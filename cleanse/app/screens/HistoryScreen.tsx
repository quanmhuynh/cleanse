import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
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
  icon: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Items', icon: 'apps' },
    { id: 'healthy', label: 'Healthy', icon: 'checkmark-circle' },
    { id: 'caution', label: 'Caution', icon: 'alert-circle' },
    { id: 'unhealthy', label: 'Unhealthy', icon: 'close-circle' },
  ];

  const getFilteredData = (): HistoryItem[] => {
    let filtered = mockHistoryData;
    
    // Apply category filter
    switch (selectedFilter) {
      case 'healthy':
        filtered = filtered.filter(item => item.healthScore >= 70);
        break;
      case 'caution':
        filtered = filtered.filter(item => item.healthScore >= 40 && item.healthScore < 70);
        break;
      case 'unhealthy':
        filtered = filtered.filter(item => item.healthScore < 40);
        break;
    }
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity 
      style={styles.historyCard}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.productImage}
          resizeMode="contain"
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.brandName}>{item.brand}</Text>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.mediumGray} />
            <Text style={styles.dateScanned}>{item.dateScanned}</Text>
          </View>
        </View>
        
        <View style={styles.scoreWrapper}>
          <View style={[
            styles.scoreContainer, 
            { backgroundColor: getScoreColor(item.healthScore) + '20' }
          ]}>
            <Text style={[styles.scoreText, { color: getScoreColor(item.healthScore) }]}>
              {item.healthScore}
            </Text>
          </View>
          <Text style={styles.scoreLabel}>
            {item.healthScore >= 70 ? 'Healthy' : item.healthScore >= 40 ? 'Moderate' : 'Poor'}
          </Text>
        </View>
      </View>
      
      <View style={styles.nutritionContainer}>
        <View style={styles.nutritionItem}>
          <View style={[
            styles.nutritionIconContainer, 
            { backgroundColor: getNutritionLabel(item.nutritionInfo.sugar).color + '15' }
          ]}>
            <MaterialCommunityIcons 
              name={getNutritionLabel(item.nutritionInfo.sugar).icon} 
              size={14} 
              color={getNutritionLabel(item.nutritionInfo.sugar).color} 
            />
          </View>
          <Text style={styles.nutritionLabel}>Sugar</Text>
          <Text style={[styles.nutritionValue, { color: getNutritionLabel(item.nutritionInfo.sugar).color }]}>
            {item.nutritionInfo.sugar}
          </Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <View style={[
            styles.nutritionIconContainer, 
            { backgroundColor: getNutritionLabel(item.nutritionInfo.sodium).color + '15' }
          ]}>
            <MaterialCommunityIcons 
              name={getNutritionLabel(item.nutritionInfo.sodium).icon} 
              size={14} 
              color={getNutritionLabel(item.nutritionInfo.sodium).color} 
            />
          </View>
          <Text style={styles.nutritionLabel}>Sodium</Text>
          <Text style={[styles.nutritionValue, { color: getNutritionLabel(item.nutritionInfo.sodium).color }]}>
            {item.nutritionInfo.sodium}
          </Text>
        </View>
        
        <View style={styles.nutritionItem}>
          <View style={[
            styles.nutritionIconContainer, 
            { backgroundColor: getNutritionLabel(item.nutritionInfo.fat).color + '15' }
          ]}>
            <MaterialCommunityIcons 
              name={getNutritionLabel(item.nutritionInfo.fat).icon} 
              size={14} 
              color={getNutritionLabel(item.nutritionInfo.fat).color} 
            />
          </View>
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
      </View>

      <View style={styles.contentContainer}>
        {/* Floating Filter Bar */}
        <View style={styles.filterScrollContainer}>
          <FlatList
            horizontal
            data={filterOptions}
            renderItem={({item}) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.filterButton,
                  selectedFilter === item.id && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(item.id)}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={16} 
                  color={selectedFilter === item.id ? COLORS.white : COLORS.darkGray} 
                  style={styles.filterIcon}
                />
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === item.id && styles.filterButtonTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
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
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="history" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyText}>
              Items you scan will appear here for future reference
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Scan a Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

     
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
    marginBottom: 90, // Increased space for larger floating search bar
    paddingTop: 10, 
  },
  filterScrollContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.xSmall,
    marginTop: 15,
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
    paddingTop: 25,
  },
  floatingSearchBar: {
    position: 'absolute',
    bottom: 100,
    left: SIZES.paddingLarge,
    right: SIZES.paddingLarge,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusFull,
    paddingVertical: 14, // Increased vertical padding
    paddingHorizontal: SIZES.paddingMedium,
    zIndex: 999,
    ...SHADOWS.large,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    elevation: 8, // Additional elevation for Android
  },
  searchIcon: {
    marginLeft: 5,
    marginRight: 10,
    width: 22,
  },
  searchInput: {
    flex: 1,
    ...FONTS.medium,
    fontSize: SIZES.medium, // Larger font size
    color: COLORS.text,
    padding: 0, // Remove default padding
    height: 24, // Control height of input
  },
  clearButton: {
    padding: 5,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    marginBottom: SIZES.marginMedium,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.paddingMedium,
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
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateScanned: {
    ...FONTS.regular,
    fontSize: SIZES.xSmall,
    color: COLORS.mediumGray,
    marginLeft: 4,
  },
  scoreWrapper: {
    alignItems: 'center',
  },
  scoreContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
  },
  scoreLabel: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray + '30',
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingSmall,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  nutritionLabel: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginTop: 2,
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

export default HistoryScreen; 