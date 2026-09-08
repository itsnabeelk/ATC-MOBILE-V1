import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar
} from 'react-native';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Radio,
  Phone,
  Mail,
  Building,
  Globe,
  MapPin,
  ExternalLink,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Share2,
  Sparkles
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { updateEmployee, deleteEmployee } from '../services/api';

export default function EmployeeDetailModal({
  visible,
  employee,
  onClose,
  onOpenNfcWriter,
  onEmployeeUpdated,
  onEmployeeDeleted
}) {
  const { theme, isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable form state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    landline: '',
    address: '',
    website: '',
    whatsapp: '',
    linkedin: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        position: employee.position || '',
        phone: employee.phone || '',
        email: employee.email || '',
        landline: employee.landline || '',
        address: employee.address || '',
        website: employee.website || '',
        whatsapp: employee.whatsapp || '',
        linkedin: employee.linkedin || ''
      });
      setIsEditing(false);
      setError('');
      setSuccess('');
    }
  }, [employee, visible]);

  if (!employee) return null;

  const profileUrl = 'https://QR.arabiantransformers.cloud/profile/' + employee.id;

  const handleCall = (num) => {
    if (num) Linking.openURL('tel:' + num);
  };

  const handleEmail = (mail) => {
    if (mail) Linking.openURL('mailto:' + mail);
  };

  const handleOpenProfile = () => {
    Linking.openURL(profileUrl);
  };

  const handleSaveEdit = async () => {
    if (!formData.name.trim()) {
      setError('Employee name is required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateEmployee(employee.id, formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      if (onEmployeeUpdated) {
        onEmployeeUpdated({ ...employee, ...formData });
      }
    } catch (err) {
      setError(err.message || 'Failed to update employee details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrompt = () => {
    Alert.alert(
      'Delete Employee Profile',
      'Are you sure you want to permanently delete ' + employee.name + '? This will disable their QR profile and invalidate programmed cards.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Record',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteEmployee(employee.id);
              if (onEmployeeDeleted) {
                onEmployeeDeleted(employee.id);
              }
              onClose();
            } catch (err) {
              Alert.alert('Delete Failed', err.message || 'Could not delete employee record.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const initials = (employee.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        {/* Top Header */}
        <View style={[styles.topBar, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.borderLight }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {isEditing ? 'Edit Profile' : 'Employee Details'}
          </Text>

          {!isEditing ? (
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.borderLight }]}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.8}
            >
              <Edit3 size={15} color={theme.textSecondary} />
              <Text style={[styles.editBtnText, { color: theme.textSecondary }]}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: theme.cardAlt }]}
              onPress={() => setIsEditing(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.editBtnText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Feedback messages */}
          {error ? (
            <View style={[styles.messageBanner, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2', borderColor: '#DC2626' }]}>
              <AlertCircle size={16} color="#DC2626" />
              <Text style={[styles.messageText, { color: '#DC2626' }]}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={[styles.messageBanner, { backgroundColor: isDark ? '#052E16' : '#F0FDF4', borderColor: '#16A34A' }]}>
              <CheckCircle2 size={16} color="#16A34A" />
              <Text style={[styles.messageText, { color: '#16A34A' }]}>{success}</Text>
            </View>
          ) : null}

          {!isEditing ? (
            /* VIEW MODE */
            <>
              {/* Profile Card Header */}
              <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
                <View style={styles.heroRow}>
                  <View style={[styles.largeAvatar, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}>
                    <Text style={[styles.largeAvatarText, { color: theme.textPrimary }]}>
                      {initials}
                    </Text>
                  </View>
                  <View style={styles.heroInfo}>
                    <Text style={[styles.heroName, { color: theme.textPrimary }]}>
                      {employee.name}
                    </Text>
                    {employee.position ? (
                      <View style={[styles.heroBadge, { backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.borderLight }]}>
                        <Award size={12} color={theme.textSecondary} />
                        <Text style={[styles.heroBadgeText, { color: theme.textSecondary }]}>
                          {employee.position}
                        </Text>
                      </View>
                    ) : null}
                    <Text style={[styles.companyLabel, { color: theme.textSecondary }]}>
                      Arabian Transformers Co.
                    </Text>
                  </View>
                </View>

                {/* Primary Action Button: Program NFC */}
                <TouchableOpacity
                  style={[styles.nfcHeroBtn, { backgroundColor: '#1a9658' }, theme.btnShadow]}
                  onPress={() => {
                    onClose();
                    if (onOpenNfcWriter) onOpenNfcWriter(employee);
                  }}
                  activeOpacity={0.85}
                >
                  <Radio size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.nfcHeroBtnText}>Program NFC Business Card</Text>
                </TouchableOpacity>
              </View>

              {/* Profile URL Preview Card */}
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>LIVE QR / DIGITAL PROFILE</Text>
                <TouchableOpacity
                  style={[styles.urlRow, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}
                  onPress={handleOpenProfile}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.urlText, { color: theme.textPrimary }]} numberOfLines={1}>
                      {profileUrl}
                    </Text>
                  </View>
                  <ExternalLink size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Contact Details List */}
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>CONTACT DIRECTORY</Text>

                {/* Phone */}
                {employee.phone ? (
                  <TouchableOpacity
                    style={styles.detailRow}
                    onPress={() => handleCall(employee.phone)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.detailIconWrap, { backgroundColor: theme.cardAlt }]}>
                      <Phone size={16} color={theme.textSecondary} />
                    </View>
                    <View style={styles.detailTextWrap}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>MOBILE NUMBER</Text>
                      <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                        {employee.phone}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                {/* Email */}
                {employee.email ? (
                  <TouchableOpacity
                    style={styles.detailRow}
                    onPress={() => handleEmail(employee.email)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.detailIconWrap, { backgroundColor: theme.cardAlt }]}>
                      <Mail size={16} color={theme.textSecondary} />
                    </View>
                    <View style={styles.detailTextWrap}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>EMAIL ADDRESS</Text>
                      <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                        {employee.email}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                {/* Landline */}
                {employee.landline ? (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconWrap, { backgroundColor: theme.cardAlt }]}>
                      <Building size={16} color={theme.textSecondary} />
                    </View>
                    <View style={styles.detailTextWrap}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>OFFICE EXTENSION / LANDLINE</Text>
                      <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                        {employee.landline}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Address */}
                {employee.address ? (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconWrap, { backgroundColor: theme.cardAlt }]}>
                      <MapPin size={16} color={theme.textSecondary} />
                    </View>
                    <View style={styles.detailTextWrap}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>OFFICE LOCATION</Text>
                      <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                        {employee.address}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Website */}
                {employee.website ? (
                  <TouchableOpacity
                    style={styles.detailRow}
                    onPress={() => Linking.openURL(employee.website.startsWith('http') ? employee.website : 'https://' + employee.website)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.detailIconWrap, { backgroundColor: theme.cardAlt }]}>
                      <Globe size={16} color={theme.textSecondary} />
                    </View>
                    <View style={styles.detailTextWrap}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>WEBSITE</Text>
                      <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                        {employee.website}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Delete Action (Matching Web Portal) */}
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2', borderColor: '#DC2626' }]}
                onPress={handleDeletePrompt}
                disabled={deleting}
                activeOpacity={0.85}
              >
                {deleting ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <>
                    <Trash2 size={16} color="#DC2626" />
                    <Text style={styles.deleteButtonText}>Delete Employee Record</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            /* EDIT MODE */
            <View style={[styles.editCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
              <Text style={[styles.editSectionHeading, { color: theme.textPrimary }]}>Edit Employee Information</Text>

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>FULL NAME *</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={formData.name}
                  onChangeText={(val) => setFormData({ ...formData, name: val })}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              {/* Position */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>POSITION / TITLE</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={formData.position}
                  onChangeText={(val) => setFormData({ ...formData, position: val })}
                  placeholder="e.g. Senior Electrical Engineer"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>PHONE NUMBER</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={formData.phone}
                  onChangeText={(val) => setFormData({ ...formData, phone: val })}
                  placeholder="+966 50 000 0000"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>EMAIL ADDRESS</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={formData.email}
                  onChangeText={(val) => setFormData({ ...formData, email: val })}
                  placeholder="name@arabiantransformers.com"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Landline */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>LANDLINE / EXTENSION</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={formData.landline}
                  onChangeText={(val) => setFormData({ ...formData, landline: val })}
                  placeholder="011 000 0000 Ext: 102"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>OFFICE LOCATION / ADDRESS</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={formData.address}
                  onChangeText={(val) => setFormData({ ...formData, address: val })}
                  placeholder="Riyadh Industrial City, KSA"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#1a9658' }, theme.btnShadow, saving && styles.btnDisabled]}
                onPress={handleSaveEdit}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={18} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar?.currentHeight || 28) + 16 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  largeAvatar: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  largeAvatarText: {
    fontSize: 22,
    fontWeight: '800'
  },
  heroInfo: {
    flex: 1
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
    marginTop: 4
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  companyLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4
  },
  nfcHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 10,
    marginTop: 18,
    shadowColor: '#1a9658',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5
  },
  nfcHeroBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 8
  },
  urlText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14
  },
  detailIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailTextWrap: {
    flex: 1
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2
  },
  actionTag: {
    fontSize: 12,
    fontWeight: '700'
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    gap: 8,
    marginTop: 6
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700'
  },
  editCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1
  },
  editSectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 18
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  textInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '500'
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 8,
    marginTop: 10
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  btnDisabled: {
    opacity: 0.65
  }
});
