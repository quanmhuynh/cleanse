import React from 'react';
import { Stack } from "expo-router";
import { UserProvider } from "./context/UserContext";
import AppNavigator from './navigation/AppNavigator';

export default function RootLayout() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}
