import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { FeedbackForm } from "./FeedbackForm";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

const FeedbackSection = ({ ticket, onSubmitFeedback }) => {
	const [feedbackVisible, setFeedbackVisible] = useState(false);
  
	if (ticket.task_status !== 'Completed') {
	  return null;
	}
  
	return (
	  <View style={styles.feedbackSection}>
		<TouchableOpacity
		  style={styles.feedbackButton}
		  onPress={() => setFeedbackVisible(true)}
		>
		  <Feather name="message-square" size={20} color="white" />
		  <Text style={styles.feedbackButtonText}>Provide Feedback</Text>
		</TouchableOpacity>
  
		<FeedbackForm
			ticket= {ticket}
		  visible={feedbackVisible}
		  onClose={() => setFeedbackVisible(false)}
		  onSubmit={(feedbackData) => {
			onSubmitFeedback(feedbackData);
			setFeedbackVisible(false);
		  }}
		/>
	  </View>
	);
  };

  const styles = StyleSheet.create({
	feedbackSection: {
	  marginBottom: 20,
	},
	feedbackButton: {
	  backgroundColor: '#FF6B6B',
	  flexDirection: 'row',
	  justifyContent: 'center',
	  alignItems: 'center',
	  paddingVertical: 12,
	  borderRadius: 8,
	},
	feedbackButtonText: {
	  color: 'white',
	  fontWeight: 'bold',
	  marginLeft: 8,
	}
  });

  export default FeedbackSection;