/**
 * Input — text field with optional floating label, leading icon, error/helper.
 */
import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Text } from './Text';
import { useColors, fontFamily, fontSize, radii, spacing } from '@/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helper?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  helper,
  error,
  leadingIcon,
  trailingIcon,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
    ? colors.brand[600]
    : colors.border.default;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="caption" color="secondary" style={{ marginBottom: spacing[1.5] }}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: radii.lg,
            borderWidth: 1.5,
            paddingHorizontal: spacing[3],
            minHeight: 52,
            backgroundColor: focused ? colors.card : colors.slate[100],
            borderColor,
          },
        ]}
      >
        {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          placeholderTextColor={colors.text.placeholder}
          cursorColor={colors.brand[600]}
          selectionColor={colors.brand[200]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
      </View>
      {error ? (
        <Text variant="caption" color={colors.danger} style={{ marginTop: spacing[1] }}>
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" color="tertiary" style={{ marginTop: spacing[1] }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    minHeight: 50,
    paddingVertical: spacing[2],
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  icon: {
    paddingHorizontal: spacing[1],
  },
});
