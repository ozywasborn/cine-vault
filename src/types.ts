export type GearCategory =
  | 'Cameras'
  | 'Lenses'
  | 'Lighting'
  | 'Audio'
  | 'Grip & Support'
  | 'Drones & Gimbals'
  | 'Power & Batteries'
  | 'Media & Storage'
  | 'Accessories';

export type GearStatus =
  | 'Available'
  | 'Checked Out'
  | 'In Maintenance'
  | 'Out On Loan'
  | 'Reserved'
  | 'Missing'
  | 'Retired';

export type ConditionRating = 'Mint' | 'Good' | 'Fair' | 'Needs Attention' | 'Damaged';

export const AVAILABLE_LOCATIONS = ['Studio', 'Gripvan', 'Charging Bay'] as const;
export type LocationOption = (typeof AVAILABLE_LOCATIONS)[number];

export type UserRole = 'Admin' | 'Equipment Manager' | 'Cinematographer' | 'Auditor';

export type AuthProvider = 'Google Workspace' | 'Microsoft 365';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  avatarUrl?: string;
  department: string;
}

export interface MaintenanceRecord {
  id: string;
  gearId: string;
  date: string;
  serviceType: 'Sensor Cleaning' | 'Firmware Update' | 'Calibration' | 'Optical Inspection' | 'Shutter Repair' | 'Cable Re-termination' | 'General Overhaul';
  technician: string;
  vendor?: string;
  cost: number;
  conditionAfter: ConditionRating;
  notes: string;
  nextServiceDueDate?: string;
  resolved: boolean;
}

export interface CheckoutRecord {
  id: string;
  gearId: string;
  gearName: string;
  assetTag: string;
  userId: string;
  userName: string;
  userEmail: string;
  projectName: string;
  shootLocation: string;
  checkoutDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
  notes?: string;
  conditionOnCheckout: ConditionRating;
  conditionOnReturn?: ConditionRating;
  returnNotes?: string;
}

export interface GearItem {
  id: string;
  assetTag: string;
  name: string;
  brand: string;
  model: string;
  category: GearCategory;
  serialNumber: string;
  status: GearStatus;
  condition: ConditionRating;
  location: string; // e.g. "Locker A-02", "Cage Shelf 4", "Van Unit 1"
  kitName?: string; // e.g. "A-Cam Cinema Rig"
  purchaseDate?: string;
  purchasePrice: number;
  replacementValue: number;
  specs?: Record<string, string>; // e.g. { "Mount": "PL Mount", "Sensor": "Full Frame 4K", "Max ISO": "409600" }
  lastServiceDate?: string;
  nextServiceDate?: string;
  maintenanceIntervalDays?: number;
  currentCheckout?: CheckoutRecord;
  imageUrl?: string;
  notes?: string;
  totalShootsCompleted?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShootProject {
  id: string;
  name: string;
  client: string;
  leadDP: string;
  location: string;
  startDate: string;
  endDate: string;
  assignedGearIds: string[];
  status: 'Prep' | 'On Shoot' | 'Wrap' | 'Archived';
  color?: string;
}

export type ProjectShoot = ShootProject;

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  provider: AuthProvider;
  action: 'CREATE' | 'UPDATE' | 'CHECKOUT' | 'CHECKIN' | 'MAINTENANCE_LOG' | 'TRANSFER' | 'QR_PRINT' | 'CLOUD_SYNC' | 'LOGIN';
  targetAssetTag: string;
  targetName?: string;
  details: string;
  ipOrDevice?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'alert' | 'success' | 'SERVICE_REMINDER' | 'OVERDUE_RETURN' | 'STATUS_ALERT' | 'SYNC_EVENT';
  timestamp: string;
  read: boolean;
  gearId?: string;
  relatedGearId?: string;
  actionLink?: string;
}

export type InventoryNotification = AppNotification;

export interface CloudBridgeConfig {
  googleWorkspace: {
    connected: boolean;
    domain: string;
    targetDriveFolder: string;
    sheetSyncEnabled: boolean;
    lastSynced?: string;
  };
  microsoft365: {
    connected: boolean;
    tenantId: string;
    organization: string;
    sharePointList: string;
    graphApiSyncEnabled: boolean;
    lastSynced?: string;
  };
  migrationSyncMode: 'bidirectional' | 'google-to-m365' | 'm365-to-google';
  autoSyncIntervalMinutes: number;
}

export interface TransferManifest {
  id: string;
  transferDate: string;
  sourceDepartment: string;
  recipientDepartment: string;
  recipientName: string;
  recipientEmail: string;
  authorizedBy: string;
  items: {
    assetTag: string;
    name: string;
    serialNumber: string;
    condition: ConditionRating;
    replacementValue: number;
  }[];
  totalValue: number;
  notes: string;
  signatureHash: string;
}
