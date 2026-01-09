import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createBlock, DAYS_OF_WEEK, deleteBlock, CourtBlock } from '../services/court-blocks';

interface BlockCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtId: string;
  blocks: CourtBlock[];
  onBlockCreated: () => void;
}

export default function BlockCourtModal({
  isOpen,
  onClose,
  courtId,
  blocks,
  onBlockCreated
}: BlockCourtModalProps) {
  // Calculate default dates: today to 30 days from now
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(thirtyDaysLater.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDayToggle = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter(d => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  const handleCreateBlock = async () => {
    if (selectedDays.length === 0) {
      setError('Seleziona almeno un giorno');
      return;
    }

    if (startTime >= endTime) {
      setError('L\'orario di inizio deve essere prima di quello di fine');
      return;
    }

    if (!startDate || !endDate) {
      setError('Seleziona entrambe le date');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La data di inizio deve essere prima della data di fine');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createBlock(
        courtId,
        new Date(startDate),
        new Date(endDate),
        startTime,
        endTime,
        selectedDays.sort()
      );
      setStartTime('08:00');
      setEndTime('12:00');
      setSelectedDays([]);
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(thirtyDaysLater.toISOString().split('T')[0]);
      onBlockCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la creazione del blocco');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo blocco?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteBlock(courtId, blockId);
      onBlockCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione del blocco');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Blocca Campo
                </Dialog.Title>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                {/* New Block Form */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Crea nuovo blocco</h4>

                  {/* Date inputs */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data inizio
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data fine
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Time inputs */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orario inizio
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orario fine
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Days of week */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giorni della settimana
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <label key={day.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(day.value)}
                            onChange={() => handleDayToggle(day.value)}
                            disabled={loading}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateBlock}
                    disabled={loading || selectedDays.length === 0}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Crea blocco
                  </button>
                </div>

                {/* Existing Blocks */}
                {blocks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Blocchi attivi</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {blocks.map((block) => {
                        const startDate = new Date(block.startDate).toLocaleDateString('it-IT');
                        const endDate = new Date(block.endDate).toLocaleDateString('it-IT');
                        return (
                          <div
                            key={block.id}
                            className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {block.startTime} - {block.endTime}
                              </p>
                              <p className="text-sm text-gray-600">
                                Dal {startDate} al {endDate}
                              </p>
                              <p className="text-sm text-gray-600">
                                {block.daysOfWeek
                                  .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
                                  .join(', ')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="mt-6">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Chiudi
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
