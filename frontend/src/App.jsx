import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import AddCandidate from "./pages/AddCandidate";
import Shortlist from "./pages/Shortlist";
import AIShortlist from "./pages/AIShortlist";
import SavedShortlists from "./pages/SavedShortlists";
import Navbar from "./components/Navbar";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
        <Route path="/candidates/add" element={<ProtectedRoute><AddCandidate /></ProtectedRoute>} />
        <Route path="/shortlist" element={<ProtectedRoute><Shortlist /></ProtectedRoute>} />
        <Route path="/ai-shortlist" element={<ProtectedRoute><AIShortlist /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedShortlists /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid #475569"
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#1e293b" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#1e293b" } }
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
