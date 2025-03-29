import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './context/UserContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { healthData } = useUser();

  const navigateToScanner = () => {
    router.push('/camera');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Cleanse</Text>
        <Text style={styles.subtitle}>
          Scan product barcodes to get personalized health insights
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>Your Health Profile</Text>
          
          <View style={styles.profileInfo}>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Age</Text>
              <Text style={styles.profileValue}>{healthData.age}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Weight</Text>
              <Text style={styles.profileValue}>{healthData.weight} kg</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Height</Text>
              <Text style={styles.profileValue}>{healthData.height} cm</Text>
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
              <View style={styles.conditionsList}>
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
              </View>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.scanButton}
        onPress={navigateToScanner}
        activeOpacity={0.7}
      >
        <Text style={styles.scanButtonText}>Scan a Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: SIZES.paddingLarge,
  },
  header: {
    paddingHorizontal: SIZES.paddingLarge,
    marginBottom: SIZES.marginLarge,
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
  content: {
    flex: 1,
    paddingHorizontal: SIZES.paddingLarge,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    ...SHADOWS.medium,
  },
  profileTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.text,
    marginBottom: SIZES.marginLarge,
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
    marginTop: SIZES.marginMedium,
  },
  conditionsTitle: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginBottom: SIZES.marginSmall,
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
  scanButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    margin: SIZES.marginLarge,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  scanButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.white,
  },
}); 