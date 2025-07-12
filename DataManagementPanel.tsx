import React, { useRef } from 'react';
import { DownloadIcon, UploadIcon, DeleteIcon } from './icons';

interface DataManagementPanelProps {
    onExport: () => void;
    onImport: (jsonString: string) => void;
    onClear: () => void;
}

const DataManagementPanel: React.FC<DataManagementPanelProps> = ({ onExport, onImport, onClear }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                onImport(text);
            }
        };
        reader.onerror = () => {
            console.error("Error reading file");
            alert("No se pudo leer el archivo.");
        }
        reader.readAsText(file);
        
        // Reset the input value so the same file can be selected again
        event.target.value = '';
    };

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg mt-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Gestión de Datos</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Realiza copias de seguridad de tus datos, restáuralos desde un archivo o limpia la aplicación para empezar de nuevo.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
                <button
                    onClick={onExport}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Exportar Datos
                </button>
                <button
                    onClick={handleImportClick}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <UploadIcon className="w-5 h-5" />
                    Importar Datos
                </button>
                <button
                    onClick={onClear}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <DeleteIcon className="w-5 h-5" />
                    Limpiar Todos los Datos
                </button>
            </div>
        </div>
    );
};

export default DataManagementPanel;