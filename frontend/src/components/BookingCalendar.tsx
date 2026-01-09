import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getBookingsByCourtId, createBooking } from '../services/booking';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import CourtTypeModal from './CourtTypeModal';
import { User } from '../services/users';
import { getBlocksByCourtId, CourtBlock } from '../services/court-blocks';

interface BookingCalendarProps {
  courtId: string;
}

interface PendingBooking {
  courtId: string;
  startsAt: string;
  endsAt: string;
}

export default function BookingCalendar({ courtId }: BookingCalendarProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);
  const [blocks, setBlocks] = useState<CourtBlock[]>([]);

  useEffect(() => {
    loadData();
  }, [courtId]);

  async function loadData() {
    try {
      // Carica sia prenotazioni che blocchi in parallelo
      const [bookings, blocksList] = await Promise.all([
        getBookingsByCourtId(courtId),
        getBlocksByCourtId(courtId)
      ]);

      console.log('📦 Blocchi caricati:', blocksList);
      console.log('📅 Prenotazioni caricate:', bookings);
      
      setBlocks(blocksList);

      // Crea gli eventi dalle prenotazioni
      const bookingEvents = bookings.map((b: any) => ({
        title: 'Occupato',
        start: b.startsAt,
        end: b.endsAt,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        extendedProps: {
          isBooked: true
        }
      }));

      // Crea gli eventi dai blocchi
      const blockEvents = blocksList.flatMap(block => {
        console.log('🔍 Processando blocco:', block);
        const dates = generateDatesForBlock(block);
        console.log('📍 Date generate dal blocco:', dates);
        return dates.map(date => ({
          title: 'Bloccato',
          start: date.start,
          end: date.end,
          backgroundColor: '#808080',
          borderColor: '#595959',
          extendedProps: {
            isBlocked: true
          }
        }));
      });

      console.log('🎨 Block events finali:', blockEvents);

      // Combina tutti gli eventi
      setEvents([...bookingEvents, ...blockEvents]);
      console.log('✅ Tutti gli eventi impostati:', [...bookingEvents, ...blockEvents]);
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    }
  }

  function generateDatesForBlock(block: CourtBlock): Array<{ start: string; end: string }> {
    const dates: Array<{ start: string; end: string }> = [];
    
    // Parse block date range
    const blockStart = new Date(block.startDate);
    blockStart.setHours(0, 0, 0, 0);
    
    const blockEnd = new Date(block.endDate);
    blockEnd.setHours(23, 59, 59, 999);

    // Genera eventi per ogni giorno nel range specificato
    let currentDate = new Date(blockStart);
    
    while (currentDate <= blockEnd) {
      const dayOfWeek = currentDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=lunedì, 6=domenica

      if (block.daysOfWeek.includes(adjustedDay)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dates.push({
          start: `${dateStr}T${block.startTime}`,
          end: `${dateStr}T${block.endTime}`
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  async function handleSelect(info: any) {
    console.log('✅ Selezione rilevata:', info);
    // Salva i dati della prenotazione e apri il modal
    setPendingBooking({
      courtId: courtId,
      startsAt: info.startStr,
      endsAt: info.endStr
    });
    setIsModalOpen(true);
  }

  async function handleCourtTypeSelected(courtType: 'singolo' | 'doppio', players: User[]) {
    if (!pendingBooking) return;

    setLoading(true);
    setMessage(null);
    setIsModalOpen(false);

    try {
      const playerIds = players.map(p => p.id);
      console.log('📤 Invio prenotazione:', { ...pendingBooking, courtType, playerIds });
      await createBooking({
        courtId: pendingBooking.courtId,
        startsAt: pendingBooking.startsAt,
        endsAt: pendingBooking.endsAt,
        courtType,
        playerIds
      });
      
      // Aggiungi immediatamente l'evento al calendario
      const playerNames = players.map(p => p.firstName || p.lastName || p.email).join(', ');
      setEvents(prev => [...prev, {
        title: `Occupato - ${courtType}`,
        start: pendingBooking.startsAt,
        end: pendingBooking.endsAt,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        extendedProps: {
          isBooked: true,
          courtType: courtType,
          players: playerNames
        }
      }]);

      setMessage({ type: 'success', text: `✅ Prenotazione confermata! (${courtType} con ${players.length} giocatore${players.length > 1 ? 'i' : ''})` });
      setPendingBooking(null);
      
      // Emetti evento per aggiornare il wallet
      window.dispatchEvent(new Event('walletUpdated'));
    } catch (error) {
      console.error('❌ Errore prenotazione:', error);
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    } finally {
      setLoading(false);
    }
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setPendingBooking(null);
  }

  return (
    <div className="space-y-4">
      <CourtTypeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSelect={handleCourtTypeSelected}
        loading={loading}
      />

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
          <li>Le celle <span className="text-gray-600 font-semibold">grigie (bloccate)</span> sono riservate dall'amministratore</li>
          <li>Puoi selezionare uno o più slot consecutivi</li>
          <li>Ti verrà chiesto di scegliere se prenotare un singolo o un doppio</li>
          <li>Potrai quindi cercare e selezionare gli altri giocatori partecipanti</li>
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
