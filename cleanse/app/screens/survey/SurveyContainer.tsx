import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import HealthConditionsScreen from './HealthConditionsScreen';
import PreferencesScreen from './PreferencesScreen';

interface SurveyContainerProps {
  onSurveyComplete: () => void;
}

const SurveyContainer = ({ onSurveyComplete }: SurveyContainerProps) => {
  const { setCurrentSurveyStep } = useUser();
  const [step, setStep] = useState(1);

  useEffect(() => {
    setCurrentSurveyStep(step);
  }, [step, setCurrentSurveyStep]);

  const handleNext = () => {
    setStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setStep(prevStep => prevStep - 1);
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalDetailsScreen onNext={handleNext} />;
      case 2:
        return <HealthConditionsScreen onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <PreferencesScreen onComplete={onSurveyComplete} onBack={handleBack} />;
      default:
        return <PersonalDetailsScreen onNext={handleNext} />;
    }
  };

  return renderStep();
};

export default SurveyContainer; 