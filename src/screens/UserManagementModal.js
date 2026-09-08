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
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar
} from 'react-native';
import {
  ArrowLeft,
  X,
  UserPlus,
  Users,
  Shield,
  User,
  Key,
  Trash2,
  Ban,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import {
  getUsers,
  registerUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser
} from '../services/api';

export default function UserManagementModal({ visible, currentUsername, onClose }) {
  const { theme, isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [addingUser, setAddingUser] = useState(false);

  // Reset Password Modal State
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resettingPass, setResettingPass] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchUsers();
      setError('');
      setSuccess('');
    }
  }, [visible]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      setError('');
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch portal users.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setAddingUser(true);
    setError('');

    try {
      await registerUser({
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newRole
      });
      setSuccess('User "' + newUsername.trim() + '" added successfully.');
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      setIsAddUserOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setAddingUser(false);
    }
  };

  const handleToggleStatus = (targetUser) => {
    if (targetUser.username === currentUsername) {
      Alert.alert('Security Restriction', 'You cannot block your own logged-in admin account.');
      return;
    }

    const nextStatus = targetUser.status === 'active' ? 'blocked' : 'active';
    const actionLabel = nextStatus === 'blocked' ? 'Block' : 'Unblock';

    Alert.alert(
      actionLabel + ' User',
      'Are you sure you want to ' + actionLabel.toLowerCase() + ' "' + targetUser.username + '"?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: nextStatus === 'blocked' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await updateUserStatus(targetUser.id, nextStatus);
              setSuccess('User "' + targetUser.username + '" is now ' + nextStatus + '.');
              fetchUsers();
            } catch (err) {
              Alert.alert('Status Error', err.message || 'Could not update user status.');
            }
          }
        }
      ]
    );
  };

  const handleResetPassword = async () => {
    if (!resetPasswordVal.trim()) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }

    setResettingPass(true);
    try {
      await resetUserPassword(selectedUserForReset.id, resetPasswordVal.trim());
      setSuccess('Password for "' + selectedUserForReset.username + '" updated.');
      setSelectedUserForReset(null);
      setResetPasswordVal('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not reset password.');
    } finally {
      setResettingPass(false);
    }
  };

  const handleDeleteUser = (targetUser) => {
    if (targetUser.username === currentUsername) {
      Alert.alert('Security Restriction', 'You cannot delete your own logged-in admin account.');
      return;
    }

    Alert.alert(
      'Delete User Account',
      'Are you sure you want to permanently delete user "' + targetUser.username + '"? This will revoke all portal access immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(targetUser.id);
              setSuccess('User "' + targetUser.username + '" deleted.');
              fetchUsers();
            } catch (err) {
              Alert.alert('Delete Error', err.message || 'Could not delete user.');
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
            Portal User Management
          </Text>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#1a9658' }, theme.btnShadow]}
            onPress={() => setIsAddUserOpen(true)}
            activeOpacity={0.8}
          >
            <UserPlus size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Banners */}
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

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.usersList}>
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                const isCurrent = u.username === currentUsername;
                const isBlocked = u.status === 'blocked';

                return (
                  <View
                    key={u.id}
                    style={[
                      styles.userCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border
                      },
                      theme.shadow
                    ]}
                  >
                    <View style={styles.userCardHeader}>
                      <View style={[styles.userAvatar, { backgroundColor: isAdmin ? '#EFF6FF' : theme.cardAlt }]}>
                        {isAdmin ? (
                          <Shield size={20} color={theme.primary} />
                        ) : (
                          <User size={20} color={theme.textSecondary} />
                        )}
                      </View>

                      <View style={styles.userInfo}>
                        <View style={styles.usernameRow}>
                          <Text style={[styles.usernameText, { color: theme.textPrimary }]}>
                            {u.username}
                          </Text>
                          {isCurrent && (
                            <View style={[styles.youBadge, { backgroundColor: theme.primaryLight }]}>
                              <Text style={[styles.youBadgeText, { color: theme.primary }]}>YOU</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.badgesRow}>
                          <View
                            style={[
                              styles.roleBadge,
                              { backgroundColor: isAdmin ? theme.primaryLight : theme.cardAlt }
                            ]}
                          >
                            <Text
                              style={[
                                styles.roleBadgeText,
                                { color: isAdmin ? theme.primary : theme.textSecondary }
                              ]}
                            >
                              {isAdmin ? 'ADMINISTRATOR' : 'OPERATOR'}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: isBlocked ? '#FEF2F2' : theme.badgeSuccessBg }
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: isBlocked ? '#DC2626' : theme.badgeSuccessText }
                              ]}
                            >
                              {isBlocked ? 'BLOCKED' : 'ACTIVE'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons Row */}
                    <View style={[styles.actionRow, { borderTopColor: theme.borderLight }]}>
                      {/* Change Password Button */}
                      <TouchableOpacity
                        style={[styles.userActionBtn, { backgroundColor: theme.cardAlt }]}
                        onPress={() => setSelectedUserForReset(u)}
                        activeOpacity={0.7}
                      >
                        <Key size={14} color={theme.textPrimary} />
                        <Text style={[styles.userActionBtnText, { color: theme.textPrimary }]}>
                          Password
                        </Text>
                      </TouchableOpacity>

                      {/* Block / Unblock Button */}
                      {!isCurrent && (
                        <TouchableOpacity
                          style={[
                            styles.userActionBtn,
                            { backgroundColor: isBlocked ? '#ECFDF5' : '#FEF2F2' }
                          ]}
                          onPress={() => handleToggleStatus(u)}
                          activeOpacity={0.7}
                        >
                          <Ban size={14} color={isBlocked ? '#059669' : '#DC2626'} />
                          <Text
                            style={[
                              styles.userActionBtnText,
                              { color: isBlocked ? '#059669' : '#DC2626' }
                            ]}
                          >
                            {isBlocked ? 'Unblock' : 'Block'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Delete Button */}
                      {!isCurrent && (
                        <TouchableOpacity
                          style={[styles.userActionBtn, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2' }]}
                          onPress={() => handleDeleteUser(u)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={14} color="#DC2626" />
                          <Text style={[styles.userActionBtnText, { color: '#DC2626' }]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Add User Sub-Modal */}
        <Modal
          visible={isAddUserOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsAddUserOpen(false)}
        >
          <View style={styles.subModalBackdrop}>
            <View style={[styles.subModalCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
              <View style={styles.subModalHeader}>
                <Text style={[styles.subModalTitle, { color: theme.textPrimary }]}>Register New User</Text>
                <TouchableOpacity onPress={() => setIsAddUserOpen(false)}>
                  <X size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalInputLabel, { color: theme.textSecondary }]}>USERNAME</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  placeholder="e.g. operator_1"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalInputLabel, { color: theme.textSecondary }]}>PASSWORD</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Set initial password"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalInputLabel, { color: theme.textSecondary }]}>ROLE</Text>
                <View style={styles.roleToggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      newRole === 'user' && { backgroundColor: '#1a9658', borderColor: '#1a9658' }
                    ]}
                    onPress={() => setNewRole('user')}
                  >
                    <Text style={[styles.roleOptionText, newRole === 'user' && { color: '#FFFFFF' }]}>
                      Operator
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      newRole === 'admin' && { backgroundColor: '#1a9658', borderColor: '#1a9658' }
                    ]}
                    onPress={() => setNewRole('admin')}
                  >
                    <Text style={[styles.roleOptionText, newRole === 'admin' && { color: '#FFFFFF' }]}>
                      Administrator
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitModalBtn, { backgroundColor: '#1a9658' }, theme.btnShadow, addingUser && { opacity: 0.6 }]}
                onPress={handleAddUser}
                disabled={addingUser}
              >
                {addingUser ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitModalBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Change User Password Sub-Modal */}
        <Modal
          visible={!!selectedUserForReset}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedUserForReset(null)}
        >
          <View style={styles.subModalBackdrop}>
            <View style={[styles.subModalCard, { backgroundColor: theme.card, borderColor: theme.border }, theme.shadow]}>
              <View style={styles.subModalHeader}>
                <Text style={[styles.subModalTitle, { color: theme.textPrimary }]}>
                  Reset Password for {selectedUserForReset?.username}
                </Text>
                <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.borderLight, alignItems: 'center', justifyContent: 'center' }} onPress={() => setSelectedUserForReset(null)}>
                  <X size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalInputLabel, { color: theme.textSecondary }]}>NEW PASSWORD</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                  value={resetPasswordVal}
                  onChangeText={setResetPasswordVal}
                  placeholder="Enter new password"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.submitModalBtn, { backgroundColor: '#1a9658' }, theme.btnShadow, resettingPass && { opacity: 0.6 }]}
                onPress={handleResetPassword}
                disabled={resettingPass}
              >
                {resettingPass ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitModalBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6
  },
  addBtnText: {
    color: '#FFFFFF',
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
  usersList: {
    gap: 14
  },
  userCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  userInfo: {
    flex: 1
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1
  },
  userActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6
  },
  userActionBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  subModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  subModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1
  },
  subModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  subModalTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  modalInputGroup: {
    marginBottom: 14
  },
  modalInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  modalInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 10
  },
  roleOption: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '700'
  },
  submitModalBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  submitModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
