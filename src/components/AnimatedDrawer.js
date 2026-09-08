import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Switch,
  Platform,
  StatusBar as RNStatusBar,
  Modal
} from 'react-native';
import {
  X,
  Home,
  LayoutGrid,
  Radio,
  Scan,
  User,
  Sun,
  Moon,
  Server,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export default function AnimatedDrawer({
  visible,
  onClose,
  activeTab,
  onSelectNav,
  totalEmployees,
  onLogout
}) {
  const { theme, isDark, toggleTheme } = useTheme();

  // Animations
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      slideAnim.setValue(DRAWER_WIDTH);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_WIDTH,
          duration: 180,
          useNativeDriver: true
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true
        })
      ]).start(({ finished }) => {
        if (finished) {
          setModalVisible(false);
        }
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true
      })
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const handleNavPress = (tabKey) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true
      })
    ]).start(() => {
      setModalVisible(false);
      onClose();
      if (onSelectNav) {
        onSelectNav(tabKey);
      }
    });
  };

  if (!modalVisible && !visible) {
    return null;
  }

  const navItems = [
    { key: 'home', label: 'Employee Directory', icon: Home },
    { key: 'cards', label: 'Digital Badges Grid', icon: LayoutGrid },
    { key: 'write', label: 'Program NFC Card', icon: Radio, accent: true },
    { key: 'scan', label: 'Inspect Physical Tag', icon: Scan },
    { key: 'account', label: 'My Account & Cloud', icon: User }
  ];

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlayContainer}>
        {/* Animated Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim
            }
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Sliding Drawer Panel */}
        <Animated.View
          style={[
            styles.drawerPanel,
            {
              backgroundColor: isDark ? '#161F30' : '#FFFFFF',
              borderLeftColor: theme.border,
              transform: [{ translateX: slideAnim }]
            },
            theme.shadow
          ]}
        >
          {/* Drawer Header */}
          <View style={[styles.drawerHeader, { borderBottomColor: theme.borderLight }]}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
                  Arabian Transformers
                </Text>
                <Text style={[styles.brandSubtitle, { color: theme.primary }]}>
                  NFC Business Card Portal
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.cardAlt, borderWidth: 1, borderColor: theme.borderLight }]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats Pill */}
          <View style={[styles.statsPill, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}>
            <Sparkles size={14} color={theme.primary} />
            <Text style={[styles.statsText, { color: theme.textPrimary }]}>
              {totalEmployees || 12} Registered Employees
            </Text>
          </View>

          {/* Navigation List */}
          <View style={styles.navList}>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.navItem,
                    isSelected && { backgroundColor: isDark ? '#1E293B' : theme.primaryLight },
                    item.accent && { borderColor: '#00bf5f', borderWidth: 1 }
                  ]}
                  onPress={() => handleNavPress(item.key)}
                  activeOpacity={0.75}
                >
                  <View style={styles.navItemLeft}>
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: item.accent
                            ? 'rgba(0, 191, 95, 0.15)'
                            : isSelected
                            ? theme.primary
                            : theme.cardAlt
                        }
                      ]}
                    >
                      <IconComp
                        size={18}
                        color={
                          item.accent
                            ? '#00bf5f'
                            : isSelected
                            ? '#FFFFFF'
                            : theme.textSecondary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.navItemLabel,
                        {
                          color: item.accent
                            ? '#00bf5f'
                            : isSelected
                            ? theme.primary
                            : theme.textPrimary,
                          fontWeight: isSelected ? '800' : '600'
                        }
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  <ChevronRight
                    size={16}
                    color={isSelected ? theme.primary : theme.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Theme Appearance Card */}
          <View style={[styles.appearanceCard, { backgroundColor: theme.cardAlt, borderColor: theme.borderLight }]}>
            <View style={styles.appearanceLeft}>
              {isDark ? (
                <Moon size={18} color={theme.textPrimary} />
              ) : (
                <Sun size={18} color={theme.textPrimary} />
              )}
              <View>
                <Text style={[styles.appearanceTitle, { color: theme.textPrimary }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text style={[styles.appearanceSub, { color: theme.textSecondary }]}>
                  Tap switch to toggle
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

          {/* Server Status Footnote */}
          <View style={styles.serverRow}>
            <Server size={14} color="#16A34A" />
            <Text style={styles.serverText}>QR.arabiantransformers.cloud (Online)</Text>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: isDark ? '#450A0A' : '#FEF2F2', borderColor: '#DC2626' }]}
            onPress={() => {
              handleClose();
              if (onLogout) onLogout();
            }}
            activeOpacity={0.8}
          >
            <LogOut size={16} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)'
  },
  drawerPanel: {
    width: DRAWER_WIDTH,
    height: '100%',
    borderLeftWidth: 1,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar?.currentHeight || 28) + 16 : 54,
    paddingHorizontal: 20,
    paddingBottom: 32,
    justifyContent: 'space-between'
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 8
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 14
  },
  statsText: {
    fontSize: 12,
    fontWeight: '700'
  },
  navList: {
    gap: 8,
    flex: 1
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navItemLabel: {
    fontSize: 14
  },
  appearanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 12
  },
  appearanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  appearanceTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  appearanceSub: {
    fontSize: 10
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12
  },
  serverText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700'
  }
});
