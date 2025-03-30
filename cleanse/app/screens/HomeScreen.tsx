import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

const HomeScreen = () => {
  const router = useRouter();
  const { healthData } = useUser();

  const navigateToScanner = () => {
    router.push('/camera');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>Hello,</Text>
          <View style={styles.profileImageContainer}>
            <Ionicons name="person-circle" size={40} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.title}>Ready to scan?</Text>
        <Text style={styles.subtitle}>
          Scan product barcodes to get personalized health insights
        </Text>
      </View>

      <View style={styles.scanCardContainer}>
        <View style={styles.scanCard}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3395/3395538.png' }} 
            style={styles.scanImage}
            resizeMode="contain"
          />
          <Text style={styles.scanCardTitle}>Scan a Product</Text>
          <Text style={styles.scanCardDescription}>
            Get immediate health insights based on your profile
          </Text>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={navigateToScanner}
            activeOpacity={0.7}
          >
            <Text style={styles.scanButtonText}>Scan Now</Text>
            <MaterialCommunityIcons name="barcode-scan" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileSummaryContainer}>
        <Text style={styles.sectionTitle}>Your Health Profile</Text>
        
        <View style={styles.profileSummaryCard}>
          <View style={styles.profileInfo}>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Age</Text>
              <Text style={styles.profileValue}>{healthData.age || '-'}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Weight</Text>
              <Text style={styles.profileValue}>{healthData.weight ? `${healthData.weight} kg` : '-'}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Height</Text>
              <Text style={styles.profileValue}>{healthData.height ? `${healthData.height} cm` : '-'}</Text>
            </View>
          </View>

          {/* Display health conditions if any */}
          {(healthData.conditions.highBloodPressure ||
            healthData.conditions.diabetes ||
            healthData.conditions.heartDisease ||
            healthData.conditions.kidneyDisease ||
            healthData.conditions.pregnant ||
            healthData.conditions.cancer ||
            healthData.conditions.dietaryRestrictions.length > 0) && (
            <View style={styles.conditionsContainer}>
              <Text style={styles.conditionsTitle}>Health Considerations</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conditionsScroll}>
                {healthData.conditions.highBloodPressure && (
                  <View style={styles.conditionTag}>
                    <Text style={styles.conditionText}>High Blood Pressure</Text>
                  </View>
                )}
                {healthData.conditions.diabetes && (
                  <View style={styles.conditionTag}>
                    <Text style={styles.conditionText}>Diabetes</Text>
                  </View>
                )}
                {healthData.conditions.heartDisease && (
                  <View style={styles.conditionTag}>
                    <Text style={styles.conditionText}>Heart Disease</Text>
                  </View>
                )}
                {healthData.conditions.kidneyDisease && (
                  <View style={styles.conditionTag}>
                    <Text style={styles.conditionText}>Kidney Disease</Text>
                  </View>
                )}
                {healthData.conditions.pregnant && (
                  <View style={styles.conditionTag}>
                    <Text style={styles.conditionText}>Pregnant</Text>
                  </View>
                )}
                {healthData.conditions.cancer && (
                  <View style={styles.conditionTag}>
                    <Text style={styles.conditionText}>Cancer</Text>
                  </View>
                )}
                {healthData.conditions.dietaryRestrictions.map((restriction, index) => (
                  <View key={index} style={styles.conditionTag}>
                    <Text style={styles.conditionText}>{restriction}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Tips & Insights</Text>
        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <Ionicons name="nutrition" size={24} color={COLORS.secondary} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Scan products before buying</Text>
            <Text style={styles.tipDescription}>Get personalized health insights tailored to your health profile.</Text>
          </View>
        </View>
        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <Ionicons name="water" size={24} color={COLORS.secondary} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Stay hydrated</Text>
            <Text style={styles.tipDescription}>Drink water regularly throughout the day for better health.</Text>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingTop: SIZES.paddingLarge * 3,
    paddingBottom: SIZES.paddingLarge,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...SHADOWS.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.marginMedium,
  },
  greeting: {
    ...FONTS.regular,
    fontSize: SIZES.large,
    color: COLORS.darkGray,

  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.primary,
    marginBottom: SIZES.marginSmall,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  scanCardContainer: {
    paddingHorizontal: SIZES.paddingLarge,
    marginTop: SIZES.marginLarge,
    zIndex: 1,
  },
  scanCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  scanImage: {
    width: 120,
    height: 120,
    marginBottom: SIZES.marginMedium,
  },
  scanCardTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
    textAlign: 'center',
  },
  scanCardDescription: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: SIZES.marginLarge,
  },
  scanButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.borderRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...SHADOWS.small,
  },
  scanButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginRight: SIZES.marginSmall,
  },
  profileSummaryContainer: {
    paddingHorizontal: SIZES.paddingLarge,
    marginTop: SIZES.marginLarge,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.marginMedium,
  },
  profileSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    ...SHADOWS.small,
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.marginLarge,
  },
  profileItem: {
    alignItems: 'center',
  },
  profileLabel: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginBottom: SIZES.marginSmall / 2,
  },
  profileValue: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  conditionsContainer: {
    marginTop: SIZES.marginSmall,
  },
  conditionsTitle: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginBottom: SIZES.marginSmall,
  },
  conditionsScroll: {
    flexDirection: 'row',
  },
  conditionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionTag: {
    backgroundColor: COLORS.primary + '15', // 15% opacity
    paddingVertical: SIZES.paddingSmall / 2,
    paddingHorizontal: SIZES.paddingSmall,
    borderRadius: SIZES.borderRadiusFull,
    marginRight: SIZES.marginSmall,
    marginBottom: SIZES.marginSmall,
  },
  conditionText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  tipsContainer: {
    paddingHorizontal: SIZES.paddingLarge,
    marginTop: SIZES.marginLarge,
  },
  tipCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginMedium,
    ...SHADOWS.small,
  },
  tipIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.marginMedium,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall / 2,
  },
  tipDescription: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  spacer: {
    height: 100, // Space for the tab bar
  },
});

export default HomeScreen; 