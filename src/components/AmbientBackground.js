import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function AmbientBackground() {
  const { isDark } = useTheme();

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top Ambient Glow Aura (Matches Reference Image Branding Style) */}
      <View
        style={[
          styles.glowTop,
          {
            backgroundColor: isDark
              ? 'rgba(6, 56, 42, 0.55)'
              : 'rgba(0, 191, 95, 0.09)'
          }
        ]}
      />

      {/* Middle Right Ambient Glow Aura */}
      <View
        style={[
          styles.glowRight,
          {
            backgroundColor: isDark
              ? 'rgba(0, 191, 95, 0.12)'
              : 'rgba(26, 150, 88, 0.07)'
          }
        ]}
      />

      {/* Bottom Center Subtle Glow */}
      <View
        style={[
          styles.glowBottom,
          {
            backgroundColor: isDark
              ? 'rgba(6, 56, 42, 0.35)'
              : 'rgba(0, 191, 95, 0.05)'
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -60,
    width: 360,
    height: 360,
    borderRadius: 180,
    ...(Platform.OS === 'web'
      ? { filter: 'blur(80px)' }
      : { opacity: 0.5 })
  },
  glowRight: {
    position: 'absolute',
    top: '32%',
    right: -90,
    width: 320,
    height: 320,
    borderRadius: 160,
    ...(Platform.OS === 'web'
      ? { filter: 'blur(85px)' }
      : { opacity: 0.45 })
  },
  glowBottom: {
    position: 'absolute',
    bottom: -60,
    left: '15%',
    width: 280,
    height: 280,
    borderRadius: 140,
    ...(Platform.OS === 'web'
      ? { filter: 'blur(80px)' }
      : { opacity: 0.35 })
  }
});
