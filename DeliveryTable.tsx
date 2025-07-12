
import React, { useState, useMemo } from 'react';
import { DeliveryRecord } from '../types';
import { EditIcon, DeleteIcon, SortIcon } from './icons';

interface DeliveryTableProps {
    records: DeliveryRecord[];
    onEdit: (record: DeliveryRecord) => void;
    onDelete: (id: string) => void;
    isReadOnly: boolean;
}

type SortKey = 'driverName' | 'totalPackages';
type SortOrder = 'asc' | 'desc';

const DeliveryTable: React.FC<DeliveryTableProps> = ({ records, onEdit, onDelete, isReadOnly }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('driverName');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const sortedAndFilteredRecords = useMemo(() => {
        const filtered = records.filter(record =>
            record.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.locations.some(loc => loc.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return filtered.sort((a, b) => {
            let valA, valB;
            if (sortKey === 'totalPackages') {
                valA = a.systemPackages + a.offSystemPackages;
                valB = b.systemPackages + b.offSystemPackages;
            } else {
                valA = a.driverName.toLowerCase();
                valB = b.driverName.toLowerCase();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [records, searchTerm, sortKey, sortOrder]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };
    
    const ThWithSort: React.FC<{ sortKeyName: SortKey; children: React.ReactNode }> = ({ sortKeyName, children }) => (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
            <button onClick={() => handleSort(sortKeyName)} className="flex items-center gap-2 group">
                {children}
                <SortIcon className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-opacity ${sortKey === sortKeyName ? 'opacity-100' : 'opacity-30'}`} />
            </button>
        </th>
    );

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Registros de la Planilla</h3>
                <input
                    type="text"
                    placeholder="Buscar registros..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700 hidden md:table-header-group">
                        <tr>
                            <ThWithSort sortKeyName="driverName">Conductor (Zona)</ThWithSort>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Suplente</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Localidades</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">P. Sistema</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">P. Fuera</th>
                            <ThWithSort sortKeyName="totalPackages">Total Paquetes</ThWithSort>
                            {!isReadOnly && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {sortedAndFilteredRecords.map(record => (
                            <tr key={record.id} className="block md:table-row border-b md:border-none mb-4 md:mb-0 p-4 md:p-0 rounded-lg shadow-md md:shadow-none">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white block md:table-cell"><span className="md:hidden font-bold">Conductor: </span>{record.driverName} <span className="text-slate-500 dark:text-slate-400">({record.zone})</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300 block md:table-cell"><span className="md:hidden font-bold">Suplente: </span>{record.isSubstitute ? 'Sí' : 'No'}</td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300 block md:table-cell"><span className="md:hidden font-bold mb-1">Localidades: </span><div className="flex flex-wrap gap-1">{record.locations.map(loc => <span key={loc} className="px-2 py-1 text-xs bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200 rounded-full">{loc}</span>)}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300 block md:table-cell"><span className="md:hidden font-bold">Paquetes Sistema: </span>{record.systemPackages}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300 block md:table-cell"><span className="md:hidden font-bold">Paquetes Fuera: </span>{record.offSystemPackages}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-brand-600 dark:text-brand-400 block md:table-cell"><span className="md:hidden font-bold">Total Paquetes: </span>{record.systemPackages + record.offSystemPackages}</td>
                                {!isReadOnly && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium block md:table-cell">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => onEdit(record)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" aria-label={`Editar ${record.driverName}`}><EditIcon /></button>
                                            <button onClick={() => onDelete(record.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" aria-label={`Eliminar ${record.driverName}`}><DeleteIcon /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedAndFilteredRecords.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-slate-500 dark:text-slate-400">No se encontraron registros.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryTable;
