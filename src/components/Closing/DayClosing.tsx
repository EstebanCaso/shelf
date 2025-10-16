import React, { useState, useEffect } from 'react';
import { Calendar, ShoppingCart, DollarSign } from 'lucide-react';
import { Product, Sale } from '@/types';
import SaleModal from '@/components/Closing/SaleModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DayClosingProps {
  products: Product[];
  onRecordSale: (sales: Omit<Sale, 'id'>[]) => void;
}

const DayClosing: React.FC<DayClosingProps> = ({ products, onRecordSale }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Agrupa ventas por día real
  useEffect(() => {
    // Aquí deberías cargar las ventas del día real desde la base de datos si es necesario
    // Por ahora, solo se mantiene en memoria
  }, []);

  const handleRecordSales = (sales: Omit<Sale, 'id'>[]) => {
    const newSales: Sale[] = sales.map(sale => ({
      ...sale,
      id: Date.now().toString() + Math.random(),
    }));
    setTodaySales(prev => [...prev, ...newSales]);
    onRecordSale(sales);
    setIsModalOpen(false);
  };

  const handleSaveDayClosing = async () => {
    if (!user) return;
    const totalSales = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalValue = todaySales.reduce((sum, sale) => sum + sale.totalValue, 0);
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('day_closings').insert({
      date: today,
      total_sales: totalSales,
      total_value: totalValue,
      closed_by: user.id,
    });
    if (error) {
      alert('Error al guardar el cierre: ' + error.message);
    } else {
      alert('Cierre del día guardado exitosamente.');
    }
  };

  const totalSales = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalValue = todaySales.reduce((sum, sale) => sum + sale.totalValue, 0);

  const availableProducts = products.filter(product => product.currentStock > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cierre del Día</h2>
              <p className="text-sm text-gray-600 capitalize">{todayDate}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-md hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              disabled={availableProducts.length === 0}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Registrar Ventas</span>
            </button>
          </div>
        </div>

        {availableProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-500">Agrega productos al inventario para registrar ventas</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Fecha</p>
                    <p className="text-2xl font-bold text-blue-700">{today}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <ShoppingCart className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Total Vendido</p>
                    <p className="text-2xl font-bold text-green-700">{totalSales} productos</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Valor Total</p>
                    <p className="text-2xl font-bold text-yellow-700">${totalValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {todaySales.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas del Día</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hora
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {todaySales.map((sale) => {
                        const product = products.find(p => p.id === sale.productId);
                        return (
                          <tr key={sale.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product?.name || 'Producto no encontrado'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {sale.quantity} {product?.unit || ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${sale.totalValue.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sale.date).toLocaleTimeString('es-ES')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={handleSaveDayClosing}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                >
                  Guardar cierre del día
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <SaleModal
          products={availableProducts}
          onSave={handleRecordSales}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DayClosing;