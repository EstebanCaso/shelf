import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Users, Phone, Mail, MapPin } from 'lucide-react';
import { Supplier } from '@/types';
import SupplierModal from '@/components/Suppliers/SupplierModal';

interface SuppliersTableProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  onUpdateSupplier: (id: string, updates: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
}

const SuppliersTable: React.FC<SuppliersTableProps> = ({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleSave = (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    if (editingSupplier) {
      onUpdateSupplier(editingSupplier.id, supplierData);
    } else {
      onAddSupplier(supplierData);
    }
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      onDeleteSupplier(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Proveedores</h2>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-md hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Proveedor</span>
          </button>
        </div>
      </div>

      {suppliers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proveedores</h3>
          <p className="text-gray-500 mb-4">Agrega proveedores para gestionar tu inventario</p>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-md hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
          >
            Agregar Primer Proveedor
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.contact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      {supplier.phone && (
                        <>
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {supplier.phone}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      {supplier.email && (
                        <>
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {supplier.email}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      {supplier.address && (
                        <>
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate max-w-xs">{supplier.address}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <SupplierModal
          supplier={editingSupplier}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSupplier(null);
          }}
        />
      )}
    </div>
  );
};

export default SuppliersTable;