import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { api } from './utils/api';
import { useUser } from './context/UserContext';

// Define types for our product data
interface ProductWarning {
  [index: number]: string;
}

interface ProductRecommendation {
  [index: number]: string;
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

// Define interface for API response
interface ApiResponse {
  score: number;
  reasoning: string;
  image_url: string;
}

export default function CameraScreen() {
  const router = useRouter();
  const { selectedProfileId } = useUser();
  // Camera permissions state
  const [permission, requestPermission] = useCameraPermissions();
  // State to store scanned barcode info
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scannedType, setScannedType] = useState<string | null>(null);
  // State to track if we should scan
  const [scanning, setScanning] = useState(true);
  // Loading state
  const [loading, setLoading] = useState(false);
  // Mock Product data (in a real app, this would come from an API)
  const [product, setProduct] = useState<ProductData | null>(null);

  // Handle barcode scanning result
  const handleBarcodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanning) {
      setScannedData(data);
      setScannedType(type);
      setScanning(false);
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

  // Go back to home screen
  const goBack = () => {
    router.back();
  };

  // Show loading while permissions are being checked
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Checking camera permissions...</Text>
      </View>
    );
  }

  // Request permissions if not granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission</Text>
        <Text style={styles.text}>We need your permission to use the camera to scan product barcodes.</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
                  {product.warnings.map((warning: string, index: number) => (
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
                  {product.recommendations.map((recommendation: string, index: number) => (
                    <View key={index} style={styles.recommendationItem}>
                      <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.success} />
                      <Text style={styles.recommendationText}>{recommendation}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={goBack}
            >
              <Text style={styles.secondaryButtonText}>Return Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={resetScanner}
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.title}>Product Scanned!</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Barcode Type:</Text>
          <Text style={styles.infoValue}>{scannedType}</Text>
          
          <Text style={styles.infoLabel}>Barcode Data:</Text>
          <Text style={styles.infoValue}>{scannedData}</Text>
          
          <Text style={styles.disclaimer}>
            Fetching product information...
          </Text>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={goBack}
          >
            <Text style={styles.secondaryButtonText}>Return Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={resetScanner}
          >
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!scannedData ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "code93", "upc_e", "upc_a"],
            }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={goBack}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            <View style={styles.scanInfoCard}>
              <Text style={styles.scanInfoTitle}>Product Scanner</Text>
              <Text style={styles.scanInfoText}>
                Align the barcode in the frame to scan product information
              </Text>
            </View>
            
            <View style={styles.overlay}>
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
              
              <View style={styles.scanTips}>
                <Text style={styles.scanTipsTitle}>Scanning Tips:</Text>
                <View style={styles.scanTipItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.scanTipText}>Ensure good lighting</Text>
                </View>
                <View style={styles.scanTipItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.scanTipText}>Keep barcode flat and visible</Text>
                </View>
              </View>
            </View>
          </CameraView>
        </View>
      ) : (
        renderProductScreen()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 180,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    backgroundColor: 'transparent',
    borderRadius: SIZES.borderRadiusSmall,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scannerAnimation: {
    position: 'absolute',
    height: 3,
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
  scanTips: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
  },
  scanTipsTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.marginSmall,
  },
  scanTipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.marginSmall,
  },
  scanTipText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.white,
    marginLeft: SIZES.marginSmall,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: SIZES.paddingSmall,
    paddingHorizontal: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    zIndex: 10,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    ...FONTS.medium,
  },
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
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.marginMedium,
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
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
  },
  title: {
    fontSize: SIZES.xxLarge,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.marginLarge,
    textAlign: 'center',
  },
  text: {
    fontSize: SIZES.medium,
    ...FONTS.regular,
    color: COLORS.text,
    marginBottom: SIZES.marginLarge,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.gray,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingLarge,
    marginBottom: SIZES.marginLarge,
    ...SHADOWS.medium,
  },
  infoLabel: {
    fontSize: SIZES.medium,
    ...FONTS.medium,
    color: COLORS.darkGray,
    marginBottom: SIZES.marginSmall / 2,
  },
  infoValue: {
    fontSize: SIZES.large,
    ...FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.marginMedium,
  },
  disclaimer: {
    fontSize: SIZES.small,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    marginTop: SIZES.marginMedium,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.paddingMedium,
    paddingHorizontal: SIZES.paddingLarge,
    borderRadius: SIZES.borderRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    ...SHADOWS.small,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    ...FONTS.bold,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    ...FONTS.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  scanInfoCard: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.paddingMedium,
    zIndex: 5,
  },
  scanInfoTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.white,
    marginBottom: SIZES.marginSmall,
    textAlign: 'center',
  },
  scanInfoText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.white,
    textAlign: 'center',
  },
});