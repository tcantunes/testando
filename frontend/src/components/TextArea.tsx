import React, { useState, useCallback } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  View,
  Pressable,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme/colors';

export interface TextAreaProps extends TextInputProps {
  height?: number;
}

const TextArea: React.FC<TextAreaProps> = ({ 
  style, 
  height = 120,
  editable = true,
  onFocus,
  onBlur,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  return (
    <Pressable 
      style={[
        styles.container,
        { height },
        isFocused && styles.containerFocused,
        !editable && styles.containerDisabled,
      ]}
    >
      <TextInput 
        style={[
          styles.input,
          style,
        ]} 
        placeholderTextColor={colors.neutral.textMuted}
        multiline
        textAlignVertical="top"
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={editable}
        autoCorrect={false}
        blurOnSubmit={false}
        {...props} 
      />
    </Pressable>
  );
};

export default TextArea;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.neutral.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  containerFocused: {
    borderColor: colors.primary.main,
  },
  containerDisabled: {
    backgroundColor: colors.neutral.background,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.neutral.textPrimary,
  },
});
