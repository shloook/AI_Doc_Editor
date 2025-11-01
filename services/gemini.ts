// Implemented Gemini API services to perform image processing, text extraction, and table extraction.
import { GoogleGenAI, Modality, Type } from "@google/genai";

// Initialize the Google Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses a base64 string with a data URL scheme.
 * @param base64String The base64 string (e.g., "data:image/jpeg;base64,...").
 * @returns An object with mimeType and the raw base64 data.
 */
const parseBase64 = (base64String: string): { mimeType: string; data: string } => {
    const match = base64String.match(/^data:(image\/.*?);base64,(.*)$/);
    if (!match || match.length < 3) {
        throw new Error('Invalid base64 image string format. Expected "data:image/...;base64,..."');
    }
    return { mimeType: match[1], data: match[2] };
};


/**
 * Processes an image with an AI model to clean it up or remove marks.
 * @param imageBase64 The base64 encoded image string.
 * @param prompt The instructions for the AI.
 * @param temperature The creativity/temperature for the AI model.
 * @param cleanSensitivity The aggressiveness of the cleaning (0 to 1).
 * @returns A new base64 encoded image string.
 */
export const processImageWithAI = async (
    imageBase64: string,
    prompt: string,
    temperature: number,
    cleanSensitivity: number
): Promise<string> => {
    const { mimeType, data } = parseBase64(imageBase64);

    let sensitivityDescription;
    if (cleanSensitivity <= 0.3) {
        sensitivityDescription = 'Low (Conservative)';
    } else if (cleanSensitivity <= 0.7) {
        sensitivityDescription = 'Medium (Balanced)';
    } else {
        sensitivityDescription = 'High (Aggressive)';
    }

    const fullPrompt = `Act as an expert document restoration AI. Clean this image based on the user's instructions and the specified sensitivity level.

    **Cleaning Sensitivity:** ${sensitivityDescription}
    - **Low sensitivity:** Be very conservative. Only remove the most obvious, non-original marks (e.g., heavy stains, clear handwriting). Prioritize preserving every detail of the original document over perfect cleanliness.
    - **High sensitivity:** Be more aggressive. Remove fainter marks, noise, and even minor paper texture variations. Strive for the cleanest possible background, even at a slight risk of affecting very light original content.

    **User's Instruction:** "${prompt}"

    Return only the cleaned image. Do not add any text or explanation.`;


    // Per @google/genai guidelines, use gemini-2.5-flash-image for image editing.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: data,
                        mimeType: mimeType,
                    },
                },
                { text: fullPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
            temperature: temperature,
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const newMimeType = part.inlineData.mimeType;
            const newBase64Data = part.inlineData.data;
            return `data:${newMimeType};base64,${newBase64Data}`;
        }
    }

    throw new Error("AI did not return an image.");
};

/**
 * Extracts text from a series of images.
 * @param imageBase64s An array of base64 encoded image strings.
 * @param onProgress A callback to report progress (0 to 1).
 * @param thinkingMode Whether to use a more powerful model for better accuracy.
 * @param temperature The creativity/temperature for the AI model.
 * @returns The combined extracted text.
 */
export const extractTextFromImages = async (
    imageBase64s: string[],
    onProgress: (p: number) => void,
    thinkingMode: boolean,
    temperature: number,
): Promise<string> => {
    // Per @google/genai guidelines, use gemini-2.5-pro for complex tasks and gemini-2.5-flash for basic tasks.
    const modelName = thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config = {
        temperature,
        ...(thinkingMode && { thinkingConfig: { thinkingBudget: 32768 } }),
    };
    
    let fullText = '';
    
    for (let i = 0; i < imageBase64s.length; i++) {
        const { mimeType, data } = parseBase64(imageBase64s[i]);
        
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: data,
                            mimeType: mimeType
                        }
                    },
                    { text: "Perform high-fidelity Optical Character Recognition (OCR) on this document image. Your primary goal is to extract all text with the highest possible accuracy, making it searchable and usable. Pay close attention to preserving the original layout, including paragraphs, line breaks, and spacing, to maintain the document's structure and readability." }
                ]
            },
            config: config
        });
        
        // Per @google/genai guidelines, access text output via the .text property
        fullText += response.text + '\n\n';
        onProgress((i + 1) / imageBase64s.length);
    }
    
    return fullText.trim();
};


/**
 * Extracts table data from a single image and returns it as a CSV string.
 * @param imageBase64 The base64 encoded image string.
 * @param onProgress A callback to report progress (0 to 1).
 * @param thinkingMode Whether to use a more powerful model for better accuracy.
 * @param temperature The creativity/temperature for the AI model.
 * @returns A CSV string representing the extracted table.
 */
export const extractTableFromImages = async (
    imageBase64: string,
    onProgress: (p: number) => void,
    thinkingMode: boolean,
    temperature: number,
): Promise<string> => {
    const modelName = thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    const thinkingConfig = thinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

    const { mimeType, data } = parseBase64(imageBase64);
    
    onProgress(0.1);

    // Per @google/genai guidelines, use responseSchema for reliable JSON output.
    const response = await ai.models.generateContent({
        model: modelName,
        contents: {
            parts: [
                {
                    inlineData: {
                        data: data,
                        mimeType: mimeType
                    }
                },
                { text: "Analyze the image and extract the table data. Structure the output as a JSON object with a single key 'table' which is an array of arrays. The first inner array should be the header row, and subsequent inner arrays should be the data rows." }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    table: {
                        type: Type.ARRAY,
                        description: "The extracted table, represented as an array of arrays where each inner array is a row.",
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A single cell value from the table. It can be a string or a number represented as a string."
                            }
                        }
                    }
                },
                required: ['table']
            },
            temperature,
            ...thinkingConfig,
        }
    });

    onProgress(0.75);
    
    // Per @google/genai guidelines, access text output via the .text property
    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    
    const tableData: string[][] = parsed.table;

    if (!tableData || !Array.isArray(tableData)) {
        throw new Error("Could not parse table data from AI response. Expected a 'table' property with an array of arrays.");
    }

    // Convert array of arrays to CSV
    const csvContent = tableData.map(row => 
        row.map(cell => {
            const cellString = String(cell ?? '');
            // Escape quotes by doubling them
            let escapedCell = cellString.replace(/"/g, '""');
            // If the cell contains a comma, newline, or quote, enclose it in quotes
            if (/[",\n]/.test(escapedCell)) {
                escapedCell = `"${escapedCell}"`;
            }
            return escapedCell;
        }).join(',')
    ).join('\n');

    onProgress(1);

    return csvContent;
};