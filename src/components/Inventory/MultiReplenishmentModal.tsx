import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Supplier, Product } from '@/types';

interface MultiReplenishmentModalProps {
  supplier: Supplier;
  products: Product[];
  onClose: () => void;
  onSubmit: (selectedProducts: { productId: string; name: string; quantity: number }[]) => void;
}

const MultiReplenishmentModal: React.FC<MultiReplenishmentModalProps> = ({
  supplier,
  products,
  onClose,
  onSubmit,
}) => {
  const [selected, setSelected] = useState<{ [id: string]: { selected: boolean; quantity: string } }>(
    Object.fromEntries(products.map(p => [p.id, { selected: false, quantity: '' }]))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleCheck = (id: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [id]: { ...prev[id], selected: checked } }));
    
    // Limpiar error cuando se selecciona un producto
    if (errors.selection) {
      setErrors(prev => ({ ...prev, selection: '' }));
    }
  };

  const handleQuantity = (id: string, quantity: number | string) => {
    setSelected(prev => ({ ...prev, [id]: { ...prev[id], quantity: quantity.toString() } }));
  };

  const validateSelection = () => {
    const selectedProducts = products.filter(p => selected[p.id]?.selected);
    
    if (selectedProducts.length === 0) {
      setErrors({ selection: 'Selecciona al menos un producto' });
      return false;
    }

    // Validar cantidades
    for (const product of selectedProducts) {
      const quantity = parseFloat(selected[product.id].quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setErrors({ selection: `La cantidad para ${product.name} debe ser mayor a 0` });
        return false;
      }
      if (quantity > product.maxStock) {
        setErrors({ selection: `La cantidad para ${product.name} no puede exceder el stock máximo (${product.maxStock} ${product.unit})` });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSelection()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const toSend = products
        .filter(p => selected[p.id]?.selected)
        .map(p => ({
          productId: p.id,
          name: p.name,
          quantity: parseFloat(selected[p.id].quantity),
        }));
      
      await onSubmit(toSend);
      onClose();
    } catch (error) {
      console.error('Error al enviar solicitudes múltiples:', error);
      setErrors({ submit: 'Error al enviar las solicitudes. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0) {
      return { status: 'Agotado', color: 'text-red-600', bg: 'bg-red-50' };
    } else if (product.currentStock <= product.minStock) {
      return { status: 'Bajo', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    } else {
      return { status: 'OK', color: 'text-green-600', bg: 'bg-green-50' };
    }
  };

  const selectedCount = products.filter(p => selected[p.id]?.selected).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Solicitar Reabastecimiento a {supplier.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Selecciona los productos que necesitas reabastecer ({selectedCount} seleccionados)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.submit}
            </div>
          )}

          {errors.selection && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
              {errors.selection}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={products.every(p => selected[p.id]?.selected)}
                      onChange={(e) => {
                        products.forEach(p => {
                          handleCheck(p.id, e.target.checked);
                        });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Mínimo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad a solicitar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected[product.id]?.selected || false}
                          onChange={e => handleCheck(product.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                          {product.currentStock} {product.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {product.minStock} {product.unit}
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min={1}
                          max={product.maxStock}
                          value={selected[product.id]?.quantity || ''}
                          onChange={e => handleQuantity(product.id, e.target.value)}
                          className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                          disabled={!selected[product.id]?.selected || isSubmitting}
                          placeholder="Ej: 50"
                        />
                        <span className="text-sm text-gray-500 ml-1">{product.unit}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedCount === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Solicitud ({selectedCount})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiReplenishmentModal;
