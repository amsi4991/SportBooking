import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { TrashIcon, SparklesIcon, ArrowUpRightIcon, ArrowDownLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { 
  getAdminStats, 
  getAdminBookings, 
  deleteAdminBooking, 
  getWalletTransactions,
  getAdminUsers,
  createUser,
  updateUserWallet
} from '../services/admin';

interface Booking {
  id: string;
  userId: string;
  courtId: string;
  startsAt: string;
  endsAt: string;
  totalPrice: number;
  paidWithWallet: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

interface Stats {
  totalBookings: number;
  revenue: number;
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form per creare nuovo utente
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  
  // Form per modificare wallet
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [walletForm, setWalletForm] = useState({ amount: 0, operation: 'add' as 'add' | 'subtract', description: '' });

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      const [statsData, bookingsData, transactionsData, usersData] = await Promise.all([
        getAdminStats(),
        getAdminBookings(),
        getWalletTransactions(),
        getAdminUsers()
      ]);
      setStats(statsData);
      setBookings(bookingsData);
      setTransactions(transactionsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Errore nel caricamento dati admin:', error);
      setMessage({ type: 'error', text: '❌ Errore nel caricamento dati' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBooking(bookingId: string) {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione? Il credito sarà rimborsato all\'utente.')) {
      return;
    }

    try {
      await deleteAdminBooking(bookingId);
      setMessage({ type: 'success', text: '✅ Prenotazione eliminata e credito rimborsato!' });
      loadAdminData();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  async function handleCreateUser() {
    if (!newUserForm.email || !newUserForm.password) {
      setMessage({ type: 'error', text: '❌ Email e password sono obbligatori' });
      return;
    }

    try {
      await createUser(newUserForm.email, newUserForm.password, newUserForm.firstName, newUserForm.lastName);
      setMessage({ type: 'success', text: '✅ Utente creato con successo!' });
      setShowCreateUserForm(false);
      setNewUserForm({ email: '', password: '', firstName: '', lastName: '' });
      loadAdminData();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  async function handleUpdateWallet() {
    if (!selectedUserId || !walletForm.amount) {
      setMessage({ type: 'error', text: '❌ Inserisci un importo valido' });
      return;
    }

    try {
      await updateUserWallet(selectedUserId, Math.round(walletForm.amount * 100), walletForm.operation, walletForm.description);
      setMessage({ type: 'success', text: '✅ Wallet aggiornato!' });
      setSelectedUserId(null);
      setWalletForm({ amount: 0, operation: 'add', description: '' });
      loadAdminData();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="text-center py-12">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <SparklesIcon className="h-8 w-8 text-purple-600" />
            Pannello Amministratore
          </h1>
          <p className="text-gray-600">Gestisci prenotazioni e visualizza statistiche</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Prenotazioni totali</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalBookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Ricavo totale</p>
              <p className="text-3xl font-bold text-green-600 mt-2">€{(stats.revenue / 100).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tutte le prenotazioni</h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">Nessuna prenotazione</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Utente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data inizio</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data fine</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Prezzo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pagato</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data creazione</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const start = new Date(booking.startsAt);
                    const end = new Date(booking.endsAt);
                    const created = new Date(booking.createdAt);

                    return (
                      <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-mono text-xs">{booking.userId.substring(0, 8)}...</td>
                        <td className="py-3 px-4 text-gray-700">
                          {start.toLocaleDateString('it-IT')} {start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {end.toLocaleDateString('it-IT')} {end.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-semibold">€{(booking.totalPrice / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${booking.paidWithWallet ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {booking.paidWithWallet ? 'Wallet' : 'Altro'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {created.toLocaleDateString('it-IT')}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Elimina
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Wallet Transactions */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cronologia transazioni portafoglio</h2>

          {transactions.length === 0 ? (
            <p className="text-gray-500">Nessuna transazione</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((tx) => {
                const date = new Date(tx.createdAt);
                const isDeposit = tx.type === 'deposit' || tx.type === 'refund';
                const icon = isDeposit ? ArrowDownLeftIcon : ArrowUpRightIcon;
                const Icon = icon;

                return (
                  <div key={tx.id} className="flex items-center justify-between border-b border-gray-200 pb-3 hover:bg-gray-50 px-3 py-2 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isDeposit ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Icon className={`h-5 w-5 ${isDeposit ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.description}</p>
                        <p className="text-sm text-gray-600">
                          {tx.user.email} • {date.toLocaleDateString('it-IT')} {date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold text-lg ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                      {isDeposit ? '+' : '-'}€{(tx.amount / 100).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gestione Utenti */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestione utenti</h2>
            <button
              onClick={() => setShowCreateUserForm(!showCreateUserForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition"
            >
              <PlusIcon className="h-5 w-5" />
              Nuovo utente
            </button>
          </div>

          {showCreateUserForm && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Crea nuovo utente</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Nome (opzionale)"
                  value={newUserForm.firstName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Cognome (opzionale)"
                  value={newUserForm.lastName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateUser}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition"
                  >
                    Crea
                  </button>
                  <button
                    onClick={() => setShowCreateUserForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-md font-medium transition"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ruolo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Wallet</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {selectedUserId === user.id ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Importo €"
                            value={walletForm.amount}
                            onChange={(e) => setWalletForm({ ...walletForm, amount: parseFloat(e.target.value) || 0 })}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <select
                            value={walletForm.operation}
                            onChange={(e) => setWalletForm({ ...walletForm, operation: e.target.value as 'add' | 'subtract' })}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm block"
                          >
                            <option value="add">Aggiungi</option>
                            <option value="subtract">Decurta</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Nota (opzionale)"
                            value={walletForm.description}
                            onChange={(e) => setWalletForm({ ...walletForm, description: e.target.value })}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={handleUpdateWallet}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium"
                            >
                              Salva
                            </button>
                            <button
                              onClick={() => setSelectedUserId(null)}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-2 py-1 rounded text-xs font-medium"
                            >
                              Annulla
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedUserId(user.id)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                          Modifica
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
