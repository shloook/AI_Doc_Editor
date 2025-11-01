// Fix: Removed self-import of 'ProcessingOptions' which conflicts with its local declaration.
export interface AppFile {
    id: string;
    file: File;
    previewUrl: string;
    base64: string;
}

export type ProcessingMode = 'clean' | 'extract-text' | 'extract-table';

export interface ProcessingOptions {
    mode: ProcessingMode;
    prompt: string;
    temperature: number;
    thinkingMode: boolean;
    cleanSensitivity: number;
}

export interface ProgressUpdate {
    percentage: number;
    message: string;
}

export interface ResultData {
    url: string;
    fileName: string;
    format: string;
}

/**
 * A serializable version of AppFile for storing in localStorage.
 */
export interface SerializableAppFile {
    id: string;
    base64: string;
    name: string;
    type: string;
}

/**
 * The structure of the saved state in localStorage.
 */
export interface SavedState {
    files: SerializableAppFile[];
    options: ProcessingOptions;
}