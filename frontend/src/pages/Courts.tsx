import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { MagnifyingGlassIcon, MapPinIcon, TicketIcon } from '@heroicons/react/24/outline';

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
  weekdays: number[];
  startTime: string;
  endTime: string;
  price: number;
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

export default function Courts() {
  const navigate = useNavigate();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchSport, setSearchSport] = useState('');
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

  async function loadCourts() {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (searchCity) query.append('city', searchCity);
      if (searchSport) query.append('sport', searchSport);

      const res = await fetch(`http://localhost:3000/courts?${query}`);
      const data = await res.json();
      setCourts(data);
    } catch (error) {
      console.error('Errore:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Scopri i Campi Sportivi</h1>
          <p className="text-gray-600">Prenota il tuo campo preferito in pochi clic</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca città..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Cerca sport..."
                value={searchSport}
                onChange={(e) => setSearchSport(e.target.value)}
                className="input-field"
              />
            </div>

            <button type="submit" className="btn-primary">
              Cerca
            </button>
          </div>
        </form>

        {/* Courts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Caricamento campi...</p>
          </div>
        ) : courts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nessun campo trovato</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courts.map((court) => (
              <div
                key={court.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{court.name}</h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{court.description}</p>

                  {/* Info Badges */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 text-blue-600" />
                      <span>{court.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TicketIcon className="h-4 w-4 text-green-600" />
                      <span>{court.sport}</span>
                    </div>
                  </div>

                  {/* Price */}
                  {court.priceRules.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      {court.priceRules.length === 1 ? (
                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            €{(court.priceRules[0].price / 100).toFixed(2)} / ora
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {court.priceRules[0].weekdays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')} {court.priceRules[0].startTime}-{court.priceRules[0].endTime}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-gray-900 mb-2">Fasce orarie:</p>
                          <div className="space-y-2">
                            {court.priceRules.map((rule, idx) => (
                              <div key={idx} className="text-sm bg-blue-50 p-2 rounded">
                                <p className="font-bold text-blue-600">€{(rule.price / 100).toFixed(2)}/h</p>
                                <p className="text-xs text-gray-600">
                                  {rule.weekdays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')} {rule.startTime}-{rule.endTime}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Button */}
                  <button 
                    onClick={() => navigate(`/court/${court.id}`)}
                    className="w-full mt-4 btn-primary"
                  >
                    Visualizza Dettagli
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
