import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Upload, FileText, Volume2, History, Info, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard/upload', icon: Upload, label: 'Upload' },
    { path: '/dashboard/process', icon: FileText, label: 'Process' },
    { path: '/dashboard/audio', icon: Volume2, label: 'Audio' },
    { path: '/dashboard/history', icon: History, label: 'History' },
    { path: '/dashboard/about', icon: Info, label: 'About' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-gradient-to-b from-amber-50 to-orange-50 h-screen flex flex-col shadow-lg">
      <div className="p-6 border-b border-amber-200">
        <h1 className="text-xl font-bold text-amber-900">Heritage Translator</h1>
        <p className="text-sm text-amber-700 mt-1">{user?.email}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              isActive(item.path)
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-amber-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-amber-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
