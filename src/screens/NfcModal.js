import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import {
  Radio,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Award,
  Sparkles
} from 'lucide-react-native';
import { writeEmployeeCard, eraseCard, isNfcAvailable } from '../services/nfc';
import { useTheme } from '../theme/ThemeContext';

export default function NfcModal({ visible, employee, onClose }) {
  const { theme, isDark } = useTheme();
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (visible) {
      setStatus('idle');
      setStatusMessage('');
      checkHardware();
    }
  }, [visible]);

  const checkHardware = async () => {
    const available = await isNfcAvailable();
    setIsAvailable(available);
  };

  if (!employee) return null;

  const empId = employee.id || employee._id || employee.employeeId || '';
  const profileUrl = 'https://QR.arabiantransformers.cloud/profile/' + empId;

  const handleWrite = async () => {
    setStatus('writing');
    setStatusMessage(
      Platform.OS === 'ios'
        ? 'iOS Ready to Scan: Hold top edge of iPhone near your physical NFC card.'
        : 'Hold NFC card to back of device...'
    );

    try {
      const result = await writeEmployeeCard(empId, profileUrl);
      if (result.success) {
        setStatus('success');
        setStatusMessage(result.message || 'NFC card programmed successfully!');
      } else {
        setStatus('error');
        setStatusMessage(result.message || 'Failed to write card.');
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'An unexpected error occurred during NFC write.');
    }
  };

  const handleErase = () => {
    Alert.alert(
      'Format / Erase Card',
      'This will erase all NDEF records on the physical NFC card. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Card',
          style: 'destructive',
          onPress: async () => {
            setStatus('writing');
            setStatusMessage('Tap NFC card to clear and format...');
            try {
              const res = await eraseCard();
              if (res.success) {
                setStatus('success');
                setStatusMessage('Physical card formatted successfully.');
              } else {
                setStatus('error');
                setStatusMessage(res.message || 'Failed to erase card.');
              }
            } catch (e) {
              setStatus('error');
              setStatusMessage(e.message || 'Erase operation failed.');
            }
          }
        }
      ]
    );
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
                <Radio size={18} color={theme.textSecondary} />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Program NFC Card</Text>
                <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
                  Native Hardware NDEF Writer
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
            <View style={[styles.empPreviewCard, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.empPreviewName, { color: theme.textPrimary }]}>
                  {employee.name}
                </Text>
                <Sparkles size={16} color={theme.primary} />
              </View>

              {employee.position ? (
                <View style={[styles.badge, { backgroundColor: isDark ? '#1E293B' : theme.primaryLight }]}>
                  <Award size={11} color={theme.primary} />
                  <Text style={[styles.badgeText, { color: theme.primary }]}>
                    {employee.position}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.urlBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.urlLabel, { color: theme.textMuted }]}>TARGET NDEF URL</Text>
                <Text style={[styles.urlText, { color: '#00bf5f' }]} numberOfLines={1}>
                  {profileUrl}
                </Text>
              </View>
            </View>

            {status !== 'idle' && (
              <View
                style={[
                  styles.statusBox,
                  status === 'writing' && { backgroundColor: isDark ? '#06382a' : 'rgba(0, 191, 95, 0.12)', borderColor: '#00bf5f' },
                  status === 'success' && { backgroundColor: isDark ? '#052E16' : '#F0FDF4', borderColor: '#16A34A' },
                  status === 'error' && { backgroundColor: isDark ? '#450A0A' : '#FEF2F2', borderColor: '#DC2626' }
                ]}
              >
                {status === 'writing' && <ActivityIndicator color="#00bf5f" />}
                {status === 'success' && <CheckCircle2 size={20} color="#16A34A" />}
                {status === 'error' && <AlertCircle size={20} color="#DC2626" />}
                <Text
                  style={[
                    styles.statusText,
                    status === 'writing' && { color: '#00bf5f' },
                    status === 'success' && { color: '#16A34A' },
                    status === 'error' && { color: '#DC2626' }
                  ]}
                >
                  {statusMessage}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.writeBtn, { backgroundColor: '#1a9658' }, theme.btnShadow, status === 'writing' && styles.writeBtnDisabled]}
              onPress={handleWrite}
              disabled={status === 'writing'}
              activeOpacity={0.85}
            >
              {status === 'writing' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Radio size={18} color="#FFFFFF" />
                  <Text style={styles.writeBtnText}>Touch Card to Write</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.eraseBtn, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}
              onPress={handleErase}
              disabled={status === 'writing'}
              activeOpacity={0.8}
            >
              <Trash2 size={15} color="#EF4444" />
              <Text style={styles.eraseBtnText}>Format / Wipe NFC Card</Text>
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
  empPreviewCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  empPreviewName: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    marginTop: 6,
    marginBottom: 14
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  urlBox: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1
  },
  urlLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4
  },
  urlText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600'
  },
  writeBtn: {
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
  writeBtnDisabled: {
    opacity: 0.65
  },
  writeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  eraseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    gap: 8,
    marginTop: 12
  },
  eraseBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600'
  }
});
