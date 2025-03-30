import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { useUser } from '../context/UserContext';
import ProductDetailModal from '../components/ProductDetailModal';

// Define types
interface RecommendationCategory {
  id: string;
  label: string;
  icon: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const categories: RecommendationCategory[] = [
    { id: 'all', label: 'All Recommendations', icon: 'apps' },
    { id: 'alternatives', label: 'Healthier Alternatives', icon: 'swap-horizontal' },
    { id: 'profile', label: 'For Your Profile', icon: 'person' },
    { id: 'trending', label: 'Trending Products', icon: 'trending-up' },
  ];

  // In a real app, this would filter based on actual data and categories
  const getFilteredData = (): RecommendedProduct[] => {
    let filtered = mockRecommendedData;
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Function to get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.secondary;
    return COLORS.error;
  };

  // Modified to show modal first, then set product data
  const handleViewProduct = (item: RecommendedProduct) => {
    console.log("View Product clicked for:", item.productName); // Add debug logging
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const renderRecommendationItem = ({ item }: { item: RecommendedProduct }) => (
    <TouchableOpacity 
      style={styles.recommendationCard} 
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.brandName}>{item.brand}</Text>
        </View>
        
        <View style={[
          styles.scoreContainer, 
          { backgroundColor: getScoreColor(item.healthScore) + '20' }
        ]}>
          <Text style={[styles.scoreText, { color: getScoreColor(item.healthScore) }]}>
            {item.healthScore}
          </Text>
        </View>
      </View>

      <View style={styles.benefitsContainer}>
        {item.benefits.map((benefit: string, index: number) => (
          <View key={index} style={styles.benefitRow}>
            <MaterialCommunityIcons 
              name="check-circle-outline" 
              size={16} 
              color={COLORS.success} 
              style={styles.benefitIcon} 
            />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <View style={styles.reasonContainer}>
        <MaterialCommunityIcons 
          name="lightbulb-outline" 
          size={16} 
          color={COLORS.secondary} 
          style={styles.reasonIcon} 
        />
        <Text style={styles.reasonText}>{item.reasonForRecommendation}</Text>
      </View>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => handleViewProduct(item)}
      >
        <Text style={styles.actionButtonText}>View Product</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Enhanced product data with more robust implementation
  const getEnhancedProductData = (product: RecommendedProduct) => {
    if (!product) return null;
    
    // Custom data based on product ID
    let ingredients = ['Organic Whole Grain Oats', 'Water', 'Sea Salt', 'Vitamin E'];
    let alternativesTo = undefined;
    let nutritionFacts = {
      calories: 150,
      protein: 5,
      fats: 3,
      carbs: 27,
      sugar: 1,
      sodium: 0.1
    };
    
    // Set specific data for different products
    switch(product.id) {
      case '1': // Oats
        alternativesTo = 'Instant Oatmeal Packets';
        break;
      case '2': // Protein Shake
        ingredients = ['Pea Protein', 'Natural Flavors', 'Monk Fruit Extract', 'MCT Oil'];
        nutritionFacts = {
          calories: 120,
          protein: 20,
          fats: 2,
          carbs: 5,
          sugar: 0,
          sodium: 0.05
        };
        break;
      case '3': // Dark Chocolate
        ingredients = ['Organic Cacao', 'Cocoa Butter', 'Erythritol', 'Stevia Extract'];
        nutritionFacts = {
          calories: 180,
          protein: 2,
          fats: 12,
          carbs: 15,
          sugar: 0,
          sodium: 0.02
        };
        alternativesTo = 'Sugar-Sweetened Chocolate';
        break;
      // Add more cases for other products
    }
    
    return {
      ...product,
      ingredients,
      nutritionFacts,
      alternativesTo
    };
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalVisible(false);
    // Wait for the animation to complete before clearing the product
    setTimeout(() => {
      setSelectedProduct(null);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>For You</Text>
      </View>

      <View style={styles.contentContainer}>
        {getFilteredData().length > 0 ? (
          <FlatList
            data={getFilteredData()}
            renderItem={renderRecommendationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="food-apple" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No recommendations found</Text>
            <Text style={styles.emptyText}>
              We'll suggest products based on your preferences and scan history
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Scan a Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Use separate state variables for better control */}
      {selectedProduct && getEnhancedProductData(selectedProduct) && (
        <ProductDetailModal
          product={getEnhancedProductData(selectedProduct)!}
          visible={modalVisible}
          onClose={handleCloseModal}
        />
      )}
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
    paddingBottom: SIZES.paddingLarge * 1.5,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.large,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.white,
    marginBottom: SIZES.marginSmall,
  },
  contentContainer: {
    flex: 1,
    marginBottom: 90, // Space for floating search bar
    paddingTop: 10,
  },
  // Personalized Message Container (styled like filter container)
  personalizedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.marginSmall,
    marginTop: 15,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    ...SHADOWS.medium,
    zIndex: 10,
  },
  messageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.marginMedium,
  },
  messageTextContainer: {
    flex: 1,
  },
  messageTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  messageText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  filterScrollContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.marginLarge,
    marginBottom: 15,
    borderRadius: SIZES.borderRadiusMedium,
    ...SHADOWS.medium,
    zIndex: 10,
  },
  filterList: {
    paddingHorizontal: SIZES.paddingMedium,
    paddingVertical: SIZES.paddingMedium,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.paddingSmall,
    paddingHorizontal: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusFull,
    marginRight: SIZES.marginMedium,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    padding: SIZES.paddingMedium,
    paddingTop: 10, // Reduced to avoid excessive space
  },
  recommendationCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    marginBottom: SIZES.marginMedium,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginMedium,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: SIZES.borderRadiusSmall,
    backgroundColor: COLORS.gray + '30',
  },
  productInfo: {
    flex: 1,
    marginLeft: SIZES.marginMedium,
  },
  productName: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  brandName: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  scoreContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
  },
  benefitsContainer: {
    marginBottom: SIZES.marginMedium,
    backgroundColor: COLORS.gray + '20',
    borderRadius: SIZES.borderRadiusSmall,
    padding: SIZES.paddingSmall,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitIcon: {
    marginRight: 8,
  },
  benefitText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
    flex: 1,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.marginMedium,
    backgroundColor: COLORS.secondary + '15',
    borderRadius: SIZES.borderRadiusSmall,
    padding: SIZES.paddingSmall,
  },
  reasonIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  reasonText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.text,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.borderRadiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  actionButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
    marginRight: 5,
  },
  floatingSearchBar: {
    position: 'absolute',
    bottom: 20,
    left: SIZES.paddingLarge,
    right: SIZES.paddingLarge,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusFull,
    paddingVertical: 14,
    paddingHorizontal: SIZES.paddingMedium,
    zIndex: 999,
    ...SHADOWS.large,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    elevation: 8,
  },
  searchIcon: {
    marginLeft: 5,
    marginRight: 10,
    width: 22,
  },
  searchInput: {
    flex: 1,
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    padding: 0,
    height: 24,
  },
  clearButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.marginMedium,
  },
  emptyTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  emptyText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.mediumGray,
    textAlign: 'center',
    marginBottom: SIZES.marginMedium * 1.5,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.borderRadiusFull,
    ...SHADOWS.small,
  },
  emptyButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
});

export default RecommendationsScreen; 