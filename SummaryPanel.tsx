
import React from 'react';
import { DeliveryRecord } from '../types';

interface SummaryPanelProps {
    records: DeliveryRecord[];
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ records }) => {
    const totalDrivers = records.length;
    const totalSubstitutes = records.filter(r => r.isSubstitute).length;
    const totalPackages = records.reduce((sum, r) => sum + r.systemPackages + r.offSystemPackages, 0);

    const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{value}</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total de Conductores" value={totalDrivers} />
            <StatCard label="Total de Suplentes" value={totalSubstitutes} />
            <StatCard label="Suma Total de Paquetes" value={totalPackages} />
        </div>
    );
};

export default SummaryPanel;
