import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/Home";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { Dashboard } from "./components/Dashboard";
import { ChessBoardComponent } from "./components/ChessBoard";
import type { User } from "./api/auth";

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const savedToken = localStorage.getItem("chess_token");
    const savedUser = localStorage.getItem("chess_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem("chess_token");
        localStorage.removeItem("chess_user");
      }
    }
  }, []);

  const handleAuthSuccess = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("chess_token", authToken);
    localStorage.setItem("chess_user", JSON.stringify(userData));
  };

  const handleSignOut = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("chess_token");
    localStorage.removeItem("chess_user");
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
                <Dashboard
                  user={user}
                  token={token}
                  onSignOut={handleSignOut}
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          <Route path="/game" element={<ChessBoardComponent />} />
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
