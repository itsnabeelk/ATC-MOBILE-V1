import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform
} from 'react-native';
import { Home, LayoutGrid, Scan, User } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const TABS = [
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'cards', icon: LayoutGrid, label: 'Cards' },
  { key: 'scan', icon: Scan, label: 'Scan' },
  { key: 'account', icon: User, label: 'Account' }
];

export default function FloatingNavBar({ activeTab, onTabChange }) {
  const { isDark } = useTheme();

  // Individual spring scale animations for each tab to give tactile micro-animation
  const animScales = {
    home: useRef(new Animated.Value(activeTab === 'home' ? 1 : 0.85)).current,
    cards: useRef(new Animated.Value(activeTab === 'cards' ? 1 : 0.85)).current,
    scan: useRef(new Animated.Value(activeTab === 'scan' ? 1 : 0.85)).current,
    account: useRef(new Animated.Value(activeTab === 'account' ? 1 : 0.85)).current
  };

  useEffect(() => {
    TABS.forEach((tab) => {
      const isActive = activeTab === tab.key;
      Animated.spring(animScales[tab.key], {
        toValue: isActive ? 1 : 0.85,
        friction: 5,
        tension: 110,
        useNativeDriver: true
      }).start();
    });
  }, [activeTab]);

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      {/* Compact Dock with Metallic Silver Rim from Reference Image */}
      <View
        style={[
          styles.dock,
          {
            borderColor: 'rgba(0, 191, 95, 0.4)',
            backgroundColor: '#06382a'
          }
        ]}
      >
        {TABS.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.85}
            >
              {/* Direct Centered Circle Container: 100% mathematically centered around the icon */}
              <Animated.View
                style={[
                  styles.circleContainer,
                  isActive && styles.activeCircle,
                  {
                    transform: [{ scale: animScales[tab.key] }]
                  }
                ]}
              >
                <IconComp
                  size={21}
                  color='#FFFFFF'
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 18,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '78%',
    maxWidth: 270, // Made dock width even smaller and more compact
    height: 58,
    borderRadius: 29,
    borderWidth: 1.8,
    paddingHorizontal: 6,
    shadowColor: '#00bf5f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 14
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  circleContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCircle: {
    backgroundColor: '#00bf5f', // Radiant fiery orange from reference image
    shadowColor: '#00bf5f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 8
  }
});
