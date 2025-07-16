import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import ImagePreviewModal from "./ImagePreviewModal";

const FilePicker = ({
  label,
  fileUri,
  fileName,
  onFileChange,
  onRemove,
  isLoading,
  hadAttachment,
  isEditMode,
}) => {
  const [imagePreview, setImagePreview] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const openPickerModal = () => setPickerModalVisible(true);
  const closePickerModal = () => setPickerModalVisible(false);

  const compressImage = async (uri) => {
    let compressQuality = 1;
    const targetSize = 200 * 1024; // 200 KB
    let compressedImage = await ImageManipulator.manipulateAsync(uri, [], {
      compress: compressQuality,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    let imageInfo = await FileSystem.getInfoAsync(compressedImage.uri);
    while (imageInfo.size > targetSize && compressQuality > 0.1) {
      compressQuality -= 0.1;
      compressedImage = await ImageManipulator.manipulateAsync(uri, [], {
        compress: compressQuality,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      imageInfo = await FileSystem.getInfoAsync(compressedImage.uri);
    }
    return compressedImage;
  };

  const handleCameraCapture = async () => {
    closePickerModal();
    setLoading(true);
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.granted) {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          const compressedImage = await compressImage(result.assets[0].uri);
          onFileChange({
            uri: compressedImage.uri,
            name: result.assets[0].fileName || "captured_image.jpg",
            mimeType: result.assets[0].mimeType || "image/jpeg",
          });
        }
      } else {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to capture photos"
        );
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
    setLoading(false);
  };

  const handleFileSelect = async () => {
    closePickerModal();
    setLoading(true);
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const fileUri = result.assets[0].uri;
        const fileName = result.assets[0].name;
        const mimeType = result.assets[0].mimeType || "image/jpeg";
        let compressedImageUri = fileUri;
        if (mimeType.startsWith("image/")) {
          const compressedImage = await compressImage(fileUri);
          compressedImageUri = compressedImage.uri || compressedImage;
        }
        onFileChange({
          uri: compressedImageUri,
          name: fileName,
          mimeType,
        });
      }
    } catch (error) {
      console.error("Error while picking file or compressing:", error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.inputGroup} pointerEvents="auto">
      <Text style={styles.label}>{label}</Text>
      {fileUri ? (
        <View style={styles.filePreview}>
          <View style={styles.fileInfo}>
            <Text numberOfLines={1} style={styles.fileNameText}>
              {fileName}
            </Text>
            {!isEditMode && (
              <TouchableOpacity
                onPress={onRemove}
                style={styles.clearButton}
                disabled={isLoading}
                pointerEvents="none"
              >
                <Feather name="x-circle" size={20} color="#FF6B6B" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={() => setImagePreview(true)}>
            <Image
              source={{ uri: fileUri }}
              style={styles.imagePreview}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noAttachmentText}>
          {isEditMode && hadAttachment ? "No Image found" : "No image attached"}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.uploadButton, (isLoading || loading) && styles.disabledButton]}
        onPress={openPickerModal}
        disabled={isLoading || loading}
      >
        <Feather name="upload" size={20} color="#FF6B6B" />
        <Text style={styles.uploadButtonText}>Upload Image</Text>
      </TouchableOpacity>

      {/* Picker Modal */}
      <Modal
        visible={pickerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePickerModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, width: 280 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select Image Source</Text>
            <TouchableOpacity style={{ marginBottom: 16 }} onPress={handleCameraCapture}>
              <Text style={{ fontSize: 16 }}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginBottom: 16 }} onPress={handleFileSelect}>
              <Text style={{ fontSize: 16 }}>Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closePickerModal}>
              <Text style={{ fontSize: 16, color: '#FF6B6B' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ImagePreviewModal ImagePreviewModal={imagePreview} previewImage={fileUri} setImagePreview={setImagePreview} />
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  filePreview: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fileNameText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginLeft: 5,
  },
  imagePreview: {
    width: 120,
    height: 120,
    marginTop: 5,
    borderRadius: 8,
    alignSelf: "center",
  },
  noAttachmentText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  uploadButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    opacity: 0.7,
  },
});

export default FilePicker;
