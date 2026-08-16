// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SuccessPage from "./pages/SuccessPage";
import MentorPage from "./pages/MentorPage";
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
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => 
    JSON.parse(localStorage.getItem("currentUser"))
  );

  // Efek untuk memantau perubahan session setiap kali halaman berpindah
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);
  }, [location]);

  // Efek untuk inisialisasi default user
  useEffect(() => {
    const existing = localStorage.getItem("users");
    if (!existing) {
      localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  // Fungsi callback setelah login berhasil agar state langsung diperbarui secara instan
  const handleLoginSuccess = () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    localStorage.removeItem("redirectedOnce");
    setCurrentUser(user);
    navigate("/success");
  };

  // Fungsi callback saat logout agar state langsung dikosongkan
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("redirectedOnce");
    setCurrentUser(null);
    navigate("/login");
  };

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
              onNavigateToMentor={() => navigate("/mentor")}
              onLoginSuccess={handleLoginSuccess}
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
        path="/mentor"
        element={<MentorPage onBack={() => navigate("/login")} />}
      />
      <Route
        path="/success"
        element={
          <ProtectedRoute>
            <SuccessPage
              onLogout={handleLogout}
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
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -24px) scale(1.15); }
        }
        @keyframes fieldPulse {
          0%, 100% { opacity: 0.18; }
          50% { opacity: 0.05; }
        }
        @keyframes fieldDash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 56; }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.55); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes drawCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-12px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(430px) rotate(560deg); opacity: 0.7; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;