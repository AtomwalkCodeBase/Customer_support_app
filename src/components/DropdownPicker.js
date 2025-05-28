import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const DropdownPicker = ({
  label,
  value,
  items,
  onSelect,
  placeholder,
  disabled,
  isLoading,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  // Handle different value types (string or object)
  const displayValue = React.useMemo(() => {
    if (typeof value === 'string') {
      return value; // Directly use the string value for display
    }
    return value?.name || placeholder;
  }, [value, placeholder]);

  // If disabled, show the value's name or placeholder
  if (disabled) {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.dropdownButton, styles.disabledDropdown]}>
          <Text style={styles.dropdownButtonText}>
            {displayValue}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, disabled && styles.disabledDropdown]}
          onPress={() => !isLoading && !disabled && setShowPicker(true)}
          disabled={isLoading || disabled}
        >
          <Text
            style={[
              styles.dropdownButtonText,
              !value?.id && styles.placeholderText,
            ]}
          >
            {displayValue}
          </Text>
          {!disabled && (
            <MaterialIcons name="arrow-drop-down" size={24} color="#888" />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select {label}</Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Feather name="x" size={20} color="#333" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {items?.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.pickerItem,
                        value?.id === item.id && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        onSelect(item);
                        setShowPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          value?.id === item.id && styles.pickerItemTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {value?.id === item.id && (
                        <Feather name="check" size={20} color="#FF6B6B" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
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
  dropdownButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  disabledDropdown: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '100%',
    maxHeight: '70%',
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerItemSelected: {
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerItemTextSelected: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

export default DropdownPicker;