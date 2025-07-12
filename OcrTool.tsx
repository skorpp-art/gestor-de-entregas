
import React, { useState } from 'react';
import { extractTextFromImage } from '../services/geminiService';
import { CopyIcon } from './icons';

interface OcrToolProps {
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const OcrTool: React.FC<OcrToolProps> = ({ addToast }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [ocrText, setOcrText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
            setOcrText('');
        }
    };

    const handleExtractText = async () => {
        if (!imageFile) {
            addToast('Por favor, selecciona una imagen primero.', 'error');
            return;
        }
        if (!process.env.API_KEY) {
             addToast('La clave de API de Gemini no está configurada.', 'error');
             return;
        }

        setIsLoading(true);
        setOcrText('');

        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const result = await extractTextFromImage(base64String, imageFile.type);
            setOcrText(result);
            setIsLoading(false);
            addToast('Texto extraído con éxito.', 'success');
        };
        reader.onerror = () => {
            setIsLoading(false);
            addToast('Error al leer el archivo de imagen.', 'error');
        };
    };

    const handleCopyText = () => {
        if (ocrText) {
            navigator.clipboard.writeText(ocrText);
            addToast('Texto copiado al portapapeles.', 'info');
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg mt-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Herramienta de OCR (con Gemini)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subir imagen</label>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/50 dark:file:text-brand-300 dark:hover:file:bg-brand-900"
                        />
                    </div>
                    {imageUrl && (
                        <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                           <img src={imageUrl} alt="Vista previa" className="max-h-60 w-full object-contain rounded" />
                        </div>
                    )}
                    <button
                        onClick={handleExtractText}
                        disabled={isLoading || !imageFile}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-lg shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                         {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                         {isLoading ? 'Procesando...' : 'Extraer Texto'}
                    </button>
                </div>
                <div className="space-y-4">
                     <div className="flex justify-between items-center">
                         <label htmlFor="ocr-output" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Texto Extraído</label>
                         <button onClick={handleCopyText} disabled={!ocrText} className="flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                             <CopyIcon className="w-4 h-4" />
                             Copiar
                         </button>
                    </div>
                    <textarea
                        id="ocr-output"
                        readOnly
                        value={ocrText}
                        placeholder="El texto de la imagen aparecerá aquí..."
                        className="w-full h-80 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono text-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default OcrTool;
