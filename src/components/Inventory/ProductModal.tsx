import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Product, Supplier } from '@/types';

interface ProductModalProps {
  product: Product | null;
  suppliers: Supplier[];
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, suppliers, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unitPrice: '',
    supplierId: '',
    description: '',
    sku: '',
    unit: 'pieces',
    profileId: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        currentStock: product.currentStock.toString(),
        minStock: product.minStock.toString(),
        maxStock: product.maxStock.toString(),
        unitPrice: product.unitPrice.toString(),
        supplierId: product.supplierId,
        description: product.description || '',
        sku: product.sku || '',
        unit: product.unit,
        profileId: product.profileId || '',
      });
    } else {
      setFormData({
        name: '',
        category: '',
        currentStock: '',
        minStock: '',
        maxStock: '',
        unitPrice: '',
        supplierId: '',
        description: '',
        sku: '',
        unit: 'pieces',
        profileId: '',
      });
    }
    setErrors({});
  }, [product]);

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
    
    // Focus en el primer input
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.supplierId) {
      newErrors.supplierId = 'Debes seleccionar un proveedor';
    }

    const currentStock = parseFloat(formData.currentStock);
    const minStock = parseFloat(formData.minStock);
    const maxStock = parseFloat(formData.maxStock);
    const unitPrice = parseFloat(formData.unitPrice);

    if (isNaN(currentStock) || currentStock < 0) {
      newErrors.currentStock = 'El stock actual no puede ser negativo';
    }

    if (isNaN(minStock) || minStock < 0) {
      newErrors.minStock = 'El stock mínimo no puede ser negativo';
    }

    if (isNaN(maxStock) || maxStock <= 0) {
      newErrors.maxStock = 'El stock máximo debe ser mayor a 0';
    }

    if (!isNaN(maxStock) && !isNaN(minStock) && maxStock < minStock) {
      newErrors.maxStock = 'El stock máximo debe ser mayor al stock mínimo';
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      newErrors.unitPrice = 'El precio unitario no puede ser negativo';
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
      await onSave({
        ...formData,
        currentStock: parseFloat(formData.currentStock) || 0,
        minStock: parseFloat(formData.minStock) || 0,
        maxStock: parseFloat(formData.maxStock) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
      });
      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setErrors({ submit: 'Error al guardar el producto. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            {product ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                required
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SKU-001"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
                required
                disabled={isSubmitting}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              >
                <option value="pieces">Piezas</option>
                <option value="kg">Kilogramos</option>
                <option value="liters">Litros</option>
                <option value="boxes">Cajas</option>
                <option value="meters">Metros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Actual *
              </label>
              <input
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.currentStock ? 'border-red-300' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
                required
                placeholder="Ej: 100"
                disabled={isSubmitting}
              />
              {errors.currentStock && (
                <p className="mt-1 text-sm text-red-600">{errors.currentStock}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo *
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.minStock ? 'border-red-300' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
                required
                placeholder="Ej: 10"
                disabled={isSubmitting}
              />
              {errors.minStock && (
                <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Máximo *
              </label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.maxStock ? 'border-red-300' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
                required
                placeholder="Ej: 500"
                disabled={isSubmitting}
              />
              {errors.maxStock && (
                <p className="mt-1 text-sm text-red-600">{errors.maxStock}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario *
              </label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.unitPrice ? 'border-red-300' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
                required
                placeholder="Ej: 25.50"
                disabled={isSubmitting}
              />
              {errors.unitPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor *
              </label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.supplierId ? 'border-red-300' : 'border-gray-300'
                }`}
                required
                disabled={isSubmitting}
              >
                <option value="">Selecciona un proveedor</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplierId && (
                <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción detallada del producto"
              disabled={isSubmitting}
            />
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
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{product ? 'Actualizar' : 'Agregar'} Producto</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;