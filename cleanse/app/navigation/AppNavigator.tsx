import React from 'react';
import { Stack } from 'expo-router';
import { useUser } from '../context/UserContext';
import { useRouter } from 'expo-router';

const AppNavigator = () => {
  const { currentUser } = useUser();
  const router = useRouter();

  // Handle survey completion
  const handleSurveyComplete = () => {
    router.replace('/');
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2367DC',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Define screens */}
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'User Selection',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          title: 'Scan Product',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="screens/survey/index"
        options={{
          title: 'Health Profile',
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default AppNavigator; 