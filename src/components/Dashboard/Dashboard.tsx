import React, { useState, useEffect } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useReplenishment } from '@/hooks/useReplenishment';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import InventoryTable from '@/components/Inventory/InventoryTable';
import SuppliersTable from '@/components/Suppliers/SuppliersTable';
import DayClosing from '@/components/Closing/DayClosing';
import ReportsView from '@/components/Reports/ReportsView';
import ReplenishmentRequests from '@/components/Inventory/ReplenishmentRequests';
import { useProfile } from '@/contexts/ProfileContext';
import InitialProfileSelector from '@/components/Layout/InitialProfileSelector';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [refreshReplenishment, setRefreshReplenishment] = useState(0);
  const { user } = useAuth();
  const {
    products,
    suppliers,
    sales,
    alerts,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    recordSales,
    loadData,
  } = useInventory();

  const { createReplenishmentRequest } = useReplenishment();
  const { profile } = useProfile();

  // Efecto para crear proveedor default si no hay ninguno
  useEffect(() => {
    if (user && !isLoading) {
      // Verifica si existe un proveedor con nombre 'default_'
      const hasDefault = suppliers.some(s => s.name === 'default');
      if (!hasDefault) {
        const defaultSupplier = {
          name: 'default',
          contact: user.user_metadata?.username || user.email || 'Administrador',
          phone: user.user_metadata?.phone || '',
          email: user.email || '',
          address: profile?.address || '',
        };
        addSupplier(defaultSupplier)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, suppliers, isLoading]);

  // Efecto para recargar datos al abrir la pestaña de inventario
  useEffect(() => {
    if (activeTab === 'inventory') {
      loadData();
      handleReplenishmentRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Título dinámico según la pestaña activa
  const tabTitles: Record<string, string> = {
    inventory: 'Inventario',
    suppliers: 'Proveedores',
    replenishment: 'Reabastecimiento',
    closing: 'Cierre del Día',
    reports: 'Reportes',
  };
  const currentTitle = tabTitles[activeTab] || 'Dashboard';

  // Función para ir a reportes
  const goToReports = () => setActiveTab('reports');

  // Función para manejar solicitudes de reabastecimiento
  const handleReplenishmentRequest = async (productId: string, quantity: number, supplierId: string) => {
    try {
      const result = await createReplenishmentRequest(productId, quantity, supplierId);
      if (result) {
        // Recargar solicitudes
        setRefreshReplenishment(prev => prev + 1);
      } else {
        alert('Error al enviar la solicitud de reabastecimiento');
      }
    } catch (error) {
      console.error('Error en solicitud de reabastecimiento:', error);
      alert('Error al enviar la solicitud de reabastecimiento');
    }
  };

  // Función para recargar solicitudes
  const handleReplenishmentRefresh = () => {
    setRefreshReplenishment(prev => prev + 1);
  };

  if (!profile) {
    return <InitialProfileSelector />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <InventoryTable
            products={products}
            suppliers={suppliers}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onRequestReplenishment={handleReplenishmentRequest}
            onDataReload={() => {
              loadData();
              handleReplenishmentRefresh();
            }}
          />
        );
      case 'suppliers':
        return (
          <SuppliersTable
            suppliers={suppliers}
            onAddSupplier={addSupplier}
            onUpdateSupplier={updateSupplier}
            onDeleteSupplier={deleteSupplier}
          />
        );
      case 'replenishment':
        return <ReplenishmentRequests key={refreshReplenishment} />;
      case 'closing':
        return (
          <DayClosing
            products={products}
            onRecordSale={recordSales}
          />
        );
      case 'reports':
        return (
          <ReportsView
            products={products}
            sales={sales}
            alerts={alerts}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header alerts={alerts} title={currentTitle} onGoToReports={goToReports} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;