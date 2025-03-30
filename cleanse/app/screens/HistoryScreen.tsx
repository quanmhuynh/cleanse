import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';

// Define types
interface NutritionInfo {
  sugar: string;
  sodium: string;
  fat: string;
}

interface HistoryItem {
  id: string;
  productName: string;
  brand: string;
  dateScanned: string;
  imageUrl: string;
  healthScore: number;
  nutritionInfo: NutritionInfo;
}

interface FilterOption {
  id: string;
  label: string;
}

// Mock data for history items - in a real app this would come from a database or storage
const mockHistoryData: HistoryItem[] = [
  {
    id: '1',
    productName: 'Organic Granola',
    brand: 'Nature\'s Path',
    dateScanned: '2023-10-15',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3724/3724788.png',
    healthScore: 85,
    nutritionInfo: {
      sugar: 'Low',
      sodium: 'Medium',
      fat: 'Low',
    }
  },
  {
    id: '2',
    productName: 'Chocolate Chip Cookies',
    brand: 'Sweet Treats',
    dateScanned: '2023-10-12',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3800/3800024.png',
    healthScore: 45,
    nutritionInfo: {
      sugar: 'High',
      sodium: 'Low',
      fat: 'High',
    }
  },
  {
    id: '3',
    productName: 'Almond Milk',
    brand: 'Pure Harvest',
    dateScanned: '2023-10-10',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3348/3348089.png',
    healthScore: 90,
    nutritionInfo: {
      sugar: 'Low',
      sodium: 'Low',
      fat: 'Low',
    }
  },
  {
    id: '4',
    productName: 'Potato Chips',
    brand: 'Crunchy Co',
    dateScanned: '2023-10-08',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/3076/3076034.png',
    healthScore: 30,
    nutritionInfo: {
      sugar: 'Low',
      sodium: 'High',
      fat: 'High',
    }
  },
  {
    id: '5',
    productName: 'Greek Yogurt',
    brand: 'Dairy Delights',
    dateScanned: '2023-10-05',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2215/2215301.png',
    healthScore: 88,
    nutritionInfo: {
      sugar: 'Medium',
      sodium: 'Low',
      fat: 'Medium',
    }
  },
];

// Function to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 70) return COLORS.success;
  if (score >= 40) return COLORS.secondary;
  return COLORS.error;
};

// Function to get label based on level
const getNutritionLabel = (level: string): { color: string, icon: 'checkbox-marked-circle' | 'alert-circle' | 'close-circle' | 'information' } => {
  switch (level) {
    case 'Low':
      return { color: COLORS.success, icon: 'checkbox-marked-circle' };
    case 'Medium':
      return { color: COLORS.secondary, icon: 'alert-circle' };
    case 'High':
      return { color: COLORS.error, icon: 'close-circle' };
    default:
      return { color: COLORS.darkGray, icon: 'information' };
  }
};

const HistoryScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Items' },
    { id: 'healthy', label: 'Healthy' },
    { id: 'caution', label: 'Caution' },
    { id: 'unhealthy', label: 'Unhealthy' },
  ];

  const getFilteredData = (): HistoryItem[] => {
    switch (selectedFilter) {
      case 'healthy':
        return mockHistoryData.filter(item => item.healthScore >= 70);
      case 'caution':
        return mockHistoryData.filter(item => item.healthScore >= 40 && item.healthScore < 70);
      case 'unhealthy':
        return mockHistoryData.filter(item => item.healthScore < 40);
      default:
        return mockHistoryData;
    }
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity 
      style={styles.historyCard}
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
          <Text style={styles.dateScanned}>{item.dateScanned}</Text>
        </View>
        <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(item.healthScore) + '20' }]}>
          <Text style={[styles.scoreText, { color: getScoreColor(item.healthScore) }]}>
            {item.healthScore}
          </Text>
        </View>
      </View>
      
      <View style={styles.nutritionContainer}>
        <View style={styles.nutritionItem}>
          <MaterialCommunityIcons 
            name={getNutritionLabel(item.nutritionInfo.sugar).icon} 
            size={16} 
            color={getNutritionLabel(item.nutritionInfo.sugar).color} 
          />
          <Text style={styles.nutritionLabel}>Sugar</Text>
          <Text style={[styles.nutritionValue, { color: getNutritionLabel(item.nutritionInfo.sugar).color }]}>
            {item.nutritionInfo.sugar}
          </Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <MaterialCommunityIcons 
            name={getNutritionLabel(item.nutritionInfo.sodium).icon} 
            size={16} 
            color={getNutritionLabel(item.nutritionInfo.sodium).color} 
          />
          <Text style={styles.nutritionLabel}>Sodium</Text>
          <Text style={[styles.nutritionValue, { color: getNutritionLabel(item.nutritionInfo.sodium).color }]}>
            {item.nutritionInfo.sodium}
          </Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <MaterialCommunityIcons 
            name={getNutritionLabel(item.nutritionInfo.fat).icon} 
            size={16} 
            color={getNutritionLabel(item.nutritionInfo.fat).color} 
          />
          <Text style={styles.nutritionLabel}>Fat</Text>
          <Text style={[styles.nutritionValue, { color: getNutritionLabel(item.nutritionInfo.fat).color }]}>
            {item.nutritionInfo.fat}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <Text style={styles.subtitle}>
          Review your previously scanned products
        </Text>
      </View>

      <View style={styles.filterContainer}>
        {filterOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterButton,
              selectedFilter === option.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(option.id)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === option.id && styles.filterButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {getFilteredData().length > 0 ? (
        <FlatList
          data={getFilteredData()}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="history" size={80} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>No items in this category</Text>
        </View>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.paddingMedium,
    paddingVertical: SIZES.paddingMedium,
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.marginLarge,
    marginTop: SIZES.marginLarge,
    marginBottom: SIZES.marginSmall,
    borderRadius: SIZES.borderRadiusMedium,
    ...SHADOWS.small,
  },
  filterButton: {
    paddingVertical: SIZES.paddingSmall,
    paddingHorizontal: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusFull,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
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
    padding: SIZES.paddingLarge,
    paddingBottom: 100, // Extra space for the bottom tab bar
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    marginBottom: SIZES.marginMedium,
    ...SHADOWS.small,
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
    backgroundColor: COLORS.gray,
  },
  productInfo: {
    flex: 1,
    marginLeft: SIZES.marginMedium,
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
    marginBottom: 2,
  },
  dateScanned: {
    ...FONTS.regular,
    fontSize: SIZES.xSmall,
    color: COLORS.mediumGray,
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
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SIZES.paddingMedium,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionLabel: {
    ...FONTS.regular,
    fontSize: SIZES.xSmall,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  nutritionValue: {
    ...FONTS.bold,
    fontSize: SIZES.small,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
  },
  emptyText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.mediumGray,
    marginTop: SIZES.marginMedium,
  },
});

export default HistoryScreen; 