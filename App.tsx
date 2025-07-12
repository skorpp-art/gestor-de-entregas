import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DeliveryRecord, Worksheet, DriverZoneMap, ToastMessage, TitularDriver } from './types';
import DeliveryForm from './components/DeliveryForm';
import DeliveryTable from './components/DeliveryTable';
import SummaryPanel from './components/SummaryPanel';
import HistoryManager from './components/HistoryManager';
import DriverManagementModal from './components/DriverManagementModal';
import DataManagementPanel from './components/DataManagementPanel';
import { ToastContainer } from './components/Toast';
import { UsersIcon } from './components/icons';

declare const html2canvas: any;

const App: React.FC = () => {
    const [currentRecords, setCurrentRecords] = useState<DeliveryRecord[]>([]);
    const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
    const [titularDrivers, setTitularDrivers] = useState<TitularDriver[]>([]);
    const [editingRecord, setEditingRecord] = useState<DeliveryRecord | null>(null);
    const [activeWorksheetId, setActiveWorksheetId] = useState<string>('current');
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [isDriverModalOpen, setDriverModalOpen] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedRecords = localStorage.getItem('currentRecords');
            if (savedRecords) setCurrentRecords(JSON.parse(savedRecords));
            
            const savedWorksheets = localStorage.getItem('worksheets');
            if (savedWorksheets) setWorksheets(JSON.parse(savedWorksheets));

            const savedDrivers = localStorage.getItem('titularDrivers');
            if (savedDrivers) setTitularDrivers(JSON.parse(savedDrivers));

        } catch (error) {
            console.error("Failed to load from localStorage", error);
            addToast("No se pudieron cargar los datos guardados.", "error");
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem('currentRecords', JSON.stringify(currentRecords));
        } catch (error) {
            console.error("Failed to save current records to localStorage", error);
            addToast("Error al guardar la planilla actual.", "error");
        }
    }, [currentRecords]);

     useEffect(() => {
        try {
            localStorage.setItem('worksheets', JSON.stringify(worksheets));
        } catch (error) {
            console.error("Failed to save worksheets to localStorage", error);
            addToast("Error al guardar el historial de planillas.", "error");
        }
    }, [worksheets]);

     useEffect(() => {
        try {
            localStorage.setItem('titularDrivers', JSON.stringify(titularDrivers));
        } catch (error) {
            console.error("Failed to save titular drivers to localStorage", error);
            addToast("Error al guardar los conductores.", "error");
        }
    }, [titularDrivers]);
    
    const driverZoneMap = useMemo(() => {
        return titularDrivers.reduce((acc, driver) => {
            acc[driver.name] = driver.zone;
            return acc;
        }, {} as DriverZoneMap);
    }, [titularDrivers]);

    const addToast = useCallback((message: string, type: ToastMessage['type']) => {
        const newToast: ToastMessage = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
    }, []);

    const removeToast = (id: number) => {
        setToasts(toasts => toasts.filter(toast => toast.id !== id));
    };

    const handleSaveRecord = (recordData: Omit<DeliveryRecord, 'id'>, id?: string) => {
        if (id) { // Update
            setCurrentRecords(prev => prev.map(r => r.id === id ? { ...recordData, id } : r));
            addToast('Registro actualizado con éxito.', 'success');
        } else { // Create
            const newRecord: DeliveryRecord = { ...recordData, id: Date.now().toString() };
            setCurrentRecords(prev => [...prev, newRecord]);
            addToast('Registro guardado con éxito.', 'success');
        }
        setEditingRecord(null);
    };

    const handleEditRecord = (record: DeliveryRecord) => {
        setEditingRecord(record);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteRecord = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
            setCurrentRecords(prev => prev.filter(r => r.id !== id));
            addToast('Registro eliminado.', 'info');
        }
    };

    const clearForm = () => {
        setEditingRecord(null);
    };

    const handleArchiveWorksheet = () => {
        if (currentRecords.length === 0) {
            addToast('No hay registros en la planilla actual para archivar.', 'error');
            return;
        }
        const newWorksheet: Worksheet = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            records: [...currentRecords]
        };
        setWorksheets(prev => [newWorksheet, ...prev]);
        setCurrentRecords([]);
        addToast('Planilla archivada con éxito.', 'success');
    };

    const handleSelectWorksheet = (id: string) => {
        setActiveWorksheetId(id);
        setEditingRecord(null); 
    };
    
    const displayRecords = useMemo(() => {
        if (activeWorksheetId === 'current') {
            return currentRecords;
        }
        const found = worksheets.find(ws => ws.id === activeWorksheetId);
        return found ? found.records : [];
    }, [activeWorksheetId, currentRecords, worksheets]);


    const isReadOnly = activeWorksheetId !== 'current';

    const handleDownloadJpg = () => {
        if (displayRecords.length === 0) {
            addToast('No hay registros para descargar.', 'info');
            return;
        }

        if (typeof html2canvas === 'undefined') {
            addToast('Error: La librería de renderizado no está disponible.', 'error');
            return;
        }
    
        addToast('Generando imagen...', 'info');
    
        const printableElement = document.createElement('div');
        printableElement.id = 'temp-printable';
        Object.assign(printableElement.style, {
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: '1200px',
            fontFamily: 'sans-serif',
            color: '#111827',
            backgroundColor: '#ffffff',
        });
        
        const worksheetDate = activeWorksheetId === 'current'
            ? new Date()
            : new Date(worksheets.find(ws => ws.id === activeWorksheetId)?.date || Date.now());
        const dateString = worksheetDate.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
        const fileDateString = worksheetDate.toLocaleDateString('es-ES').replace(/\//g, '-');
    
        const totalDrivers = displayRecords.length;
        const totalSubstitutes = displayRecords.filter(r => r.isSubstitute).length;
        const totalSystemPackages = displayRecords.reduce((sum, r) => sum + r.systemPackages, 0);
        const totalOffSystemPackages = displayRecords.reduce((sum, r) => sum + r.offSystemPackages, 0);
        const totalPackages = totalSystemPackages + totalOffSystemPackages;
    
        const tableRowsHtml = displayRecords.map(record => `
            <tr>
                <td>${record.driverName}</td>
                <td>${record.zone}</td>
                <td>${record.isSubstitute ? 'Sí' : 'No'}</td>
                <td>${record.locations.join(', ')}</td>
                <td>${record.systemPackages}</td>
                <td>${record.offSystemPackages}</td>
                <td><strong>${record.systemPackages + record.offSystemPackages}</strong></td>
            </tr>
        `).join('');
        
        printableElement.innerHTML = `
            <style>
                .print-container { padding: 40px; background-color: #ffffff; }
                .print-header h1 { font-size: 28px; font-weight: bold; margin: 0; color: #0c4a6e; }
                .print-header p { font-size: 16px; color: #374151; margin: 4px 0 0 0; }
                .print-summary { display: flex; gap: 16px; margin: 24px 0; }
                .summary-card { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
                .summary-card .value { font-size: 24px; font-weight: bold; color: #0284c7; }
                .summary-card .label { font-size: 14px; color: #6b7280; }
                .print-table { width: 100%; border-collapse: collapse; font-size: 14px; }
                .print-table th, .print-table td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; vertical-align: top; }
                .print-table thead th { background-color: #f9fafb; font-weight: 600; color: #374151; }
                .print-table tbody tr:nth-child(even) { background-color: #f9fafb; }
                .print-table td strong { color: #0284c7; font-weight: 600; }
                .print-footer { margin-top: 24px; text-align: center; font-size: 12px; color: #6b7280; }
            </style>
            <div class="print-container">
                <div class="print-header">
                    <h1>Planilla de Entregas</h1>
                    <p>${dateString}</p>
                </div>
                
                <div class="print-summary">
                    <div class="summary-card">
                        <div class="value">${totalDrivers}</div>
                        <div class="label">Total Conductores</div>
                    </div>
                    <div class="summary-card">
                        <div class="value">${totalSubstitutes}</div>
                        <div class="label">Total Suplentes</div>
                    </div>
                     <div class="summary-card">
                        <div class="value">${totalSystemPackages}</div>
                        <div class="label">P. Sistema</div>
                    </div>
                    <div class="summary-card">
                        <div class="value">${totalOffSystemPackages}</div>
                        <div class="label">P. Fuera Sistema</div>
                    </div>
                    <div class="summary-card">
                        <div class="value">${totalPackages}</div>
                        <div class="label">Total Paquetes</div>
                    </div>
                </div>
    
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Conductor</th>
                            <th>Zona</th>
                            <th>Suplente</th>
                            <th>Localidades</th>
                            <th>P. Sistema</th>
                            <th>P. Fuera</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
    
                <div class="print-footer">
                    &copy; ${new Date().getFullYear()} Gestor de Entregas Pro+
                </div>
            </div>
        `;
    
        document.body.appendChild(printableElement);
    
        html2canvas(printableElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then((canvas: HTMLCanvasElement) => {
            const link = document.createElement('a');
            link.download = `planilla-${fileDateString}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
            addToast('Descarga iniciada.', 'success');
        }).catch((err: any) => {
            console.error("Error generating JPG:", err);
            addToast('Error al generar la imagen.', 'error');
        }).finally(() => {
            document.body.removeChild(printableElement);
        });
    };
    
    const handleSaveTitularDriver = (driverData: Omit<TitularDriver, 'id'>, id?: string) => {
        if(id) {
            setTitularDrivers(prev => prev.map(d => d.id === id ? { ...d, ...driverData } : d));
            addToast('Conductor actualizado.', 'success');
        } else {
            const newDriver: TitularDriver = { ...driverData, id: Date.now().toString() };
            setTitularDrivers(prev => [...prev, newDriver]);
            addToast('Conductor titular guardado.', 'success');
        }
    };
    
    const handleDeleteTitularDriver = (id: string) => {
        if(window.confirm('¿Seguro que quieres eliminar este conductor titular?')) {
            setTitularDrivers(prev => prev.filter(d => d.id !== id));
            addToast('Conductor eliminado.', 'info');
        }
    };

    const handleExportData = () => {
        try {
            const dataToExport = {
                currentRecords,
                worksheets,
                titularDrivers
            };
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'gestor-entregas-backup.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addToast('Datos exportados con éxito.', 'success');
        } catch (error) {
            console.error("Error exporting data:", error);
            addToast('Hubo un error al exportar los datos.', 'error');
        }
    };
    
    const handleImportData = (jsonString: string) => {
        if (!window.confirm('¿Estás seguro de que quieres importar estos datos? Esto sobreescribirá toda la información actual.')) {
            return;
        }
        try {
            const importedData = JSON.parse(jsonString);
            
            // Basic validation
            if (!Array.isArray(importedData.currentRecords) || !Array.isArray(importedData.worksheets) || !Array.isArray(importedData.titularDrivers)) {
                throw new Error('El archivo de importación no tiene el formato correcto.');
            }
            
            setCurrentRecords(importedData.currentRecords);
            setWorksheets(importedData.worksheets);
            setTitularDrivers(importedData.titularDrivers);

            // Also update active worksheet view if needed
            setActiveWorksheetId('current');

            addToast('Datos importados con éxito.', 'success');
        } catch (error) {
            console.error("Error importing data:", error);
            addToast('El archivo de importación es inválido o está corrupto.', 'error');
        }
    };

    const handleClearAllData = () => {
        if (window.confirm('¡ADVERTENCIA! ¿Estás seguro de que quieres borrar TODOS los datos de la aplicación? Esta acción no se puede deshacer.')) {
            setCurrentRecords([]);
            setWorksheets([]);
            setTitularDrivers([]);
            // localStorage.clear(); // This would clear everything, including other potential site data. Better to remove items specifically.
            localStorage.removeItem('currentRecords');
            localStorage.removeItem('worksheets');
            localStorage.removeItem('titularDrivers');
            addToast('Todos los datos han sido eliminados.', 'info');
        }
    };


    return (
        <>
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
            <DriverManagementModal 
                isOpen={isDriverModalOpen}
                onClose={() => setDriverModalOpen(false)}
                drivers={titularDrivers}
                onSave={handleSaveTitularDriver}
                onDelete={handleDeleteTitularDriver}
            />

            <div className="container mx-auto p-4 md:p-8">
                <header className="text-center mb-8 relative">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-brand-700 dark:text-brand-300">
                        Gestor de Entregas Pro+
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Tu centro de operaciones para la logística diaria.</p>
                     <button 
                        onClick={() => setDriverModalOpen(true)}
                        className="absolute top-0 right-0 mt-2 flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                        title="Gestionar Conductores Titulares"
                     >
                        <UsersIcon className="w-5 h-5"/>
                        <span className="hidden md:inline">Conductores</span>
                    </button>
                </header>

                <main>
                    <HistoryManager
                        worksheets={worksheets}
                        activeWorksheetId={activeWorksheetId}
                        onSelectWorksheet={handleSelectWorksheet}
                        onArchive={handleArchiveWorksheet}
                        isReadOnly={isReadOnly}
                        onDownloadJpg={handleDownloadJpg}
                    />

                    {!isReadOnly && (
                        <DeliveryForm
                            onSave={handleSaveRecord}
                            editingRecord={editingRecord}
                            clearForm={clearForm}
                            driverZoneMap={driverZoneMap}
                            disabled={isReadOnly}
                        />
                    )}

                    <div id="printable-area" className="mt-8">
                        {isReadOnly && (
                             <div className="text-center p-4 mb-6 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-lg">
                                Estás viendo una planilla archivada en modo de solo lectura.
                            </div>
                        )}
                        <SummaryPanel records={displayRecords} />
                        <DeliveryTable
                            records={displayRecords}
                            onEdit={handleEditRecord}
                            onDelete={handleDeleteRecord}
                            isReadOnly={isReadOnly}
                        />
                    </div>
                    
                    <DataManagementPanel
                        onExport={handleExportData}
                        onImport={handleImportData}
                        onClear={handleClearAllData}
                    />

                </main>
                 <footer className="text-center mt-12 py-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} Gestor de Entregas Pro+. Todos los derechos reservados.</p>
                </footer>
            </div>
        </>
    );
};

export default App;