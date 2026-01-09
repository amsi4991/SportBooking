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
  courtId?: string;
  courtIds?: string[];
  isAdmin?: boolean;
  showAllCourts?: boolean;
  courts?: Array<{ id: string; name: string; city: string; sport: string }>;
}

interface PendingBooking {
  courtId: string;
  startsAt: string;
  endsAt: string;
}

interface CourtInfo {
  id: string;
  name: string;
  color: string;
}

const COURT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#14B8A6', // teal
];

export default function BookingCalendar({ 
  courtId, 
  courtIds = [], 
  isAdmin = false,
  showAllCourts = false,
  courts = []
}: BookingCalendarProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCourtSelectOpen, setIsCourtSelectOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);
  const [blocks, setBlocks] = useState<CourtBlock[]>([]);
  const [courtColorMap, setCourtColorMap] = useState<Record<string, string>>({});
  const [tempSlotSelection, setTempSlotSelection] = useState<{ startStr: string; endStr: string } | null>(null);;

  useEffect(() => {
    loadData();
  }, [courtId, courtIds, showAllCourts]);

  async function loadData() {
    try {
      const idsToLoad = showAllCourts ? courtIds : (courtId ? [courtId] : []);
      
      if (idsToLoad.length === 0) return;

      // Carica prenotazioni e blocchi per tutti i campi
      const bookingsPromises = idsToLoad.map(id => getBookingsByCourtId(id));
      const blocksPromises = idsToLoad.map(id => getBlocksByCourtId(id));

      const [allBookings, allBlocks] = await Promise.all([
        Promise.all(bookingsPromises),
        Promise.all(blocksPromises)
      ]);

      // Appiattisci gli array
      const allBookingsFlat = allBookings.flat();
      const allBlocksFlat = allBlocks.flat();

      setBlocks(allBlocksFlat);

      // Crea mappa colori per i campi
      const colorMap: Record<string, string> = {};
      idsToLoad.forEach((id, index) => {
        colorMap[id] = COURT_COLORS[index % COURT_COLORS.length];
      });
      setCourtColorMap(colorMap);

      // Crea gli eventi dalle prenotazioni
      const bookingEvents = allBookingsFlat.map((b: any) => {
        const courtColor = colorMap[b.courtId];
        return {
          title: showAllCourts ? `${b.court?.name} - Occupato` : 'Occupato',
          start: b.startsAt,
          end: b.endsAt,
          backgroundColor: courtColor || '#3B82F6',
          borderColor: courtColor || '#1E40AF',
          extendedProps: {
            isBooked: true,
            courtId: b.courtId,
            courtName: b.court?.name
          }
        };
      });

      // Crea gli eventi dai blocchi
      const blockEvents = allBlocksFlat.flatMap(block => {
        // Trova il nome del campo dal mapping dei courts disponibili
        const courtName = courts.find(c => c.id === block.courtId)?.name || `Campo ${block.courtId}`;
        const courtColor = colorMap[block.courtId];
        const dates = generateDatesForBlock(block);
        return dates.map(date => ({
          title: showAllCourts ? `${courtName} - Bloccato` : 'Bloccato',
          start: date.start,
          end: date.end,
          backgroundColor: '#808080',
          borderColor: '#595959',
          extendedProps: {
            isBlocked: true,
            courtId: block.courtId,
            courtName: courtName
          }
        }));
      });

      // Combina tutti gli eventi
      setEvents([...bookingEvents, ...blockEvents]);
    } catch (error) {
      console.error('Errore caricamento dati:', error);
    }
  }

  function generateDatesForBlock(block: CourtBlock): Array<{ start: string; end: string }> {
    const dates: Array<{ start: string; end: string }> = [];
    
    const blockStart = new Date(block.startDate);
    blockStart.setHours(0, 0, 0, 0);
    
    const blockEnd = new Date(block.endDate);
    blockEnd.setHours(23, 59, 59, 999);

    let currentDate = new Date(blockStart);
    
    while (currentDate <= blockEnd) {
      const dayOfWeek = currentDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

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
    if (showAllCourts) {
      // In modalità "Tutti i campi", mostra il popup di selezione campo
      setTempSlotSelection({ startStr: info.startStr, endStr: info.endStr });
      setIsCourtSelectOpen(true);
      return;
    }

    if (!courtId) {
      setMessage({ type: 'error', text: '❌ Errore: impossibile determinare il campo. Passa alla modalità "Campo singolo"' });
      return;
    }

    setPendingBooking({
      courtId: courtId,
      startsAt: info.startStr,
      endsAt: info.endStr
    });
    setIsModalOpen(true);
  }

  function handleCourtSelected(selectedCourtId: string) {
    if (tempSlotSelection) {
      setPendingBooking({
        courtId: selectedCourtId,
        startsAt: tempSlotSelection.startStr,
        endsAt: tempSlotSelection.endStr
      });
    }
    setIsCourtSelectOpen(false);
    setTempSlotSelection(null);
    setIsModalOpen(true);
  }

  async function handleCourtTypeSelected(courtType: 'singolo' | 'doppio', players: User[]) {
    if (!pendingBooking) return;

    setLoading(true);
    setMessage(null);
    setIsModalOpen(false);

    try {
      const playerIds = players.map(p => p.id);
      await createBooking({
        courtId: pendingBooking.courtId,
        startsAt: pendingBooking.startsAt,
        endsAt: pendingBooking.endsAt,
        courtType,
        playerIds
      });
      
      // Aggiungi immediatamente l'evento al calendario
      const playerNames = players.map(p => p.firstName || p.lastName || p.email).join(', ');
      const courtColor = courtColorMap[pendingBooking.courtId];
      
      setEvents(prev => [...prev, {
        title: `Occupato - ${courtType}`,
        start: pendingBooking.startsAt,
        end: pendingBooking.endsAt,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        extendedProps: {
          isBooked: true,
          courtType: courtType,
          players: playerNames,
          courtId: pendingBooking.courtId
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

      {/* Court Selection Modal for "Tutti i campi" mode */}
      {isCourtSelectOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Seleziona il campo</h2>
            <p className="text-gray-600 mb-6">Quale campo desideri prenotare?</p>
            
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {courts.map((court) => (
                <button
                  key={court.id}
                  onClick={() => handleCourtSelected(court.id)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition group"
                >
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600">{court.name}</p>
                  <p className="text-sm text-gray-600">
                    {court.sport} • {court.city}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsCourtSelectOpen(false);
                setTempSlotSelection(null);
              }}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className={`border rounded-lg p-4 text-sm ${isAdmin ? 'bg-yellow-50 border-yellow-200 text-yellow-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
        {isAdmin ? (
          <>
            <strong>ℹ️ Visualizzazione calendario:</strong>
            <ul className="list-disc list-inside mt-2">
              <li>Puoi visualizzare il calendario e le prenotazioni</li>
              <li>Le celle <span className="text-red-600 font-semibold">rosse (occupate)</span> sono prenotazioni attive</li>
              <li>Le celle <span className="text-gray-600 font-semibold">grigie (bloccate)</span> sono blocchi che hai configurato</li>
              <li>Non puoi effettuare prenotazioni come admin</li>
            </ul>
          </>
        ) : (
          <>
            <strong>ℹ️ Come prenotare:</strong> 
            <ul className="list-disc list-inside mt-2">
              <li>Clicca sulle celle <span className="text-blue-600 font-semibold">bianche (libere)</span> per selezionare gli orari</li>
              <li>Le celle <span className="text-red-600 font-semibold">rosse (occupate)</span> non possono essere prenotate</li>
              <li>Le celle <span className="text-gray-600 font-semibold">grigie (bloccate)</span> sono riservate dall'amministratore</li>
              <li>Puoi selezionare slot consecutivi</li>
              <li>Ti verrà chiesto di scegliere se prenotare un singolo o un doppio</li>
              <li>Potrai quindi cercare e selezionare gli altri giocatori partecipanti</li>
            </ul>
          </>
        )}
      </div>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="it"
        selectable={!isAdmin}
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
        contentHeight="auto"
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
          console.log('🔴 Slot cliccato:', info.event.title);
        }}
        eventDisplay="auto"
        dayMaxEvents={3}
      />

      {showAllCourts && courtIds.length > 0 && (
        <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">🎾 Legenda Campi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {courtIds.map((id, index) => {
              const court = courts.find(c => c.id === id);
              return (
                <div key={id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
                  <div 
                    className="w-6 h-6 rounded-lg flex-shrink-0 mt-0.5 shadow-sm" 
                    style={{ backgroundColor: COURT_COLORS[index % COURT_COLORS.length] }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{court?.name || `Campo ${index + 1}`}</p>
                    <p className="text-xs text-gray-600">
                      {court?.sport} {court?.city && `• ${court.city}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
