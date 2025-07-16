import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ImagePreviewModal = ({ImagePreviewModal, previewImage, setImagePreview}) => {
  return (
	 <Modal
        animationType="fade"
        transparent
        visible={ImagePreviewModal}
        onRequestClose={() => setImagePreview(false)}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => setImagePreview(false)}
        />
        <View style={styles.previewOverlay}>
          <TouchableOpacity 
            style={styles.previewCloseButton} 
            onPress={() => setImagePreview(false)}
          >
            <MaterialIcons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
  )
}

export default ImagePreviewModal

const styles = StyleSheet.create({
	previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: 8,
  },
  previewCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  previewDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 30,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 8,
  },
})