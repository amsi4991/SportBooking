import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getBookings, createBooking } from '../services/booking';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function BookingCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const bookings = await getBookings();
      setEvents(bookings.map((b: any) => ({
        title: 'Occupato',
        start: b.startsAt,
        end: b.endsAt,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
      })));
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  async function handleSelect(info: any) {
    setLoading(true);
    setMessage(null);
    try {
      await createBooking({
        courtId: '550e8400-e29b-41d4-a716-446655440000',
        startsAt: info.startStr,
        endsAt: info.endStr
      });
      setMessage({ type: 'success', text: '✅ Prenotazione confermata!' });
      setTimeout(() => loadBookings(), 500);
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="it"
        selectable={!loading}
        events={events}
        select={handleSelect}
        height="auto"
        slotMinTime="06:00"
        slotMaxTime="23:00"
        slotDuration="01:00"
        allDaySlot={false}
        nowIndicator={true}
      />
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <strong>ℹ️ Come prenotare:</strong> Clicca e trascina sul calendario
      </div>
    </div>
  );
}
