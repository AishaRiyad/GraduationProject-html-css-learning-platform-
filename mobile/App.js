import 'react-native-gesture-handler';

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import "./src/i18n";
import { LanguageProvider } from "./context/LanguageProvider";
import * as Notifications from "expo-notifications";
import { requestPermissionsAsync, sendLocalNotification } from "./services/notifications";
import React, { useEffect } from "react";
import { View, Button } from "react-native";




import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import DashboardScreen from "./pages/DashboardScreen";
import ProfilePage from "./components/ProfilePage";
import LevelSelector from "./pages/LevelSelector";
import LessonListScreen from "./pages/LessonListScreen";
import LessonViewer from "./pages/LessonViewer";
import LessonViewer2 from "./pages/LessonViewer2";
import LessonViewer3 from "./pages/LessonViewer3";
import LessonViewer4 from "./pages/LessonViewer4";
import LessonViewer5 from "./pages/LessonViewer5";
import LessonViewer6 from "./pages/LessonViewer6";
import LessonViewer7 from "./pages/LessonViewer7";
import LessonViewer8 from "./pages/LessonViewer8";
import LessonViewer9 from "./pages/LessonViewer9";
import LessonViewer10 from "./pages/LessonViewer10";
import LessonViewer11 from "./pages/LessonViewer11";
import LessonViewer12 from "./pages/LessonViewer12";
import LessonViewer13 from "./pages/LessonViewer13";
import LessonViewer14 from "./pages/LessonViewer14";
import LessonViewer15 from "./pages/LessonViewer15";
import CSSLessonsListMobile from "./pages/CSSLessonsListMobile";
import CSSLessonViewerMobile from "./pages/CSSLessonViewerMobile";
import BuildProjectScreen from "./pages/BuildProjectScreen";
import FilePreviewScreen from "./pages/FilePreviewScreen";
import ProjectHubScreen from "./pages/ProjectHubScreen";
import ChallengesListScreen from "./pages/ChallengesListScreen";
import SubmitChallengeScreen from "./pages/SubmitChallengeScreen";
import ChallengeDetailsScreen from "./pages/ChallengeDetailsScreen";
import ProfilePageMobile from "./pages/ProfilePageMobile";
import HTMLPlaygroundMobile from "./pages/HTMLPlaygroundMobile";
//import LessonListScreen from "./pages/LessonListScreen";
import AdvancedQuiz from "./pages/AdvancedQuiz";
import WelcomeMobile from "./pages/WelcomeMobile";

import CertificatePageMobile from "./components/CertificatePageMobile";
import ProjectDetailsScreen from "./components/ProjectDetailsScreen";
import MyTasksScreen from "./components/MyTasksScreen";
import ContactScreenMobile from "./components/ContactScreenMobile";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import ViewSubmissionMobile from "./pages/ViewSubmissionMobile";
import NotificationsScreen from "./pages/NotificationsScreen";
const Stack = createStackNavigator();

export default function App() {
   useEffect(() => {
    async function prepare() {
      const granted = await requestPermissionsAsync();
      console.log("Notification permission:", granted);
    }
    prepare();
  }, []);
  return (
    
      <LanguageProvider>
    <NavigationContainer>
        
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WelcomeMobile" component={WelcomeMobile} />

        {/* Screens without header */}
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Main screens */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        <Stack.Screen name="LevelSelector" component={LevelSelector} />
<Stack.Screen name="LessonList" component={LessonListScreen} />
<Stack.Screen name="LessonViewer" component={LessonViewer} />
<Stack.Screen name="LessonViewer2" component={LessonViewer2} />
<Stack.Screen name="LessonViewer3" component={LessonViewer3} />
<Stack.Screen name="LessonViewer4" component={LessonViewer4} />
<Stack.Screen name="LessonViewer5" component={LessonViewer5} />
<Stack.Screen name="LessonViewer6" component={LessonViewer6} />
<Stack.Screen name="LessonViewer7" component={LessonViewer7} />
<Stack.Screen name="LessonViewer8" component={LessonViewer8} />
<Stack.Screen name="LessonViewer9" component={LessonViewer9} />
<Stack.Screen name="LessonViewer10" component={LessonViewer10} />
<Stack.Screen name="LessonViewer11" component={LessonViewer11} />
<Stack.Screen name="LessonViewer12" component={LessonViewer12} />
<Stack.Screen name="LessonViewer13" component={LessonViewer13} />
<Stack.Screen name="LessonViewer14" component={LessonViewer14} />
<Stack.Screen name="LessonViewer15" component={LessonViewer15} />

 <Stack.Screen name="CSSLessonsList" component={CSSLessonsListMobile} />
        <Stack.Screen name="CSSLessonViewer" component={CSSLessonViewerMobile} />
        <Stack.Screen name="AdvancedQuiz" component={AdvancedQuiz} />
        <Stack.Screen name="BuildProject" component={BuildProjectScreen} />
<Stack.Screen name="FilePreview" component={FilePreviewScreen} />
<Stack.Screen name="ProjectHub" component={ProjectHubScreen} />
<Stack.Screen name="ChallengesList" component={ChallengesListScreen} />
<Stack.Screen name="SubmitChallenge" component={SubmitChallengeScreen} />
<Stack.Screen name="ChallengeDetails" component={ChallengeDetailsScreen} />
 <Stack.Screen name="ProfileMobile" component={ProfilePageMobile} />
 <Stack.Screen name="HTMLPlayground" component={HTMLPlaygroundMobile} />

<Stack.Screen
  name="CertificatePageMobile"
  component={CertificatePageMobile}
/>
<Stack.Screen
  name="ProjectDetails"
  component={ProjectDetailsScreen}
/>
<Stack.Screen
  name="MyTasks"
  component={MyTasksScreen}
  options={{ title: "My Tasks" }}
/>
<Stack.Screen 
  name="SupervisorDashboard" 
  component={SupervisorDashboard} 
  options={{ headerShown: false }}
/>
<Stack.Screen name="SubmissionDetails" component={ViewSubmissionMobile} />

<Stack.Screen name="Contact" component={ContactScreenMobile} />
<Stack.Screen
  name="Notifications"
  component={NotificationsScreen}
  options={{ headerShown: false }}
/>



      </Stack.Navigator>
    </NavigationContainer>
    </LanguageProvider>
  );
}
