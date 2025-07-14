import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { colors } from '../Styles/appStyle';

const TextInputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  editable,
  errorMessage
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
      {errorMessage && (
        <Text style={{ marginTop: 7, color: colors.error, fontSize: 12 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
});

export default TextInputField;