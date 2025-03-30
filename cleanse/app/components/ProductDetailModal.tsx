import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

interface ProductDetailModalProps {
  product: {
    id: string;
    productName: string;
    brand: string;
    imageUrl: string;
    healthScore: number;
    benefits: string[];
    reasonForRecommendation: string;
    ingredients?: string[];
    nutritionFacts?: {
      calories?: number;
      protein?: number;
      fats?: number;
      carbs?: number;
      sugar?: number;
      sodium?: number;
    };
    alternativesTo?: string;
  };
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

const ProductDetailModal = ({ product, visible, onClose }: ProductDetailModalProps) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Function to get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.secondary;
    return COLORS.error;
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
        >
        <TouchableOpacity 
          style={{ flex: 1 }} 
          activeOpacity={1} 
          onPress={onClose}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Handle for dragging */}
        <View style={styles.dragHandle} />
        
        {/* Top bar with close button */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <AntDesign name="close" size={22} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Product Header */}
          <View style={styles.productHeader}>
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
            
            <View style={styles.productHeaderInfo}>
              <Text style={styles.productName}>{product.productName}</Text>
              <Text style={styles.brandName}>{product.brand}</Text>
              
              <View style={styles.scoreRow}>
                <View style={[
                  styles.scoreContainer, 
                  { backgroundColor: getScoreColor(product.healthScore) + '20' }
                ]}>
                  <Text style={[styles.scoreText, { color: getScoreColor(product.healthScore) }]}>
                    {product.healthScore}
                  </Text>
                </View>
                <Text style={styles.scoreLabel}>Health Score</Text>
              </View>
            </View>
          </View>
          
          {/* Health Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Benefits</Text>
            <View style={styles.benefitsContainer}>
              {product.benefits.map((benefit: string, index: number) => (
                <View key={index} style={styles.benefitRow}>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={18} 
                    color={COLORS.success} 
                    style={styles.benefitIcon} 
                  />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Recommendation Reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why We Recommend This</Text>
            <View style={styles.reasonContainer}>
              <MaterialCommunityIcons 
                name="lightbulb-outline" 
                size={18} 
                color={COLORS.secondary} 
                style={styles.reasonIcon} 
              />
              <Text style={styles.reasonText}>{product.reasonForRecommendation}</Text>
            </View>
            
            {product.alternativesTo && (
              <View style={styles.alternativeContainer}>
                <MaterialCommunityIcons 
                  name="swap-horizontal" 
                  size={18} 
                  color={COLORS.primary} 
                  style={styles.alternativeIcon} 
                />
                <Text style={styles.alternativeText}>
                  This is a healthier alternative to <Text style={styles.alternativeBold}>{product.alternativesTo}</Text>
                </Text>
              </View>
            )}
          </View>
          
          {/* Nutrition Facts */}
          {product.nutritionFacts && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              <View style={styles.nutritionContainer}>
                {product.nutritionFacts.calories !== undefined && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{product.nutritionFacts.calories}</Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                )}
                {product.nutritionFacts.protein !== undefined && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{product.nutritionFacts.protein}g</Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                )}
                {product.nutritionFacts.fats !== undefined && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{product.nutritionFacts.fats}g</Text>
                    <Text style={styles.nutritionLabel}>Fats</Text>
                  </View>
                )}
                {product.nutritionFacts.carbs !== undefined && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{product.nutritionFacts.carbs}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          {/* Ingredients */}
          {product.ingredients && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.ingredientsContainer}>
                <Text style={styles.ingredientsText}>
                  {product.ingredients.join(', ')}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
        
        {/* Action buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.favoriteButton}>
            <AntDesign name="hearto" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.compareButton}>
            <MaterialCommunityIcons name="scale-balance" size={20} color={COLORS.white} />
            <Text style={styles.compareButtonText}>Compare</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Find Where to Buy</Text>
            <Ionicons name="location-outline" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.text,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.9,
    paddingBottom: 20,
    ...SHADOWS.large,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingMedium,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: SIZES.paddingLarge,
    paddingBottom: 20,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginLarge,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadiusMedium,
    backgroundColor: COLORS.gray + '30',
  },
  productHeaderInfo: {
    flex: 1,
    marginLeft: SIZES.marginLarge,
  },
  productName: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 4,
  },
  brandName: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
  },
  scoreLabel: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  section: {
    marginBottom: SIZES.marginLarge,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.marginMedium,
  },
  benefitsContainer: {
    backgroundColor: COLORS.success + '10',
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    marginRight: 10,
  },
  benefitText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.secondary + '15',
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    marginBottom: SIZES.marginMedium,
  },
  reasonIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  reasonText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
  },
  alternativeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
  },
  alternativeIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  alternativeText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
  },
  alternativeBold: {
    ...FONTS.bold,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray + '15',
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  nutritionLabel: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  ingredientsContainer: {
    backgroundColor: COLORS.gray + '15',
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
  },
  ingredientsText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLarge,
    paddingTop: SIZES.paddingMedium,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray + '30',
  },
  favoriteButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: SIZES.marginMedium,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.borderRadiusFull,
    flex: 1,
    marginRight: SIZES.marginMedium,
    ...SHADOWS.small,
  },
  compareButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
    marginLeft: 6,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.borderRadiusFull,
    flex: 2,
    ...SHADOWS.small,
  },
  primaryButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
    marginRight: 6,
  },
});

export default ProductDetailModal; 