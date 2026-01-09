
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const updateWalletBalance = useCallback((newBalance: number) => {
    setWalletBalance(newBalance);
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/wallet', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Errore refresh wallet:', error);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, login, logout, walletBalance, updateWalletBalance, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
