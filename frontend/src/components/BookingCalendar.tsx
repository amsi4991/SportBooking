import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getBookingsByCourtId, createBooking } from '../services/booking';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface BookingCalendarProps {
  courtId: string;
}

export default function BookingCalendar({ courtId }: BookingCalendarProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectStart, setSelectStart] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, [courtId]);

  async function loadBookings() {
    try {
      const bookings = await getBookingsByCourtId(courtId);
      setEvents(bookings.map((b: any) => ({
        title: 'Occupato',
        start: b.startsAt,
        end: b.endsAt,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        extendedProps: {
          isBooked: true
        }
      })));
    } catch (error) {
      console.error('Errore caricamento prenotazioni:', error);
    }
  }

  async function handleSelect(info: any) {
    console.log('✅ Selezione rilevata:', info);
    setLoading(true);
    setMessage(null);
    try {
      console.log('📤 Invio prenotazione:', { courtId, startsAt: info.startStr, endsAt: info.endStr });
      await createBooking({
        courtId: courtId,
        startsAt: info.startStr,
        endsAt: info.endStr
      });
      
      // Aggiungi immediatamente l'evento al calendario
      setEvents(prev => [...prev, {
        title: 'Occupato',
        start: info.startStr,
        end: info.endStr,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        extendedProps: {
          isBooked: true
        }
      }]);

      setMessage({ type: 'success', text: '✅ Prenotazione confermata!' });
    } catch (error) {
      console.error('❌ Errore prenotazione:', error);
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <strong>ℹ️ Come prenotare:</strong> 
        <ul className="list-disc list-inside mt-2">
          <li>Clicca e trascina sulle celle <span className="text-blue-600 font-semibold">bianche (libere)</span> per selezionare gli orari</li>
          <li>Le celle <span className="text-red-600 font-semibold">rosse (occupate)</span> non possono essere prenotate</li>
          <li>Puoi selezionare uno o più slot consecutivi</li>
        </ul>
      </div>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="it"
        selectable={true}
        events={events}
        select={handleSelect}
        height="auto"
        slotMinTime="06:00"
        slotMaxTime="23:00"
        slotDuration="01:00"
        allDaySlot={false}
        nowIndicator={true}
        slotLabelInterval="01:00"
        weekends={true}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek'
        }}
        buttonText={{
          today: 'Oggi',
          week: 'Settimana'
        }}
        eventClick={(info) => {
          console.log('🔴 Slot occupato cliccato:', info.event.title);
        }}
      />
    </div>
  );
}
