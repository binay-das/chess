import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/Home";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { Dashboard } from "./components/Dashboard";
import type { User } from "./api/auth";

export function App() {
  const [currentTab, setCurrentTab] = useState<"home" | "signin" | "signup" | "dashboard">("home");
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
    setCurrentTab("dashboard");
  };

  const handleSignOut = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("chess_token");
    localStorage.removeItem("chess_user");
    setCurrentTab("home");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 font-sans antialiased">
      <Navbar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {currentTab === "home" && (
          <Home onNavigate={setCurrentTab} user={user} />
        )}

        {currentTab === "signin" && (
          <SignIn
            onNavigate={setCurrentTab}
            onSuccess={handleAuthSuccess}
          />
        )}

        {currentTab === "signup" && (
          <SignUp
            onNavigate={setCurrentTab}
            onSuccess={handleAuthSuccess}
          />
        )}

        {currentTab === "dashboard" && user && (
          <Dashboard
            user={user}
            token={token}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        {new Date().getFullYear()} ChessArena • Built with Tailwind CSS & React
      </footer>
    </div>
  );
}

export default App;
