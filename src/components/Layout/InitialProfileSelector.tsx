import React, { useEffect, useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useProfile } from '@/contexts/ProfileContext';
import { Profile } from '@/types';

const InitialProfileSelector: React.FC = () => {
  const { getProfiles, createProfile } = useInventory();
  const { setProfile } = useProfile();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = () => {
    if (!selectedProfileId) return;
    const selected = profiles.find(p => p.id === selectedProfileId);
    if (selected) {
      setProfile(selected);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    try {
      await createProfile({ name: newName.trim(), address: newAddress.trim() });
      await loadProfiles(); // Recargar perfiles
      setNewName('');
      setNewAddress('');
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          {profiles.length === 0 ? 'Crear tu primer perfil/local' : 'Selecciona un perfil/local'}
        </h2>
        
        {profiles.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Perfiles existentes:
            </label>
            <select
              value={selectedProfileId}
              onChange={e => setSelectedProfileId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Selecciona un perfil --</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selectedProfileId && (
              <button
                onClick={handleSelect}
                className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Continuar con este perfil
              </button>
            )}
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">
            {profiles.length === 0 ? 'Crear perfil' : 'O crear uno nuevo'}
          </h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del local *
              </label>
              <input
                type="text"
                placeholder="Ej: Mi Tienda"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Calle Principal 123"
                value={newAddress}
                onChange={e => setNewAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {profiles.length === 0 ? 'Crear y continuar' : 'Crear perfil'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InitialProfileSelector;
