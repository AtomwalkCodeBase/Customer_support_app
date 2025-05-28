import { Stack } from "expo-router";
import {AppProvider} from '../context/AppContext'
import { TaskProvider } from "../context/TaskContext";

export default function RootLayout() {
  return (
    <AppProvider>
    <TaskProvider>
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
