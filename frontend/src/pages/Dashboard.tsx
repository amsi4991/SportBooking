import BookingCalendar from '../components/BookingCalendar';
import Navigation from '../components/Navigation';
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface Court {
  id: string;
  name: string;
  city: string;
  sport: string;
}

export default function Dashboard() {
  const [selectedCourtId, setSelectedCourtId] = useState<string>('550e8400-e29b-41d4-a716-446655440000');
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  useEffect(() => {
    const court = courts.find(c => c.id === selectedCourtId);
    setSelectedCourt(court || null);
  }, [selectedCourtId, courts]);

  async function loadCourts() {
    try {
      const res = await fetch('http://localhost:3000/courts');
      const data = await res.json();
      setCourts(data);
      if (data.length > 0 && !selectedCourtId) {
        setSelectedCourtId(data[0].id);
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Calendario Prenotazioni</h2>
          <p className="text-gray-600">Seleziona uno slot per prenotare il tuo campo sportivo</p>
        </div>

        {/* Court Selector */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Seleziona campo</label>
          <select 
            value={selectedCourtId} 
            onChange={(e) => setSelectedCourtId(e.target.value)}
            className="input-field w-full md:w-96"
          >
            {courts.map(court => (
              <option key={court.id} value={court.id}>
                {court.name} - {court.sport} ({court.city})
              </option>
            ))}
          </select>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card flex items-center gap-4">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Disponibilità</p>
              <p className="text-lg font-semibold text-gray-900">7 giorni a settimana</p>
            </div>
          </div>

          <div className="card flex items-center gap-4">
            <ClockIcon className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Orari</p>
              <p className="text-lg font-semibold text-gray-900">06:00 - 22:00</p>
            </div>
          </div>

          <div className="card flex items-center gap-4">
            <MapPinIcon className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Campo</p>
              <p className="text-lg font-semibold text-gray-900">{selectedCourt?.name || '—'}</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="card">
          <BookingCalendar courtId={selectedCourtId} key={selectedCourtId} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
