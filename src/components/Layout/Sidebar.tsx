import React from 'react';
import { Package, Users, Clock, BarChart3, LogOut, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useInventory } from '@/hooks/useInventory';
import { useEffect, useState, useRef } from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuario';
  const { profile, setProfile } = useProfile();
  const { getProfiles, createProfile } = useInventory();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const data = await getProfiles();
      setProfiles(data);
      if (!profile && data.length > 0) setProfile(data[0]);
      if (data.length === 0) setShowCreateForm(true);
    })();
    
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popoverOpen]);

  const handleSelect = (id: string) => {
    const selected = profiles.find(p => p.id === id) || null;
    setProfile(selected);
    setPopoverOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    await createProfile({ name: newName, address: newAddress });
    const data = await getProfiles();
    setProfiles(data);
    setNewName('');
    setNewAddress('');
    setShowCreateForm(false);
  };

  const menuItems = [
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'suppliers', label: 'Proveedores', icon: Users },
    { id: 'replenishment', label: 'Reabastecimiento', icon: ShoppingCart },
    { id: 'closing', label: 'Cierre', icon: Clock },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Error during logout:', e);
    }
  
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-27 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center space-x-2 w-full mx-auto">
            <Package className="w-10 h-10 text-white mr-2" />
            <div className="text-2xl font-bold text-white">shelf</div>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-white text-blue-700 ring-2 ring-inset ring-gray-200'
                    : 'text-gray-700 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* seleccion de usuario hasta abajo de todo */}
      <div className="p-6 border-t border-gray-200 relative">
        <div className="flex items-center space-x-3 mb-4">
          <button
            className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
            onClick={() => setPopoverOpen((v) => !v)}
            aria-label="Abrir perfiles"
          >
            <User className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
        {popoverOpen && (
          <div ref={popoverRef} className="absolute left-0 bottom-16 w-64 bg-white rounded-lg shadow-lg border p-4 z-50 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">Perfiles / Locales</span>
              <button
                className="w-7 h-7 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-full text-blue-600 text-lg font-bold"
                onClick={() => { setNewName(''); setNewAddress(''); setShowCreateForm(v => !v); }}
                title="Crear nuevo perfil"
              >
                +
              </button>
            </div>
            <ul className="mb-2 max-h-40 overflow-y-auto">
              {profiles.map((p) => (
                <li key={p.id}>
                  <button
                    className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 ${profile?.id === p.id ? 'bg-blue-100 font-semibold' : ''}`}
                    onClick={() => handleSelect(p.id)}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
            {showCreateForm && (
              <form onSubmit={handleCreate} className="flex flex-col gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Nombre del local"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="px-2 py-1 border rounded"
                />
                <input
                  type="text"
                  placeholder="Dirección (opcional)"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="px-2 py-1 border rounded"
                />
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded mt-1">Crear</button>
              </form>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 mt-4"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;