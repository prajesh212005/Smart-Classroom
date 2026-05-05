import Dashboard from "./pages/Dashboard"
import Landing from "./pages/Landing"
import LoginPage from "./pages/Login"
import SignupPage from "./pages/Signup"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import CoursesPage from "./pages/Courses"
import RoomPage from "./pages/Rooms"
import TimetablePage from "./pages/Timetable"
import NotificationsPage from "./pages/Notifications"
import ClassroomsPage from "./pages/Classrooms"
function App() {
 

  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classrooms"
          element={
            <ProtectedRoute>
              <ClassroomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetables"
          element={
            <ProtectedRoute>
              <TimetablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    
  )
}

export default App
