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
import { COLORS, SIZES, FONTS } from '../../../constants/theme';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import ProgressSteps from '../../components/ProgressSteps';

const genders = ['male', 'female', 'other'] as const;

interface ValidationErrors {
  age?: string;
  weight?: string;
  height?: string;
  gender?: string;
}

// Age picker component that shows a scrollable list of ages
const AgePickerComponent = ({ 
  value, 
  onValueChange, 
  error 
}: { 
  value: string, 
  onValueChange: (value: string) => void,
  error?: string
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const ages = Array.from({ length: 120 }, (_, i) => String(i + 1));

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.label}>Age</Text>
      <TouchableOpacity 
        style={[
          styles.pickerButton,
          error ? styles.pickerButtonError : {}
        ]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.pickerButtonText}>
          {value ? value : 'Select your age'}
        </Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Age</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.ageScrollView}>
              {ages.map((age) => (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.ageOption,
                    value === age && styles.selectedAgeOption
                  ]}
                  onPress={() => {
                    onValueChange(age);
                    setModalVisible(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.ageOptionText,
                      value === age && styles.selectedAgeOptionText
                    ]}
                  >
                    {age}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const PersonalDetailsScreen = ({ onNext }: { onNext: () => void }) => {
  const { healthData, updateHealthData, currentSurveyStep } = useUser();
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Maintain form state locally
  const [formState, setFormState] = useState({
    age: healthData.age !== null ? String(healthData.age) : '',
    weight: healthData.weight !== null ? String(healthData.weight) : '',
    height: healthData.height !== null ? String(healthData.height) : '',
    gender: healthData.gender || null,
  });

  const updateFormField = (field: string, value: string) => {
    setFormState({
      ...formState,
      [field]: value,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formState.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formState.age)) || Number(formState.age) <= 0 || Number(formState.age) > 120) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }

    if (!formState.weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(Number(formState.weight)) || Number(formState.weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }

    if (!formState.height) {
      newErrors.height = 'Height is required';
    } else if (isNaN(Number(formState.height)) || Number(formState.height) <= 0) {
      newErrors.height = 'Please enter a valid height';
    }

    if (!formState.gender) {
      newErrors.gender = 'Please select a gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      updateHealthData({
        age: Number(formState.age),
        weight: Number(formState.weight),
        height: Number(formState.height),
        gender: formState.gender as 'male' | 'female' | 'other',
      });
      onNext();
    }
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
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            We'll use this information to provide better recommendations for products that match your needs.
          </Text>
        </View>

        <View style={styles.form}>
          <AgePickerComponent
            value={formState.age}
            onValueChange={(text) => updateFormField('age', text)}
            error={errors.age}
          />

          <TextInput
            label="Weight (kg)"
            placeholder="Enter your weight in kg"
            value={formState.weight}
            onChangeText={(text) => updateFormField('weight', text)}
            error={errors.weight}
            keyboardType="numeric"
          />

          <TextInput
            label="Height (cm)"
            placeholder="Enter your height in cm"
            value={formState.height}
            onChangeText={(text) => updateFormField('height', text)}
            error={errors.height}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {genders.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  formState.gender === gender && styles.selectedGender,
                ]}
                onPress={() => updateFormField('gender', gender)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderText,
                    formState.gender === gender && styles.selectedGenderText,
                  ]}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        </View>

        <Button
          title="Continue"
          onPress={handleNext}
          style={styles.button}
        />
      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Additional top padding for mobile
  },
  header: {
    marginTop: SIZES.marginLarge,
    marginBottom: SIZES.marginLarge,
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.xxxLarge,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
  },
  form: {
    marginBottom: SIZES.marginLarge,
  },
  label: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.marginSmall,
  },
  genderOption: {
    flex: 1,
    padding: SIZES.paddingMedium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadiusSmall,
    marginRight: SIZES.marginSmall,
  },
  selectedGender: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10', // 10% opacity
  },
  genderText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.mediumGray,
  },
  selectedGenderText: {
    color: COLORS.primary,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.error,
    marginBottom: SIZES.marginMedium,
  },
  button: {
    marginTop: SIZES.marginMedium,
  },
  // Age picker styles
  pickerContainer: {
    marginBottom: SIZES.marginMedium,
    width: '100%',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusSmall,
    padding: SIZES.paddingMedium,
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerButtonError: {
    borderColor: COLORS.error,
  },
  pickerButtonText: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.paddingMedium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: SIZES.paddingSmall,
  },
  modalCloseText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  ageScrollView: {
    maxHeight: 300,
  },
  ageOption: {
    padding: SIZES.paddingMedium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  selectedAgeOption: {
    backgroundColor: COLORS.primary + '10',
  },
  ageOptionText: {
    ...FONTS.regular,
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  selectedAgeOptionText: {
    ...FONTS.bold,
    color: COLORS.primary,
  },
});

export default PersonalDetailsScreen; 