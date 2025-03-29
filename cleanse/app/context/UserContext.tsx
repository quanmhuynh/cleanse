import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, getUser, saveUser, createUser } from '../../utils/userStorage';

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
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  completedSurvey: boolean;
  setCompletedSurvey: (completed: boolean) => void;
  healthData: UserHealthData;
  updateHealthData: (data: Partial<UserHealthData>) => void;
  currentSurveyStep: number;
  setCurrentSurveyStep: (step: number) => void;
  saveCurrentUser: () => Promise<void>;
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
  currentUser: null,
  setCurrentUser: () => {},
  completedSurvey: false,
  setCompletedSurvey: () => {},
  healthData: initialHealthData,
  updateHealthData: () => {},
  currentSurveyStep: 1,
  setCurrentSurveyStep: () => {},
  saveCurrentUser: async () => {},
});

// Provider component that wraps app
export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [completedSurvey, setCompletedSurvey] = useState(false);
  const [healthData, setHealthData] = useState<UserHealthData>(initialHealthData);
  const [currentSurveyStep, setCurrentSurveyStep] = useState(1);

  // Load data from current user
  useEffect(() => {
    if (currentUser) {
      setHealthData(currentUser.healthData);
      setCompletedSurvey(currentUser.completedSurvey);
    } else {
      setHealthData(initialHealthData);
      setCompletedSurvey(false);
    }
  }, [currentUser]);

  // Function to update health data
  const updateHealthData = (data: Partial<UserHealthData>) => {
    setHealthData(prevData => ({
      ...prevData,
      ...data,
      // Handle nested objects like conditions
      conditions: {
        ...prevData.conditions,
        ...(data.conditions || {})
      }
    }));
  };

  // Function to save current user data
  const saveCurrentUser = async () => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        healthData,
        completedSurvey
      };
      await saveUser(updatedUser);
      setCurrentUser(updatedUser);
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser,
      completedSurvey,
      setCompletedSurvey,
      healthData,
      updateHealthData,
      currentSurveyStep,
      setCurrentSurveyStep,
      saveCurrentUser
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