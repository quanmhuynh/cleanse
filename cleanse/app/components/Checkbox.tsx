import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

const Checkbox = ({
  label,
  checked,
  onPress,
  containerStyle,
  labelStyle,
}: CheckboxProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <View style={styles.checkmark} />}
      </View>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginMedium,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: SIZES.borderRadiusSmall,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: SIZES.marginSmall,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  label: {
    ...FONTS.regular,
    fontSize: SIZES.medium,
    color: COLORS.text,
    flex: 1,
  },
});

export default Checkbox; 