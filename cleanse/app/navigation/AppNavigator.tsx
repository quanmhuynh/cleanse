import React from 'react';
import { Stack } from 'expo-router';
import { useUser } from '../context/UserContext';
import SurveyContainer from '../screens/survey/SurveyContainer';

const AppNavigator = () => {
  const { completedSurvey } = useUser();

  return (
    <>
      {!completedSurvey ? (
        // Show the survey if not completed
        <SurveyContainer 
          onSurveyComplete={() => {
            // After survey completion, the Stack navigator will show the main app
          }} 
        />
      ) : (
        // Show the main app stack when survey is completed
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
        />
      )}
    </>
  );
};

export default AppNavigator; 