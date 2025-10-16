import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Package,Trash2 } from 'lucide-react';
import { ReplenishmentRequest } from '@/types';
import { useReplenishment } from '@/hooks/useReplenishment';
import { useInventory } from '@/hooks/useInventory';

const ReplenishmentRequests: React.FC<{ onRequestCreated?: () => void }> = ({ onRequestCreated }) => {
  const [requests, setRequests] = useState<ReplenishmentRequest[]>([]);
  const { loading, error, getReplenishmentRequests, updateReplenishmentStatus, deleteReplenishmentRequest } = useReplenishment();
  const { loadData } = useInventory();

  useEffect(() => {
    loadRequests();
  }, []);

  // Exponer la función loadRequests para que otros componentes puedan llamarla
  useEffect(() => {
    if (onRequestCreated) {
      onRequestCreated = loadRequests;
    }
  }, [onRequestCreated]);

  const loadRequests = async () => {
    const data = await getReplenishmentRequests();
    setRequests(data);
  };

  const handleStatusUpdate = async (request: ReplenishmentRequest, newStatus: ReplenishmentRequest['status']) => {
    // Asegurar que el productId sea correcto
    const productId = request.productId || request.product?.id;
    if (!productId) {
      alert('Error: No se pudo determinar el producto asociado a la solicitud.');
      return;
    }
    const success = await updateReplenishmentStatus(
      request.id,
      newStatus,
      undefined,
      productId,
      request.quantity
    );
    if (success) {
      await loadRequests();
      await loadData(); // Recargar productos para actualizar el stock en la UI
      if (newStatus === 'approved') {
        
      }
    } else {
      alert('Ocurrió un error al actualizar la solicitud.');
    }
  };

  const handleDelete = async (requestId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) {
      const success = await deleteReplenishmentRequest(requestId);
      if (success) {
        await loadRequests();
      }
    }
  };

  const getStatusIcon = (status: ReplenishmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ReplenishmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ReplenishmentRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      case 'completed':
        return 'Completada';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Solicitudes de Reabastecimiento</h2>
          <button
            onClick={loadRequests}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
          <p className="text-gray-500">No se han realizado solicitudes de reabastecimiento</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos solicitados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ul>
                      {Array.isArray(request.products) && request.products.length > 0 ? (
                        request.products.map((prod: any) => (
                          <li key={prod.productId}>
                            <span className="font-medium">{prod.name}</span> — {prod.quantity} unidades
                          </li>
                        ))
                      ) : (
                        <li>
                          {request.product?.name || 'Producto no encontrado'} — {request.quantity} {request.product?.unit || 'unidades'}
                        </li>
                      )}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.supplier?.name || 'Proveedor no encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.requestedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-4">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(request, 'approved')}
                            className="text-green-600 hover:text-green-900 transition-colors px-4 py-2 text-lg rounded-lg border border-green-200 bg-green-50"
                            title="Aprobar solicitud"
                          >
                            <CheckCircle className="w-6 h-6 mr-1" /> Aprobar
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request, 'rejected')}
                            className="text-red-600 hover:text-red-900 transition-colors px-4 py-2 text-lg rounded-lg border border-red-200 bg-red-50"
                            title="Rechazar solicitud"
                          >
                            <XCircle className="w-6 h-6 mr-1" /> Rechazar
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(request, 'completed')}
                          className="text-blue-600 hover:text-blue-900 transition-colors px-4 py-2 text-lg rounded-lg border border-blue-200 bg-blue-50"
                          title="Marcar como completada"
                        >
                          <CheckCircle className="w-6 h-6 mr-1" /> Completar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 text-lg rounded-lg border border-gray-200 bg-gray-50"
                        title="Eliminar solicitud"
                      >
                        <Trash2 className="w-6 h-6 mr-1" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReplenishmentRequests; 