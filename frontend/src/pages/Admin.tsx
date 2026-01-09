import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { TrashIcon, SparklesIcon, ArrowUpRightIcon, ArrowDownLeftIcon, PlusIcon, XMarkIcon, PencilIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { 
  getAdminStats, 
  getAdminBookings, 
  deleteAdminBooking, 
  getAdminUsers,
  createUser,
  updateUserWallet,
  getUserTransactions
} from '../services/admin';
import { getAllCourts, createCourt, updateCourt, deleteCourt, Court, getPriceRules, createPriceRule, updatePriceRule, deletePriceRule, DAYS_OF_WEEK, PriceRule } from '../services/courts';
import { getSettings, updateBrandSettings, updateDashboardSettings } from '../services/settings';
import BlockCourtModal from '../components/BlockCourtModal';
import { getBlocksByCourtId, CourtBlock } from '../services/court-blocks';

interface Booking {
  id: string;
  userId: string;
  courtId: string;
  startsAt: string;
  endsAt: string;
  totalPrice: number;
  paidWithWallet: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  wallet?: {
    balance: number;
  };
}

interface Stats {
  totalBookings: number;
  revenue: number;
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
}

interface BrandSettings {
  icon: string;
  name: string;
}

const AVAILABLE_ICONS = ['⚽', '🏀', '🎾', '🏐', '🏑', '🏒', '🏓', '⛳', '🎳', '🏏', '⚾', '🥎', '🏸', '🥊', '🥋'];

export default function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Brand settings
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({ icon: '⚽', name: 'SportBook' });
  const [editBrandIcon, setEditBrandIcon] = useState('⚽');
  const [editBrandName, setEditBrandName] = useState('SportBook');
  const [showBrandEditor, setShowBrandEditor] = useState(false);
  
  // Dashboard settings
  interface DashboardSettings {
    availabilityText: string;
    hoursText: string;
  }
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({ 
    availabilityText: '7 giorni a settimana',
    hoursText: '06:00 - 22:00'
  });
  const [editAvailabilityText, setEditAvailabilityText] = useState('7 giorni a settimana');
  const [editHoursText, setEditHoursText] = useState('06:00 - 22:00');
  const [showDashboardEditor, setShowDashboardEditor] = useState(false);
  
  // Form per creare nuovo utente
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  
  // Modal per gestire campi
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [courtForm, setCourtForm] = useState({ name: '', city: '', sport: '', description: '', image: '' });
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingPriceRuleId, setEditingPriceRuleId] = useState<string | null>(null);
  const [priceForm, setPriceForm] = useState({ weekdays: [] as number[], startTime: '08:00', endTime: '12:00', price: 0 });
  
  // Modal per modificare wallet
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [walletForm, setWalletForm] = useState({ amount: 0, operation: 'add' as 'add' | 'subtract' | 'set', description: '' });

  // Modal per bloccare campi
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedCourtForBlock, setSelectedCourtForBlock] = useState<Court | null>(null);
  const [blocksMap, setBlocksMap] = useState<{ [courtId: string]: CourtBlock[] }>({});

  useEffect(() => {
    loadAdminData();
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const settings = await getSettings();
      if (settings.brandSettings) {
        setBrandSettings(settings.brandSettings);
        setEditBrandIcon(settings.brandSettings.icon);
        setEditBrandName(settings.brandSettings.name);
      }
      if (settings.dashboardSettings) {
        setDashboardSettings(settings.dashboardSettings);
        setEditAvailabilityText(settings.dashboardSettings.availabilityText);
        setEditHoursText(settings.dashboardSettings.hoursText);
      }
    } catch (error) {
      console.error('Errore caricamento settings:', error);
    }
  }

  async function loadAdminData() {
    try {
      const [statsData, bookingsData, usersData, courtsData] = await Promise.all([
        getAdminStats(),
        getAdminBookings(),
        getAdminUsers(),
        getAllCourts()
      ]);
      setStats(statsData);
      setBookings(bookingsData);
      setUsers(usersData);
      setCourts(courtsData);
    } catch (error) {
      console.error('Errore nel caricamento dati admin:', error);
      setMessage({ type: 'error', text: '❌ Errore nel caricamento dati' });
    } finally {
      setLoading(false);
    }
  }

  async function openBlockModal(court: Court) {
    setSelectedCourtForBlock(court);
    setShowBlockModal(true);
    try {
      const blocks = await getBlocksByCourtId(court.id);
      setBlocksMap(prev => ({ ...prev, [court.id]: blocks }));
    } catch (error) {
      console.error('Errore caricamento blocchi:', error);
    }
  }

  function handleBlocksCreated() {
    if (selectedCourtForBlock) {
      openBlockModal(selectedCourtForBlock);
    }
  }

  async function handleDeleteBooking(bookingId: string) {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione? Il credito sarà rimborsato all\'utente.')) {
      return;
    }

    try {
      await deleteAdminBooking(bookingId);
      setMessage({ type: 'success', text: '✅ Prenotazione eliminata e credito rimborsato!' });
      loadAdminData();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  async function handleCreateUser() {
    if (!newUserForm.email || !newUserForm.password) {
      setMessage({ type: 'error', text: '❌ Email e password sono obbligatori' });
      return;
    }

    try {
      await createUser(newUserForm.email, newUserForm.password, newUserForm.firstName, newUserForm.lastName);
      setMessage({ type: 'success', text: '✅ Utente creato con successo!' });
      setShowCreateUserForm(false);
      setNewUserForm({ email: '', password: '', firstName: '', lastName: '' });
      loadAdminData();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  async function handleUpdateWallet() {
    if (!selectedUser || !walletForm.amount) {
      setMessage({ type: 'error', text: '❌ Inserisci un importo valido' });
      return;
    }

    try {
      await updateUserWallet(selectedUser.id, walletForm.amount, walletForm.operation, walletForm.description);
      setMessage({ type: 'success', text: '✅ Wallet aggiornato!' });
      setShowWalletModal(false);
      setSelectedUser(null);
      setUserTransactions([]);
      setWalletForm({ amount: 0, operation: 'add', description: '' });
      loadAdminData();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  async function openWalletModal(user: User) {
    setSelectedUser(user);
    setShowWalletModal(true);
    setWalletForm({ amount: 0, operation: 'add', description: '' });
    setLoadingTransactions(true);
    try {
      const txs = await getUserTransactions(user.id);
      setUserTransactions(txs);
    } catch (error) {
      console.error('Errore nel caricamento transazioni:', error);
    } finally {
      setLoadingTransactions(false);
    }
  }

  async function handleSaveCourt() {
    if (!courtForm.name || !courtForm.city || !courtForm.sport) {
      setMessage({ type: 'error', text: '❌ Nome, città e sport sono obbligatori' });
      return;
    }

    try {
      if (selectedCourt) {
        // Modifica
        await updateCourt(selectedCourt.id, courtForm);
        setMessage({ type: 'success', text: '✅ Campo aggiornato!' });
      } else {
        // Crea
        await createCourt(courtForm);
        setMessage({ type: 'success', text: '✅ Campo creato!' });
      }
      setShowCourtModal(false);
      setSelectedCourt(null);
      setCourtForm({ name: '', city: '', sport: '', description: '', image: '' });
      loadAdminData();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  function openCourtModal(court?: Court) {
    if (court) {
      setSelectedCourt(court);
      setCourtForm({
        name: court.name,
        city: court.city,
        sport: court.sport,
        description: court.description || '',
        image: court.image || ''
      });
      // Carica i prezzi
      loadPriceRules(court.id);
    } else {
      setSelectedCourt(null);
      setCourtForm({ name: '', city: '', sport: '', description: '', image: '' });
      setPriceRules([]);
    }
    setShowPriceForm(false);
    setEditingPriceRuleId(null);
    setPriceForm({ weekdays: [], startTime: '08:00', endTime: '12:00', price: 0 });
    setShowCourtModal(true);
  }

  async function loadPriceRules(courtId: string) {
    try {
      const rules = await getPriceRules(courtId);
      setPriceRules(rules);
    } catch (error) {
      console.error('Errore caricamento prezzi:', error);
    }
  }

  async function handleAddPrice() {
    if (!selectedCourt || priceForm.weekdays.length === 0) return;

    try {
      if (editingPriceRuleId) {
        // Update
        await updatePriceRule(
          selectedCourt.id,
          editingPriceRuleId,
          {
            weekdays: priceForm.weekdays,
            startTime: priceForm.startTime,
            endTime: priceForm.endTime,
            price: Math.round(priceForm.price * 100)
          }
        );
        setMessage({ type: 'success', text: '✅ Fascia oraria aggiornata!' });
        setEditingPriceRuleId(null);
      } else {
        // Create
        await createPriceRule(
          selectedCourt.id,
          priceForm.weekdays,
          priceForm.startTime,
          priceForm.endTime,
          Math.round(priceForm.price * 100) // Converti euro a centesimi
        );
        setMessage({ type: 'success', text: '✅ Fascia oraria aggiunta!' });
      }
      setPriceForm({ weekdays: [], startTime: '08:00', endTime: '12:00', price: 0 });
      setShowPriceForm(false);
      loadPriceRules(selectedCourt.id);
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  function handleEditPrice(rule: PriceRule) {
    setEditingPriceRuleId(rule.id);
    setPriceForm({
      weekdays: rule.weekdays,
      startTime: rule.startTime,
      endTime: rule.endTime,
      price: rule.price / 100 // Converti centesimi a euro
    });
    setShowPriceForm(true);
  }

  async function handleDeletePrice(ruleId: string) {
    if (!selectedCourt) return;

    try {
      await deletePriceRule(selectedCourt.id, ruleId);
      setMessage({ type: 'success', text: '✅ Fascia oraria eliminata!' });
      if (editingPriceRuleId === ruleId) {
        setEditingPriceRuleId(null);
        setShowPriceForm(false);
      }
      loadPriceRules(selectedCourt.id);
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  async function handleDeleteCourt(courtId: string) {
    if (!confirm('Sei sicuro di voler eliminare questo campo? Tutte le prenotazioni associate verranno eliminate.')) {
      return;
    }

    try {
      await deleteCourt(courtId);
      setMessage({ type: 'success', text: '✅ Campo eliminato!' });
      loadAdminData();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="text-center py-12">Caricamento...</div>
      </div>
    );
  }

  function handleSaveBrand() {
    if (editBrandName.trim()) {
      updateBrandSettings(editBrandIcon, editBrandName)
        .then((settings) => {
          setBrandSettings(settings.brandSettings || { icon: editBrandIcon, name: editBrandName });
          setShowBrandEditor(false);
          setMessage({ type: 'success', text: '✅ Brand personalizzato con successo!' });
          // Reload per mostrare le modifiche nella navbar
          setTimeout(() => window.location.reload(), 1500);
        })
        .catch((error) => {
          setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
        });
    }
  }

  function handleSaveDashboard() {
    if (editAvailabilityText.trim() && editHoursText.trim()) {
      updateDashboardSettings(editAvailabilityText, editHoursText)
        .then((settings) => {
          setDashboardSettings(settings.dashboardSettings || { availabilityText: editAvailabilityText, hoursText: editHoursText });
          setShowDashboardEditor(false);
          setMessage({ type: 'success', text: '✅ Impostazioni dashboard salvate con successo!' });
        })
        .catch((error) => {
          setMessage({ type: 'error', text: `❌ Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}` });
        });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <SparklesIcon className="h-8 w-8 text-purple-600" />
            Pannello Amministratore
          </h1>
          <p className="text-gray-600">Gestisci prenotazioni e visualizza statistiche</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Brand Customization */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <PaintBrushIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Personalizzazione Brand</h2>
                <p className="text-sm text-gray-600">Icona: {brandSettings.icon} • Nome: {brandSettings.name}</p>
              </div>
            </div>
            <button
              onClick={() => setShowBrandEditor(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Modifica
            </button>
          </div>
        </div>

        {/* Dashboard Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Impostazioni Dashboard</h2>
                <p className="text-sm text-gray-600">Disponibilità: {dashboardSettings.availabilityText} • Orari: {dashboardSettings.hoursText}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDashboardEditor(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Modifica
            </button>
          </div>
        </div>

        {/* Brand Editor Modal */}
        {showBrandEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalizza il brand</h2>
              
              {/* Icon Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Seleziona icona</label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setEditBrandIcon(icon)}
                      className={`text-3xl p-2 rounded-lg transition ${
                        editBrandIcon === icon
                          ? 'bg-purple-600 ring-2 ring-purple-400'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome applicazione</label>
                <input
                  type="text"
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Es: SportBook"
                />
              </div>

              {/* Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Anteprima:</p>
                <div className="flex items-center gap-2">
                  <div className="text-3xl">{editBrandIcon}</div>
                  <p className="text-xl font-bold text-gray-900">{editBrandName}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBrandEditor(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveBrand}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Settings Editor Modal */}
        {showDashboardEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Impostazioni Dashboard</h2>
              
              {/* Disponibilità Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilità</label>
                <input
                  type="text"
                  value={editAvailabilityText}
                  onChange={(e) => setEditAvailabilityText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Es: 7 giorni a settimana"
                />
              </div>

              {/* Orari Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Orari</label>
                <input
                  type="text"
                  value={editHoursText}
                  onChange={(e) => setEditHoursText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Es: 06:00 - 22:00"
                />
              </div>

              {/* Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Anteprima:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 text-sm">Disponibilità:</span>
                    <span className="text-gray-900 font-semibold">{editAvailabilityText}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 text-sm">Orari:</span>
                    <span className="text-gray-900 font-semibold">{editHoursText}</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDashboardEditor(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveDashboard}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Prenotazioni totali</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalBookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm">Ricavo totale</p>
              <p className="text-3xl font-bold text-green-600 mt-2">€{(stats.revenue / 100).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tutte le prenotazioni</h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">Nessuna prenotazione</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Utente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data inizio</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data fine</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Prezzo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pagato</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data creazione</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const start = new Date(booking.startsAt);
                    const end = new Date(booking.endsAt);
                    const created = new Date(booking.createdAt);

                    return (
                      <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-mono text-xs">{booking.userId.substring(0, 8)}...</td>
                        <td className="py-3 px-4 text-gray-700">
                          {start.toLocaleDateString('it-IT')} {start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {end.toLocaleDateString('it-IT')} {end.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-semibold">€{(booking.totalPrice / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${booking.paidWithWallet ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {booking.paidWithWallet ? 'Wallet' : 'Altro'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {created.toLocaleDateString('it-IT')}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Elimina
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Gestione Utenti */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestione utenti</h2>
            <button
              onClick={() => setShowCreateUserForm(!showCreateUserForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition"
            >
              <PlusIcon className="h-5 w-5" />
              Nuovo utente
            </button>
          </div>

          {showCreateUserForm && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Crea nuovo utente</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Nome (opzionale)"
                  value={newUserForm.firstName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Cognome (opzionale)"
                  value={newUserForm.lastName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateUser}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition"
                  >
                    Crea
                  </button>
                  <button
                    onClick={() => setShowCreateUserForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-md font-medium transition"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ruolo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Saldo Wallet</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.role === 'admin' ? (
                        <span className="text-gray-500 text-sm italic">N/A</span>
                      ) : (
                        <span className="text-lg font-bold text-blue-600">
                          €{user.wallet ? (user.wallet.balance / 100).toFixed(2) : '0.00'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => openWalletModal(user)}
                          className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                          Gestisci wallet
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Gestione Wallet */}
        {showWalletModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Gestisci Wallet</h3>
                <button
                  onClick={() => {
                    setShowWalletModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600">Email: <span className="font-semibold text-gray-900">{selectedUser.email}</span></p>
                <p className="text-sm text-gray-600 mt-1">Saldo attuale: <span className="text-lg font-bold text-blue-600">€{selectedUser.wallet ? (selectedUser.wallet.balance / 100).toFixed(2) : '0.00'}</span></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operazione</label>
                  <select
                    value={walletForm.operation}
                    onChange={(e) => setWalletForm({ ...walletForm, operation: e.target.value as 'add' | 'subtract' | 'set' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="add">Aggiungi credito (+)</option>
                    <option value="subtract">Decurta credito (-)</option>
                    <option value="set">Imposta saldo diretto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {walletForm.operation === 'set' ? 'Nuovo saldo (€)' : 'Importo (€)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={walletForm.operation === 'set' ? '0.00' : '0.00'}
                    value={walletForm.amount}
                    onChange={(e) => setWalletForm({ ...walletForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  {walletForm.operation === 'set' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Saldo attuale: €{selectedUser.wallet ? (selectedUser.wallet.balance / 100).toFixed(2) : '0.00'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opzionale)</label>
                  <input
                    type="text"
                    placeholder="Es: Bonus fedeltà"
                    value={walletForm.description}
                    onChange={(e) => setWalletForm({ ...walletForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleUpdateWallet}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition"
                  >
                    Salva modifiche
                  </button>
                  <button
                    onClick={() => {
                      setShowWalletModal(false);
                      setSelectedUser(null);
                      setUserTransactions([]);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-md font-medium transition"
                  >
                    Annulla
                  </button>
                </div>

                {/* Transaction History */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Cronologia transazioni</h4>
                  {loadingTransactions ? (
                    <p className="text-gray-500 text-sm">Caricamento...</p>
                  ) : userTransactions.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nessuna transazione</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userTransactions.map((tx) => {
                        const date = new Date(tx.createdAt);
                        const isDeposit = tx.type === 'deposit' || tx.type === 'refund';
                        const icon = isDeposit ? ArrowDownLeftIcon : ArrowUpRightIcon;
                        const Icon = icon;

                        return (
                          <div key={tx.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded-full ${isDeposit ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Icon className={`h-4 w-4 ${isDeposit ? 'text-green-600' : 'text-red-600'}`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{tx.description}</p>
                                <p className="text-xs text-gray-600">{date.toLocaleDateString('it-IT')} {date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                            <p className={`font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                              {isDeposit ? '+' : '-'}€{(tx.amount / 100).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gestione Campi */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestione campi</h2>
            <button
              onClick={() => openCourtModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition"
            >
              <PlusIcon className="h-5 w-5" />
              Nuovo campo
            </button>
          </div>

          {courts.length === 0 ? (
            <p className="text-gray-500">Nessun campo</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courts.map((court) => (
                <div key={court.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  {court.image && (
                    <img src={court.image} alt={court.name} className="w-full h-40 object-cover rounded-md mb-3" />
                  )}
                  <h3 className="font-bold text-gray-900 text-lg">{court.name}</h3>
                  <p className="text-sm text-gray-600">📍 {court.city} • ⚽ {court.sport}</p>
                  {court.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{court.description}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openCourtModal(court)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Modifica
                    </button>
                    <button
                      onClick={() => openBlockModal(court)}
                      className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2"
                    >
                      🔒
                      Blocca
                    </button>
                    <button
                      onClick={() => handleDeleteCourt(court.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-md text-sm font-medium transition"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Gestione Campi */}
        {showCourtModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedCourt ? 'Modifica Campo' : 'Nuovo Campo'}
                </h3>
                <button
                  onClick={() => {
                    setShowCourtModal(false);
                    setSelectedCourt(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    placeholder="Es: Campo Centrale"
                    value={courtForm.name}
                    onChange={(e) => setCourtForm({ ...courtForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Città *</label>
                  <input
                    type="text"
                    placeholder="Es: Milano"
                    value={courtForm.city}
                    onChange={(e) => setCourtForm({ ...courtForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sport *</label>
                  <input
                    type="text"
                    placeholder="Es: Calcio"
                    value={courtForm.sport}
                    onChange={(e) => setCourtForm({ ...courtForm, sport: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    placeholder="Descrizione del campo..."
                    value={courtForm.description}
                    onChange={(e) => setCourtForm({ ...courtForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Immagine</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={courtForm.image}
                    onChange={(e) => setCourtForm({ ...courtForm, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                {/* Sezione Prezzi */}
                {selectedCourt && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Fasce orarie e prezzi</h4>
                      <button
                        onClick={() => setShowPriceForm(!showPriceForm)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-medium transition"
                      >
                        <PlusIcon className="h-4 w-4 inline mr-1" />
                        Aggiungi
                      </button>
                    </div>

                    {showPriceForm && (
                      <div className="bg-blue-50 p-3 rounded-md mb-3 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Giorni della settimana</label>
                          <div className="grid grid-cols-2 gap-2">
                            {DAYS_OF_WEEK.map(day => (
                              <label key={day.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={priceForm.weekdays.includes(day.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setPriceForm({ ...priceForm, weekdays: [...priceForm.weekdays, day.value].sort((a, b) => a - b) });
                                    } else {
                                      setPriceForm({ ...priceForm, weekdays: priceForm.weekdays.filter(d => d !== day.value) });
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{day.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Inizio</label>
                            <input
                              type="time"
                              value={priceForm.startTime}
                              onChange={(e) => setPriceForm({ ...priceForm, startTime: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Fine</label>
                            <input
                              type="time"
                              value={priceForm.endTime}
                              onChange={(e) => setPriceForm({ ...priceForm, endTime: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Prezzo (€)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={priceForm.price}
                            onChange={(e) => setPriceForm({ ...priceForm, price: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddPrice}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm font-medium transition"
                          >
                            {editingPriceRuleId ? 'Aggiorna' : 'Aggiungi'}
                          </button>
                          <button
                            onClick={() => {
                              setShowPriceForm(false);
                              setEditingPriceRuleId(null);
                              setPriceForm({ weekdays: [], startTime: '08:00', endTime: '12:00', price: 0 });
                            }}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-2 py-1 rounded text-sm font-medium transition"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    )}

                    {priceRules.length === 0 ? (
                      <p className="text-xs text-gray-500">Nessuna fascia oraria configurata</p>
                    ) : (
                      <div className="space-y-2">
                        {priceRules.map((rule) => {
                          const dayNames = rule.weekdays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label || `Giorno ${d}`).join(', ');
                          return (
                            <div key={rule.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                              <div>
                                <p className="font-medium text-gray-900">{dayNames}</p>
                                <p className="text-xs text-gray-600">{rule.startTime} - {rule.endTime}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-green-600">€{(rule.price / 100).toFixed(2)}</span>
                                <button
                                  onClick={() => handleEditPrice(rule)}
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                  title="Modifica"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePrice(rule.id)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                  title="Elimina"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveCourt}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition"
                  >
                    Salva
                  </button>
                  <button
                    onClick={() => {
                      setShowCourtModal(false);
                      setSelectedCourt(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-md font-medium transition"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Block Court Modal */}
        {selectedCourtForBlock && (
          <BlockCourtModal
            isOpen={showBlockModal}
            onClose={() => {
              setShowBlockModal(false);
              setSelectedCourtForBlock(null);
            }}
            courtId={selectedCourtForBlock.id}
            blocks={blocksMap[selectedCourtForBlock.id] || []}
            onBlockCreated={handleBlocksCreated}
          />
        )}
      </div>
    </div>
  );
}
