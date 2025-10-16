import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { Product, Sale, StockAlert, DayClosing } from '@/types';
import { supabase } from '@/lib/supabase';

interface ReportsViewProps {
  products: Product[];
  sales: Sale[];
  alerts: StockAlert[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ products,}) => {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.unitPrice), 0);
  const lowStockProducts = products.filter(product => product.currentStock <= product.minStock);
  const outOfStockProducts = products.filter(product => product.currentStock <= 0);

  const topCategories = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryEntries = Object.entries(topCategories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const [dayClosings, setDayClosings] = useState<DayClosing[]>([]);
  useEffect(() => {
    const fetchClosings = async () => {
      const { data, error } = await supabase
        .from('day_closings')
        .select('*')
        .order('date', { ascending: false });
      if (!error && data) {
        setDayClosings(data.map(row => ({
          id: row.id,
          date: row.date,
          totalSales: row.total_sales,
          totalValue: row.total_value,
          closedBy: row.closed_by,
          createdAt: row.created_at,
        })));
      }
    };
    fetchClosings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="w-12 h-12 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="w-12 h-12 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="w-12 h-12 text-red-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Stock</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockProducts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Productos con Stock Bajo</h3>
          </div>
          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay productos con stock bajo</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 10).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {product.currentStock} {product.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mín: {product.minStock} {product.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Categorías Principales</h3>
          </div>
          <div className="p-6">
            {categoryEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay categorías disponibles</p>
            ) : (
              <div className="space-y-3">
                {categoryEntries.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">{category}</span>
                    <span className="text-gray-600">{count} productos</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {products.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Inventario</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.slice(0, 10).map((product) => {
                  const isLowStock = product.currentStock <= product.minStock;
                  const isOutOfStock = product.currentStock <= 0;
                  
                  return (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.currentStock} {product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(product.currentStock * product.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Sin Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            En Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historial de cierres de día */}
      <div className="bg-white rounded-lg shadow mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Cierres de Día</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vendido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dayClosings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">No hay cierres registrados</td>
                </tr>
              ) : (
                dayClosings.map((closing) => (
                  <tr key={closing.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(closing.date).toLocaleDateString('es-ES')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{closing.totalSales}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${closing.totalValue.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;