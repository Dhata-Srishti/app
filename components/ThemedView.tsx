import React from 'react';
import { View, ViewProps, useColorScheme } from 'react-native';

interface ThemedViewProps extends ViewProps {
  type?: 'default' | 'card' | 'background';
}

export function ThemedView({ style, type = 'default', ...props }: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getBackgroundColor = () => {
    switch (type) {
      case 'card':
        return isDark ? '#2C2C2C' : '#FFFFFF';
      case 'background':
        return isDark ? '#1A1A1A' : '#F5F5F5';
      default:
        return isDark ? '#000000' : '#FFFFFF';
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: getBackgroundColor(),
        },
        style,
      ]}
      {...props}
    />
  );
}
