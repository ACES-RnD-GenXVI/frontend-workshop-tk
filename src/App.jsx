// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
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
    setCurrentUser(user);
    navigate("/success");
  };

  // Fungsi callback saat logout agar state langsung dikosongkan
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
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
      `}</style>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;