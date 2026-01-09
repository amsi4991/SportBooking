import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { ArrowLeftIcon, MapPinIcon, StarIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import BlockCourtModal from '../components/BlockCourtModal';
import { getBlocksByCourtId, CourtBlock } from '../services/court-blocks';

const DAYS_OF_WEEK = [
  { label: 'Lunedì', value: 0 },
  { label: 'Martedì', value: 1 },
  { label: 'Mercoledì', value: 2 },
  { label: 'Giovedì', value: 3 },
  { label: 'Venerdì', value: 4 },
  { label: 'Sabato', value: 5 },
  { label: 'Domenica', value: 6 }
];

interface PriceRule {
  id: string;
  price: number;
  weekdays: number[];
  startTime: string;
  endTime: string;
}

interface Court {
  id: string;
  name: string;
  city: string;
  sport: string;
  description: string;
  image: string;
  priceRules: PriceRule[];
}

interface Slot {
  start: string;
  end: string;
  available: boolean;
}

export default function CourtDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [court, setCourt] = useState<Court | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blocks, setBlocks] = useState<CourtBlock[]>([]);

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

    if (id) {
      loadCourt();
      loadBlocks();
    }
  }, [id]);

  useEffect(() => {
    if (id) loadSlots();
  }, [selectedDate, id]);

  async function loadCourt() {
    try {
      const res = await fetch(`http://localhost:3000/courts/${id}`);
      const data = await res.json();
      setCourt(data);
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  async function loadBlocks() {
    try {
      if (id) {
        const data = await getBlocksByCourtId(id);
        setBlocks(data);
      }
    } catch (error) {
      console.error('Errore caricamento blocchi:', error);
    }
  }

  async function loadSlots() {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/courts/${id}/slots?date=${selectedDate}`);
      const data = await res.json();
      setSlots(data);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBookSlot(start: string, end: string) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courtId: id,
          startsAt: start,
          endsAt: end
        })
      });

      if (!res.ok) throw new Error('Prenotazione fallita');

      setMessage({ type: 'success', text: '✅ Prenotazione confermata!' });
      setTimeout(() => loadSlots(), 500);
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  if (!court) {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courts')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Torna ai campi</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-96 bg-gray-200 overflow-hidden">
            <img src={court.image} alt={court.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{court.name}</h1>

            <p className="text-gray-600 text-lg mb-6">{court.description}</p>

            {/* Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Città</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                  {court.city}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Sport</p>
                <p className="text-lg font-semibold text-gray-900">{court.sport}</p>
              </div>
            </div>

            {/* Price */}
            {court.priceRules.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                {court.priceRules.length === 1 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">Prezzo</p>
                    <p className="text-3xl font-bold text-blue-600">
                      €{(court.priceRules[0].price / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">per ora</p>
                    <p className="text-xs text-gray-600 mt-3">
                      {court.priceRules[0].weekdays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')} {court.priceRules[0].startTime}-{court.priceRules[0].endTime}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4 font-semibold">Fasce orarie e prezzi</p>
                    <div className="space-y-3">
                      {court.priceRules.map((rule) => (
                        <div key={rule.id} className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {rule.weekdays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')}
                              </p>
                              <p className="text-sm text-gray-600">
                                {rule.startTime} - {rule.endTime}
                              </p>
                            </div>
                            <p className="text-xl font-bold text-blue-600">
                              €{(rule.price / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Admin Block Button */}
            {isAdmin && (
              <button
                onClick={() => setShowBlockModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                <LockClosedIcon className="h-5 w-5" />
                Blocca campo
              </button>
            )}
          </div>
        </div>

        {/* Block Modal */}
        {id && (
          <BlockCourtModal
            isOpen={showBlockModal}
            onClose={() => setShowBlockModal(false)}
            courtId={id}
            blocks={blocks}
            onBlockCreated={loadBlocks}
          />
        )}

        {/* Booking Section */}
        {!isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Prenota uno slot</h2>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                {message.text}
              </div>
            )}

            {/* Date Picker */}
            <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona data
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field w-full md:w-64"
            />
          </div>

          {/* Slots Grid */}
          {loading ? (
            <p className="text-gray-500">Caricamento slot...</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-500">Nessuno slot disponibile per questa data</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {slots.map((slot, idx) => {
                const start = new Date(slot.start);
                const timeStr = start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                return (
                  <button
                    key={idx}
                    onClick={() => slot.available && handleBookSlot(slot.start, slot.end)}
                    disabled={!slot.available}
                    className={`p-4 rounded-lg font-semibold transition-all ${
                      slot.available
                        ? 'bg-blue-50 border-2 border-blue-600 text-blue-600 hover:bg-blue-100 cursor-pointer'
                        : 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {timeStr}
                  </button>
                );
              })}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
