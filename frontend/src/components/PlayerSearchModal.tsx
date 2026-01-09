import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { searchUsers, getDisplayName, User } from '../services/users';

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (players: User[]) => void;
  loading: boolean;
  maxPlayers: number;
}

export default function PlayerSearchModal({ isOpen, onClose, onConfirm, loading, maxPlayers }: PlayerSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          // Filtra i giocatori già selezionati
          const filtered = results.filter(r => !selectedPlayers.some(p => p.id === r.id));
          setSearchResults(filtered);
        } catch (error) {
          console.error('Errore ricerca utenti:', error);
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedPlayers]);

  const handleSelectPlayer = (user: User) => {
    if (selectedPlayers.length < maxPlayers) {
      setSelectedPlayers([...selectedPlayers, user]);
      setSearchQuery('');
    }
  };

  const handleRemovePlayer = (userId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== userId));
  };

  const handleConfirm = () => {
    if (selectedPlayers.length === maxPlayers) {
      onConfirm(selectedPlayers);
      setSelectedPlayers([]);
      setSearchQuery('');
    }
  };

  const canConfirm = selectedPlayers.length === maxPlayers;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Seleziona Giocatori ({selectedPlayers.length}/{maxPlayers})
                </Dialog.Title>

                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cerca per email, nome o cognome..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading || selectedPlayers.length >= maxPlayers}
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searchQuery.length >= 2 && (
                  <div className="mb-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {searching ? (
                      <div className="p-4 text-center text-gray-500">
                        Ricerca in corso...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <ul className="divide-y">
                        {searchResults.map((user) => (
                          <li key={user.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectPlayer(user)}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{getDisplayName(user)}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                              <span className="text-blue-500 font-semibold">+</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Nessun giocatore trovato
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Players */}
                {selectedPlayers.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Giocatori selezionati:</p>
                    <div className="space-y-2">
                      {selectedPlayers.map((player) => (
                        <div key={player.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <span className="text-gray-900 font-medium">{getDisplayName(player)}</span>
                          <button
                            onClick={() => handleRemovePlayer(player.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="space-y-3 mt-6">
                  <button
                    onClick={handleConfirm}
                    disabled={!canConfirm || loading}
                    className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Conferma
                  </button>
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
  );
}
