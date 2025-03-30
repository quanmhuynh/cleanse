import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Modal
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../constants/theme';
import Button from '../../components/Button';
import ProgressSteps from '../../components/ProgressSteps';

// Define common health conditions
const healthConditions = [
  { id: 'none', label: 'None' },
  { id: 'highBloodPressure', label: 'High Blood Pressure' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'heartDisease', label: 'Heart Disease' },
  { id: 'kidneyDisease', label: 'Kidney Disease' },
  { id: 'pregnant', label: 'Pregnant' },
  { id: 'cancer', label: 'Cancer' },
];

// Define common dietary restrictions
const dietaryRestrictions = [
  { id: 'none', label: 'None' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'glutenFree', label: 'Gluten Free' },
  { id: 'dairyFree', label: 'Dairy Free' },
  { id: 'nutAllergy', label: 'Nut Allergy' },
  { id: 'shellfish', label: 'Shellfish Allergy' },
];

// Define the health condition type for type safety
type HealthCondition = {
  highBloodPressure: boolean;
  diabetes: boolean;
  heartDisease: boolean;
  kidneyDisease: boolean;
  pregnant: boolean;
  cancer: boolean;
  [key: string]: boolean;
};

const HealthConditionsScreen = ({ 
  onNext, 
  onBack 
}: { 
  onNext: () => void, 
  onBack: () => void 
}) => {
  const { healthData, updateHealthData, currentSurveyStep } = useUser();
  
  // Create state to track selected conditions - extract only the boolean properties
  const [selectedConditions, setSelectedConditions] = useState<HealthCondition>({
    highBloodPressure: healthData.conditions.highBloodPressure,
    diabetes: healthData.conditions.diabetes,
    heartDisease: healthData.conditions.heartDisease,
    kidneyDisease: healthData.conditions.kidneyDisease,
    pregnant: healthData.conditions.pregnant,
    cancer: healthData.conditions.cancer,
  });
  
  // State for dietary restrictions
  const [selectedDietary, setSelectedDietary] = useState<string[]>(
    healthData.conditions.dietaryRestrictions || []
  );
  
  // State for dropdowns
  const [healthDropdownVisible, setHealthDropdownVisible] = useState(false);
  const [dietaryDropdownVisible, setDietaryDropdownVisible] = useState(false);

  // Toggle health condition selection
  const toggleCondition = (conditionId: string) => {
    if (conditionId === 'none') {
      // If "None" is selected, clear all selections
      setSelectedConditions({
        highBloodPressure: false,
        diabetes: false,
        heartDisease: false,
        kidneyDisease: false,
        pregnant: false,
        cancer: false,
      });
      return;
    }
    
    setSelectedConditions(prev => ({
      ...prev,
      [conditionId]: !prev[conditionId],
    }));
  };

  // Toggle dietary restriction selection
  const toggleDietary = (restrictionId: string) => {
    if (restrictionId === 'none') {
      // If "None" is selected, clear all selections
      setSelectedDietary([]);
      return;
    }
    
    setSelectedDietary(prev => {
      if (prev.includes(restrictionId)) {
        return prev.filter(id => id !== restrictionId);
      } else {
        // Remove "none" if it exists when selecting other options
        const filtered = prev.filter(id => id !== 'none');
        return [...filtered, restrictionId];
      }
    });
  };

  // Handle next button
  const handleNext = () => {
    updateHealthData({
      conditions: {
        highBloodPressure: selectedConditions.highBloodPressure,
        diabetes: selectedConditions.diabetes,
        heartDisease: selectedConditions.heartDisease,
        kidneyDisease: selectedConditions.kidneyDisease,
        pregnant: selectedConditions.pregnant,
        cancer: selectedConditions.cancer,
        dietaryRestrictions: selectedDietary,
        otherConditions: [],
      },
    });
    onNext();
  };

  // Get summary text for buttons
  const getHealthSummary = () => {
    const selected = Object.entries(selectedConditions)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => healthConditions.find(c => c.id === id)?.label)
      .filter(Boolean);
    
    if (selected.length === 0) return "None selected";
    if (selected.length === 1) return selected[0];
    return `${selected.length} conditions selected`;
  };

  const getDietarySummary = () => {
    if (selectedDietary.length === 0) return "None selected";
    if (selectedDietary.length === 1) {
      const label = dietaryRestrictions.find(r => r.id === selectedDietary[0])?.label;
      return label || "1 restriction selected";
    }
    return `${selectedDietary.length} restrictions selected`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false} // Prevents bouncing on iOS
        overScrollMode="never" // Prevents over-scrolling on Android
      >
        <ProgressSteps 
          currentStep={currentSurveyStep} 
          totalSteps={3}
          labels={['Personal', 'Health', 'Preferences']}
        />
        
        <View style={styles.header}>
          <Text style={styles.title}>Health Information</Text>
          <Text style={styles.subtitle}>
            Select any health conditions that apply to you. This helps us provide safer product recommendations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Conditions</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setHealthDropdownVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>{getHealthSummary()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setDietaryDropdownVisible(true)}
          >
            <Text style={styles.dropdownButtonText}>{getDietarySummary()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={onBack}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </ScrollView>

      {/* Health Conditions Dropdown Modal */}
      <Modal
        visible={healthDropdownVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setHealthDropdownVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Health Conditions</Text>
              <TouchableOpacity onPress={() => setHealthDropdownVisible(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {healthConditions.map((condition) => (
                <TouchableOpacity
                  key={condition.id}
                  style={[
                    styles.modalItem,
                    condition.id !== 'none' && selectedConditions[condition.id] && styles.modalItemSelected
                  ]}
                  onPress={() => toggleCondition(condition.id)}
                >
                  <Text style={styles.modalItemText}>{condition.label}</Text>
                  {condition.id !== 'none' && selectedConditions[condition.id] && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Dietary Restrictions Dropdown Modal */}
      <Modal
        visible={dietaryDropdownVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDietaryDropdownVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dietary Restrictions</Text>
              <TouchableOpacity onPress={() => setDietaryDropdownVisible(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {dietaryRestrictions.map((restriction) => (
                <TouchableOpacity
                  key={restriction.id}
                  style={[
                    styles.modalItem,
                    selectedDietary.includes(restriction.id) && styles.modalItemSelected
                  ]}
                  onPress={() => toggleDietary(restriction.id)}
                >
                  <Text style={styles.modalItemText}>{restriction.label}</Text>
                  {selectedDietary.includes(restriction.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.paddingLarge,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    marginTop: SIZES.marginLarge,
    marginBottom: SIZES.marginLarge,
    paddingHorizontal: SIZES.paddingLarge,
    paddingVertical: SIZES.paddingLarge,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
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
  section: {
    marginBottom: SIZES.marginLarge,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  dropdownButton: {
    height: 80,
    borderRadius: SIZES.borderRadiusMedium,
    backgroundColor: `${COLORS.primary}40`,
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingLarge,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dropdownButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.marginMedium,
  },
  backButton: {
    flex: 1,
    marginRight: SIZES.marginSmall,
  },
  nextButton: {
    flex: 1,
    marginLeft: SIZES.marginSmall,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.text,
  },
  modalDone: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
  modalScroll: {
    flex: 1,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.paddingLarge,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalItemSelected: {
    backgroundColor: `${COLORS.primary}20`,
  },
  modalItemText: {
    ...FONTS.regular,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  checkmark: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
});

export default HealthConditionsScreen; 