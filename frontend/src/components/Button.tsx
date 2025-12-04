import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  color?: string; // Para compatibilidade com código existente
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  color, // ignorado no novo design, mantido para compatibilidade
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...sizeStyles[size],
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (variant === 'outline') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary.main,
      };
    }

    if (variant === 'ghost') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
      };
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...textSizeStyles[size],
      fontWeight: '700',
    };

    if (variant === 'outline' || variant === 'ghost') {
      return {
        ...baseStyle,
        color: colors.primary.main,
      };
    }

    return {
      ...baseStyle,
      color: colors.neutral.white,
    };
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? colors.primary.main : colors.neutral.white} 
          size="small" 
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), isDisabled && styles.disabledText]}>
            {title}
          </Text>
        </>
      )}
    </>
  );

  if (variant === 'primary' || variant === 'secondary') {
    const gradientColors = variant === 'primary' 
      ? colors.gradients.primary 
      : colors.gradients.secondary;

    return (
      <TouchableOpacity 
        onPress={onPress} 
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.shadowContainer,
          fullWidth && { width: '100%' },
          isDisabled && styles.disabled,
        ]}
      >
        <LinearGradient
          colors={isDisabled ? [colors.neutral.disabled, colors.neutral.disabled] : gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[getButtonStyle(), styles.gradient]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        getButtonStyle(),
        isDisabled && styles.disabled,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const sizeStyles: Record<string, ViewStyle> = {
  small: {
    height: 40,
    paddingHorizontal: spacing.md,
  },
  medium: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  large: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },
};

const textSizeStyles: Record<string, TextStyle> = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
};

const styles = StyleSheet.create({
  shadowContainer: {
    borderRadius: borderRadius.lg,
    ...colors.shadows.medium,
  },
  gradient: {
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default Button;
