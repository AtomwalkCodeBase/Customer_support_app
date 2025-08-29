import { Stack } from "expo-router";
import {AppProvider} from '../context/AppContext'
import { TaskProvider } from "../context/TaskContext";
import { BackHandler, StatusBar, View } from "react-native";
import { colors } from "../src/Styles/appStyle";

if (BackHandler && typeof BackHandler.removeEventListener !== 'function') {
  BackHandler.removeEventListener = () => {};
}

export default function RootLayout() {
  return (
    <AppProvider>
    <TaskProvider>
      <StatusBar barStyle="light-content" />
      <View style={styles.statusBarBackground} />
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

const styles = {
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StatusBar.currentHeight,
    backgroundColor: colors.primary, // Your status bar color
    zIndex: 999,
  }
};
