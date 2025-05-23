import React from 'react';
import { Text, TextProps, useColorScheme } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'caption';
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getTextStyle = () => {
    const baseStyle = {
      color: isDark ? '#FFFFFF' : '#000000',
    };

    switch (type) {
      case 'title':
        return {
          ...baseStyle,
          fontSize: 24,
          fontWeight: 'bold',
        };
      case 'subtitle':
        return {
          ...baseStyle,
          fontSize: 18,
          fontWeight: '600',
        };
      case 'caption':
        return {
          ...baseStyle,
          fontSize: 12,
          color: isDark ? '#AAAAAA' : '#666666',
        };
      default:
        return baseStyle;
    }
  };

  return <Text style={[getTextStyle(), style]} {...props} />;
}
