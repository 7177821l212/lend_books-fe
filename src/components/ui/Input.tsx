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
import { colors, fontFamily, fontSize, radii, spacing } from '@/theme';

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
          styles.container,
          {
            backgroundColor: colors.slate[50],
            borderColor,
          },
        ]}
      >
        {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.text.placeholder}
          selectionColor={colors.brand[600]}
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing[3],
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  icon: {
    paddingHorizontal: spacing[1],
  },
});
