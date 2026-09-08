import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { login } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const REMEMBER_KEY = 'remembered_user_credential';

export default function LoginScreen({ onLoginSuccess }) {
  const { theme, isDark } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRemembered = async () => {
      try {
        const saved = await AsyncStorage.getItem(REMEMBER_KEY);
        if (saved) {
          setUsername(saved);
        }
      } catch (e) {
        console.log('Error loading saved credentials', e);
      }
    };
    loadRemembered();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter your email/username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(username.trim(), password.trim());
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_KEY, username.trim());
      } else {
        await AsyncStorage.removeItem(REMEMBER_KEY);
      }
      if (onLoginSuccess) {
        onLoginSuccess({ token: data.token, username: data.username || username.trim(), role: data.role || (username.trim().toLowerCase() === 'admin' ? 'admin' : 'user') });
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Blue Wave Header (Matches Reference Image) */}
          <ImageBackground
            source={require('../../assets/login_bg.jpg')}
            style={styles.headerBackground}
            imageStyle={styles.headerImage}
            resizeMode="cover"
          >
            <View style={styles.headerOverlay}>
              {/* Company Logo in the Center of Header */}
              <View style={styles.logoCenterContainer}>
                <Image
                  source={require('../../assets/atc_banner_logo.png')}
                  style={styles.companyBannerLogo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.headerTextContainer}>
                <Text style={styles.greetingTitle}>Hello!</Text>
                <Text style={styles.greetingSubtitle}>
                  Securely log in with your email and password.
                </Text>
              </View>
            </View>
          </ImageBackground>

          {/* Bottom Card: 100% Solid Opaque to cleanly overlap header with perfect curve */}
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: isDark ? '#111827' : '#FFFFFF',
                borderTopColor: isDark ? '#1F2937' : '#E2E8F0'
              }
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Sign in</Text>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: isDark ? '#450a0a' : '#FEF2F2' }]}>
                <Text style={[styles.errorText, { color: isDark ? '#f87171' : '#DC2626' }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email / Username Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder
                }
              ]}
            >
              <Mail size={19} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Enter your mail"
                placeholderTextColor={theme.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder
                }
              ]}
            >
              <Lock size={19} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Enter your Password"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={18} color={theme.textMuted} />
                ) : (
                  <Eye size={18} color={theme.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Remember Me Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && { backgroundColor: '#00bf5f', borderColor: '#00bf5f' },
                    !rememberMe && { borderColor: theme.border, backgroundColor: theme.cardAlt }
                  ]}
                >
                  {rememberMe && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={[styles.rememberMeText, { color: theme.textSecondary }]}>
                  Remember me
                </Text>
              </TouchableOpacity>
            </View>

            {/* Primary Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: '#1a9658' }, theme.btnShadow, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            {/* Company Branding Footnote */}
            <View style={styles.brandFooter}>
              <ShieldCheck size={14} color={theme.textMuted} />
              <Text style={[styles.brandFooterText, { color: theme.textMuted }]}>
                Arabian Transformers Portal • Production API
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: SCREEN_HEIGHT
  },
  headerBackground: {
    height: SCREEN_HEIGHT * 0.42,
    width: '100%',
    backgroundColor: '#0B0F19',
    overflow: 'hidden'
  },
  headerImage: {
    opacity: 0.95
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 56, 42, 0.35)',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 40
  },
  logoCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10
  },
  companyBannerLogo: {
    width: '85%',
    maxWidth: 290,
    height: 44
  },
  headerTextContainer: {
    gap: 6
  },
  greetingTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#94A3B8',
    lineHeight: 20
  },
  cardContainer: {
    flex: 1,
    marginTop: -30,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    zIndex: 10,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 24
  },
  errorBox: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '500'
  },
  eyeBtn: {
    padding: 6
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 28
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rememberMeText: {
    fontSize: 13,
    fontWeight: '500'
  },
  signInButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a9658',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5
  },
  buttonDisabled: {
    opacity: 0.65
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  brandFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 36
  },
  brandFooterText: {
    fontSize: 12,
    fontWeight: '500'
  }
});
