import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/Home";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ChessBoardComponent } from "./components/ChessBoard";
import type { User } from "./api/auth";
import { DashboardPage } from "./pages/DashboardPage";
import { useAuthStore } from "./store/AuthStore";

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem("token") || "";
  });

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
    <div className="flex min-h-screen flex-col bg-white text-slate-900 font-sans antialiased">
      <Navbar user={user} onSignOut={handleSignOut} />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route
            path="/signin"
            element={<SignInPage onSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/signup"
            element={<SignUpPage onSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <DashboardPage />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        {new Date().getFullYear()} ChessArena
      </footer>
    </div>
  );
}

export default App;
