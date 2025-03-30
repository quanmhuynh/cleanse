import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { api } from '../utils/api';

// Define types for our product data
interface ProductWarning {
  [index: number]: string;
}

interface ProductRecommendation {
  [index: number]: string;
}

// Define types for history items
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

interface ProductData {
  name: string;
  brand: string;
  image: string;
  healthScore: number;
  nutritionalInfo: {
    calories: string;
    sugar: string;
    sodium: string;
    protein: string;
    fat: string;
  };
  warnings: string[];
  recommendations: string[];
}

// Recent scan history data - using the same format as in HistoryScreen
const recentScansData: HistoryItem[] = [
];

// Define interface for API response
interface ApiResponse {
  score: number;
  reasoning: string;
  image_url: string;
}

// Function to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 70) return COLORS.success;
  if (score >= 40) return COLORS.secondary;
  return COLORS.error;
};

const HomeScreen = () => {
  const router = useRouter();
  const { selectedProfileId, hasSelectedProfile } = useUser();
  // Camera permissions state
  const [permission, requestPermission] = useCameraPermissions();
  // State to store scanned barcode info
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scannedType, setScannedType] = useState<string | null>(null);
  // State to track if we should scan
  const [scanning, setScanning] = useState(true);
  // Loading state
  const [loading, setLoading] = useState(false);
  // Product data from API
  const [product, setProduct] = useState<ProductData | null>(null);
  // State for recent scans
  const [recentScans, setRecentScans] = useState<HistoryItem[]>([]);
  // Loading state for history
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch user's scan history when profile changes or after successful scan
  useEffect(() => {
    if (selectedProfileId) {
      fetchUserHistory();
    }
  }, [selectedProfileId]);

  // Log the selected profile when it changes
  useEffect(() => {
    console.log(`HomeScreen: Current selectedProfileId: ${selectedProfileId}`);
    console.log(`HomeScreen: hasSelectedProfile: ${hasSelectedProfile}`);
  }, [selectedProfileId, hasSelectedProfile]);

  // Function to fetch user history from API
  const fetchUserHistory = async () => {
    if (!selectedProfileId) return;
    
    setHistoryLoading(true);
    try {
      console.log(`Fetching history for user: ${selectedProfileId}`);
      const data = await api.get<any[]>(`get_history?email=${selectedProfileId}`);
      
      if (Array.isArray(data) && data.length > 0) {
        // Transform API data to our app's format
        const formattedData: HistoryItem[] = data.map((item, index) => ({
          id: index.toString(),
          productName: `Product #${item.upc}`,
          brand: 'Unknown Brand',
          dateScanned: new Date(item.date).toLocaleDateString(),
          imageUrl: item.image_url,
          healthScore: item.score,
          nutritionInfo: {
            sugar: getSugarLevel(item.score),
            sodium: getSodiumLevel(item.score),
            fat: getFatLevel(item.score),
          }
        }));
        
        // Sort by date (newest first) and take the most recent 5
        const sortedData = formattedData.sort((a, b) => 
          new Date(b.dateScanned).getTime() - new Date(a.dateScanned).getTime()
        );
        
        const recentItems = sortedData.slice(0, 5);
        setRecentScans(recentItems);
        console.log(`Loaded ${recentItems.length} recent scans`);
      } else {
        console.log('No history found for this user');
        setRecentScans([]);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
      setRecentScans([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Helper functions to estimate nutrition levels based on score
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

  // Handle barcode scanning result
  const handleBarcodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanning) {
      console.log(`Barcode scanned: ${data} (${type})`);
      console.log(`Current user: ${selectedProfileId}, hasProfile: ${hasSelectedProfile}`);
      
      // Set scanning state to prevent duplicate scans
      setScanning(false);
      setScannedData(data);
      setScannedType(type);
      setLoading(true);
      
      // Check if we have a selected profile
      if (!selectedProfileId) {
        console.error('No profile selected');
        setLoading(false);
        setProduct({
          name: "Error scanning product",
          brand: "",
          image: "https://cdn-icons-png.flaticon.com/512/1828/1828843.png",
          healthScore: 0,
          nutritionalInfo: {
            calories: "N/A",
            sugar: "N/A",
            sodium: "N/A",
            protein: "N/A",
            fat: "N/A"
          },
          warnings: ["No user profile selected."],
          recommendations: ["Please select a profile before scanning."]
        });
        return;
      }
      
      console.log(`Scanning barcode: ${data} for user: ${selectedProfileId}`);
      
      // Use the API to get product information based on UPC
      api.post<ApiResponse>('add_history', { 
        email: selectedProfileId, // Use the actual profile ID
        upc: data 
      })
      .then(response => {
        console.log("API Response received:", response);
        
        // Verify that we received a valid response
        if (!response || typeof response !== 'object') {
          throw new Error("Invalid response from server");
        }
        
        // Extract values with defaults for missing data
        const score = response.score !== undefined ? response.score : 50;
        const reasoning = response.reasoning || "No specific recommendations available";
        const imageUrl = response.image_url || "https://cdn-icons-png.flaticon.com/512/3724/3724788.png";
        
        // Format the response into our ProductData format
        setProduct({
          name: `Product (UPC: ${data})`, // Include UPC in the name
          brand: "Unknown Brand",
          image: imageUrl,
          healthScore: score,
          nutritionalInfo: {
            calories: "N/A",
            sugar: "N/A",
            sodium: "N/A",
            protein: "N/A",
            fat: "N/A"
          },
          warnings: [],
          recommendations: [reasoning]
        });
        
        // Fetch updated history after successful scan (with a slight delay to ensure DB updates)
        setTimeout(() => {
          fetchUserHistory();
        }, 500);
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product data:', error);
        setLoading(false);
        
        // Provide more specific user feedback based on the error
        let errorMessage = "Failed to retrieve product information.";
        let recommendation = "Please try scanning again.";
        
        if (error.message && error.message.includes("User with email")) {
          errorMessage = "Your user profile could not be found on the server.";
          recommendation = "Please complete your profile setup first.";
        } else if (error.message && error.message.includes("Network")) {
          errorMessage = "Network connection issue.";
          recommendation = "Please check your internet connection and try again.";
        }
        
        setProduct({
          name: "Error scanning product",
          brand: "",
          image: "https://cdn-icons-png.flaticon.com/512/1828/1828843.png",
          healthScore: 0,
          nutritionalInfo: {
            calories: "N/A",
            sugar: "N/A",
            sodium: "N/A",
            protein: "N/A",
            fat: "N/A"
          },
          warnings: [errorMessage],
          recommendations: [recommendation]
        });
      });
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setScannedData(null);
    setScannedType(null);
    setScanning(true);
    setProduct(null);
  };

  // Render the Product Result Screen
  const renderProductScreen = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicator}>
            <MaterialCommunityIcons name="barcode-scan" size={40} color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching product information...</Text>
          </View>
        </View>
      );
    }

    if (product) {
      return (
        <View style={styles.productContainer}>
          <View style={styles.productCard}>
            <View style={styles.productHeader}>
              <Image 
                source={{ uri: product.image }} 
                style={styles.productImage}
                resizeMode="contain"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.brandName}>{product.brand}</Text>
                <View style={styles.healthScoreContainer}>
                  <Text style={styles.healthScoreLabel}>Health Score:</Text>
                  <View style={styles.healthScoreBadge}>
                    <Text style={styles.healthScoreValue}>{product.healthScore}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Nutritional Information</Text>
            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutritionalInfo.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutritionalInfo.protein}</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutritionalInfo.fat}</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutritionalInfo.sugar}</Text>
                <Text style={styles.nutritionLabel}>Sugar</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{product.nutritionalInfo.sodium}</Text>
                <Text style={styles.nutritionLabel}>Sodium</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {product.warnings.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Warnings</Text>
                <View style={styles.warningsContainer}>
                  {product.warnings.map((warning, index) => (
                    <View key={index} style={styles.warningItem}>
                      <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.secondary} />
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.divider} />
              </>
            )}
            
            {product.recommendations.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                <View style={styles.recommendationsContainer}>
                  {product.recommendations.map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.success} />
                      <Text style={styles.recommendationText}>{recommendation}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.scanAgainButton} 
            onPress={resetScanner}
          >
            <MaterialCommunityIcons name="barcode-scan" size={24} color={COLORS.white} />
            <Text style={styles.scanAgainButtonText}>Scan Another Product</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  // Render camera permissions screen
  const renderPermissionsScreen = () => {
    if (!permission) {
      return (
        <View style={styles.permissionsContainer}>
          <Text style={styles.permissionsText}>Checking camera permissions...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionsContainer}>
          <Text style={styles.permissionsTitle}>Camera Permission</Text>
          <Text style={styles.permissionsText}>We need your permission to use the camera to scan product barcodes.</Text>
          <TouchableOpacity 
            style={styles.permissionsButton} 
            onPress={requestPermission}
          >
            <Text style={styles.permissionsButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  // Main render for home screen with integrated camera scanner
  const renderHomeContent = () => {
    return (
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false} // Prevents bouncing on iOS
        overScrollMode="never" // Prevents over-scrolling on Android
      >
        <View style={styles.scannerContainer}>
          <View style={styles.embeddedCameraContainer}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "code93", "upc_e", "upc_a"],
              }}
            >
              <View style={styles.scanFrame}>
                <View style={styles.scannerAnimation} />
              </View>
              <View style={styles.scanInstructions}>
                <MaterialCommunityIcons 
                  name="barcode-scan" 
                  size={24} 
                  color={COLORS.white} 
                  style={styles.scanIcon}
                />
                <Text style={styles.scanText}>Hold steady while scanning</Text>
              </View>
            </CameraView>
          </View>
        </View>

        <View style={styles.recentScansContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push("/history")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {historyLoading ? (
            <View style={styles.loadingHistoryContainer}>
              <MaterialCommunityIcons name="loading" size={24} color={COLORS.primary} />
              <Text style={styles.loadingHistoryText}>Loading scan history...</Text>
            </View>
          ) : recentScans.length > 0 ? (
            <View style={styles.recentScansList}>
              {recentScans.map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.recentScanItem}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.recentScanImage}
                    resizeMode="contain"
                  />
                  <View style={styles.recentScanInfo}>
                    <Text style={styles.recentScanName} numberOfLines={1}>{item.productName}</Text>
                    <Text style={styles.recentScanBrand} numberOfLines={1}>{item.brand}</Text>
                  </View>
                  <View style={[styles.recentScanScore, { backgroundColor: getScoreColor(item.healthScore) + '20' }]}>
                    <Text style={[styles.recentScanScoreText, { color: getScoreColor(item.healthScore) }]}>
                      {item.healthScore}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyScansContainer}>
              <MaterialCommunityIcons 
                name="history" 
                size={80} 
                color={COLORS.lightGray} 
              />
              <Text style={styles.emptyScansText}>No recent scans</Text>
              <Text style={styles.emptyScansSubtext}>
                Products you scan will appear here for quick access
              </Text>
            </View>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan & Learn</Text>
        <Text style={styles.subtitle}>
          Get personalized health insights for any product
        </Text>
      </View>

      {/* Show different content based on state */}
      {scannedData || product ? (
        renderProductScreen()
      ) : (
        <>
          {permission?.granted ? (
            renderHomeContent()
          ) : (
            renderPermissionsScreen()
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollContent: {
    flex: 1,
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
  scannerContainer: {
    paddingHorizontal: SIZES.paddingLarge,
    marginTop: SIZES.marginLarge,
  },
  embeddedCameraContainer: {
    height: 350,
    borderRadius: SIZES.borderRadiusMedium,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 120,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: 'transparent',
    borderRadius: SIZES.borderRadiusSmall,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scannerAnimation: {
    position: 'absolute',
    height: 2,
    width: '100%',
    backgroundColor: COLORS.secondary,
    opacity: 0.7,
    // In a real implementation, you'd animate this with Animated API
  },
  scanInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: SIZES.paddingSmall,
    paddingHorizontal: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    marginTop: SIZES.marginMedium,
  },
  scanIcon: {
    marginRight: SIZES.marginSmall,
  },
  scanText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    ...FONTS.medium,
  },
  recentScansContainer: {
    paddingHorizontal: SIZES.paddingLarge,
    marginTop: SIZES.marginLarge,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.marginMedium,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  seeAllText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  recentScansList: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    ...SHADOWS.small,
  },
  recentScanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMedium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  recentScanItem_lastChild: {
    borderBottomWidth: 0,
  },
  recentScanImage: {
    width: 40,
    height: 40,
    borderRadius: SIZES.borderRadiusSmall,
    backgroundColor: COLORS.gray + '30',
  },
  recentScanInfo: {
    flex: 1,
    marginLeft: SIZES.marginMedium,
  },
  recentScanName: {
    paddingVertical: SIZES.paddingSmall,
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  recentScanBrand: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
  },
  recentScanScore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.marginMedium,
  },
  recentScanScoreText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
  },
  emptyScansContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    alignItems: 'center',
    ...SHADOWS.small,
    paddingVertical: SIZES.paddingLarge * 1.5,
  },
  emptyScansText: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  emptyScansSubtext: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  spacer: {
    height: 100, // Space for the tab bar
  },
  
  // Product result styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
  },
  loadingIndicator: {
    backgroundColor: COLORS.white,
    padding: SIZES.paddingLarge,
    borderRadius: SIZES.borderRadiusMedium,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  loadingText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginTop: SIZES.marginMedium,
  },
  productContainer: {
    flex: 1,
    padding: SIZES.paddingLarge,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    marginBottom: SIZES.marginMedium,
    ...SHADOWS.medium,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.marginMedium,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.borderRadiusSmall,
    backgroundColor: COLORS.gray,
  },
  productInfo: {
    marginLeft: SIZES.marginMedium,
    flex: 1,
  },
  productName: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 2,
  },
  brandName: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginBottom: SIZES.marginSmall,
  },
  healthScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScoreLabel: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginRight: SIZES.marginSmall,
  },
  healthScoreBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    paddingHorizontal: SIZES.paddingSmall,
    borderRadius: SIZES.borderRadiusFull,
  },
  healthScoreValue: {
    ...FONTS.bold,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SIZES.marginMedium,
  },
  nutritionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    width: '18%',
    marginBottom: SIZES.marginMedium,
  },
  nutritionValue: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    ...FONTS.regular,
    fontSize: SIZES.xSmall,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  warningsContainer: {
    marginBottom: SIZES.marginMedium,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginSmall,
  },
  warningText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginLeft: SIZES.marginSmall,
    flex: 1,
  },
  recommendationsContainer: {
    marginBottom: SIZES.marginMedium,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginSmall,
  },
  recommendationText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginLeft: SIZES.marginSmall,
    flex: 1,
  },
  scanAgainButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    ...SHADOWS.medium,
  },
  scanAgainButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginLeft: SIZES.marginSmall,
  },
  
  // Permissions styles
  permissionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
  },
  permissionsTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.text,
    marginBottom: SIZES.marginMedium,
    textAlign: 'center',
  },
  permissionsText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginBottom: SIZES.marginLarge,
    textAlign: 'center',
  },
  permissionsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.borderRadiusMedium,
    ...SHADOWS.small,
  },
  permissionsButtonText: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  loadingHistoryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
    flexDirection: 'row',
    height: 120,
  },
  loadingHistoryText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    marginLeft: SIZES.marginSmall,
  },
});

export default HomeScreen; 