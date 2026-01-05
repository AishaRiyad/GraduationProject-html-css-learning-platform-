import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AdminLayoutMobile from "./AdminLayoutMobile";

import AdminDashboardMobile from "./AdminDashboardMobile";
import AdminUsersScreen from "./AdminUsersScreen";
import AdminProjectsMobile from "./AdminProjectsMobile";
import AdminProjectDetailsMobile from "./AdminProjectDetailsMobile";
import AdminLessonsMobile from "./AdminLessonsMobile";
import AdminCssLessonsMobile from "./AdminCssLessonsMobile";
import AdminQuizzesMobile from "./AdminQuizzesMobile";
import AdminAnalyticsMobile from "./AdminAnalyticsMobile";
import AdminStudentAnalyticsScreen from "./AdminStudentAnalyticsScreen";
import AdminSettingsScreen from "./AdminSettingsScreen";
import AdminChatMobile from "./AdminChatMobile";
import AdminCommentsMobile from "./AdminCommentsMobile";

const AdminStack = createStackNavigator();

export default function AdminNavigator({ navigation }) {
  return (
    <AdminLayoutMobile navigation={navigation}>
      <AdminStack.Navigator screenOptions={{ headerShown: false }}>
        <AdminStack.Screen name="AdminDashboard" component={AdminDashboardMobile} />
        <AdminStack.Screen name="AdminUsers" component={AdminUsersScreen} />
        <AdminStack.Screen name="AdminProjects" component={AdminProjectsMobile} />
        <AdminStack.Screen name="AdminProjectDetails" component={AdminProjectDetailsMobile} />
        <AdminStack.Screen name="AdminLessons" component={AdminLessonsMobile} />
        <AdminStack.Screen name="AdminCssLessons" component={AdminCssLessonsMobile} />
        <AdminStack.Screen name="AdminQuizzes" component={AdminQuizzesMobile} />
        <AdminStack.Screen name="AdminAnalytics" component={AdminAnalyticsMobile} />
        <AdminStack.Screen name="AdminStudentAnalytics" component={AdminStudentAnalyticsScreen} />
        <AdminStack.Screen name="AdminSettings" component={AdminSettingsScreen} />
        <AdminStack.Screen name="AdminChat" component={AdminChatMobile} />
        <AdminStack.Screen name="AdminComments" component={AdminCommentsMobile} />
      </AdminStack.Navigator>
    </AdminLayoutMobile>
  );
}
