import React, { useState, useEffect, useRef } from 'react';
import { X, Package, AlertTriangle, Send } from 'lucide-react';
import { Product, Supplier } from '@/types';

interface ReplenishmentModalProps {
  product: Product;
  supplier: Supplier;
  onClose: () => void;
  onSubmit: (productId: string, quantity: number, supplierId: string) => void;
}

const ReplenishmentModal: React.FC<ReplenishmentModalProps> = ({
  product,
  supplier,
  onClose,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState<number>(product.minStock * 2); // Sugerencia inicial
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

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
    
    // Focus en el input de cantidad
    if (quantityInputRef.current) {
      quantityInputRef.current.focus();
    }

    // Sugerencia inicial si el producto cambia, es el doble del stock minimo q se pone
    setQuantity(product.minStock * 2);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, product]);

  const validateQuantity = () => {
    if (quantity <= 0) {
      setErrors({ quantity: 'La cantidad debe ser mayor a 0' });
      return false;
    }
    if (quantity > product.maxStock) {
      setErrors({ quantity: `La cantidad no puede exceder el stock máximo (${product.maxStock} ${product.unit})` });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateQuantity()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(product.id, quantity, supplier.id);
      onClose();
    } catch (error) {
      console.error('Error al enviar solicitud de reabastecimiento:', error);
      setErrors({ submit: 'Error al enviar la solicitud. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    setQuantity(newQuantity);
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: '' }));
    }
  };

  const maxStock = product.maxStock;
  const currentStock = product.currentStock;
  const minStock = product.minStock;
  const suggestedQuantities: number[] = [
    Number(minStock) * 2,
    Number(minStock) * 3,
    Number(maxStock) - Number(currentStock),
    Number(maxStock)
  ].filter((q: number) => q > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Solicitar Reabastecimiento</h3>
                <p className="text-sm text-gray-500">Producto con bajo stock</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.submit}
            </div>
          )}

          {/* Información del producto */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-500">
                  Stock actual: {product.currentStock} {product.unit} | 
                  Mínimo: {product.minStock} {product.unit}
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Stock bajo detectado
                </span>
              </div>
            </div>
          </div>

          {/* Información del proveedor */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Proveedor</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900">{supplier.name}</p>
              <p className="text-sm text-gray-600">{supplier.contact}</p>
              {supplier.phone && (
                <p className="text-sm text-gray-600">Tel: {supplier.phone}</p>
              )}
              {supplier.email && (
                <p className="text-sm text-gray-600">Email: {supplier.email}</p>
              )}
            </div>
          </div>

          {/* Cantidad a solicitar */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block font-medium text-gray-900 mb-2">
              Cantidad a solicitar ({product.unit})
            </label>
            <input
              ref={quantityInputRef}
              type="number"
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min={1}
              max={maxStock}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.quantity ? 'border-red-300' : 'border-gray-300'
              }`}
              required
              placeholder="Ej: 50"
              disabled={isSubmitting}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
            
            {/* Cantidades sugeridas */}
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Cantidades sugeridas:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuantities.map((suggestedQty, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setQuantity(suggestedQty)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {suggestedQty} {product.unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">Resumen de la solicitud</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Producto:</span> {product.name}</p>
              <p><span className="font-medium">Cantidad:</span> {quantity} {product.unit}</p>
              <p><span className="font-medium">Proveedor:</span> {supplier.name}</p>
              <p><span className="font-medium">Precio unitario:</span> ${product.unitPrice.toFixed(2)}</p>
              <p><span className="font-medium">Total estimado:</span> ${(quantity * product.unitPrice).toFixed(2)}</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Solicitud</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplenishmentModal; 