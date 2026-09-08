import React, { useState, useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  User,
  Shield,
  Sun,
  Moon,
  Server,
  Radio,
  LogOut,
  ChevronRight,
  Building2,
  CheckCircle2,
  Users,
  Key,
  Save,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Clock,
  Briefcase
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { getStoredUser, clearAuthData, updateProfile, syncUserRoleFromDb } from '../services/api';
import { isNfcSupported } from '../services/nfc';
import UserManagementModal from './UserManagementModal';

export default function AccountScreen({ onLogout, onUsernameChanged }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [nfcReady, setNfcReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sub-page navigation: 'profile' | 'edit_credentials'
  const [currentView, setCurrentView] = useState('profile');

  // Profile update state
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Admin User Management modal
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

  useEffect(() => {
    loadAccountDetails();
  }, []);

  const loadAccountDetails = async () => {
    setLoading(true);
    try {
      const stored = await syncUserRoleFromDb();
      setUser(stored);
      setEditUsername(stored?.username || '');

      const nfcStatus = await isNfcSupported();
      setNfcReady(nfcStatus);
    } catch (e) {
      console.log('Error loading account', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileMsg({ type: '', text: '' });

    if (editPassword && editPassword !== confirmPassword) {
      setProfileMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const payload = {};
    if (editUsername && editUsername.trim() !== user?.username) {
      payload.username = editUsername.trim();
    }
    if (editPassword.trim()) {
      payload.password = editPassword.trim();
    }

    if (Object.keys(payload).length === 0) {
      setProfileMsg({ type: 'error', text: 'No changes detected to update.' });
      return;
    }

    setUpdatingProfile(true);
    try {
      await updateProfile(payload);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setUser((prev) => ({ ...prev, username: payload.username || prev.username }));
      setEditPassword('');
      setConfirmPassword('');
      if (payload.username && onUsernameChanged) {
        onUsernameChanged(payload.username);
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLogoutConfirm = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of the NFC Business Card portal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await clearAuthData();
            if (onLogout) onLogout();
          }
        }
      ]
    );
  };

  const isAdmin = user?.role === 'admin';

  /* ==========================================================
     SUB-PAGE: EDIT PROFILE & CREDENTIALS (WITH IMAGE 1 BACK BTN)
     ========================================================== */
  if (currentView === 'edit_credentials') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* Top Bar with Image 1 Back Arrow (<-) */}
        <View style={[styles.innerTopBar, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}
            onPress={() => {
              setProfileMsg({ type: '', text: '' });
              setCurrentView('profile');
            }}
            activeOpacity={0.75}
          >
            <ArrowLeft size={20} color={theme.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.innerHeaderTitle, { color: theme.textPrimary }]}>
            Edit Profile
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status Message */}
          {profileMsg.text ? (
            <View
              style={[
                styles.msgBox,
                {
                  backgroundColor:
                    profileMsg.type === 'error'
                      ? isDark ? '#450A0A' : '#FEF2F2'
                      : isDark ? '#052E16' : '#F0FDF4',
                  borderColor: profileMsg.type === 'error' ? '#DC2626' : '#16A34A'
                }
              ]}
            >
              {profileMsg.type === 'error' ? (
                <AlertCircle size={16} color="#DC2626" />
              ) : (
                <CheckCircle2 size={16} color="#16A34A" />
              )}
              <Text
                style={[
                  styles.msgText,
                  { color: profileMsg.type === 'error' ? '#DC2626' : '#16A34A' }
                ]}
              >
                {profileMsg.text}
              </Text>
            </View>
          ) : null}

          {/* Edit Form Card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Account Credentials
            </Text>
            <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
              Update your username and sign-in password
            </Text>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>USERNAME</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary
                  }
                ]}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Enter new username"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                NEW PASSWORD (OPTIONAL)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary
                  }
                ]}
                value={editPassword}
                onChangeText={setEditPassword}
                placeholder="Leave blank to keep current password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
              />
            </View>

            {/* Confirm Password */}
            {editPassword ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  CONFIRM NEW PASSWORD
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.textPrimary
                    }
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                />
              </View>
            ) : null}

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: '#1a9658' },
                theme.btnShadow,
                updatingProfile && { opacity: 0.65 }
              ]}
              onPress={handleUpdateProfile}
              disabled={updatingProfile}
              activeOpacity={0.85}
            >
              {updatingProfile ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Save size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Profile Updates</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     MAIN PROFILE SCREEN (MATCHING ATTACHED REFERENCE IMAGE 2)
     ========================================================== */
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title (Matches Image 2) */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>My Profile</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* HERO PROFILE CARD (Matching Image 2 Layout) */}
            <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
              {/* Top Row: Avatar & Edit Profile Button */}
              <View style={styles.heroTopRow}>
                {/* Avatar with Active Online Status Dot */}
                <View style={styles.avatarWrap}>
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: theme.cardAlt,
                        borderColor: theme.borderLight
                      }
                    ]}
                  >
                    {isAdmin ? (
                      <Shield size={32} color={theme.textPrimary} />
                    ) : (
                      <User size={32} color={theme.textPrimary} />
                    )}
                  </View>
                  <View style={styles.onlineDot} />
                </View>

                {/* Edit Profile Button (Replaced "Edit Image" as requested) */}
                <TouchableOpacity
                  style={[styles.editProfileBtn, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}
                  onPress={() => {
                    setProfileMsg({ type: '', text: '' });
                    setCurrentView('edit_credentials');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.editProfileBtnText, { color: theme.textPrimary }]}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Status & Time */}
              <View style={styles.sessionStatusRow}>
                <Clock size={12} color={theme.textMuted} />
                <Text style={[styles.sessionStatusText, { color: theme.textSecondary }]}>
                  Active Session • Arabian Transformers
                </Text>
              </View>

              {/* User Name (Keep prominent name as requested) */}
              <Text style={[styles.heroName, { color: theme.textPrimary }]}>
                {user?.username ? user.username.toUpperCase() : 'ADMINISTRATOR'}
              </Text>

              {/* Position & Role kept below name (Matches Image 2) */}
              <View style={styles.roleRow}>
                <View style={[styles.roleOrangeDot, { backgroundColor: theme.textSecondary }]} />
                <Text style={[styles.roleLabel, { color: theme.textSecondary }]}>
                  {isAdmin ? 'System Administration' : 'Card Operations'}
                </Text>
                <Text style={[styles.roleDivider, { color: theme.textMuted }]}>|</Text>
                <Text style={[styles.roleSubBadge, { color: theme.textPrimary }]}>
                  {isAdmin ? 'Full Privileges' : 'Standard User'}
                </Text>
              </View>
            </View>

            {/* TWO SUMMARY SPLIT CARDS (Matches Image 2) */}
            <View style={styles.splitRow}>
              {/* Box 1: Organization */}
              <View style={[styles.splitCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
                <Text style={[styles.splitCardLabel, { color: theme.textMuted }]}>Organization</Text>
                <Text style={[styles.splitCardVal, { color: theme.textPrimary }]} numberOfLines={1}>
                  Arabian Transformers
                </Text>
              </View>

              {/* Box 2: Access Level */}
              <View style={[styles.splitCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
                <Text style={[styles.splitCardLabel, { color: theme.textMuted }]}>Access Level</Text>
                <Text style={[styles.splitCardVal, { color: theme.textPrimary }]} numberOfLines={1}>
                  {isAdmin ? 'Administrator' : 'Standard User'}
                </Text>
              </View>
            </View>

            {/* MENU LIST ITEMS (Matches Image 2 Design with clean icons & > arrows) */}
            <View style={[styles.menuListCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
              {/* Item 1: Account Security & Credentials */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setProfileMsg({ type: '', text: '' });
                  setCurrentView('edit_credentials');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconSquare, { backgroundColor: theme.cardAlt }]}>
                    <Key size={18} color={theme.textPrimary} />
                  </View>
                  <View>
                    <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                      Account Credentials
                    </Text>
                    <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>
                      Update username & password
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>

              <View style={[styles.itemDivider, { backgroundColor: theme.borderLight }]} />

              {/* Item 2: Manage Portal Users (Admin Only) */}
              {isAdmin && (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setIsUserMgmtOpen(true)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={[styles.menuIconSquare, { backgroundColor: theme.cardAlt }]}>
                        <Users size={18} color={theme.textPrimary} />
                      </View>
                      <View>
                        <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                          Manage Portal Users
                        </Text>
                        <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>
                          Add, block, reset & delete users
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={18} color={theme.textMuted} />
                  </TouchableOpacity>

                  <View style={[styles.itemDivider, { backgroundColor: theme.borderLight }]} />
                </>
              )}

              {/* Item 3: Appearance & Theme Switch */}
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconSquare, { backgroundColor: theme.cardAlt }]}>
                    {isDark ? (
                      <Moon size={18} color={theme.textPrimary} />
                    ) : (
                      <Sun size={18} color={theme.textPrimary} />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                    <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>
                      {isDark ? 'Deep dark contrast' : 'Clean bright styling'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#CBD5E1', true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.itemDivider, { backgroundColor: theme.borderLight }]} />

              {/* Item 4: Hardware & Cloud Diagnostics */}
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconSquare, { backgroundColor: theme.cardAlt }]}>
                    <Server size={18} color={theme.textPrimary} />
                  </View>
                  <View>
                    <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                      Cloud & NFC Hardware
                    </Text>
                    <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>
                      Server: Online • NFC: {nfcReady ? 'Active' : 'Ready'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.onlineChip, { backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.borderLight }]}>
                  <Text style={[styles.onlineChipText, { color: theme.textSecondary }]}>ONLINE</Text>
                </View>
              </View>

              <View style={[styles.itemDivider, { backgroundColor: theme.borderLight }]} />

              {/* Item 5: Sign Out */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogoutConfirm}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconSquare, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}>
                    <LogOut size={18} color="#DC2626" />
                  </View>
                  <View>
                    <Text style={[styles.menuItemTitle, { color: '#DC2626' }]}>
                      Sign Out
                    </Text>
                    <Text style={[styles.menuItemSub, { color: theme.textMuted }]}>
                      Log out of portal account
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ height: 110 }} />
          </>
        )}
      </ScrollView>

      {/* Admin User Management Modal (Uses Image 1 Back Arrow) */}
      <UserManagementModal
        visible={isUserMgmtOpen}
        currentUsername={user?.username}
        onClose={() => setIsUserMgmtOpen(false)}
      />
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
    marginBottom: 16
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6
  },
  innerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar?.currentHeight || 28) + 10 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  innerHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  heroCard: {
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    marginBottom: 14,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }
      : {})
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  avatarWrap: {
    position: 'relative'
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  editProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  sessionStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: '500'
  },
  heroName: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  roleOrangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  roleDivider: {
    fontSize: 13
  },
  roleSubBadge: {
    fontSize: 13,
    fontWeight: '700'
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  splitCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }
      : {})
  },
  splitCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4
  },
  splitCardVal: {
    fontSize: 14,
    fontWeight: '800'
  },
  menuListCard: {
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }
      : {})
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1
  },
  menuIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  menuItemSub: {
    fontSize: 11,
    marginTop: 2
  },
  itemDivider: {
    height: 1,
    marginVertical: 2
  },
  onlineChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  onlineChipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 18
  },
  msgBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14
  },
  msgText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1
  },
  inputGroup: {
    marginBottom: 14
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
    height: 50,
    borderRadius: 25,
    gap: 8,
    marginTop: 10
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
