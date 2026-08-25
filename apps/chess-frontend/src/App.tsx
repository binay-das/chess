import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { Home } from "./components/Home";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { DashboardPage } from "./pages/DashboardPage";

import type { User } from "./api/auth";
import { useAuthStore } from "./store/AuthStore";

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || "",
  );

  useEffect(() => {
    if (token && user) {
      useAuthStore.getState().setAuth(user as any, token);
    }
  }, [token, user]);

  const handleAuthSuccess = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);

    useAuthStore.getState().setAuth(userData as any, authToken);

    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleSignOut = () => {
    setUser(null);
    setToken("");

    useAuthStore.getState().logout();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <div className="min-h-screen bg-[#0c0c0b] font-sans text-[#f5f2eb] antialiased">
      <Navbar user={user} onSignOut={handleSignOut} />

      <Routes>
        <Route path="/" element={<Home user={user} />} />

        <Route
          path="/signin"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignInPage onSuccess={handleAuthSuccess} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignUpPage onSuccess={handleAuthSuccess} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? <DashboardPage /> : <Navigate to="/signin" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;