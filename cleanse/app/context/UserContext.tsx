import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define interface for health data
export interface UserHealthData {
  // Step 1: Characteristics
  age: number | null;
  weight: number | null; // in kg
  height: number | null; // in cm
  gender: 'male' | 'female' | 'other' | null;
  
  // Step 2: Health conditions
  conditions: {
    highBloodPressure: boolean;
    diabetes: boolean;
    heartDisease: boolean;
    kidneyDisease: boolean;
    pregnant: boolean;
    cancer: boolean;
    dietaryRestrictions: string[];
    otherConditions: string[];
  };
  
  // Step 3: Additional preferences
  additionalPreferences: string;
}

interface UserContextType {
  // Profile selection
  selectedProfileId: string | null;
  selectProfile: (profileId: string) => Promise<void>;
  hasSelectedProfile: boolean;

  // Survey and user data
  completedSurvey: boolean;
  setCompletedSurvey: (completed: boolean) => void;
  healthData: UserHealthData;
  updateHealthData: (data: Partial<UserHealthData>) => void;
  currentSurveyStep: number;
  setCurrentSurveyStep: (step: number) => void;
  
  // New profile management functions
  createNewProfile: (username: string) => Promise<string>;
  loadUserData: () => Promise<void>;
  saveUserData: () => Promise<void>;
}

// Create initial health data
const initialHealthData: UserHealthData = {
  age: null,
  weight: null,
  height: null,
  gender: null,
  conditions: {
    highBloodPressure: false,
    diabetes: false,
    heartDisease: false,
    kidneyDisease: false,
    pregnant: false,
    cancer: false,
    dietaryRestrictions: [],
    otherConditions: [],
  },
  additionalPreferences: '',
};

// Create context with default values
const UserContext = createContext<UserContextType>({
  selectedProfileId: null,
  selectProfile: async () => {},
  hasSelectedProfile: false,
  completedSurvey: false,
  setCompletedSurvey: () => {},
  healthData: initialHealthData,
  updateHealthData: () => {},
  currentSurveyStep: 1,
  setCurrentSurveyStep: () => {},
  createNewProfile: async () => '',
  loadUserData: async () => {},
  saveUserData: async () => {},
});

// Provider component that wraps app
export function UserProvider({ children }: { children: ReactNode }) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [hasSelectedProfile, setHasSelectedProfile] = useState(false);
  const [completedSurvey, setCompletedSurvey] = useState(false);
  const [healthData, setHealthData] = useState<UserHealthData>(initialHealthData);
  const [currentSurveyStep, setCurrentSurveyStep] = useState(1);

  // Function to update health data
  const updateHealthData = (data: Partial<UserHealthData>) => {
    setHealthData(prevData => {
      const updatedData = {
        ...prevData,
        ...data,
        // Handle nested objects like conditions
        conditions: {
          ...prevData.conditions,
          ...(data.conditions || {})
        }
      };
      
      // Save the updated data to storage
      saveUserData();
      
      return updatedData;
    });
  };

  // Select a profile and load its data
  const selectProfile = async (profileId: string) => {
    try {
      setSelectedProfileId(profileId);
      await loadUserData(profileId);
      setHasSelectedProfile(true);
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  // Load user data from storage
  const loadUserData = async (profileId?: string) => {
    try {
      const idToUse = profileId || selectedProfileId;
      if (!idToUse) return;

      const userDataJson = await AsyncStorage.getItem(`userData_${idToUse}`);
      if (userDataJson) {
        const userData = JSON.parse(userDataJson);
        
        // Set state based on loaded data
        if (userData.completedSurvey !== undefined) {
          setCompletedSurvey(userData.completedSurvey);
        }
        
        if (userData.healthData) {
          setHealthData(userData.healthData);
        }
        
        if (userData.currentSurveyStep) {
          setCurrentSurveyStep(userData.currentSurveyStep);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Save user data to storage
  const saveUserData = async () => {
    try {
      if (!selectedProfileId) return;
      
      const userData = {
        completedSurvey,
        healthData,
        currentSurveyStep,
      };
      
      await AsyncStorage.setItem(
        `userData_${selectedProfileId}`, 
        JSON.stringify(userData)
      );
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Create a new profile
  const createNewProfile = async (username: string): Promise<string> => {
    try {
      // Get existing profiles
      const profileListJson = await AsyncStorage.getItem('profileList');
      const profileList = profileListJson ? JSON.parse(profileListJson) : [];
      
      // Create new profile
      const newProfileId = `profile_${Date.now()}`;
      const newProfile = {
        id: newProfileId,
        username,
        createdAt: new Date().toISOString(),
      };
      
      // Add to list and save
      profileList.push(newProfile);
      await AsyncStorage.setItem('profileList', JSON.stringify(profileList));
      
      // Create empty user data for this profile
      await AsyncStorage.setItem(
        `userData_${newProfileId}`, 
        JSON.stringify({
          completedSurvey: false,
          healthData: initialHealthData,
          currentSurveyStep: 1,
        })
      );
      
      return newProfileId;
    } catch (error) {
      console.error('Error creating new profile:', error);
      throw error;
    }
  };

  // Save data whenever relevant state changes
  useEffect(() => {
    if (selectedProfileId) {
      saveUserData();
    }
  }, [completedSurvey, healthData, currentSurveyStep]);

  // Override setCompletedSurvey to also save data
  const setCompletedSurveyWithSave = (value: boolean) => {
    setCompletedSurvey(value);
    // Data will be saved via the useEffect
  };

  return (
    <UserContext.Provider value={{
      selectedProfileId,
      selectProfile,
      hasSelectedProfile,
      completedSurvey,
      setCompletedSurvey: setCompletedSurveyWithSave,
      healthData,
      updateHealthData,
      currentSurveyStep,
      setCurrentSurveyStep,
      createNewProfile,
      loadUserData,
      saveUserData,
    }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  return useContext(UserContext);
}

// Add default export
export default UserProvider; 