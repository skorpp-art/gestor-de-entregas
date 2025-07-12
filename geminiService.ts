
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure the API key is available, otherwise throw an error.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts text from an image using the Gemini API.
 * @param base64Image The base64 encoded image string.
 * @param mimeType The MIME type of the image.
 * @returns The extracted text.
 */
export const extractTextFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType,
            },
        };

        const textPart = {
            text: "Extrae todo el texto de esta imagen. Presenta el texto exactamente como aparece, manteniendo los saltos de línea y la estructura si es posible.",
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error extracting text with Gemini:", error);
        if (error instanceof Error) {
            return `Error al procesar la imagen: ${error.message}`;
        }
        return "Error al procesar la imagen: Ocurrió un error desconocido.";
    }
};
