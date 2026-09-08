import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { getStoredUser, clearAuthData, syncUserRoleFromDb } from './src/services/api';
import { initNfc } from './src/services/nfc';
import LoginScreen from './src/screens/LoginScreen';
import DirectoryScreen from './src/screens/DirectoryScreen';
import CardsGridScreen from './src/screens/CardsGridScreen';
import AccountScreen from './src/screens/AccountScreen';
import NfcScannerScreen from './src/screens/NfcScannerScreen';
import FloatingNavBar from './src/components/FloatingNavBar';
import NfcModal from './src/screens/NfcModal';
import NfcScannerModal from './src/screens/NfcScannerModal';
import EmployeeDetailModal from './src/screens/EmployeeDetailModal';
import AnimatedDrawer from './src/components/AnimatedDrawer';
import AmbientBackground from './src/components/AmbientBackground';
import UserManagementModal from './src/screens/UserManagementModal';

function MainApp() {
  const { theme, isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Active navigation tab: 'home' | 'cards' | 'scan' | 'account'
  const [activeTab, setActiveTab] = useState('home');

  // Hamburger Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Selected employee for NFC Writer Modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isNfcWriterVisible, setIsNfcWriterVisible] = useState(false);

  // Selected employee for Full Detail Modal (with Edit, Delete, and Program NFC)
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Quick Scanner popup (for quick actions)
  const [isNfcScannerVisible, setIsNfcScannerVisible] = useState(false);

  // Admin User Management Modal
  const [isUserMgmtVisible, setIsUserMgmtVisible] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      // 1. Initialize hardware NFC Core safely
      await initNfc();

      // 2. Check stored session and sync live database role
      const user = await syncUserRoleFromDb();
      if (user && user.token) {
        setCurrentUser(user);
      }
      setInitializing(false);
    };

    bootstrap();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('home');
  };

  const handleLogout = async () => {
    await clearAuthData();
    setCurrentUser(null);
    setActiveTab('home');
    setIsDetailModalVisible(false);
    setIsNfcWriterVisible(false);
    setIsNfcScannerVisible(false);
    setIsUserMgmtVisible(false);
    setIsDrawerOpen(false);
  };

  // Open Full Detail Modal when card is selected
  const handleOpenEmployeeDetail = (employee) => {
    setSelectedEmployeeForDetail(employee);
    setIsDetailModalVisible(true);
  };

  // Trigger NFC Programmer directly
  const handleOpenNfcWriter = (employee) => {
    setSelectedEmployee(employee);
    setIsNfcWriterVisible(true);
  };

  const handleDrawerNav = (key) => {
    setIsDrawerOpen(false);
    if (key === 'home') {
      setActiveTab('home');
      return;
    }
    if (key === 'cards') {
      setActiveTab('cards');
      return;
    }
    if (key === 'account') {
      setActiveTab('account');
      return;
    }
    if (key === 'scan') {
      setActiveTab('scan');
      return;
    }
    if (key === 'write') {
      if (selectedEmployeeForDetail) {
        setIsNfcWriterVisible(true);
      } else {
        setActiveTab('home');
      }
      return;
    }
  };

  if (initializing) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: '#FFFFFF' }]}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <Image
          source={require('./assets/atc_green_logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="#1a9658" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={theme.background}
      />

      {/* Ambient Emerald Brand Aura (Matches Reference Image Branding Style) */}
      <AmbientBackground />

      {/* Screen Content based on Active Tab */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <DirectoryScreen
            onSelectEmployee={handleOpenEmployeeDetail}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onNavigateTab={setActiveTab}
            onOpenNfcScanner={() => setActiveTab('scan')}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'cards' && (
          <CardsGridScreen onSelectEmployee={handleOpenEmployeeDetail} />
        )}

        {activeTab === 'scan' && (
          <NfcScannerScreen />
        )}

        {activeTab === 'account' && (
          <AccountScreen
            onLogout={handleLogout}
            onUsernameChanged={(newU) => setCurrentUser((prev) => ({ ...prev, username: newU }))}
          />
        )}
      </View>

      {/* Floating Bottom Navigation Bar (Matches Attached Image Style with Sliding Orange Circle) */}
      {!isDrawerOpen && (
        <FloatingNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* Animated Hamburger Drawer */}
      <AnimatedDrawer
        visible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectNav={handleDrawerNav}
        totalEmployees={12}
        onLogout={handleLogout}
      />

      {/* Full Employee Detail Modal (With Edit, Delete, and Program NFC) */}
      <EmployeeDetailModal
        visible={isDetailModalVisible}
        employee={selectedEmployeeForDetail}
        onClose={() => setIsDetailModalVisible(false)}
        onOpenNfcWriter={handleOpenNfcWriter}
        onEmployeeUpdated={(updated) => setSelectedEmployeeForDetail(updated)}
        onEmployeeDeleted={() => {
          setSelectedEmployeeForDetail(null);
          setIsDetailModalVisible(false);
        }}
      />

      {/* Hardware NFC Writer Modal */}
      <NfcModal
        visible={isNfcWriterVisible}
        employee={selectedEmployee}
        onClose={() => setIsNfcWriterVisible(false)}
      />

      {/* Quick NFC Scanner Modal */}
      <NfcScannerModal
        visible={isNfcScannerVisible}
        onClose={() => setIsNfcScannerVisible(false)}
      />

      {/* Admin User Management Modal */}
      <UserManagementModal
        visible={isUserMgmtVisible}
        currentUsername={currentUser?.username}
        onClose={() => setIsUserMgmtVisible(false)}
      />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  splashLogo: {
    width: 260,
    height: 106
  },
  screenContainer: {
    flex: 1,
    zIndex: 1
  },
  tabView: {
    ...StyleSheet.absoluteFillObject
  },
  tabViewActive: {
    opacity: 1,
    zIndex: 10
  },
  tabViewHidden: {
    opacity: 0,
    zIndex: 0,
    pointerEvents: 'none'
  }
});
