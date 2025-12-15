// App.jsx
import React, { useState, useEffect } from "react";
import "./index.css";

import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";

import Header from "./components/StudentComponents/Header";
import WelcomePage from "./pages/StudentPages/WelcomePage";
import Login from "./pages/StudentPages/login";
import SignUp from "./pages/StudentPages/SignUp";
import Dashboard from "./pages/StudentPages/Dashboard";
import ProfilePage from "./components/StudentComponents/ProfilePage";
import ForgotPassword from "./pages/StudentPages/ForgotPassword";
import ResetPassword from "./pages/StudentPages/ResetPassword";
import AboutMePage from "./pages/StudentPages/AboutMePage";
import LessonsPage from "./pages/StudentPages/learningPage";
import LessonList from "./pages/StudentPages/LessonList";
import LevelSelector from "./components/StudentComponents/LevelSelector";
import LessonViewer2 from "./pages/StudentPages/LessonViewer2";
import DynamicLessonViewer from "./pages/StudentPages/DynamicLessonViewer";
import LessonViewer3 from "./pages/StudentPages/LessonViewer3";
import LessonViewer4 from "./pages/StudentPages/LessonViewer4";
import LessonViewer5 from "./pages/StudentPages/LessonViewer5";
import LessonViewer6 from "./pages/StudentPages/LessonViewer6";
import LessonViewer7 from "./pages/StudentPages/LessonViewer7";
import LessonViewer8 from "./pages/StudentPages/LessonViewer8";
import LessonViewer9 from "./pages/StudentPages/LessonViewer9";
import LessonViewer10 from "./pages/StudentPages/LessonViewer10";
import LessonViewer11 from "./pages/StudentPages/LessonViewer11";
import LessonViewer12 from "./pages/StudentPages/LessonViewer12";
import LessonViewer13 from "./pages/StudentPages/LessonViewer13";
import LessonViewer14 from "./pages/StudentPages/LessonViewer14";
import LessonViewer15 from "./pages/StudentPages/LessonViewer15";
import MyTasksPage from "./pages/StudentPages/MyTasksPage";
import HtmlPlayground from "./components/StudentComponents/HtmlPlayground";
import CSSPlatform from "./components/StudentComponents/CSSPlatform";

import Quiz from "./pages/StudentPages/Quiz";
import QuizMap from "./pages/StudentPages/QuizMap";
import { QuizLevelRoute } from "./pages/StudentPages/QuizLevel";
import "./quiz-theme.css";

import BuildProjectPage from "./pages/StudentPages/BuildProjectPage";
import ProjectHub from "./pages/StudentPages/ProjectHub";
import ProjectDetails from "./pages/StudentPages/ProjectDetails";
import AddProject from "./pages/StudentPages/AddProject";
import EditProject from "./pages/StudentPages/EditProject";

import Navbar from "./layout/Navbar";
import ChallengesList from "./pages/StudentPages/ChallengesList";
import ChallengeDetails from "./pages/StudentPages/ChallengeDetails";
import SubmitChallenge from "./pages/StudentPages/SubmitChallenge";
import Leaderboard from "./pages/StudentPages/Leaderboard";
import MySubmissions from "./pages/StudentPages/MySubmissions";
import CertificatePage from "./pages/StudentPages/CertificatePage";
import StudentContactSupervisor from "./pages/StudentPages/StudentContactSupervisor";

import ChatPage from "./pages/StudentPages/ChatPage";

import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import ViewSubmission from "./pages/supervisor/ViewSubmission";
import SupervisorLayout from "./pages/supervisor/SupervisorLayout";
import SupervisorMessages from "./pages/supervisor/SupervisorMessages";
import EvaluateStudents from "./pages/supervisor/EvaluateStudents";
import SupervisorSessions from "./pages/supervisor/SupervisorSessions";

import AdminRoute from "./admin-front/src/AdminRoute.jsx";
import AdminLayout from "./admin-front/src/AdminLayout.jsx";
import AdminDashboard from "./admin-front/src/AdminDashboard.jsx";
import AdminUsers from "./admin-front/src/AdminUsers.jsx";
import AdminLessons from "./admin-front/src/AdminLessons.jsx";
import AdminCssLessons from "./admin-front/src/AdminCssLessons.jsx";
import AdminQuizzes from "./admin-front/src/AdminQuizzes.jsx";
import AdminCommentsPage from "./admin-front/src/AdminCommentsPage.jsx";
import AdminSettingsPage from "./admin-front/src/AdminSettingsPage.jsx";
import AdminChatPage from "./admin-front/src/AdminChatPage.jsx";
import AdminProjects from "./admin-front/src/AdminProjects.jsx";
import AdminProjectDetails from "./admin-front/src/AdminProjectDetails.jsx";

import AdminAnalytics from "./admin-front/src/AdminAnalytics.jsx";
import AdminStudentAnalytics from "./admin-front/src/AdminStudentAnalytics.jsx";

import EvaluateSupervisor from "./pages/StudentPages/EvaluateSupervisor";
import MySupervisorSessions from "./pages/StudentPages/MySupervisorSessions";

import { requestPermission } from "./requestPermission";

function ArenaLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const onSuper = location.pathname.startsWith("/supervisor");
  const onAdmin = location.pathname.startsWith("/admin");

  const hideHeader =
    onSuper ||
    onAdmin ||
    ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/supervisor-dashboard"].includes(
      location.pathname
    );

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <>
      {!hideHeader && (
        <Header
          profileImage={currentUser?.profile_image || "/user-avatar.jpg"}
          onProfileClick={() => navigate("/profile")}
        />
      )}

      <Routes>
        <Route path="/" element={<WelcomePage />} />

        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
        <Route
          path="/profile"
          element={<ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} />}
        />
        <Route path="/profile/about-me" element={<AboutMePage />} />

        <Route path="/chat" element={<ChatPage />} />

        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/learning" element={<LessonList />} />
        <Route path="/editor" element={<HtmlPlayground />} />

        <Route
          path="/level-selector"
          element={<LevelSelector hasCompletedBasic={true} userId={currentUser?.id} />}
        />

        <Route path="/lesson-viewer/:lessonId" element={<DynamicLessonViewer />} />
        <Route path="/lesson-viewer2" element={<LessonViewer2 />} />
        <Route path="/lesson-viewer/3" element={<LessonViewer3 />} />
        <Route path="/lesson-viewer/4" element={<LessonViewer4 />} />
        <Route path="/lesson-viewer/31" element={<LessonViewer5 />} />
        <Route path="/lesson-viewer/32" element={<LessonViewer6 />} />
        <Route path="/lesson-viewer/33" element={<LessonViewer7 />} />
        <Route path="/lesson-viewer/34" element={<LessonViewer8 />} />
        <Route path="/lesson-viewer/35" element={<LessonViewer9 />} />
        <Route path="/lesson-viewer/36" element={<LessonViewer10 />} />
        <Route path="/lesson-viewer/37" element={<LessonViewer11 />} />
        <Route path="/lesson-viewer/38" element={<LessonViewer12 />} />
        <Route path="/lesson-viewer/39" element={<LessonViewer13 />} />
        <Route path="/lesson-viewer/40" element={<LessonViewer14 />} />
        <Route path="/lesson-viewer/41" element={<LessonViewer15 />} />

        <Route path="/css-tutorial" element={<CSSPlatform />} />

        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz/map" element={<QuizMap />} />
        <Route path="/quiz/level/:levelId" element={<QuizLevelRoute />} />

        <Route path="/certificate/:topic" element={<CertificatePage />} />

        <Route path="/project" element={<BuildProjectPage />} />
        <Route path="/project-hub" element={<ProjectHub />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/edit-project/:id" element={<EditProject />} />

        <Route path="/contact" element={<StudentContactSupervisor />} />
        <Route path="/my-tasks" element={<MyTasksPage />} />

        <Route path="/student/evaluate-supervisor" element={<EvaluateSupervisor />} />
        <Route path="/student/sessions" element={<MySupervisorSessions />} />

        <Route element={<ArenaLayout />}>
          <Route path="/challenges" element={<ChallengesList />} />
          <Route path="/challenge/:id" element={<ChallengeDetails />} />
          <Route path="/challenge/:id/submit" element={<SubmitChallenge />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/my-submissions" element={<MySubmissions />} />
        </Route>

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="css-lessons" element={<AdminCssLessons />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="comments" element={<AdminCommentsPage />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/:id" element={<AdminProjectDetails />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="chat" element={<AdminChatPage />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="analytics/:userId" element={<AdminStudentAnalytics />} />
        </Route>

        <Route element={<SupervisorLayout />}>
          <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor/messages" element={<SupervisorMessages />} />
          <Route path="/supervisor/submission/:id" element={<ViewSubmission />} />
          <Route path="/supervisor/evaluate-students" element={<EvaluateStudents />} />
          <Route path="/supervisor/sessions" element={<SupervisorSessions />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
