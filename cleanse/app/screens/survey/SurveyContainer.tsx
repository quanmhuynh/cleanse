import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import HealthConditionsScreen from './HealthConditionsScreen';
import PreferencesScreen from './PreferencesScreen';
import { Alert } from 'react-native';

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

    console.log('Submitting user data with email:', userData.email);

    // Send data to API
    fetch("http://localhost:8000/add_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.detail || "Failed to save user data");
        });
      }
      return response.json();
    })
    .then(data => {
      setLoading(false);
      setCompletedSurvey(true);
      onSurveyComplete();
    })
    .catch(error => {
      setLoading(false);
      Alert.alert("Error", error.message || "Failed to save your data. Please try again.");
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