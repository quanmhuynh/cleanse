import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { COLORS, SIZES, FONTS } from '../../../constants/theme';
import Button from '../../components/Button';
import ProgressSteps from '../../components/ProgressSteps';
import TextInput from '../../components/TextInput';

interface PreferencesScreenProps {
  onComplete: () => void;
  onBack: () => void;
  preferences: string;
  setPreferences: (preferences: string) => void;
  loading?: boolean;
}

const PreferencesScreen = ({ 
  onComplete, 
  onBack,
  preferences,
  setPreferences,
  loading = false
}: PreferencesScreenProps) => {
  const { currentSurveyStep } = useUser();

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
          <Text style={styles.title}>Additional Preferences</Text>
          <Text style={styles.subtitle}>
            Is there anything else you'd like us to know about your health, dietary needs, or preferences?
          </Text>
        </View>

        <View style={styles.section}>
          <TextInput
            placeholder="Enter any additional information that might be relevant..."
            value={preferences}
            onChangeText={setPreferences}
            multiline
            numberOfLines={6}
            inputStyle={styles.textAreaInput}
          />
          <Text style={styles.helperText}>
            Examples: specific ingredients to avoid, meal timing preferences, food intolerances, 
            or any health goals you're working toward.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={onBack}
            variant="outline"
            style={styles.backButton}
            disabled={loading}
          />
          <Button
            title={loading ? "Saving..." : "Complete"}
            onPress={onComplete}
            style={styles.completeButton}
            disabled={loading}
          />
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
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
  section: {
    marginBottom: SIZES.marginLarge,
  },
  textAreaInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.mediumGray,
    marginTop: SIZES.marginSmall,
    marginBottom: SIZES.marginLarge,
    fontStyle: 'italic',
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
  completeButton: {
    flex: 1,
    marginLeft: SIZES.marginSmall,
    backgroundColor: COLORS.secondary,
  },
  loadingContainer: {
    marginTop: SIZES.marginLarge,
    alignItems: 'center',
  }
});

export default PreferencesScreen; 