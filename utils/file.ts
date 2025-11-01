import { AppFile } from '../types';

/**
 * Reads a File object and converts it to a base64 encoded string.
 * @param file The File object to read.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};


/**
 * Processes an array of File objects into an array of AppFile objects.
 * @param files The array of File objects.
 * @returns A promise that resolves with an array of AppFile objects.
 */
export const processFiles = async (files: File[]): Promise<AppFile[]> => {
    const appFiles: AppFile[] = [];
    for (const file of files) {
        const base64 = await fileToBase64(file);
        appFiles.push({
            id: `${file.name}-${file.lastModified}-${file.size}`,
            file,
            previewUrl: URL.createObjectURL(file),
            base64: base64,
        });
    }
    return appFiles;
};

/**
 * Converts a base64 data URL string into a File object.
 * @param dataUrl The base64 data URL (e.g., "data:image/png;base64,...").
 * @param filename The name to give the resulting file.
 * @param fileType The MIME type of the file.
 * @returns A File object.
 */
export const base64ToFile = (dataUrl: string, filename: string, fileType: string): File => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) {
        throw new Error('Invalid data URL');
    }
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: fileType });
};
