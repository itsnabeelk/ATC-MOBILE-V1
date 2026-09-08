import { Platform } from 'react-native';

let NfcManager = null;
let NfcTech = null;
let Ndef = null;

try {
  const nfcModule = require('react-native-nfc-manager');
  NfcManager = nfcModule.default || nfcModule;
  NfcTech = nfcModule.NfcTech;
  Ndef = nfcModule.Ndef;
} catch (e) {
  console.warn('NFC module not available in current environment', e);
}

export const isNfcAvailable = async () => {
  if (!NfcManager) return false;
  try {
    return await NfcManager.isSupported();
  } catch {
    return false;
  }
};

export const initNfc = async () => {
  if (!NfcManager) return false;
  try {
    await NfcManager.start();
    return true;
  } catch (err) {
    console.warn('Failed to start NFC Manager', err);
    return false;
  }
};

export const writeEmployeeCard = async (employeeIdOrObject, targetUrl) => {
  if (!NfcManager || !NfcTech || !Ndef) {
    throw new Error('NFC is not supported or initialized on this device.');
  }

  let empId = employeeIdOrObject;
  if (employeeIdOrObject && typeof employeeIdOrObject === 'object') {
    empId = employeeIdOrObject.id || employeeIdOrObject._id || employeeIdOrObject.employeeId || '';
  }

  const urlToWrite = targetUrl || `https://QR.arabiantransformers.cloud/profile/${empId}`;

  try {
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Hold your physical NFC business card near the top of your iPhone...'
    });

    const bytes = Ndef.encodeMessage([
      Ndef.uriRecord(urlToWrite)
    ]);

    if (!bytes) {
      throw new Error('Failed to encode NFC record.');
    }

    await NfcManager.ndefHandler.writeNdefMessage(bytes);

    if (Platform.OS === 'ios') {
      await NfcManager.setAlertMessageIOS('Success! Digital Business Card written successfully.');
    }

    return { success: true, url: urlToWrite };
  } catch (error) {
    if (Platform.OS === 'ios') {
      await NfcManager.invalidateSessionWithErrorIOS(error.message || 'Write failed.');
    }
    throw error;
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {}
  }
};

export const eraseCard = async () => {
  if (!NfcManager || !NfcTech || !Ndef) {
    throw new Error('NFC is not supported on this device.');
  }

  try {
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Hold the NFC card near your phone to format and erase it...'
    });

    const bytes = Ndef.encodeMessage([
      Ndef.record(Ndef.TNF_EMPTY, null, null, null)
    ]);

    await NfcManager.ndefHandler.writeNdefMessage(bytes);

    if (Platform.OS === 'ios') {
      await NfcManager.setAlertMessageIOS('Card formatted and erased successfully!');
    }

    return { success: true };
  } catch (error) {
    if (Platform.OS === 'ios') {
      await NfcManager.invalidateSessionWithErrorIOS(error.message || 'Erase failed.');
    }
    throw error;
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {}
  }
};

export const readNfcCard = async () => {
  if (!NfcManager || !NfcTech || !Ndef) {
    throw new Error('NFC is not supported on this device.');
  }

  try {
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Hold an NFC card near your phone to scan it...'
    });

    const tag = await NfcManager.getTag();
    let parsedUrl = '';

    if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
      const record = tag.ndefMessage[0];
      try {
        parsedUrl = Ndef.uri.decodePayload(record.payload);
      } catch {
        parsedUrl = 'Raw Data Tag';
      }
    }

    if (Platform.OS === 'ios') {
      await NfcManager.setAlertMessageIOS('Card read successfully!');
    }

    return { success: true, tag, url: parsedUrl };
  } catch (error) {
    if (Platform.OS === 'ios') {
      await NfcManager.invalidateSessionWithErrorIOS('Card scan cancelled or failed.');
    }
    throw error;
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {}
  }
};
