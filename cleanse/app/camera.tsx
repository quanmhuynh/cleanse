import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { useRouter } from 'expo-router';

export default function CameraScreen() {
  const router = useRouter();
  // Camera permissions state
  const [permission, requestPermission] = useCameraPermissions();
  // State to store scanned barcode info
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scannedType, setScannedType] = useState<string | null>(null);
  // State to track if we should scan
  const [scanning, setScanning] = useState(true);

  // Handle barcode scanning result
  const handleBarcodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanning) {
      setScannedData(data);
      setScannedType(type);
      setScanning(false);
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setScannedData(null);
    setScannedType(null);
    setScanning(true);
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

  return (
    <View style={styles.container}>
      {scannedData ? (
        // Show scanned data if available
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
    justifyContent: "center",
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
});
