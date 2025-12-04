import React, { useState, useCallback } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  View, 
  Text,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../theme/colors';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  multiline?: boolean;
  height?: number;
}

const Input: React.FC<InputProps> = ({ 
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style, 
  multiline, 
  height,
  secureTextEntry,
  editable = true,
  onFocus,
  onBlur,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const actualSecureEntry = isPassword && !showPassword;

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const getBorderColor = () => {
    if (error) return colors.feedback.error;
    if (isFocused) return colors.primary.main;
    return colors.neutral.border;
  };

  const getBackgroundColor = () => {
    if (!editable) return colors.neutral.background;
    return colors.neutral.white;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[
          styles.label,
          isFocused && styles.labelFocused,
          error && styles.labelError,
        ]}>
          {label}
        </Text>
      )}
      
      <Pressable 
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          multiline && { height: height || 120, alignItems: 'flex-start' },
        ]}
      >
        {icon && (
          <MaterialIcons 
            name={icon} 
            size={22} 
            color={isFocused ? colors.primary.main : colors.neutral.textMuted}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput 
          style={[
            styles.input,
            multiline && styles.multilineInput,
            !editable && styles.inputDisabled,
            style,
          ]} 
          placeholderTextColor={colors.neutral.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          secureTextEntry={actualSecureEntry}
          editable={editable}
          autoCorrect={false}
          blurOnSubmit={!multiline}
          {...props} 
        />

        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons 
              name={showPassword ? 'visibility' : 'visibility-off'} 
              size={22} 
              color={colors.neutral.textMuted}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons 
              name={rightIcon} 
              size={22} 
              color={colors.neutral.textMuted}
            />
          </TouchableOpacity>
        )}
      </Pressable>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={14} color={colors.feedback.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  labelFocused: {
    color: colors.primary.main,
  },
  labelError: {
    color: colors.feedback.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    backgroundColor: colors.neutral.white,
  },
  inputWrapperFocused: {
    borderColor: colors.primary.main,
  },
  inputWrapperError: {
    borderColor: colors.feedback.error,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral.textPrimary,
    paddingVertical: spacing.sm,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: spacing.md,
    height: '100%',
  },
  inputDisabled: {
    color: colors.neutral.textMuted,
  },
  rightIconButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
    gap: spacing.xs,
  },
  errorText: {
    ...typography.small,
    color: colors.feedback.error,
  },
});
