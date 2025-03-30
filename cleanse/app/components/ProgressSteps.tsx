import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

const ProgressSteps = ({ 
  currentStep, 
  totalSteps, 
  labels = [] 
}: ProgressStepsProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / totalSteps) * 100}%` }
            ]} 
          />
        </View>
        <View style={styles.stepsContainer}>
          {Array(totalSteps).fill(0).map((_, index) => {
            const isCompleted = index + 1 <= currentStep;
            const isCurrent = index + 1 === currentStep;
            
            return (
              <View key={index} style={styles.stepIndicatorWrapper}>
                <View 
                  style={[
                    styles.stepIndicator,
                    isCompleted && styles.completedStep,
                    isCurrent && styles.currentStep
                  ]}
                >
                  <Text 
                    style={[
                      styles.stepNumber,
                      (isCompleted || isCurrent) && styles.activeStepNumber
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                {labels[index] && (
                  <Text 
                    style={[
                      styles.stepLabel,
                      (isCompleted || isCurrent) && styles.activeStepLabel
                    ]}
                  >
                    {labels[index]}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZES.paddingMedium,
    width: '100%',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadiusFull,
    marginBottom: SIZES.marginSmall,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusFull,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  stepIndicatorWrapper: {
    alignItems: 'center',
    width: 80,
  },
  stepIndicator: {
    width: 80,
    height: 40,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedStep: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  currentStep: {
    borderColor: COLORS.primary,
  },
  stepNumber: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.mediumGray,
  },
  activeStepNumber: {
    color: COLORS.white,
  },
  stepLabel: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },
  activeStepLabel: {
    ...FONTS.medium,
    color: COLORS.primary,
  },
});

export default ProgressSteps; 