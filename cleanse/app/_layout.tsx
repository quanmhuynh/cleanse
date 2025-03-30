import React from 'react';
import { Stack } from "expo-router";
import { UserProvider, useUser } from "./context/UserContext";
import AppNavigator from './navigation/AppNavigator';
import { COLORS } from '../constants/theme';

function AppContent() {
  // We'll directly use our AppNavigator which now handles the complete flow:
  // Profile Selection -> Survey -> Main App
  return <AppNavigator />;
}

export default function RootLayout() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
