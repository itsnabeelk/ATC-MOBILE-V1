import React, { useState, useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Search,
  Radio,
  Phone,
  Mail,
  Award,
  RefreshCw,
  User,
  ArrowRight,
  Menu,
  Sparkles,
  ExternalLink
} from 'lucide-react-native';
import { getEmployees } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import AnimatedDrawer from '../components/AnimatedDrawer';

export default function DirectoryScreen({
  onOpenDrawer,
  onSelectEmployee,
  onNavigateTab,
  onOpenNfcScanner,
  onLogout
}) {
  const { theme, isDark } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchList = async () => {
    try {
      setError('');
      const data = await getEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to load employee directory.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = employees.filter((emp) => {
      const name = (emp.name || '').toLowerCase();
      const pos = (emp.position || '').toLowerCase();
      const email = (emp.email || '').toLowerCase();
      return name.includes(q) || pos.includes(q) || email.includes(q);
    });
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchList();
  };

  const handleCall = (phone) => {
    if (phone) Linking.openURL('tel:' + phone);
  };

  const handleEmail = (email) => {
    if (email) Linking.openURL('mailto:' + email);
  };

  const handleDrawerNav = (key) => {
    setIsDrawerOpen(false);
    if (key === 'home') return;
    if (key === 'scan') {
      if (onOpenNfcScanner) onOpenNfcScanner();
      return;
    }
    if (key === 'write') {
      if (employees.length > 0 && onSelectEmployee) {
        onSelectEmployee(employees[0]);
      }
      return;
    }
    if (onNavigateTab) {
      onNavigateTab(key);
    }
  };

  const renderEmployeeItem = ({ item }) => {
    const initials = (item.name || 'U')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const cardCode = '^AT-' + String(item.id).padStart(4, '0');

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border
          },
          theme.shadow
        ]}
        onPress={() => onSelectEmployee(item)}
        activeOpacity={0.85}
      >
        

        {/* Employee Info Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}>
            <Text style={[styles.avatarText, { color: theme.textPrimary }]}>{initials}</Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.empName, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.position ? (
              <View style={[styles.badge, { backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.borderLight }]}>
                <Award size={11} color={theme.textSecondary} />
                <Text style={[styles.badgeText, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.position}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Forward Action Button (Matches Image 3 Navigate style) */}
        <TouchableOpacity
          style={[styles.actionPillBtn, { backgroundColor: '#1a9658' }, theme.btnShadow]}
          onPress={() => onSelectEmployee(item)}
          activeOpacity={0.85}
        >
          <View style={styles.actionBtnContent}>
            <Radio size={16} color='#FFFFFF' />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
              Program NFC & Details
            </Text>
          </View>
          <ArrowRight size={16} color='#FFFFFF' />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header with Hamburger Menu Button */}
      <View style={[styles.topBar, { borderBottomColor: theme.borderLight }]}>
        <View style={styles.brandContainer}>
          <Text style={[styles.topTitle, { color: theme.textPrimary }]}>Arabian Transformers</Text>
          <Text style={[styles.topSubtitle, { color: theme.primary }]}>
            NFC Business Cards
          </Text>
        </View>

        {/* Stylish Hamburger Button */}
        <TouchableOpacity
          style={[styles.hamburgerBtn, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}
          onPress={onOpenDrawer}
          activeOpacity={0.75}
        >
          <Menu size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar (Matches Image 3) */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: theme.card,
              borderColor: theme.border
            },
            theme.shadow
          ]}
        >
          <Search size={18} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search employee or position..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Directory Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Syncing directory from server...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: '#1a9658' }, theme.btnShadow]}
            onPress={fetchList}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredEmployees.length === 0 ? (
        <View style={styles.centerContainer}>
          <User size={44} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No matching employees found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEmployeeItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        />
      )}

      </SafeAreaView>
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
    paddingTop: Platform.OS === 'android' ? (RNStatusBar?.currentHeight || 28) + 16 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  topSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2
  },
  hamburgerBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }
      : {})
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 110,
    gap: 16
  },
  card: {
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }
      : {})
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10
  },
  codePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  statusChipText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 14
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800'
  },
  cardInfo: {
    flex: 1
  },
  empName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
    marginTop: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  contactsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  contactText: {
    fontSize: 13,
    fontWeight: '500'
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 18,
    marginTop: 14
  },
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingText: {
    fontSize: 13,
    marginTop: 12
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12
  }
});
