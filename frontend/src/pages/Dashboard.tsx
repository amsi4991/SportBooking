import BookingCalendar from '../components/BookingCalendar';
import Navigation from '../components/Navigation';
import { CalendarIcon, MapPinIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface Court {
  id: string;
  name: string;
  city: string;
  sport: string;
}

export default function Dashboard() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');

  useEffect(() => {
    // Verifica se l'utente è admin
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === 'admin');
      } catch (e) {
        console.error('Errore decodifica token:', e);
      }
    }

    loadCourts();
  }, []);

  async function loadCourts() {
    try {
      const res = await fetch('http://localhost:3000/courts');
      const data = await res.json();
      setCourts(data);
      if (data.length > 0) {
        setSelectedCourtId(data[0].id);
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  const selectedCourt = courts.find(c => c.id === selectedCourtId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Calendario Prenotazioni
            </h1>
          </div>
          <p className="text-gray-600">Visualizza e prenota i tuoi slot preferiti</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border-l-4 border-blue-600 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Disponibilità</p>
                <p className="text-lg font-semibold text-gray-900">7 giorni a settimana</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border-l-4 border-green-600 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Orari</p>
                <p className="text-lg font-semibold text-gray-900">06:00 - 22:00</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border-l-4 border-red-600 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Campi disponibili</p>
                <p className="text-lg font-semibold text-gray-900">{courts.length} campi</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Court Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* View Mode */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-3">Modalità visualizzazione</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('all')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    viewMode === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 Tutti i campi
                </button>
                <button
                  onClick={() => setViewMode('single')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    viewMode === 'single'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔍 Campo singolo
                </button>
              </div>
            </div>

            {/* Court Selector - Only show in single mode */}
            {viewMode === 'single' && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">Seleziona campo</label>
                <select 
                  value={selectedCourtId} 
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {courts.map(court => (
                    <option key={court.id} value={court.id}>
                      {court.name} - {court.sport} ({court.city})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden">
          {viewMode === 'all' ? (
            <BookingCalendar 
              courtIds={courts.map(c => c.id)} 
              isAdmin={isAdmin} 
              showAllCourts={true}
              courts={courts}
            />
          ) : (
            <BookingCalendar courtId={selectedCourtId} isAdmin={isAdmin} />
          )}
        </div>
      </div>
    </div>
  );
}
