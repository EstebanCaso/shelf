import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Product, Supplier } from '@/types';
import ProductModal from '@/components/Inventory/ProductModal';
import ReplenishmentModal from '@/components/Inventory/ReplenishmentModal';
import MultiReplenishmentModal from '@/components/Inventory/MultiReplenishmentModal';
import { useReplenishment } from '@/hooks/useReplenishment';

interface InventoryTableProps {
  products: Product[];
  suppliers: Supplier[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onRequestReplenishment?: (productId: string, quantity: number, supplierId: string) => Promise<void>;
  onDataReload?: () => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  suppliers,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRequestReplenishment,
  onDataReload,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isReplenishmentModalOpen, setIsReplenishmentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [multiModalSupplier, setMultiModalSupplier] = useState<Supplier | null>(null);
  const [multiModalProducts, setMultiModalProducts] = useState<Product[]>([]);
  const { createMultiReplenishmentRequest } = useReplenishment();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSave = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productData);
    } else {
      onAddProduct(productData);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      onDeleteProduct(id);
    }
  };

  const handleRequestReplenishment = (product: Product) => {
    setSelectedProduct(product);
    setIsReplenishmentModalOpen(true);
  };

  const handleReplenishmentSubmit = async (productId: string, quantity: number, supplierId: string) => {
    if (onRequestReplenishment) {
      await onRequestReplenishment(productId, quantity, supplierId);
    }
  };

  const handleOpenMultiModal = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setMultiModalSupplier(supplier);
      setMultiModalProducts(products.filter(p => p.supplierId === supplierId));
    }
  };

  const handleMultiSubmit = async (selectedProducts: { productId: string; name: string; quantity: number }[]) => {
    if (!multiModalSupplier) return;
    const result = await createMultiReplenishmentRequest(multiModalSupplier.id, selectedProducts);
    setMultiModalSupplier(null);
    setMultiModalProducts([]);
    
    if (result) {
      // Recargar datos para actualizar la pestaña de reabastecimiento
       // Mostrar notificación de éxito 
      alert('Solicitud de reabastecimiento múltiple enviada exitosamente');

      if (onDataReload) {
        onDataReload();
      }
    } else {
      alert('Error al enviar la solicitud de reabastecimiento múltiple');
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0) {
      return { status: 'out', color: 'text-red-600', bg: 'bg-gradient-to-r from-red-50 to-red-100' };
    } else if (product.currentStock <= product.minStock) {
      return { status: 'low', color: 'text-yellow-600', bg: 'bg-gradient-to-r from-yellow-50 to-orange-50' };
    } else {
      return { status: 'good', color: 'text-green-600', bg: 'bg-gradient-to-r from-green-50 to-emerald-50' };
    }
  };

  const getSupplier = (product: Product) => {
    return suppliers.find(s => s.id === product.supplierId);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Inventario</h2>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
          <p className="text-gray-500 mb-4">Comienza agregando productos a tu inventario</p>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            Agregar Primer Producto
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Mínimo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const supplier = getSupplier(product);
                const showReplenishmentButton = stockStatus.status === 'low' || stockStatus.status === 'out';
                
                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.sku && (
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                          {product.currentStock} {product.unit}
                        </span>
                        {stockStatus.status !== 'good' && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.minStock} {product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier?.name || 'Sin proveedor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {showReplenishmentButton && supplier && (
                          <button
                            onClick={() => handleRequestReplenishment(product)}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Solicitar reabastecimiento"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          suppliers={suppliers}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {isReplenishmentModalOpen && selectedProduct && (
        <ReplenishmentModal
          product={selectedProduct}
          supplier={getSupplier(selectedProduct)!}
          onClose={() => {
            setIsReplenishmentModalOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleReplenishmentSubmit}
        />
      )}

      {/* Botones para reabastecimiento múltiple por proveedor */}
      <div className="flex flex-col gap-4 p-4">
        {suppliers.map((supplier) => {
          // Filtrar productos de bajo stock para este proveedor (incluyendo stock 0)
          const lowStockProducts = products.filter(
            p => p.supplierId === supplier.id && p.currentStock <= p.minStock
          );
          if (lowStockProducts.length === 0) return null;
          return (
            <button
              key={supplier.id}
              onClick={() => handleOpenMultiModal(supplier.id)}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-white rounded-lg font-semibold shadow hover:from-orange-500 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105"
            >
              <span className="mr-2">🛒</span>
              Reabastecer productos de {supplier.name} ({lowStockProducts.length} productos)
            </button>
          );
        })}
      </div>
      {multiModalSupplier && (
        <MultiReplenishmentModal
          supplier={multiModalSupplier}
          products={multiModalProducts}
          onClose={() => setMultiModalSupplier(null)}
          onSubmit={handleMultiSubmit}
        />
      )}
    </div>
  );
};

export default InventoryTable;