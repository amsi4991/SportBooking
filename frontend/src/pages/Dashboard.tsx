
import BookingCalendar from '../components/BookingCalendar';
import Navigation from '../components/Navigation';
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Calendario Prenotazioni</h2>
          <p className="text-gray-600">Seleziona uno slot per prenotare il tuo campo sportivo</p>
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
              <p className="text-lg font-semibold text-gray-900">Campo Centrale</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="card">
          <BookingCalendar />
        </div>
      </div>
    </div>
  );
}
