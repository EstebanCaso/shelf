import React from 'react';
import { Bell } from 'lucide-react';
import { StockAlert } from '@/types';

interface HeaderProps {
  alerts: StockAlert[];
  title: string;
  onGoToReports: () => void;
}

const Header: React.FC<HeaderProps> = ({ alerts, title, onGoToReports }) => {
  const activeAlerts = alerts.filter(alert => alert.isActive);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {activeAlerts.length > 0 && (
            <button
              onClick={onGoToReports}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 px-3 py-1 rounded-full border border-red-200 hover:from-orange-100 hover:to-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">{activeAlerts.length} alertas</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;