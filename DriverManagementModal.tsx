import React, { useState, useEffect } from 'react';
import { TitularDriver } from '../types';
import { EditIcon, DeleteIcon } from './icons';

interface DriverManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    drivers: TitularDriver[];
    onSave: (driver: Omit<TitularDriver, 'id'>, id?: string) => void;
    onDelete: (id: string) => void;
}

const DriverManagementModal: React.FC<DriverManagementModalProps> = ({ isOpen, onClose, drivers, onSave, onDelete }) => {
    const [name, setName] = useState('');
    const [zone, setZone] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            clearForm();
        }
    }, [isOpen]);

    const clearForm = () => {
        setName('');
        setZone('');
        setEditingId(null);
    };

    const handleEdit = (driver: TitularDriver) => {
        setEditingId(driver.id);
        setName(driver.name);
        setZone(driver.zone);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !zone.trim()) {
            alert('Nombre y Zona son obligatorios.');
            return;
        }
        onSave({ name, zone }, editingId || undefined);
        clearForm();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestionar Conductores Titulares</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Añade o edita conductores para autocompletar su zona.</p>
                </div>
                
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{editingId ? 'Editar Conductor' : 'Añadir Conductor'}</h3>
                         <div>
                            <label htmlFor="driver-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                            <input id="driver-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="driver-zone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Zona Asignada</label>
                            <input id="driver-zone" type="text" value={zone} onChange={e => setZone(e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                                {editingId ? 'Actualizar' : 'Guardar Conductor'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={clearForm} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500">
                                    Cancelar Edición
                                </button>
                            )}
                        </div>
                    </form>
                    
                    {/* List Section */}
                    <div className="space-y-2">
                         <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Lista de Conductores</h3>
                         <div className="max-h-64 overflow-y-auto pr-2">
                             {drivers.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">No hay conductores titulares guardados.</p>
                             ) : (
                                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {drivers.map(driver => (
                                        <li key={driver.id} className="py-2 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{driver.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{driver.zone}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleEdit(driver)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><EditIcon className="w-4 h-4" /></button>
                                                <button onClick={() => onDelete(driver.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><DeleteIcon className="w-4 h-4" /></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                             )}
                         </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-right rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverManagementModal;
