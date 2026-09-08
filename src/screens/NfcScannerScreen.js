import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar as RNStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Scan,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Radio,
  Sparkles,
  Shield
} from 'lucide-react-native';
import { readNfcCard } from '../services/nfc';
import { useTheme } from '../theme/ThemeContext';

export default function NfcScannerScreen() {
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Inspect NFC Tag</Text>
          <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
            Read, verify, and decode physical business cards
          </Text>
        </View>

        {/* Scan Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
          <View style={[styles.radarCircle, { backgroundColor: 'rgba(0, 191, 95, 0.12)', borderColor: 'rgba(0, 191, 95, 0.35)' }]}>
            <Scan size={52} color="#00bf5f" strokeWidth={1.8} />
          </View>

          <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Ready for Physical Card</Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Hold the top edge of your phone directly against the business card chip to inspect its programmed data.
          </Text>

          <TouchableOpacity
            style={[styles.scanMainBtn, { backgroundColor: '#1a9658' }, theme.btnShadow, reading && { opacity: 0.65 }]}
            onPress={handleStartScan}
            disabled={reading}
            activeOpacity={0.85}
          >
            {reading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Radio size={20} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.scanMainBtnText}>
                  {scannedData ? 'Scan Another Card' : 'Touch Card to Inspect'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Card */}
        {scannedData ? (
          <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
            <View style={styles.resultHeader}>
              <CheckCircle2 size={20} color="#16A34A" />
              <Text style={styles.resultHeaderTitle}>PHYSICAL CHIP VERIFIED</Text>
            </View>

            {scannedData.tagId ? (
              <View style={styles.dataGroup}>
                <Text style={[styles.dataLabel, { color: theme.textMuted }]}>UNIQUE HARDWARE UID</Text>
                <Text style={[styles.dataVal, { color: theme.textPrimary }]}>
                  {scannedData.tagId}
                </Text>
              </View>
            ) : null}

            {scannedData.url ? (
              <View style={styles.dataGroup}>
                <Text style={[styles.dataLabel, { color: theme.textMuted }]}>ENCODED PROFILE URL</Text>
                <Text style={[styles.urlVal, { color: '#00bf5f' }]}>
                  {scannedData.url}
                </Text>

                <TouchableOpacity
                  style={[styles.openProfileBtn, { backgroundColor: '#1a9658' }, theme.btnShadow]}
                  onPress={() => handleOpenUrl(scannedData.url)}
                  activeOpacity={0.85}
                >
                  <ExternalLink size={15} color="#FFFFFF" />
                  <Text style={styles.openProfileBtnText}>Open Encoded Link</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Error Banner */}
        {error ? (
          <View style={[styles.errorCard, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
            <AlertCircle size={18} color="#DC2626" />
            <Text style={styles.errorCardText}>{error}</Text>
          </View>
        ) : null}

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar?.currentHeight || 28) + 12 : 16
  },
  header: {
    marginBottom: 20
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500'
  },
  heroCard: {
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }
      : {})
  },
  radarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 18
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center'
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8
  },
  scanMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 28,
    gap: 10,
    width: '100%',
    shadowColor: '#1a9658',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6
  },
  scanMainBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  resultCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }
      : {})
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  },
  resultHeaderTitle: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  dataGroup: {
    marginBottom: 12
  },
  dataLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  dataVal: {
    fontSize: 14,
    fontWeight: '700'
  },
  urlVal: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 10
  },
  openProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 21,
    gap: 8
  },
  openProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DC2626',
    gap: 10,
    marginBottom: 16
  },
  errorCardText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    flex: 1
  }
});
