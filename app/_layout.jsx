import { Stack } from "expo-router";
import {AppProvider} from '../context/AppContext'
import { TaskProvider } from "../context/TaskContext";
import { BackHandler, Platform, StatusBar, StyleSheet, View } from "react-native";
import { colors } from "../src/Styles/appStyle";

if (BackHandler && typeof BackHandler.removeEventListener !== 'function') {
  BackHandler.removeEventListener = () => {};
}

const StatusBarBackground = () => (
  <View style={styles.statusBarBackground} />
);

export default function RootLayout() {
  return (
    <AppProvider>
    <TaskProvider>
      <StatusBarBackground />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
    <Stack>
      <Stack.Screen name="index"/>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      <Stack.Screen name="AuthScreen/index" options={{headerShown:false}}/> 
      <Stack.Screen name="PinScreen/index" options={{headerShown:false}}/> 
      <Stack.Screen name="ResetPassword/index" options={{headerShown:false}}/>
      <Stack.Screen name="TicketDetailScreen/index" options={{headerShown:false}}/>
      <Stack.Screen name="ForgetPin/index" options={{headerShown:false}}/>
    </Stack>
    </TaskProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  statusBarBackground: {
    height: Platform.OS === "android" ? StatusBar.currentHeight : 44, // 44 for iOS notch
    backgroundColor: colors.primary,
  },
});
