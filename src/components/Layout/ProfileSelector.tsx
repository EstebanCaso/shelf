import React, { useEffect, useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useProfile } from '@/contexts/ProfileContext';
import { Profile } from '@/types';

const ProfileSelector: React.FC = () => {
  const { getProfiles, createProfile } = useInventory();
  const { profile, setProfile } = useProfile();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getProfiles();
      setProfiles(data);
      if (!profile && data.length > 0) setProfile(data[0]);
    })();
    // eslint-disable-next-line
  }, []);

  const handleSelect = (id: string) => {
    const selected = profiles.find(p => p.id === id) || null;
    setProfile(selected);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    await createProfile({ name: newName, address: newAddress });
    const data = await getProfiles();
    setProfiles(data);
    setNewName('');
    setNewAddress('');
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona un local/sucursal:</label>
      <select
        value={profile?.id || ''}
        onChange={e => handleSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
      >
        <option value="">-- Selecciona --</option>
        {profiles.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <form onSubmit={handleCreate} className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Nuevo local"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="flex-1 px-2 py-1 border rounded"
        />
        <input
          type="text"
          placeholder="Dirección (opcional)"
          value={newAddress}
          onChange={e => setNewAddress(e.target.value)}
          className="flex-1 px-2 py-1 border rounded"
        />
        <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded">Crear</button>
      </form>
    </div>
  );
};

export default ProfileSelector;
