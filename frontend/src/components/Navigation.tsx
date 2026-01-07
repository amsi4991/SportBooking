import { useAuth } from '../context/AuthContext';
import { ArrowLeftOnRectangleIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const { logout } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    // Fetch wallet balance
    fetch('http://localhost:3000/wallet', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setWalletBalance(data.balance))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-blue-600">⚽</div>
          <h1 className="text-xl font-bold text-gray-900">SportBook</h1>
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
