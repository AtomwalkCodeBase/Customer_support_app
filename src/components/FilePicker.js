import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

const FilePicker = ({
  label,
  fileUri,
  fileName,
  onPick,
  onRemove,
  isLoading,
  hadAttachment,
  isEditMode,
}) => {
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
          <Image
            source={{ uri: fileUri }}
            style={styles.imagePreview}
            pointerEvents="none"
          />
        </View>
      ) : (
        <Text style={styles.noAttachmentText}>
          {isEditMode && hadAttachment ? "Image cleared" : "No image attached"}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.uploadButton, isLoading && styles.disabledButton]}
        onPress={onPick}
        disabled={isLoading}
      >
        <Feather name="upload" size={20} color="#FF6B6B" />
        <Text style={styles.uploadButtonText}>Upload Image</Text>
      </TouchableOpacity>
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
