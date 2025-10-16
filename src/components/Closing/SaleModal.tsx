import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Product, Sale } from '@/types';

interface SaleModalProps {
  products: Product[];
  onSave: (sales: Omit<Sale, 'id'>[]) => void;
  onClose: () => void;
}

interface SaleLine {
  productId: string;
  quantity: string;
}

const SaleModal: React.FC<SaleModalProps> = ({ products, onSave, onClose }) => {
  const [lines, setLines] = useState<SaleLine[]>([
    { productId: '', quantity: '' },
  ]);
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

  const handleLineChange = (idx: number, field: keyof SaleLine, value: string | number) => {
    setLines((prev) =>
      prev.map((line, i) =>
        i === idx ? { ...line, [field]: field === 'quantity' ? value.toString() : value } : line
      )
    );
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[`line_${idx}`]) {
      setErrors(prev => ({ ...prev, [`line_${idx}`]: '' }));
    }
  };

  const handleAddLine = () => {
    setLines((prev) => [...prev, { productId: '', quantity: '' }]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length > 1) {
      setLines((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let hasValidLines = false;

    lines.forEach((line, idx) => {
      if (!line.productId) {
        newErrors[`line_${idx}`] = 'Selecciona un producto';
        return;
      }

      const quantity = parseFloat(line.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors[`line_${idx}`] = 'La cantidad debe ser mayor a 0';
        return;
      }

      const product = products.find((p) => p.id === line.productId);
      if (!product) {
        newErrors[`line_${idx}`] = 'Producto no encontrado';
        return;
      }

      if (quantity > product.currentStock) {
        newErrors[`line_${idx}`] = `Stock insuficiente. Disponible: ${product.currentStock} ${product.unit}`;
        return;
      }

      hasValidLines = true;
    });

    if (!hasValidLines) {
      newErrors.general = 'Agrega al menos un producto válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validLines = lines.filter(
        (line) => line.productId && parseFloat(line.quantity) > 0 &&
          products.find((p) => p.id === line.productId && p.currentStock >= parseFloat(line.quantity))
      );
      
      const sales: Omit<Sale, 'id'>[] = validLines.map((line) => {
        const product = products.find((p) => p.id === line.productId)!;
        return {
          productId: line.productId,
          quantity: parseFloat(line.quantity),
          date: new Date(),
          totalValue: parseFloat(line.quantity) * product.unitPrice,
        };
      });
      
      await onSave(sales);
      onClose();
    } catch (error) {
      console.error('Error al registrar ventas:', error);
      setErrors({ submit: 'Error al registrar las ventas. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalValue = () => {
    return lines.reduce((total, line) => {
      const product = products.find((p) => p.id === line.productId);
      return total + (product ? parseFloat(line.quantity) * product.unitPrice : 0);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg max-w-lg w-full shadow-xl"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Registrar Ventas</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.submit}
            </div>
          )}

          {errors.general && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}

          {lines.map((line, idx) => {
            const selectedProduct = products.find((p) => p.id === line.productId);
            const maxQuantity = selectedProduct ? selectedProduct.currentStock : 0;
            return (
              <div key={idx} className="flex items-end space-x-2 border-b pb-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                  <select
                    value={line.productId}
                    onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors[`line_${idx}`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock: {product.currentStock} {product.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col items-end w-36">
                  <label className="block text-sm font-medium text-gray-700 mb-1 w-full">Cantidad *</label>
                  <div className="flex items-center w-full">
                    <input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors[`line_${idx}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      min="1"
                      max={maxQuantity}
                      required
                      placeholder="Ej: 2"
                      disabled={isSubmitting}
                    />
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0 disabled:opacity-50"
                        style={{ marginBottom: '2px' }}
                        title="Eliminar"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {errors[`line_${idx}`] && (
                  <div className="w-full mt-1">
                    <p className="text-sm text-red-600">{errors[`line_${idx}`]}</p>
                  </div>
                )}
              </div>
            );
          })}
          
          <button 
            type="button" 
            onClick={handleAddLine} 
            className="flex items-center text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-1" /> Agregar otro producto
          </button>

          {/* Resumen del total */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="font-medium text-orange-900 mb-2">Total de la venta</h4>
            <p className="text-lg font-bold text-orange-700">${getTotalValue().toFixed(2)}</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <span>Registrar Ventas</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleModal;