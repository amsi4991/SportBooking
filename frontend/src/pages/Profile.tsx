import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { UserIcon, CalendarIcon, TrashIcon, ArrowUpRightIcon, ArrowDownLeftIcon } from '@heroicons/react/24/outline';
import { deleteBooking } from '../services/booking';
import { getTransactions } from '../services/wallet';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  wallet: { balance: number };
}

interface Booking {
  id: string;
  court: { name: string; city: string };
  startsAt: string;
  endsAt: string;
  status: string;
  totalPrice: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadBookings();
    loadTransactions();
  }, []);

  async function loadProfile() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        city: data.city || ''
      });
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadBookings() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/profile/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  async function loadTransactions() {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Errore nel caricamento transazioni:', error);
    }
  }

  async function handleDeleteBooking(bookingId: string) {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione? Il credito sarà rimborsato.')) {
      return;
    }

    try {
      await deleteBooking(bookingId);
      setMessage({ type: 'success', text: '✅ Prenotazione eliminata e credito rimborsato!' });
      loadBookings();
      loadProfile();
      loadTransactions();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  async function handleSaveProfile() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Errore nel salvataggio');

      setMessage({ type: 'success', text: '✅ Profilo aggiornato!' });
      setIsEditing(false);
      loadProfile();
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="text-center py-12">Profilo non trovato</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Il mio profilo</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <UserIcon className="h-6 w-6 text-blue-600" />
              Dati personali
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-primary"
            >
              {isEditing ? 'Annulla' : 'Modifica'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={profile.email} disabled className="input-field w-full bg-gray-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <button onClick={handleSaveProfile} className="btn-primary w-full">
                Salva modifiche
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{profile.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.firstName || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cognome</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.lastName || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Telefono</p>
                <p className="text-lg font-semibold text-gray-900">{profile.phone || '—'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Città</p>
                <p className="text-lg font-semibold text-gray-900">{profile.city || '—'}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Saldo portafoglio</p>
                <p className="text-2xl font-bold text-blue-600">€{(profile.wallet.balance / 100).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            Le mie prenotazioni
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">Nessuna prenotazione</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const start = new Date(booking.startsAt);
                const end = new Date(booking.endsAt);
                const isUpcoming = start > new Date();

                return (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-sm text-gray-600">Campo</p>
                        <p className="font-semibold text-gray-900">{booking.court.name}</p>
                        <p className="text-sm text-gray-600">{booking.court.city}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Data</p>
                        <p className="font-semibold text-gray-900">{start.toLocaleDateString('it-IT')}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Orari</p>
                        <p className="font-semibold text-gray-900">
                          {start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Prezzo</p>
                          <p className="font-semibold text-gray-900">€{(booking.totalPrice / 100).toFixed(2)}</p>
                          <p className={`text-xs font-semibold mt-1 ${booking.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
                            {booking.status}
                          </p>
                        </div>
                        {isUpcoming && (
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="mt-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 w-fit"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Elimina
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cronologia transazioni</h2>

          {transactions.length === 0 ? (
            <p className="text-gray-500">Nessuna transazione</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const date = new Date(tx.createdAt);
                const isDeposit = tx.type === 'deposit' || tx.type === 'refund';
                const icon = isDeposit ? ArrowDownLeftIcon : ArrowUpRightIcon;
                const Icon = icon;

                return (
                  <div key={tx.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isDeposit ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Icon className={`h-5 w-5 ${isDeposit ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.description}</p>
                        <p className="text-sm text-gray-600">{date.toLocaleDateString('it-IT')} {date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
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
      </div>
    </div>
  );
}
