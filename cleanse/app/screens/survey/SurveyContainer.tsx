import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import HealthConditionsScreen from './HealthConditionsScreen';
import PreferencesScreen from './PreferencesScreen';
import { Alert } from 'react-native';
import { api, API_URL } from '../../utils/api';

interface SurveyContainerProps {
  onSurveyComplete: () => void;
}

const SurveyContainer = ({ onSurveyComplete }: SurveyContainerProps) => {
  const { setCurrentSurveyStep, setCompletedSurvey, updateHealthData, healthData, selectedProfileId } = useUser();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentSurveyStep(step);
  }, [step, setCurrentSurveyStep]);

  const handleNext = () => {
    setStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setStep(prevStep => prevStep - 1);
  };

  // Generate a unique email based on profile ID or random string
  const generateUniqueEmail = () => {
    let username = selectedProfileId || '';
    
    // If no profile ID, generate a random username
    if (!username) {
      username = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
    
    // Make sure username doesn't already contain .com
    if (!username.includes('.com')) {
      username = `${username}.com`;
    }
    
    // Ensure it's a proper email format
    if (!username.includes('@')) {
      username = `${username.replace('.com', '')}@example.com`;
    }
    
    return username;
  };

  const submitUserData = () => {
    setLoading(true);
    
    // Extract active health conditions as comorbidities
    const comorbidities = [];
    
    // Add boolean conditions that are true
    Object.entries(healthData.conditions).forEach(([key, value]) => {
      if (typeof value === 'boolean' && value === true) {
        comorbidities.push(key);
      }
    });
    
    // Add dietary restrictions
    if (healthData.conditions.dietaryRestrictions) {
      comorbidities.push(...healthData.conditions.dietaryRestrictions);
    }
    
    // Add other conditions
    if (healthData.conditions.otherConditions) {
      comorbidities.push(...healthData.conditions.otherConditions);
    }
    
    // Format data according to the API requirements
    const userData = {
      email: generateUniqueEmail(), // Generate unique email
      height: healthData.height,
      weight: healthData.weight,
      age: healthData.age,
      physical_activity: "Moderate", // This could be collected in the survey
      gender: healthData.gender,
      comorbidities: comorbidities,
      preferences: preferences // Use the preferences from state
    };

    console.log('Submitting user data to API');
    
    // Use the API utility instead of direct fetch
    api.post('add_user', userData)
      .then(data => {
        console.log('Success:', data);
        setLoading(false);
        setCompletedSurvey(true);
        onSurveyComplete();
      })
      .catch(error => {
        console.log('Full error:', error);
        setLoading(false);
        
        if (error.message.includes('Network request failed')) {
          // Special handling for network errors on mobile
          Alert.alert(
            "Connection Error", 
            "Could not connect to the server. Make sure:\n\n" +
            "1. Your backend server is running\n" +
            "2. Your phone and computer are on the same network\n" +
            `3. The server is accessible at ${API_URL}`
          );
        } else {
          Alert.alert("Error", error.message || "Failed to save your data. Please try again.");
        }
        console.error("API Error:", error);
      });
  };

  const handleComplete = () => {
    // Update the health data with the final preferences
    updateHealthData({
      additionalPreferences: preferences,
    });
    
    // Submit data to API
    submitUserData();
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalDetailsScreen onNext={handleNext} />;
      case 2:
        return <HealthConditionsScreen onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <PreferencesScreen 
                 onComplete={handleComplete} 
                 onBack={handleBack} 
                 setPreferences={setPreferences} 
                 preferences={preferences}
                 loading={loading}
               />;
      default:
        return <PersonalDetailsScreen onNext={handleNext} />;
    }
  };

  return renderStep();
};

export default SurveyContainer; 