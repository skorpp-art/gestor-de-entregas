import React from 'react';
import { Worksheet } from '../types';
import { DownloadIcon } from './icons';

interface HistoryManagerProps {
    worksheets: Worksheet[];
    activeWorksheetId: string;
    onSelectWorksheet: (id: string) => void;
    onArchive: () => void;
    isReadOnly: boolean;
    onDownloadJpg: () => void;
}

const HistoryManager: React.FC<HistoryManagerProps> = ({ worksheets, activeWorksheetId, onSelectWorksheet, onArchive, isReadOnly, onDownloadJpg }) => {
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <label htmlFor="worksheet-history" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ver Planilla:
                </label>
                <select
                    id="worksheet-history"
                    value={activeWorksheetId}
                    onChange={(e) => onSelectWorksheet(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                    <option value="current">Planilla Actual (Editable)</option>
                    {worksheets.map(ws => (
                        <option key={ws.id} value={ws.id}>
                            Historial: {new Date(ws.date).toLocaleString('es-ES')}
                        </option>
                    ))}
                </select>
            </div>
             <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-center sm:justify-end">
                <button
                    onClick={onDownloadJpg}
                    className="flex-grow sm:flex-grow-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                >
                    <DownloadIcon className="w-4 h-4" />
                    Descargar JPG
                </button>
                <button
                    onClick={onArchive}
                    disabled={isReadOnly}
                    className="flex-grow sm:flex-grow-0 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Archivar Planilla Actual
                </button>
            </div>
        </div>
    );
};

export default HistoryManager;