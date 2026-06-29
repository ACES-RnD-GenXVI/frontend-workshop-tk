import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SuccessPage from "./pages/SuccessPage";
import ProtectedRoute from "./components/ProtectedRoute";

const DEFAULT_USERS = [
  {
    name: "Admin",
    email: "admin@tekkom.com",
    password: "123",
    cardUID: "A4-B2-F9-1C",
  },
];

const AppRoutes = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const existing = localStorage.getItem("users");
    if (!existing) {
      localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to="/success" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/success" replace />
          ) : (
            <LoginPage
              onNavigateToRegister={() => navigate("/register")}
              onLoginSuccess={() => navigate("/success")}
            />
          )
        }
      />
      <Route
        path="/register"
        element={
          currentUser ? (
            <Navigate to="/success" replace />
          ) : (
            <RegisterPage
              onNavigateToLogin={() => navigate("/login")}
            />
          )
        }
      />
      <Route
        path="/success"
        element={
          <ProtectedRoute>
            <SuccessPage
              onLogout={() => navigate("/login")}
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;