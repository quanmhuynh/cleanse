import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';

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

// Define interface for API user data
interface ApiUserData {
  email: string;
  height: number | null;
  weight: number | null;
  age: number | null;
  physical_activity: string;
  gender: string | null;
  comorbidities: string[];
  preferences: string;
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
      
      // Save the updated data to storage and API
      saveUserData(updatedData);
      
      return updatedData;
    });
  };

  // Select a profile and load its data
  const selectProfile = async (profileId: string) => {
    try {
      console.log(`Selecting profile: ${profileId}`);
      setSelectedProfileId(profileId);
      
      // First check if user exists on the API
      try {
        console.log(`Checking if user exists on server: ${profileId}`);
        const userData = await api.get<ApiUserData | null>(`get_user?email=${profileId}`);
        
        // If user doesn't exist on the API, create one
        if (!userData) {
          console.log(`User ${profileId} not found on server, creating default user...`);
          
          // Get local user data first to use if available
          let localUserData = null;
          try {
            const userDataJson = await AsyncStorage.getItem(`userData_${profileId}`);
            if (userDataJson) {
              localUserData = JSON.parse(userDataJson);
              console.log('Found local user data to use for API creation');
            }
          } catch (localError) {
            console.log('No local user data found or error reading it');
          }
          
          // Create user data for API, preferring local data if available
          const defaultUser = {
            email: profileId,
            height: localUserData?.healthData?.height || 170.0,
            weight: localUserData?.healthData?.weight || 70.0,
            age: localUserData?.healthData?.age || 30,
            physical_activity: "Moderate",
            gender: localUserData?.healthData?.gender || "not_specified",
            comorbidities: [],
            preferences: localUserData?.healthData?.additionalPreferences || "No specific preferences"
          };
          
          try {
            // Create the user on the server
            const result = await api.post('add_user', defaultUser);
            console.log(`Created default user for ${profileId} on server:`, result);
            
            // Fetch the user data right after creation to confirm
            const newUserData = await api.get<ApiUserData | null>(`get_user?email=${profileId}`);
            if (newUserData) {
              console.log('Successfully verified user was created on server');
            } else {
              console.warn('User was created but verification failed');
            }
          } catch (createError) {
            console.error(`Failed to create default user on server: ${createError}`);
            // Continue anyway, as we'll use local data
          }
        } else {
          console.log(`User ${profileId} exists on server`);
        }
      } catch (error) {
        console.log(`Error checking user existence: ${error}`);
        // Continue with local data if we can't check the API
      }
      
      // Now load the user data (either from API or local storage)
      await loadUserData(profileId);
      setHasSelectedProfile(true);
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  // Load user data from API and fallback to storage if API fails
  const loadUserData = async (profileId?: string) => {
    try {
      const idToUse = profileId || selectedProfileId;
      if (!idToUse) return;

      // Try to fetch from API first
      try {
        console.log(`Fetching user data from API for: ${idToUse}`);
        const userData = await api.get<ApiUserData | null>(`get_user?email=${idToUse}`);
        
        // Only process if userData exists and is not null
        if (userData) {
          console.log(`User data found on server for: ${idToUse}`);
          // Transform API data to our format
          const healthData: UserHealthData = {
            age: userData.age || null,
            weight: userData.weight || null,
            height: userData.height || null,
            gender: userData.gender as any || null,
            conditions: {
              highBloodPressure: userData.comorbidities?.includes('high_blood_pressure') || false,
              diabetes: userData.comorbidities?.includes('diabetes') || false,
              heartDisease: userData.comorbidities?.includes('heart_disease') || false,
              kidneyDisease: userData.comorbidities?.includes('kidney_disease') || false,
              pregnant: userData.comorbidities?.includes('pregnant') || false,
              cancer: userData.comorbidities?.includes('cancer') || false,
              dietaryRestrictions: userData.comorbidities?.filter(c => 
                ['gluten_free', 'dairy_free', 'vegan', 'vegetarian'].includes(c)) || [],
              otherConditions: userData.comorbidities?.filter(c => 
                !['high_blood_pressure', 'diabetes', 'heart_disease', 'kidney_disease', 
                'pregnant', 'cancer', 'gluten_free', 'dairy_free', 'vegan', 'vegetarian'].includes(c)) || [],
            },
            additionalPreferences: userData.preferences || '',
          };
          
          setHealthData(healthData);
          setCompletedSurvey(true);
          setCurrentSurveyStep(4); // completed
          return;
        } else {
          console.log('No user data found in API, falling back to local storage');
        }
      } catch (apiError) {
        console.log('API fetch failed, falling back to local storage', apiError);
      }

      // Fallback to local storage
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

  // Save user data to storage and API
  const saveUserData = async (updatedHealthData?: UserHealthData) => {
    try {
      if (!selectedProfileId) {
        console.error('Cannot save user data: No profile selected');
        return;
      }
      
      console.log(`Saving user data for ${selectedProfileId}`);
      const dataToUse = updatedHealthData || healthData;
      
      // Save to local storage
      const userData = {
        completedSurvey,
        healthData: dataToUse,
        currentSurveyStep,
      };
      
      await AsyncStorage.setItem(
        `userData_${selectedProfileId}`, 
        JSON.stringify(userData)
      );
      console.log('User data saved to local storage');
      
      // Always save to API regardless of survey completion
      // Transform our data format to API format
      const apiUserData = {
        email: selectedProfileId,
        height: dataToUse.height || 170.0, // Provide defaults where needed
        weight: dataToUse.weight || 70.0,
        age: dataToUse.age || 30,
        physical_activity: "Regular exercise", // Placeholder, would come from UI
        gender: dataToUse.gender || "not_specified",
        comorbidities: [
          ...(dataToUse.conditions.highBloodPressure ? ['high_blood_pressure'] : []),
          ...(dataToUse.conditions.diabetes ? ['diabetes'] : []),
          ...(dataToUse.conditions.heartDisease ? ['heart_disease'] : []),
          ...(dataToUse.conditions.kidneyDisease ? ['kidney_disease'] : []),
          ...(dataToUse.conditions.pregnant ? ['pregnant'] : []),
          ...(dataToUse.conditions.cancer ? ['cancer'] : []),
          ...dataToUse.conditions.dietaryRestrictions,
          ...dataToUse.conditions.otherConditions,
        ],
        preferences: dataToUse.additionalPreferences || "No specific preferences",
      };
      
      try {
        console.log('Saving user data to API...');
        const result = await api.post('add_user', apiUserData);
        console.log('User data saved to API successfully:', result);
      } catch (apiError) {
        console.error('Failed to save user data to API:', apiError);
        // Continue as we have saved to local storage as a backup
      }
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