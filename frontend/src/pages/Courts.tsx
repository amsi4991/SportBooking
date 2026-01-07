import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { MagnifyingGlassIcon, MapPinIcon, TicketIcon } from '@heroicons/react/24/outline';

interface Court {
  id: string;
  name: string;
  city: string;
  sport: string;
  description: string;
  image: string;
  priceRules: Array<{ price: number }>;
}

export default function Courts() {
  const navigate = useNavigate();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchSport, setSearchSport] = useState('');

  useEffect(() => {
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
                onClick={() => navigate(`/court/${court.id}`)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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
                      <p className="text-lg font-bold text-blue-600">
                        €{(court.priceRules[0].price / 100).toFixed(2)} / ora
                      </p>
                    </div>
                  )}

                  {/* Button */}
                  <button className="w-full mt-4 btn-primary">
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
