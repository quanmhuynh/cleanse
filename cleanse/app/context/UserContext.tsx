import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserHealthData {
  // Step 1: Basic Characteristics
  age: number | null;
  weight: number | null; // kg
  height: number | null; // cm
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
  selectedProfileId: string | null;
  selectProfile: (profileId: string) => Promise<void>;
  hasSelectedProfile: boolean;
  completedSurvey: boolean;
  setCompletedSurvey: (completed: boolean) => void;
  healthData: UserHealthData;
  updateHealthData: (data: Partial<UserHealthData>) => void;
  currentSurveyStep: number;
  setCurrentSurveyStep: (step: number) => void;
  
  // If you still want "profile" logic
  createNewProfile: (username: string) => Promise<string>;
  loadUserData: () => Promise<void>;
  saveUserData: () => Promise<void>;
}

// Example initial data
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

export function UserProvider({ children }: { children: ReactNode }) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [hasSelectedProfile, setHasSelectedProfile] = useState(false);
  const [completedSurvey, setCompletedSurvey] = useState(false);
  const [healthData, setHealthData] = useState<UserHealthData>(initialHealthData);
  const [currentSurveyStep, setCurrentSurveyStep] = useState(1);

  // ----- UPDATING HEALTH DATA -----
  const updateHealthData = (data: Partial<UserHealthData>) => {
    setHealthData(prev => {
      const updated = {
        ...prev,
        ...data,
        conditions: {
          ...prev.conditions,
          ...(data.conditions || {}),
        },
      };
      return updated;
    });
  };

  // ----- SELECT PROFILE -----
  const selectProfile = async (profileId: string) => {
    setSelectedProfileId(profileId);
    // If you still want to load from server or local storage, call loadUserData
    // await loadUserData(profileId);
    setHasSelectedProfile(true);
  };

  // ----- CREATE NEW PROFILE -----
  const createNewProfile = async (username: string): Promise<string> => {
    // If you want to store the profile list on the server or locally, you can do so here.
    // This example just returns a random profileId to keep the logic consistent
    const newProfileId = `profile_${Date.now()}`;
    console.log('Created new profile for user:', username, 'with ID:', newProfileId);
    return newProfileId;
  };

  // ----- LOAD USER DATA (OPTIONAL) -----
  const loadUserData = async (profileId?: string) => {
    // If you want to fetch existing data from the server, do a GET request here
    // e.g., fetch(`http://YOUR_SERVER_IP:8000/users/${profileId}`)
    // Then update state accordingly.
    console.log('loadUserData called. Implement server GET if needed.');
  };

  // ----- SAVE USER DATA TO SERVER (IMPORTANT) -----
  const saveUserData = async () => {
    try {
      // Map your current state -> the shape required by FastAPI’s UserModel
      // For example, if your server expects:
      //   { email, height, weight, age, physical_activity, gender, comorbidities, preferences }
      // You need to decide how to get 'email' or 'physical_activity' from your app state.
      // Let's do an example mapping:

      const userToAdd = {
        email: 'some_email@example.com',  // Or retrieve from some additional state field
        height: healthData.height ?? 0,
        weight: healthData.weight ?? 0,
        age: healthData.age ?? 0,
        physical_activity: 'light',      // Hard-coded example. Could come from a new field
        gender: healthData.gender ?? 'other',
        comorbidities: {
          // Perhaps you store them as booleans but your server expects an array or dictionary
          highBloodPressure: healthData.conditions.highBloodPressure,
          diabetes: healthData.conditions.diabetes,
          heartDisease: healthData.conditions.heartDisease,
          kidneyDisease: healthData.conditions.kidneyDisease,
          pregnant: healthData.conditions.pregnant,
          cancer: healthData.conditions.cancer,
          dietaryRestrictions: healthData.conditions.dietaryRestrictions,
          otherConditions: healthData.conditions.otherConditions,
        },
        preferences: healthData.additionalPreferences,
      };

      const response = await fetch('http://127.0.0.1:8000/add_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToAdd),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('User added successfully:', data);

    } catch (error) {
      console.error('Error saving user data to server:', error);
    }
  };

  // Whenever certain fields change, you could optionally auto-save:
  useEffect(() => {
    if (selectedProfileId) {
      // Uncomment if you want auto-save to run:
      // saveUserData();
    }
  }, [completedSurvey, healthData, currentSurveyStep]);

  // Just to keep naming consistent
  const setCompletedSurveyWithSave = (value: boolean) => {
    setCompletedSurvey(value);
    // Optionally call saveUserData() here
  };

  return (
    <UserContext.Provider
      value={{
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for easy access
export function useUser() {
  return useContext(UserContext);
}

export default UserProvider;
