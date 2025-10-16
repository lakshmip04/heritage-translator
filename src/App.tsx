import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { UploadPage } from './pages/UploadPage';
import { ProcessPage } from './pages/ProcessPage';
import { AudioPage } from './pages/AudioPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="/dashboard/upload" />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="process" element={<ProcessPage />} />
              <Route path="audio" element={<AudioPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
