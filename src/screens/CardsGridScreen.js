import React, { useState, useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  Share,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  CreditCard,
  Radio,
  Share2,
  ExternalLink,
  Award,
  Sparkles,
  QrCode
} from 'lucide-react-native';
import { getEmployees } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

export default function CardsGridScreen({ onSelectEmployee }) {
  const { theme, isDark } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (e) {
      console.log('Error loading cards', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (emp) => {
    const url = `https://QR.arabiantransformers.cloud/profile/${emp.id}`;
    try {
      await Share.share({
        title: `${emp.name} - Digital Business Card`,
        message: `Connect with ${emp.name} (${emp.position || 'Arabian Transformers'}): ${url}`,
        url: url
      });
    } catch (err) {
      console.log('Share error', err);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (Matching Reference Image Standards) */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Digital Badges</Text>
          <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
            NFC-Ready Smart Profiles
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.cardsList}>
            {employees.map((emp) => {
              const codeId = `^AT-${String(emp.id).padStart(4, '0')}`;

              return (
                <View
                  key={emp.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border
                    },
                    theme.shadow
                  ]}
                >
                  {/* Card Header: Name & Position on Left, Share Icon on Right */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.empDetails}>
                      <Text style={[styles.empName, { color: theme.textPrimary }]}>
                        {emp.name}
                      </Text>
                      <Text style={[styles.empPosition, { color: theme.textSecondary }]}>
                        {emp.position || 'Arabian Transformers Co.'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.shareIconBtn,
                        {
                          backgroundColor: theme.cardAlt,
                          borderWidth: 1,
                          borderColor: theme.borderLight
                        }
                      ]}
                      onPress={() => handleShare(emp)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.shareIconWrap}>
                        <Share2 size={16} color={theme.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Program NFC Card Button (Matching Black Pill / Forward Style) */}
                  <TouchableOpacity
                    style={[styles.programBtn, { backgroundColor: '#1a9658' }, theme.btnShadow]}
                    onPress={() => onSelectEmployee(emp)}
                    activeOpacity={0.85}
                  >
                    <Radio size={16} color="#FFFFFF" />
                    <Text style={styles.programBtnText}>Write to NFC Card</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
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
    marginBottom: 20
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500'
  },
  cardsList: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  empDetails: {
    flex: 1,
    marginRight: 12
  },
  empName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  empPosition: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4
  },
  shareIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shareIconWrap: {
    transform: [{ rotate: '-35deg' }]
  },
  programBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#1a9658',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  programBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
