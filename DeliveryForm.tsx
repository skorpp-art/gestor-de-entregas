
import React, { useState, useEffect, useMemo } from 'react';
import { DeliveryRecord, DriverZoneMap } from '../types';
import TagInput from './TagInput';

interface DeliveryFormProps {
    onSave: (record: Omit<DeliveryRecord, 'id'>, id?: string) => void;
    editingRecord: DeliveryRecord | null;
    clearForm: () => void;
    driverZoneMap: DriverZoneMap;
    disabled: boolean;
}

const initialFormState = {
    driverName: '',
    zone: '',
    isSubstitute: false,
    locations: [],
    systemPackages: 0,
    offSystemPackages: 0,
};

const DeliveryForm: React.FC<DeliveryFormProps> = ({ onSave, editingRecord, clearForm, driverZoneMap, disabled }) => {
    const [formState, setFormState] = useState<Omit<DeliveryRecord, 'id'>>(initialFormState);

    useEffect(() => {
        if (editingRecord) {
            setFormState(editingRecord);
        } else {
            setFormState(initialFormState);
        }
    }, [editingRecord]);

    useEffect(() => {
        if (!editingRecord && formState.driverName && driverZoneMap[formState.driverName]) {
            setFormState(prev => ({ ...prev, zone: driverZoneMap[formState.driverName] }));
        }
    }, [formState.driverName, driverZoneMap, editingRecord]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value)
        }));
    };

    const handleLocationsChange = (locations: string[]) => {
        setFormState(prev => ({ ...prev, locations }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.driverName || !formState.zone) {
            alert('Nombre del conductor y zona asignada son obligatorios.');
            return;
        }
        onSave(formState, editingRecord?.id);
    };

    const handleClear = () => {
        clearForm();
        setFormState(initialFormState);
    };

    const totalPackages = useMemo(() => {
        return (Number(formState.systemPackages) || 0) + (Number(formState.offSystemPackages) || 0);
    }, [formState.systemPackages, formState.offSystemPackages]);

    return (
        <div className={`p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg transition-opacity duration-300 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Gestión de Entregas</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="driverName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Conductor</label>
                        <input type="text" name="driverName" id="driverName" value={formState.driverName} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                    </div>
                    <div>
                        <label htmlFor="zone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Zona Asignada</label>
                        <input type="text" name="zone" id="zone" value={formState.zone} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                    </div>
                </div>

                <div>
                    <label htmlFor="locations" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Localidades que recorre</label>
                    <TagInput tags={formState.locations} setTags={handleLocationsChange} placeholder="Añadir localidad y presionar Enter..." />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                     <div>
                        <label htmlFor="systemPackages" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paquetes en sistema</label>
                        <input type="number" name="systemPackages" id="systemPackages" value={formState.systemPackages} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                    </div>
                    <div>
                        <label htmlFor="offSystemPackages" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paquetes fuera de sistema</label>
                        <input type="number" name="offSystemPackages" id="offSystemPackages" value={formState.offSystemPackages} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                    </div>
                    <div className="p-3 text-center bg-slate-100 dark:bg-slate-700 rounded-lg">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Paquetes</span>
                        <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{totalPackages}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                     <div className="flex items-center">
                        <input id="isSubstitute" name="isSubstitute" type="checkbox" checked={formState.isSubstitute} onChange={handleChange} className="h-4 w-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500" />
                        <label htmlFor="isSubstitute" className="ml-2 block text-sm text-slate-900 dark:text-slate-200">
                            ¿Es Suplente?
                        </label>
                    </div>

                    <div className="flex items-center gap-4">
                        <button type="button" onClick={handleClear} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                            Limpiar
                        </button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                            {editingRecord ? 'Actualizar Registro' : 'Guardar Registro'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DeliveryForm;
