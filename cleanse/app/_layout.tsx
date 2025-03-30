import React from 'react';
import { Stack } from "expo-router";
import { UserProvider } from "./context/UserContext";
import { useUser } from "./context/UserContext";
import SurveyContainer from './screens/survey/SurveyContainer';
import { COLORS } from '../constants/theme';

function AppContent() {
  const { completedSurvey, setCompletedSurvey } = useUser();

  if (!completedSurvey) {
    return <SurveyContainer onSurveyComplete={() => {
      // This will trigger a re-render that shows the tabs
      setCompletedSurvey(true);
    }} />;
  }

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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
