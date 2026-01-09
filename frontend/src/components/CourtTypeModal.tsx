import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import PlayerSearchModal from './PlayerSearchModal';
import { User } from '../services/users';

interface CourtTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'singolo' | 'doppio', players: User[]) => void;
  loading: boolean;
}

export default function CourtTypeModal({ isOpen, onClose, onSelect, loading }: CourtTypeModalProps) {
  const [courtType, setCourtType] = useState<'singolo' | 'doppio' | null>(null);
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);

  const handleCourtTypeSelect = (type: 'singolo' | 'doppio') => {
    setCourtType(type);
    setShowPlayerSearch(true);
  };

  const handlePlayersSelected = (players: User[]) => {
    if (courtType) {
      onSelect(courtType, players);
      setCourtType(null);
      setShowPlayerSearch(false);
    }
  };

  const handlePlayerSearchClose = () => {
    setShowPlayerSearch(false);
    setCourtType(null);
  };

  return (
    <>
      <Transition appear show={isOpen && !showPlayerSearch} as={Fragment}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Tipo di Prenotazione
                  </Dialog.Title>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    Seleziona se desideri prenotare un campo per una partita singolo o doppio:
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleCourtTypeSelect('singolo')}
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                    >
                      <span>⚫ Singolo (1 vs 1)</span>
                      <span className="text-xs bg-blue-200 px-2 py-1 rounded">Un giocatore</span>
                    </button>

                    <button
                      onClick={() => handleCourtTypeSelect('doppio')}
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-lg border-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                    >
                      <span>⚫⚫ Doppio (2 vs 2)</span>
                      <span className="text-xs bg-green-200 px-2 py-1 rounded">Tre giocatori</span>
                    </button>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="w-full px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annulla
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <PlayerSearchModal
        isOpen={showPlayerSearch}
        onClose={handlePlayerSearchClose}
        onConfirm={handlePlayersSelected}
        loading={loading}
        maxPlayers={courtType === 'singolo' ? 1 : 3}
      />
    </>
  );
}
