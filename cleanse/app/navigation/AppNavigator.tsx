import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import SurveyContainer from '../screens/survey/SurveyContainer';
import ProfileSelectionScreen from '../screens/ProfileSelectionScreen';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { BlurView } from 'expo-blur';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabBarComponent = (props: any) => {
  return (
    <View style={{ 
      position: 'absolute', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      ...SHADOWS.medium 
    }}>
      <BlurView
        intensity={80}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
        }}
      />
      <BottomTabBar
        {...props}
        style={{ 
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 10,
        }}
      />
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: SIZES.small,
          marginBottom: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
      tabBar={(props) => <TabBarComponent {...props} />}
    >
      <Tab.Screen 
        name="Scan" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="barcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Recommendations" 
        component={RecommendationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="tag-heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { hasSelectedProfile, completedSurvey, selectProfile } = useUser();
  const router = useRouter();
  const segments = useSegments();

  // Effect to handle navigation based on app state
  useEffect(() => {
    // Check if the last segment corresponds to the camera route name
    const isNavigatingToCamera = segments[segments.length - 1] === 'camera';

    // Only redirect to tabs if the survey is completed AND we are not trying to open the camera modal
    if (completedSurvey && !isNavigatingToCamera) {
      // If survey is completed, ensure user is in the main tabs section
      if (segments[0] !== '(tabs)') {
        // Wrap navigation in setTimeout to ensure Root Layout is mounted
        // This avoids the "Attempted to navigate before mounting the Root Layout" error
        setTimeout(() => {
          try {
            // Using replace ensures this doesn't add to history unnecessarily
            router.replace('/(tabs)');
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }, 100);
      }
    }
    // Note: The conditional rendering below might still conflict with Expo Router's
    // declarative nature. Consider using redirects to dedicated routes
    // (e.g., /profile-selection, /survey) managed by the Stack navigator
    // for better stability, instead of returning different components here.
  }, [completedSurvey, segments, router]); // Add router to dependency array

  // If user hasn't selected a profile, show profile selection
  if (!hasSelectedProfile) {
    return (
      <ProfileSelectionScreen
        onProfileSelect={(profileId) => selectProfile(profileId)}
      />
    );
  }

  // If user hasn't completed the survey, show the survey
  if (!completedSurvey) {
    return (
      <SurveyContainer
        onSurveyComplete={() => {
          // The user context state update will trigger the useEffect above
          // which should handle navigation.
        }}
      />
    );
  }

  // For completed users, render the main Stack navigator
  // The useEffect above handles redirecting to '(tabs)' if necessary.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="camera"
        options={{
          headerShown: true,
          headerTitle: "Scan Product",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          presentation: 'modal',
        }}
      />
      {/* Consider adding screens for profile selection and survey here
          if you refactor to use redirects instead of conditional returns */}
      {/* <Stack.Screen name="profile-selection" component={ProfileSelectionScreen} /> */}
      {/* <Stack.Screen name="survey" component={SurveyContainer} /> */}
    </Stack>
  );
};

export default AppNavigator; 