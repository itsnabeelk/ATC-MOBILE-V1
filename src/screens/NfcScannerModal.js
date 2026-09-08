import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView
} from 'react-native';
import {
  Radio,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Scan,
  Sparkles
} from 'lucide-react-native';
import { readNfcCard } from '../services/nfc';
import { useTheme } from '../theme/ThemeContext';

export default function NfcScannerModal({ visible, onClose }) {
  const { theme, isDark } = useTheme();
  const [reading, setReading] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState('');

  const handleStartScan = async () => {
    setReading(true);
    setError('');
    setScannedData(null);

    try {
      const result = await readNfcCard();
      if (result.success) {
        setScannedData(result);
      } else {
        setError(result.message || 'No readable NDEF payload found on card.');
      }
    } catch (err) {
      setError(err.message || 'Scanner encountered an error.');
    } finally {
      setReading(false);
    }
  };

  const handleOpenUrl = (url) => {
    if (url) Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
          <View style={[styles.sheetHeader, { borderBottomColor: theme.borderLight }]}>
            <View style={styles.sheetHeaderTitleRow}>
              <View style={[styles.nfcIconCircle, { backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.borderLight }]}>
                <Scan size={18} color={theme.textSecondary} />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Inspect Physical Card</Text>
                <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
                  Native Hardware NDEF Scanner
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.borderLight }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {/* Scanned Result */}
            {scannedData ? (
              <View style={[styles.resultCard, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}>
                <View style={styles.resultHeader}>
                  <CheckCircle2 size={18} color="#16A34A" />
                  <Text style={styles.resultHeaderTitle}>CARD IDENTIFIED</Text>
                </View>

                {scannedData.tagId ? (
                  <View style={styles.dataField}>
                    <Text style={[styles.dataLabel, { color: theme.textMuted }]}>PHYSICAL UID</Text>
                    <Text style={[styles.dataValue, { color: theme.textPrimary }]}>
                      {scannedData.tagId}
                    </Text>
                  </View>
                ) : null}

                {scannedData.url ? (
                  <View style={styles.dataField}>
                    <Text style={[styles.dataLabel, { color: theme.textMuted }]}>ENCODED PROFILE URL</Text>
                    <Text style={[styles.urlValue, { color: '#00bf5f' }]}>
                      {scannedData.url}
                    </Text>
                    <TouchableOpacity
                      style={[styles.openLinkBtn, { backgroundColor: '#1a9658' }, theme.btnShadow]}
                      onPress={() => handleOpenUrl(scannedData.url)}
                      activeOpacity={0.85}
                    >
                      <ExternalLink size={14} color="#FFFFFF" />
                      <Text style={styles.openLinkBtnText}>Open Profile</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Error Message */}
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Scan Button */}
            <TouchableOpacity
              style={[styles.scanBtn, { backgroundColor: '#1a9658' }, theme.btnShadow, reading && styles.scanBtnDisabled]}
              onPress={handleStartScan}
              disabled={reading}
              activeOpacity={0.85}
            >
              {reading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Scan size={18} color="#FFFFFF" />
                  <Text style={styles.scanBtnText}>
                    {scannedData ? 'Scan Another Tag' : 'Touch Card to Read'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end'
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1
  },
  sheetHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  nfcIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  sheetSubtitle: {
    fontSize: 12,
    fontWeight: '500'
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetBody: {
    padding: 24
  },
  resultCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  resultHeaderTitle: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  dataField: {
    marginBottom: 10
  },
  dataLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  dataValue: {
    fontSize: 13,
    fontWeight: '700'
  },
  urlValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 10
  },
  openLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 21,
    gap: 8,
    marginTop: 4
  },
  openLinkBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DC2626'
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    gap: 10,
    shadowColor: '#1a9658',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6
  },
  scanBtnDisabled: {
    opacity: 0.65
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
