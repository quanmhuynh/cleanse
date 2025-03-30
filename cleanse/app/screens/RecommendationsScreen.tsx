import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useUser } from '../context/UserContext';

// Define types
interface RecommendationCategory {
  id: string;
  label: string;
}

interface RecommendedProduct {
  id: string;
  productName: string;
  brand: string;
  imageUrl: string;
  healthScore: number;
  benefits: string[];
  reasonForRecommendation: string;
}

// Mock data for recommended products - in a real app this would come from an API
const mockRecommendedData: RecommendedProduct[] = [
  {
    id: '1',
    productName: 'Organic Steel Cut Oats',
    brand: 'Honest Harvest',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2515/2515264.png',
    healthScore: 95,
    benefits: [
      'High in fiber',
      'Low sugar content',
      'Good for heart health'
    ],
    reasonForRecommendation: 'Based on your health profile and dietary preferences'
  },
  {
    id: '2',
    productName: 'Plant-Based Protein Shake',
    brand: 'Green Power',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2553/2553651.png',
    healthScore: 90,
    benefits: [
      'High protein content',
      'No artificial sweeteners',
      'Good for muscle recovery'
    ],
    reasonForRecommendation: 'Similar to products you\'ve scanned before'
  },
  {
    id: '3',
    productName: 'Sugar-Free Dark Chocolate',
    brand: 'Sweet Balance',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2431/2431977.png',
    healthScore: 82,
    benefits: [
      'No added sugar',
      'Rich in antioxidants',
      'Heart-healthy alternative'
    ],
    reasonForRecommendation: 'Healthier alternative to previously scanned products'
  },
  {
    id: '4',
    productName: 'Low-Sodium Vegetable Broth',
    brand: 'Nature\'s Kitchen',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2515/2515305.png',
    healthScore: 88,
    benefits: [
      'Low sodium content',
      'No artificial preservatives',
      'Good for blood pressure'
    ],
    reasonForRecommendation: 'Matches your health conditions (High Blood Pressure)'
  },
  {
    id: '5',
    productName: 'Gluten-Free Multigrain Bread',
    brand: 'Healthy Grains',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3365/3365133.png',
    healthScore: 85,
    benefits: [
      'Gluten-free',
      'High fiber content',
      'Low glycemic index'
    ],
    reasonForRecommendation: 'Matches your dietary restrictions'
  },
];

const RecommendationsScreen = () => {
  const { healthData } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories: RecommendationCategory[] = [
    { id: 'all', label: 'All' },
    { id: 'alternatives', label: 'Healthier Alternatives' },
    { id: 'profile', label: 'For Your Profile' },
    { id: 'trending', label: 'Trending' },
  ];

  // In a real app, this would filter based on actual data and categories
  const getFilteredData = (): RecommendedProduct[] => {
    // For mock purposes, just return the whole data set
    return mockRecommendedData;
  };

  const renderCategoryItem = ({ item }: { item: RecommendationCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderRecommendationItem = ({ item }: { item: RecommendedProduct }) => (
    <TouchableOpacity style={styles.recommendationCard} activeOpacity={0.7}>
      <View style={styles.recommendationHeader}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.brandName}>{item.brand}</Text>
          <View style={styles.scoreRow}>
            <MaterialCommunityIcons name="star" size={16} color={COLORS.secondary} />
            <Text style={styles.scoreText}>{item.healthScore}</Text>
          </View>
        </View>
      </View>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Benefits:</Text>
        {item.benefits.map((benefit: string, index: number) => (
          <View key={index} style={styles.benefitRow}>
            <MaterialCommunityIcons name="check-circle" size={14} color={COLORS.success} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Why we recommend this:</Text>
        <Text style={styles.reasonText}>{item.reasonForRecommendation}</Text>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>View Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recommendations</Text>
        <Text style={styles.subtitle}>
          Products tailored to your health profile
        </Text>
      </View>

      {/* Categories row */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Personalized message based on health data */}
      <View style={styles.personalizedMessageContainer}>
        <MaterialCommunityIcons name="lightbulb-on" size={22} color={COLORS.secondary} />
        <Text style={styles.personalizedMessage}>
          {healthData.conditions.highBloodPressure 
            ? "We've selected products that are low in sodium for your blood pressure."
            : "We've selected products that match your health profile."}
        </Text>
      </View>

      {/* Recommendations list */}
      <FlatList
        data={getFilteredData()}
        renderItem={renderRecommendationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.recommendationsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...SHADOWS.medium,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.white,
    marginBottom: SIZES.marginSmall,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.white,
    opacity: 0.8,
  },
  categoriesContainer: {
    marginTop: SIZES.marginMedium,
  },
  categoriesList: {
    paddingHorizontal: SIZES.paddingLarge,
  },
  categoryButton: {
    paddingVertical: SIZES.paddingSmall,
    paddingHorizontal: SIZES.paddingMedium,
    marginRight: SIZES.marginMedium,
    borderRadius: SIZES.borderRadiusFull,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.secondary,
  },
  categoryText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  personalizedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.marginLarge,
    marginVertical: SIZES.marginMedium,
    padding: SIZES.paddingMedium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    ...SHADOWS.small,
  },
  personalizedMessage: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginLeft: SIZES.marginSmall,
    flex: 1,
  },
  recommendationsList: {
    padding: SIZES.paddingLarge,
    paddingBottom: 100, // Extra space for the bottom tab bar
  },
  recommendationCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    marginBottom: SIZES.marginMedium,
    ...SHADOWS.small,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginMedium,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.borderRadiusSmall,
    backgroundColor: COLORS.lightGray,
  },
  productInfo: {
    marginLeft: SIZES.marginMedium,
    flex: 1,
  },
  productName: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  brandName: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    ...FONTS.bold,
    fontSize: SIZES.small,
    color: COLORS.secondary,
    marginLeft: 4,
  },
  benefitsContainer: {
    marginBottom: SIZES.marginMedium,
  },
  benefitsTitle: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginBottom: SIZES.marginSmall,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginLeft: SIZES.marginSmall,
  },
  reasonContainer: {
    backgroundColor: COLORS.gray,
    padding: SIZES.paddingSmall,
    borderRadius: SIZES.borderRadiusSmall,
    marginBottom: SIZES.marginMedium,
  },
  reasonLabel: {
    ...FONTS.medium,
    fontSize: SIZES.xSmall,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  reasonText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.paddingSmall,
    paddingHorizontal: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    alignItems: 'center',
  },
  actionButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
});

export default RecommendationsScreen; 