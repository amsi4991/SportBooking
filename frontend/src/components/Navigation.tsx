import { useAuth } from '../context/AuthContext';
import { ArrowLeftOnRectangleIcon, WalletIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function decodeToken(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export default function Navigation() {
  const { logout, walletBalance, refreshWallet } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Carica il wallet
    refreshWallet();

    // Check if user is admin by decoding JWT
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'EXISTS' : 'MISSING');
    
    if (token) {
      const payload = decodeToken(token);
      console.log('Full Token payload:', payload);
      console.log('Role from payload:', payload?.role);
      console.log('Is Admin?', payload?.role === 'admin');
      setIsAdmin(payload?.role === 'admin');
    } else {
      console.log('No token found in localStorage');
    }

    // Ascolta evento di aggiornamento wallet
    const handleWalletUpdate = () => {
      refreshWallet();
    };

    window.addEventListener('walletUpdated', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdated', handleWalletUpdate);
  }, [refreshWallet]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-blue-600">⚽</div>
            <h1 className="text-xl font-bold text-gray-900">SportBook</h1>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/courts" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Campi
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Profilo
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors">
                <SparklesIcon className="h-5 w-5" />
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {walletBalance !== null && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <WalletIcon className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">€ {(walletBalance / 100).toFixed(2)}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Esci</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
