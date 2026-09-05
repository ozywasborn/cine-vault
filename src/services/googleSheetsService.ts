import { GearItem, ShootProject, MaintenanceRecord, AuditLog } from '../types';

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetUrl?: string;
  sheetName?: string;
  autoSyncEnabled: boolean;
  lastSynced?: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  errorMessage?: string;
}

const LOCAL_STORAGE_KEY_SHEETS_CONFIG = 'cinevault_google_sheets_config_v1';

export const APPS_SCRIPT_TEMPLATE = `/**
 * CineVault Google Sheets Cloud Database Bridge
 * Paste this into Extensions > Apps Script in your Google Sheet,
 * then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */

function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🎬 CineVault')
      .addItem('🚀 Setup Tabs & Populate Sample Data', 'populateInitialData')
      .addItem('📊 Format & Clean Tabs', 'formatAllTabs')
      .addToUi();
  } catch (e) {}
}

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var postData = null;
  
  if (e && e.postData && e.postData.contents) {
    try {
      postData = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      postData = null;
    }
  } else if (params && params.payload) {
    try {
      postData = JSON.parse(params.payload);
    } catch (err) {
      postData = null;
    }
  }
  
  var action = (postData && postData.action) || params.action || 'ping';
  
  // Resolve active or target spreadsheet
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {}
  
  var targetUrl = (postData && (postData.spreadsheetUrl || postData.spreadsheetId)) || 
                  (params && (params.spreadsheetUrl || params.spreadsheetId));
  if (!ss && targetUrl) {
    try {
      ss = targetUrl.indexOf('http') === 0 
        ? SpreadsheetApp.openByUrl(targetUrl) 
        : SpreadsheetApp.openById(targetUrl);
    } catch (e) {}
  }
  
  var output = {
    success: true,
    spreadsheetUrl: ss ? ss.getUrl() : '',
    sheetName: ss ? ss.getName() : 'Google Sheet',
    timestamp: new Date().toISOString()
  };

  if (!ss) {
    output.success = false;
    output.error = 'No active spreadsheet found. Please open your Google Sheet, click Extensions > Apps Script, paste this script there, and deploy.';
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    if (action === 'ping') {
      output.message = 'CineVault Google Sheets Bridge Active';
      output.inventoryCount = getRowCount(ss, 'Inventory');
      output.deploymentsCount = getRowCount(ss, 'Deployments');
    } else if (action === 'fetchAll') {
      output.gear = readSheetAsJson(ss, 'Inventory');
      output.projects = readSheetAsJson(ss, 'Deployments');
      output.maintenance = readSheetAsJson(ss, 'Maintenance');
      output.auditLogs = readSheetAsJson(ss, 'Audit_Logs');
    } else if (action === 'pushAll') {
      var dataObj = postData || params;
      var gearWritten = 0;
      var projWritten = 0;
      var maintWritten = 0;
      var auditWritten = 0;

      if (dataObj.gear && Array.isArray(dataObj.gear) && dataObj.gear.length > 0) {
        writeJsonToSheet(ss, 'Inventory', dataObj.gear, true);
        gearWritten = dataObj.gear.length;
      }
      if (dataObj.projects && Array.isArray(dataObj.projects)) {
        writeJsonToSheet(ss, 'Deployments', dataObj.projects, false);
        projWritten = dataObj.projects.length;
      }
      if (dataObj.maintenance && Array.isArray(dataObj.maintenance)) {
        writeJsonToSheet(ss, 'Maintenance', dataObj.maintenance, false);
        maintWritten = dataObj.maintenance.length;
      }
      if (dataObj.auditLogs && Array.isArray(dataObj.auditLogs)) {
        writeJsonToSheet(ss, 'Audit_Logs', dataObj.auditLogs, false);
        auditWritten = dataObj.auditLogs.length;
      }

      // Auto-clean: delete any blank default Sheet1 so Inventory is the first and default visible tab
      try {
        var blankSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Sheet 1');
        if (blankSheet && ss.getSheets().length > 1 && blankSheet.getLastRow() <= 1) {
          ss.deleteSheet(blankSheet);
        }
      } catch (cleanErr) {}

      output.message = 'Successfully synchronized ' + gearWritten + ' inventory items, ' + projWritten + ' deployments to Google Sheets!';
      output.gearWritten = gearWritten;
      output.projWritten = projWritten;
      output.maintWritten = maintWritten;
      output.auditWritten = auditWritten;
    } else if (action === 'updateGear') {
      var itemToUpdate = (postData && postData.item) || (params && params.item ? JSON.parse(params.item) : null);
      if (itemToUpdate) {
        updateOrInsertRow(ss, 'Inventory', itemToUpdate, 'id');
        output.message = 'Gear item updated';
      }
    } else if (action === 'deleteGear') {
      var idToDelete = (postData && postData.id) || params.id;
      if (idToDelete) {
        deleteRowById(ss, 'Inventory', idToDelete, 'id');
        output.message = 'Gear item deleted';
      }
    } else if (action === 'updateProject') {
      var projToUpdate = (postData && postData.project) || (params && params.project ? JSON.parse(params.project) : null);
      if (projToUpdate) {
        updateOrInsertRow(ss, 'Deployments', projToUpdate, 'id');
        output.message = 'Project updated';
      }
    } else {
      output.success = false;
      output.error = 'Unrecognized action: ' + action;
    }
  } catch (err) {
    output.success = false;
    output.error = err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function getRowCount(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return 0;
  var rows = sheet.getLastRow();
  return rows > 1 ? rows - 1 : 0;
}

function readSheetAsJson(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var header = headers[j];
      var val = data[i][j];
      if (header === 'specs_json' && val) {
        try { obj['specs'] = JSON.parse(val); } catch(e) { obj['specs'] = {}; }
      } else if (header === 'assignedGearIds' && typeof val === 'string') {
        try {
          obj['assignedGearIds'] = JSON.parse(val);
        } catch(e) {
          obj['assignedGearIds'] = val ? val.split(',').map(function(s) { return s.trim(); }) : [];
        }
      } else {
        obj[header] = val;
      }
    }
    
    if (obj['currentCheckout_projectName'] || obj['currentCheckout_userName']) {
      obj.currentCheckout = {
        id: obj['currentCheckout_id'] || ('chk-' + obj.id),
        gearId: obj.id,
        gearName: obj.name,
        assetTag: obj.assetTag,
        userName: obj['currentCheckout_userName'] || 'Field Crew',
        userEmail: obj['currentCheckout_userEmail'] || '',
        projectName: obj['currentCheckout_projectName'] || 'Production',
        shootLocation: obj['currentCheckout_shootLocation'] || '',
        checkoutDate: obj['currentCheckout_checkoutDate'] || new Date().toISOString(),
        expectedReturnDate: obj['currentCheckout_expectedReturnDate'] || '',
        status: 'Active',
        notes: obj['currentCheckout_notes'] || '',
        conditionOnCheckout: obj.condition || 'Good'
      };
    }
    
    rows.push(obj);
  }
  return rows;
}

function getOrCreateSheet(ss, sheetName, isPrimary) {
  var sheet = ss.getSheetByName(sheetName);
  if (sheet) return sheet;

  var allSheets = ss.getSheets();
  // If only 1 sheet exists and has no meaningful content, rename it to sheetName
  if (allSheets.length === 1 && allSheets[0].getLastRow() <= 1 && allSheets[0].getLastColumn() <= 1) {
    sheet = allSheets[0];
    sheet.setName(sheetName);
    return sheet;
  }

  sheet = ss.insertSheet(sheetName);
  if (isPrimary) {
    try {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(1);
    } catch (e) {}
  }
  return sheet;
}

function writeJsonToSheet(ss, sheetName, items, isPrimary) {
  if (!items || items.length === 0) return;
  var sheet = getOrCreateSheet(ss, sheetName, isPrimary);
  
  sheet.clear();
  
  var flatItems = items.map(function(item) { return flattenObject(item); });
  var headerSet = {};
  flatItems.forEach(function(item) {
    Object.keys(item).forEach(function(k) { headerSet[k] = true; });
  });
  var headers = Object.keys(headerSet);
  if (headers.length === 0) return;
  
  // Expand columns if necessary
  var maxCols = sheet.getMaxColumns();
  if (headers.length > maxCols) {
    sheet.insertColumnsAfter(maxCols, headers.length - maxCols);
  }
  
  // Build safe row matrix (ensure only primitives or strings, never raw objects)
  var rows = [headers];
  for (var i = 0; i < flatItems.length; i++) {
    var item = flatItems[i];
    var row = headers.map(function(h) {
      var v = item[h];
      if (v === undefined || v === null) return '';
      if (typeof v === 'object') {
        try { return JSON.stringify(v); } catch(e) { return String(v); }
      }
      return v;
    });
    rows.push(row);
  }
  
  // Expand rows if necessary
  var maxRows = sheet.getMaxRows();
  if (rows.length > maxRows) {
    sheet.insertRowsAfter(maxRows, rows.length - maxRows);
  }
  
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  
  // Format header row
  try {
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#0f172a')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  } catch (fmtErr) {}
  
  // Safe column auto-sizing
  try {
    for (var c = 1; c <= Math.min(headers.length, 12); c++) {
      sheet.autoResizeColumn(c);
    }
  } catch (resizeErr) {}
  
  if (isPrimary) {
    try {
      SpreadsheetApp.setActiveSheet(sheet);
    } catch(e) {}
  }
}

function updateOrInsertRow(ss, sheetName, item, idKey) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    writeJsonToSheet(ss, sheetName, [item], false);
    return;
  }
  
  var flat = flattenObject(item);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    writeJsonToSheet(ss, sheetName, [item], false);
    return;
  }
  
  var headers = data[0];
  var idColIdx = headers.indexOf(idKey || 'id');
  if (idColIdx === -1) {
    writeJsonToSheet(ss, sheetName, [item], false);
    return;
  }
  
  var foundRowIdx = -1;
  var targetId = String(flat[idKey || 'id']);
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][idColIdx]) === targetId) {
      foundRowIdx = r + 1;
      break;
    }
  }
  
  var newRow = headers.map(function(h) {
    var v = flat[h];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') {
      try { return JSON.stringify(v); } catch(e) { return String(v); }
    }
    return v;
  });
  
  if (foundRowIdx !== -1) {
    sheet.getRange(foundRowIdx, 1, 1, headers.length).setValues([newRow]);
  } else {
    sheet.appendRow(newRow);
  }
}

function deleteRowById(ss, sheetName, idValue, idKey) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  var headers = data[0];
  var idColIdx = headers.indexOf(idKey || 'id');
  if (idColIdx === -1) return;
  
  var targetId = String(idValue);
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][idColIdx]) === targetId) {
      sheet.deleteRow(r + 1);
      break;
    }
  }
}

function flattenObject(obj) {
  var copy = JSON.parse(JSON.stringify(obj));
  if (copy.specs && typeof copy.specs === 'object') {
    copy.specs_json = JSON.stringify(copy.specs);
    delete copy.specs;
  }
  if (copy.assignedGearIds && Array.isArray(copy.assignedGearIds)) {
    copy.assignedGearIds = JSON.stringify(copy.assignedGearIds);
  }
  if (copy.currentCheckout) {
    copy.currentCheckout_id = copy.currentCheckout.id;
    copy.currentCheckout_userName = copy.currentCheckout.userName;
    copy.currentCheckout_userEmail = copy.currentCheckout.userEmail;
    copy.currentCheckout_projectName = copy.currentCheckout.projectName;
    copy.currentCheckout_shootLocation = copy.currentCheckout.shootLocation;
    copy.currentCheckout_checkoutDate = copy.currentCheckout.checkoutDate;
    copy.currentCheckout_expectedReturnDate = copy.currentCheckout.expectedReturnDate;
    copy.currentCheckout_notes = copy.currentCheckout.notes;
    delete copy.currentCheckout;
  }
  return copy;
}

// Built-in initial sample data populator runnable directly from the Google Sheets menu
function populateInitialData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  
  var sampleGear = [
    { id: 'gear-01', assetTag: 'CAM-ALEXA-01', name: 'ARRI Alexa Mini LF Cinema Camera Body', brand: 'ARRI', model: 'Alexa Mini LF', category: 'Cameras', serialNumber: 'ALF-55829', status: 'Available', condition: 'Mint', location: 'Studio', purchasePrice: 58000, replacementValue: 64000 },
    { id: 'gear-02', assetTag: 'CAM-FX6-02', name: 'Sony FX6 Full-Frame Cinema Camera', brand: 'Sony', model: 'ILME-FX6V', category: 'Cameras', serialNumber: 'SNY-609144', status: 'Available', condition: 'Good', location: 'Gripvan', purchasePrice: 6000, replacementValue: 6500 },
    { id: 'gear-03', assetTag: 'CAM-RED-03', name: 'RED V-Raptor 8K VV Cinema Camera', brand: 'RED', model: 'V-Raptor 8K', category: 'Cameras', serialNumber: 'RED-88210', status: 'Available', condition: 'Mint', location: 'Studio', purchasePrice: 24500, replacementValue: 27000 },
    { id: 'gear-04', assetTag: 'LEN-COOKE-01', name: 'Cooke S4/i Prime 32mm T2.0 Lens', brand: 'Cooke', model: 'S4/i 32mm', category: 'Lenses', serialNumber: 'CK-44102', status: 'Available', condition: 'Mint', location: 'Studio', purchasePrice: 18500, replacementValue: 21000 },
    { id: 'gear-05', assetTag: 'LEN-ZEISS-02', name: 'Zeiss Supreme Prime 50mm T1.5', brand: 'Zeiss', model: 'Supreme 50mm', category: 'Lenses', serialNumber: 'ZS-99201', status: 'Available', condition: 'Mint', location: 'Studio', purchasePrice: 21000, replacementValue: 23500 },
    { id: 'gear-06', assetTag: 'LGT-APU-01', name: 'Aputure Electro Storm CS15 LED Monolight', brand: 'Aputure', model: 'CS15', category: 'Lighting', serialNumber: 'AP-33921', status: 'Available', condition: 'Good', location: 'Studio', purchasePrice: 4800, replacementValue: 5300 },
    { id: 'gear-07', assetTag: 'AUD-SENN-01', name: 'Sennheiser MKH 416 Shotgun Microphone Kit', brand: 'Sennheiser', model: 'MKH 416', category: 'Audio', serialNumber: 'SN-77218', status: 'Available', condition: 'Good', location: 'Studio', purchasePrice: 1200, replacementValue: 1400 },
    { id: 'gear-08', assetTag: 'GRP-RONIN-01', name: 'DJI Ronin 2 3-Axis Gimbal Stabilizer', brand: 'DJI', model: 'Ronin 2', category: 'Drones & Gimbals', serialNumber: 'DJI-55219', status: 'Available', condition: 'Good', location: 'Studio', purchasePrice: 7500, replacementValue: 8200 }
  ];
  
  writeJsonToSheet(ss, 'Inventory', sampleGear, true);
  SpreadsheetApp.getUi().alert('✅ Success: CineVault tabs created and 8 sample equipment items populated! Connect CineVault Web App to sync your full live fleet.');
}

function formatAllTabs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var s = sheets[i];
    if (s.getLastRow() >= 1 && s.getLastColumn() >= 1) {
      s.getRange(1, 1, 1, s.getLastColumn()).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
      s.setFrozenRows(1);
    }
  }
}
`;

export function getStoredSheetsConfig(): GoogleSheetsConfig {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SHEETS_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    webAppUrl: '',
    spreadsheetUrl: '',
    autoSyncEnabled: true,
    status: 'disconnected',
  };
}

export function saveStoredSheetsConfig(config: GoogleSheetsConfig) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SHEETS_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save sheets config in localStorage', err);
  }
}

export const googleSheetsService = {
  // Test connection to the Google Apps Script Web App
  async testConnection(webAppUrl: string): Promise<{
    success: boolean;
    sheetName?: string;
    spreadsheetUrl?: string;
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/sheets/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to backend proxy' };
    }
  },

  // Pull all data from the Google Sheet
  async fetchAll(webAppUrl: string): Promise<{
    success: boolean;
    gear?: GearItem[];
    projects?: ShootProject[];
    maintenance?: MaintenanceRecord[];
    auditLogs?: AuditLog[];
    sheetName?: string;
    spreadsheetUrl?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/sheets/fetch-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Error fetching from Google Sheets' };
    }
  },

  // Push all local data to the Google Sheet (initial setup or manual full sync)
  async pushAll(
    webAppUrl: string,
    data: {
      gear?: GearItem[];
      projects?: ShootProject[];
      maintenance?: MaintenanceRecord[];
      auditLogs?: AuditLog[];
      spreadsheetUrl?: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    timestamp?: string;
    sheetName?: string;
    spreadsheetUrl?: string;
    gearWritten?: number;
    projWritten?: number;
  }> {
    try {
      const res = await fetch('/api/sheets/push-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl, ...data }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Error pushing to Google Sheets' };
    }
  },

  // Incremental gear item update
  async syncGearItem(webAppUrl: string, action: 'updateGear' | 'deleteGear', itemOrId: GearItem | string): Promise<boolean> {
    try {
      const payload: any = { webAppUrl, action };
      if (action === 'updateGear') {
        payload.item = itemOrId;
      } else {
        payload.id = itemOrId;
      }
      const res = await fetch('/api/sheets/update-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  },

  // Incremental project update
  async syncProject(webAppUrl: string, project: ShootProject): Promise<boolean> {
    try {
      const res = await fetch('/api/sheets/update-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl, project }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  },

  // Helper to trigger direct browser download of Inventory CSV
  downloadInventoryCsv(gear: GearItem[]) {
    const headers = [
      'id',
      'assetTag',
      'name',
      'brand',
      'model',
      'category',
      'status',
      'condition',
      'location',
      'kitName',
      'serialNumber',
      'purchasePrice',
      'replacementValue',
      'lastServiceDate',
      'nextServiceDate',
      'notes',
    ];
    
    const rows = gear.map((item: any) =>
      headers
        .map((h) => {
          const val = item[h];
          if (val === undefined || val === null) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CineVault_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
