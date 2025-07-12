import React from "react";
import { View } from "react-native";
import TicketCard from "./TicketCard";
import EmptyState from "./EmptyState";

const TicketList = ({ tickets, onView, onEdit, onCreate }) => {
  if (!tickets.length) {
    return <EmptyState hasFilters onCreatePress={onCreate} />;
  }
  return (
    <View style={{ gap: 1 }}>
      {tickets.map((ticket, index) => (
        <View key={ticket.id} style={index > 0 && { marginTop: 16 }}>
          <TicketCard ticket={ticket} onPress={() => onView(ticket)} onEdit={onEdit} />
        </View>
      ))}
    </View>
  );
};

export default TicketList; 