import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

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

export default function CameraScreen() {
  const router = useRouter();
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
      
      // Simulate API call to get product information
      setTimeout(() => {
        // Mock product data
        setProduct({
          name: "Organic Granola",
          brand: "Nature's Best",
          image: "https://cdn-icons-png.flaticon.com/512/3724/3724788.png",
          healthScore: 82,
          nutritionalInfo: {
            calories: "220kcal",
            sugar: "12g",
            sodium: "15mg",
            protein: "5g",
            fat: "8g"
          },
          warnings: [
            "Contains nuts and seeds",
            "May contain traces of milk"
          ],
          recommendations: [
            "Good source of fiber",
            "Low sodium"
          ]
        });
        setLoading(false);
      }, 2000);
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
      {scannedData ? (
        // Show scanned data if available
        renderProductScreen()
      ) : (
        // Show camera scanner if no data yet
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
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>Align barcode within the frame</Text>
            </View>
          </CameraView>
        </View>
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
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: 'transparent',
    borderRadius: SIZES.borderRadiusSmall,
    marginBottom: SIZES.marginLarge,
    // Add a subtle shadow to make it more visible
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  scanText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    ...FONTS.medium,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: SIZES.paddingSmall,
    borderRadius: SIZES.borderRadiusSmall,
    overflow: 'hidden',
    maxWidth: '80%',
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
});