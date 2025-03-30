export const COLORS = {
  primary: '#2367DC',    // Main color (blue)
  secondary: '#DC9823',  // Accent color (orange/gold)
  white: '#FFFFFF',
  black: '#000000',
  gray: '#F5F5F5',
  lightGray: '#E5E5E5',
  mediumGray: '#999999',
  darkGray: '#666666',
  error: '#FF3B30',
  success: '#4CD964',
  text: '#333333',
};

export const SIZES = {
  // Font sizes
  xxSmall:7,
  xSmall: 10,
  small: 12,
  medium: 14,
  large: 16,
  xLarge: 18,
  xxLarge: 20,
  xxxLarge: 24,
  
  // Spacing
  spacing: 8,
  paddingSmall: 10,
  paddingMedium: 15,
  paddingLarge: 20,
  marginSmall: 10,
  marginMedium: 15,
  marginLarge: 20,
  
  // Border radius
  borderRadiusSmall: 5,
  borderRadiusMedium: 10,
  borderRadiusLarge: 15,
  borderRadiusFull: 9999,
};

export const FONTS = {
  regular: {
    fontFamily: 'System',
    fontWeight: 'normal' as const,
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
  },
  bold: {
    fontFamily: 'System',
    fontWeight: 'bold' as const,
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300' as const,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 6,
  },
}; 