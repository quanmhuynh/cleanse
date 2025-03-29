import React from 'react';
import { 
  View, 
  TextInput as RNTextInput, 
  Text, 
  StyleSheet, 
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
}

const TextInput = ({
  label,
  error,
  placeholder,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  ...restProps
}: TextInputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
      <RNTextInput
        style={[
          styles.input,
          error ? styles.inputError : {},
          inputStyle
        ]}
        placeholderTextColor={COLORS.mediumGray}
        placeholder={placeholder}
        {...restProps}
      />
      {error && (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.marginMedium,
    width: '100%',
  },
  label: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.marginSmall / 2,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusSmall,
    padding: SIZES.paddingMedium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    minHeight: 50,
    ...FONTS.regular,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.error,
    marginTop: SIZES.marginSmall / 2,
  },
});

export default TextInput; 