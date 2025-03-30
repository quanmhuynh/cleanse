import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';

// Define interface for health data
export interface UserHealthData {
  email: string;
  age: number | null;
  weight: number | null; // in kg
  height: number | null; // in cm
  gender: 'male' | 'female' | 'other' | null;
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
  additionalPreferences: string;
}

interface UserContextType {
  currentUser: string | null;
  selectUser: (email: string) => Promise<void>;
  hasSelectedUser: boolean;
  completedSurvey: boolean;
  setCompletedSurvey: (completed: boolean) => void;
  healthData: UserHealthData;
  updateHealthData: (data: Partial<UserHealthData>) => void;
  currentSurveyStep: number;
  setCurrentSurveyStep: (step: number) => void;
  createNewUser: (email: string) => Promise<void>;
  saveUserData: () => Promise<void>;
  userList: string[];
  loadUserList: () => Promise<void>;
}

// Create initial health data
const initialHealthData: UserHealthData = {
  email: '',
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
  selectUser: async () => {},
  hasSelectedUser: false,
  completedSurvey: false,
  setCompletedSurvey: () => {},
  healthData: initialHealthData,
  updateHealthData: () => {},
  currentSurveyStep: 1,
  setCurrentSurveyStep: () => {},
  createNewUser: async () => {},
  saveUserData: async () => {},
  userList: [],
  loadUserList: async () => {},
});

// Provider component that wraps app
export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [hasSelectedUser, setHasSelectedUser] = useState(false);
  const [completedSurvey, setCompletedSurvey] = useState(false);
  const [healthData, setHealthData] = useState<UserHealthData>(initialHealthData);
  const [currentSurveyStep, setCurrentSurveyStep] = useState(1);
  const [userList, setUserList] = useState<string[]>([]);

  // Load user list on mount
  useEffect(() => {
    loadUserList();
  }, []);

  // Load the list of users
  const loadUserList = async () => {
    try {
      const storedList = await AsyncStorage.getItem('userList');
      if (storedList) {
        setUserList(JSON.parse(storedList));
      }
    } catch (error) {
      console.error('Error loading user list:', error);
    }
  };

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
      
      return updatedData;
    });
  };

  // Select a user and load their data
  const selectUser = async (email: string) => {
    try {
      console.log(`Selecting user: ${email}`);
      setCurrentUser(email);
      
      // Load user data from local storage
      const userDataJson = await AsyncStorage.getItem(`user_${email}`);
      
      if (userDataJson) {
        // Local data exists, use it
        const userData = JSON.parse(userDataJson);
        setHealthData({...userData, email});
        setCompletedSurvey(!!userData.completedSurvey);
        setCurrentSurveyStep(userData.currentSurveyStep || 1);
      } else {
        // No local data, try to get from API
        try {
          const apiUserData = await api.get<any>(`get_user?email=${email}`);
          
          if (apiUserData) {
            // Transform API data to our format
            const formattedData: UserHealthData = {
              email: email,
              age: apiUserData.age || null,
              weight: apiUserData.weight || null,
              height: apiUserData.height || null,
              gender: apiUserData.gender as any || null,
              conditions: {
                highBloodPressure: apiUserData.comorbidities?.includes('high_blood_pressure') || false,
                diabetes: apiUserData.comorbidities?.includes('diabetes') || false,
                heartDisease: apiUserData.comorbidities?.includes('heart_disease') || false,
                kidneyDisease: apiUserData.comorbidities?.includes('kidney_disease') || false,
                pregnant: apiUserData.comorbidities?.includes('pregnant') || false,
                cancer: apiUserData.comorbidities?.includes('cancer') || false,
                dietaryRestrictions: apiUserData.comorbidities?.filter((c: string) => 
                  ['gluten_free', 'dairy_free', 'vegan', 'vegetarian'].includes(c)) || [],
                otherConditions: apiUserData.comorbidities?.filter((c: string) => 
                  !['high_blood_pressure', 'diabetes', 'heart_disease', 'kidney_disease', 
                  'pregnant', 'cancer', 'gluten_free', 'dairy_free', 'vegan', 'vegetarian'].includes(c)) || [],
              },
              additionalPreferences: apiUserData.preferences || '',
            };
            
            setHealthData(formattedData);
            setCompletedSurvey(true); // If it exists in API, assume survey is completed
            setCurrentSurveyStep(4);
            
            // Save to local storage for future use
            await AsyncStorage.setItem(`user_${email}`, JSON.stringify({
              ...formattedData,
              completedSurvey: true,
              currentSurveyStep: 4
            }));
          } else {
            // No data in API either, initialize with defaults
            const newUserData = {
              ...initialHealthData,
              email: email,
              completedSurvey: false,
              currentSurveyStep: 1
            };
            
            setHealthData({...initialHealthData, email});
            setCompletedSurvey(false);
            setCurrentSurveyStep(1);
            
            // Save default data to local storage
            await AsyncStorage.setItem(`user_${email}`, JSON.stringify(newUserData));
          }
        } catch (error) {
          console.error('Error fetching user from API:', error);
          // Initialize with defaults
          const newUserData = {
            ...initialHealthData,
            email: email,
            completedSurvey: false,
            currentSurveyStep: 1
          };
          
          setHealthData({...initialHealthData, email});
          setCompletedSurvey(false);
          setCurrentSurveyStep(1);
          
          // Save default data to local storage
          await AsyncStorage.setItem(`user_${email}`, JSON.stringify(newUserData));
        }
      }
      
      setHasSelectedUser(true);
    } catch (error) {
      console.error('Error selecting user:', error);
    }
  };

  // Create a new user
  const createNewUser = async (email: string) => {
    try {
      console.log(`Creating new user: ${email}`);
      
      // Initialize with defaults
      const newUserData = {
        ...initialHealthData,
        email: email,
        completedSurvey: false,
        currentSurveyStep: 1
      };
      
      // Save to local storage
      await AsyncStorage.setItem(`user_${email}`, JSON.stringify(newUserData));
      
      // Update user list
      const updatedUserList = [...userList, email];
      setUserList(updatedUserList);
      await AsyncStorage.setItem('userList', JSON.stringify(updatedUserList));
      
      // Select the new user
      await selectUser(email);
    } catch (error) {
      console.error('Error creating new user:', error);
    }
  };

  // Save user data to storage and API
  const saveUserData = async () => {
    if (!currentUser) {
      console.error('Cannot save user data: No user selected');
      return;
    }
    
    try {
      console.log(`Saving user data for ${currentUser}`);
      
      // Save to local storage
      const dataToSave = {
        ...healthData,
        completedSurvey,
        currentSurveyStep
      };
      
      await AsyncStorage.setItem(`user_${currentUser}`, JSON.stringify(dataToSave));
      
      // Only send to API if survey is completed
      if (completedSurvey) {
        // Format for API
        const apiUserData = {
          email: currentUser,
          height: healthData.height || 170.0,
          weight: healthData.weight || 70.0,
          age: healthData.age || 30,
          physical_activity: "Moderate",
          gender: healthData.gender || "not_specified",
          comorbidities: [
            ...(healthData.conditions.highBloodPressure ? ['high_blood_pressure'] : []),
            ...(healthData.conditions.diabetes ? ['diabetes'] : []),
            ...(healthData.conditions.heartDisease ? ['heart_disease'] : []),
            ...(healthData.conditions.kidneyDisease ? ['kidney_disease'] : []),
            ...(healthData.conditions.pregnant ? ['pregnant'] : []),
            ...(healthData.conditions.cancer ? ['cancer'] : []),
            ...healthData.conditions.dietaryRestrictions,
            ...healthData.conditions.otherConditions,
          ],
          preferences: healthData.additionalPreferences || "No specific preferences",
        };
        
        try {
          await api.post('add_user', apiUserData);
          console.log('User data saved to API successfully');
        } catch (apiError) {
          console.error('Failed to save user data to API:', apiError);
        }
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Save data whenever relevant state changes
  useEffect(() => {
    if (currentUser) {
      saveUserData();
    }
  }, [completedSurvey, currentSurveyStep]);
  
  // Save health data changes with debounce
  useEffect(() => {
    if (currentUser) {
      const timeoutId = setTimeout(() => {
        saveUserData();
      }, 1000); // 1 second debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [healthData]);

  return (
    <UserContext.Provider value={{
      currentUser,
      selectUser,
      hasSelectedUser,
      completedSurvey,
      setCompletedSurvey,
      healthData,
      updateHealthData,
      currentSurveyStep,
      setCurrentSurveyStep,
      createNewUser,
      saveUserData,
      userList,
      loadUserList
    }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  return useContext(UserContext);
}

export default UserProvider; 