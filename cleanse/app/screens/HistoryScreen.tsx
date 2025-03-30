import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { api } from '../utils/api';
import { useUser } from '../context/UserContext';

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
  rawDate?: string;
  imageUrl: string;
  healthScore: number;
  nutritionInfo: NutritionInfo;
  upc: string;
}

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

// Interface for API response
interface HistoryApiItem {
  upc: string;
  score: number;
  reasoning: string;
  image_url: string;
  date: string;
}

const HistoryScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser: selectedProfileId, hasSelectedUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Items', icon: 'apps' },
    { id: 'healthy', label: 'Healthy', icon: 'checkmark-circle' },
    { id: 'caution', label: 'Caution', icon: 'alert-circle' },
    { id: 'unhealthy', label: 'Unhealthy', icon: 'close-circle' },
  ];

  useEffect(() => {
    if (hasSelectedUser) {
      fetchHistoryData();
    }
  }, [selectedProfileId, hasSelectedUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Clear any cached history before fetching
    if (selectedProfileId) {
      api.clearHistoryCache(selectedProfileId);
    }
    await fetchHistoryData();
    setRefreshing(false);
  };

  const fetchHistoryData = async () => {
    try {
      // Don't fetch if we're already loading to prevent duplicate calls
      if (loading) {
        console.log('Already fetching history, skipping duplicate call');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      if (!selectedProfileId) {
        setError('No profile selected');
        setLoading(false);
        setHistoryData([]);
        return;
      }
      
      console.log(`Fetching history for user: ${selectedProfileId}`);
      let data: HistoryApiItem[] = [];
      try {
        data = await api.get<HistoryApiItem[]>(`get_history?email=${selectedProfileId}`);
        console.log('Raw history data received:', JSON.stringify(data));
      } catch (apiError) {
        console.error('API error fetching history:', apiError);
        // Use empty array if API fails
        data = [];
      }
      
      // Ensure we have valid array data
      const historyItems = Array.isArray(data) ? data : [];
      console.log(`Received ${historyItems.length} history items`);
      
      // Transform API data to our app's format - handle empty array case
      const formattedData: HistoryItem[] = historyItems.map((item, index) => {
        const formattedItem = {
          id: index.toString(),
          productName: `Product #${item.upc || 'unknown'}`, // Handle missing UPC
          brand: 'Unknown Brand', // The API doesn't provide brand yet
          dateScanned: item.date ? new Date(item.date).toLocaleDateString() : 'Unknown date',
          rawDate: item.date || '',
          imageUrl: item.image_url || 'https://cdn-icons-png.flaticon.com/512/3724/3724788.png',
          healthScore: item.score || 0,
          nutritionInfo: {
            sugar: getSugarLevel(item.score || 0),
            sodium: getSodiumLevel(item.score || 0),
            fat: getFatLevel(item.score || 0),
          },
          upc: item.upc || 'unknown' // Add UPC to identify duplicates
        };
        console.log(`Formatted item ${index}:`, JSON.stringify(formattedItem));
        return formattedItem;
      });
      
      // Remove duplicates based on UPC code
      const uniqueItems = formattedData.reduce<HistoryItem[]>((acc, current) => {
        const x = acc.find(item => item.upc === current.upc);
        if (!x) {
          return acc.concat(current);
        }
        return acc;
      }, []);
      
      console.log(`After deduplication: ${uniqueItems.length} items`);
      
      // Sort by date (newest first)
      const sortedData = uniqueItems.sort((a, b) => {
        const dateA = new Date(a.rawDate || '').getTime();
        const dateB = new Date(b.rawDate || '').getTime();
        return isNaN(dateB) || isNaN(dateA) ? 0 : dateB - dateA;
      });
      
      console.log(`Setting history data with ${sortedData.length} items`);
      setHistoryData(sortedData);
      console.log(`Loaded ${sortedData.length} unique history items after deduplication`);
    } catch (error) {
      console.error('Error fetching history:', error);
      // Don't set error for empty history, just show empty state
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to estimate nutrition levels based on score 
  // (these are placeholder functions since the API doesn't provide detailed nutrition info yet)
  const getSugarLevel = (score: number): string => {
    if (score >= 80) return 'Low';
    if (score >= 50) return 'Medium';
    return 'High';
  };
  
  const getSodiumLevel = (score: number): string => {
    if (score >= 70) return 'Low';
    if (score >= 40) return 'Medium';
    return 'High';
  };
  
  const getFatLevel = (score: number): string => {
    if (score >= 75) return 'Low';
    if (score >= 45) return 'Medium';
    return 'High';
  };

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

  const getFilteredData = (): HistoryItem[] => {
    let filtered = historyData;
    
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchHistoryData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : getFilteredData().length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={48} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>No history items found</Text>
            <Text style={styles.emptySubText}>Scan products to see them appear here</Text>
            <Text style={styles.emptySubText}>Items in cache: {historyData.length}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                if (selectedProfileId) {
                  console.log('Manually refreshing history');
                  api.clearHistoryCache(selectedProfileId);
                  onRefresh();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={getFilteredData()}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
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
    padding: SIZES.paddingMedium * 2,
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
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: SIZES.paddingMedium,
  },
  emptySubText: {
    ...FONTS.regular,
    color: COLORS.mediumGray,
    textAlign: 'center',
    marginTop: SIZES.small,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.regular,
    color: COLORS.darkGray,
    marginTop: SIZES.small,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingMedium * 2,
  },
  errorText: {
    ...FONTS.regular,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: SIZES.small,
  },
  retryButton: {
    marginTop: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingMedium,
    paddingVertical: SIZES.small,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusMedium,
  },
  retryButtonText: {
    ...FONTS.regular,
    color: COLORS.white,
  },
  listContent: {
    padding: SIZES.paddingMedium,
    paddingTop: 25,
  },
});

export default HistoryScreen; 