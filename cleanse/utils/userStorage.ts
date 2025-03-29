import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserHealthData } from '../app/context/UserContext';

export interface User {
  id: string;
  name: string;
  createdAt: number;
  healthData: UserHealthData;
  completedSurvey: boolean;
}

// Key for storing the list of user IDs
const USERS_KEY = 'cleanse_users';

// Get a user by ID
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(`user_${userId}`);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const userIdsJson = await AsyncStorage.getItem(USERS_KEY);
    const userIds = userIdsJson ? JSON.parse(userIdsJson) : [];
    
    const users = await Promise.all(
      userIds.map(async (id: string) => await getUser(id))
    );
    
    return users.filter((user): user is User => user !== null);
  } catch (error) {
    console.error('Error retrieving all users:', error);
    return [];
  }
};

// Save a user
export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(`user_${user.id}`, JSON.stringify(user));
    
    // Add user ID to the list if not already present
    const userIdsJson = await AsyncStorage.getItem(USERS_KEY);
    const userIds = userIdsJson ? JSON.parse(userIdsJson) : [];
    
    if (!userIds.includes(user.id)) {
      userIds.push(user.id);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(userIds));
    }
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Create a new user
export const createUser = async (name: string): Promise<User> => {
  const id = Date.now().toString();
  const newUser: User = {
    id,
    name,
    createdAt: Date.now(),
    completedSurvey: false,
    healthData: {
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
    }
  };
  
  await saveUser(newUser);
  return newUser;
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`user_${userId}`);
    
    const userIdsJson = await AsyncStorage.getItem(USERS_KEY);
    const userIds = userIdsJson ? JSON.parse(userIdsJson) : [];
    
    const updatedUserIds = userIds.filter((id: string) => id !== userId);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUserIds));
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}; 