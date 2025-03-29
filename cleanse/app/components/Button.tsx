import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) => {
  // Determine button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: [
            styles.container,
            styles.primaryContainer,
            disabled && styles.disabledContainer,
            style,
          ],
          text: [
            styles.text,
            styles.primaryText,
            textStyle,
          ],
        };
      case 'secondary':
        return {
          container: [
            styles.container,
            styles.secondaryContainer,
            disabled && styles.disabledContainer,
            style,
          ],
          text: [
            styles.text,
            styles.secondaryText,
            textStyle,
          ],
        };
      case 'outline':
        return {
          container: [
            styles.container,
            styles.outlineContainer,
            disabled && styles.disabledOutlineContainer,
            style,
          ],
          text: [
            styles.text,
            styles.outlineText,
            disabled && styles.disabledOutlineText,
            textStyle,
          ],
        };
      default:
        return {
          container: [styles.container, style],
          text: [styles.text, textStyle],
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <TouchableOpacity
      style={buttonStyles.container}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary : COLORS.white}
          size="small"
        />
      ) : (
        <Text style={buttonStyles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.paddingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryContainer: {
    backgroundColor: COLORS.primary,
  },
  secondaryContainer: {
    backgroundColor: COLORS.secondary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabledContainer: {
    backgroundColor: COLORS.lightGray,
  },
  disabledOutlineContainer: {
    borderColor: COLORS.mediumGray,
  },
  text: {
    ...FONTS.medium,
    fontSize: SIZES.large,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabledOutlineText: {
    color: COLORS.mediumGray,
  },
});

export default Button; 