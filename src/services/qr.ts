import QRCode from 'qrcode';
import { GearItem } from '../types';

export async function generateQrDataUrl(gear: GearItem): Promise<string> {
  const payload = JSON.stringify({
    tag: gear.assetTag,
    id: gear.id,
    name: gear.name,
    sn: gear.serialNumber,
    cat: gear.category,
    val: gear.replacementValue,
    loc: gear.location,
    app: 'CineVault-v2',
  });

  try {
    const url = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return url;
  } catch (err) {
    console.error('Error generating QR code:', err);
    // Fallback simple svg placeholder
    return '';
  }
}

export async function generateRawQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating raw QR code:', err);
    return '';
  }
}
