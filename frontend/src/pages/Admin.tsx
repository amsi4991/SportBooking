import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getAdminStats, getAdminBookings, deleteAdminBooking } from '../services/admin';

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

interface Stats {
  totalBookings: number;
  revenue: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      const [statsData, bookingsData] = await Promise.all([
        getAdminStats(),
        getAdminBookings()
      ]);
      setStats(statsData);
      setBookings(bookingsData);
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
      </div>
    </div>
  );
}
