import React, { useState, useCallback, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ImageGrid from './components/ImageGrid';
import ProcessingOptionsPanel from './components/ProcessingOptionsPanel';
import Loader from './components/Loader';
import ResultDisplay from './components/ResultDisplay';
import { AppFile, ProcessingOptions, ProgressUpdate, ResultData, SerializableAppFile, SavedState } from './types';
import { processFiles, base64ToFile } from './utils/file';
import { processImageWithAI, extractTextFromImages, extractTableFromImages } from './services/gemini';
import { FolderOpenIcon, SaveIcon } from './components/icons';

// Define the states of the application
type AppState = 'uploading' | 'configuring' | 'processing' | 'done';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('uploading');
    const [files, setFiles] = useState<AppFile[]>([]);
    const [options, setOptions] = useState<ProcessingOptions>({
        mode: 'clean',
        prompt: '',
        temperature: 0.5,
        thinkingMode: false,
        cleanSensitivity: 0.5,
    });
    const [progress, setProgress] = useState<ProgressUpdate>({ percentage: 0, message: '' });
    const [result, setResult] = useState<ResultData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [hasSavedState, setHasSavedState] = useState<boolean>(false);

    useEffect(() => {
        // Check for saved state on initial load
        if (localStorage.getItem('docPiState')) {
            setHasSavedState(true);
        }
    }, []);

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveState = useCallback(() => {
        try {
            const serializableFiles: SerializableAppFile[] = files.map(f => ({
                id: f.id,
                base64: f.base64,
                name: f.file.name,
                type: f.file.type,
            }));

            const stateToSave: SavedState = { files: serializableFiles, options };
            localStorage.setItem('docPiState', JSON.stringify(stateToSave));
            setHasSavedState(true);
            showNotification('Session saved successfully!');
        } catch (err) {
            console.error("Failed to save state:", err);
            setError("Could not save the session. The browser storage might be full.");
        }
    }, [files, options]);

    const handleLoadState = useCallback(() => {
        setError(null);
        try {
            const savedStateJSON = localStorage.getItem('docPiState');
            if (!savedStateJSON) {
                showNotification('No saved session found.');
                return;
            }

            const savedState: SavedState = JSON.parse(savedStateJSON);

            // Basic validation
            if (!savedState.files || !savedState.options) {
                throw new Error("Invalid saved data format.");
            }

            const loadedFiles: AppFile[] = savedState.files.map(sf => {
                const file = base64ToFile(sf.base64, sf.name, sf.type);
                return {
                    id: sf.id,
                    file: file,
                    previewUrl: sf.base64, // Use base64 directly as it's a data URL
                    base64: sf.base64,
                };
            });

            setFiles(loadedFiles);
            // Ensure newly added options have default values when loading older states
            setOptions(prev => ({
                ...{
                    mode: 'clean',
                    prompt: '',
                    temperature: 0.5,
                    thinkingMode: false,
                    cleanSensitivity: 0.5,
                },
                ...savedState.options
            }));
            setAppState('configuring');
            showNotification('Session loaded successfully!');
        } catch (err: any) {
            console.error("Failed to load state:", err);
            setError(`Could not load session. The saved data might be corrupted. (Error: ${err.message})`);
            localStorage.removeItem('docPiState'); // Clear corrupted data
            setHasSavedState(false);
        }
    }, []);

    const handleFilesChange = useCallback(async (newFiles: File[]) => {
        // Limit to 100 files
        if (files.length + newFiles.length > 100) {
            alert("You can upload a maximum of 100 images.");
            return;
        }
        const processed = await processFiles(newFiles);
        setFiles(prev => [...prev, ...processed]);
        setAppState('configuring');
    }, [files.length]);

    const handleDeleteFile = useCallback((id: string) => {
        setFiles(prev => {
            const newFiles = prev.filter(f => f.id !== id);
            if (newFiles.length === 0) {
                setAppState('uploading');
            }
            return newFiles;
        });
    }, []);

    const handleOptionsChange = useCallback((newOptions: Partial<ProcessingOptions>) => {
        setOptions(prev => ({ ...prev, ...newOptions }));
    }, []);

    const getProgressHandler = (task: string) => (p: number) => {
        setProgress({
            percentage: p * 100,
            message: `${task} - ${Math.round(p * 100)}% complete...`,
        });
    };

    const handleSubmit = async () => {
        setError(null);
        setAppState('processing');
        setProgress({ percentage: 0, message: 'Starting process...' });

        try {
            let outputContent: string;
            let fileFormat: string;
            let fileName: string;

            switch (options.mode) {
                case 'clean':
                    if (files.length !== 1) {
                        throw new Error("Image cleaning only works with a single image.");
                    }
                    if (!options.prompt.trim()) {
                        throw new Error("Please provide instructions for cleaning the image.");
                    }
                    setProgress({ percentage: 10, message: 'Sending image to AI for cleaning...' });
                    outputContent = await processImageWithAI(files[0].base64, options.prompt, options.temperature, options.cleanSensitivity);
                    fileFormat = outputContent.split(';')[0].split('/')[1] || 'png';
                    fileName = `cleaned-${files[0].file.name}`;
                    break;
                case 'extract-text':
                    outputContent = await extractTextFromImages(files.map(f => f.base64), getProgressHandler('Extracting text'), options.thinkingMode, options.temperature);
                    fileFormat = 'txt';
                    fileName = 'extracted-text.txt';
                    break;
                case 'extract-table':
                    if (files.length !== 1) {
                        throw new Error("Table extraction only works with a single image.");
                    }
                    outputContent = await extractTableFromImages(files[0].base64, getProgressHandler('Extracting table data'), options.thinkingMode, options.temperature);
                    fileFormat = 'csv';
                    fileName = 'extracted-table.csv';
                    break;
                default:
                    throw new Error("Invalid processing mode selected.");
            }

            const blob = options.mode === 'clean'
                ? await (await fetch(outputContent)).blob()
                : new Blob([outputContent], { type: `text/${fileFormat}` });

            const url = URL.createObjectURL(blob);
            setResult({ url, fileName, format: fileFormat });
            setAppState('done');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred.');
            setAppState('configuring'); // Go back to config on error
        }
    };

    const handleReset = () => {
        setAppState('uploading');
        setFiles([]);
        setOptions({ 
            mode: 'clean', 
            prompt: '', 
            temperature: 0.5, 
            thinkingMode: false,
            cleanSensitivity: 0.5,
        });
        setProgress({ percentage: 0, message: '' });
        setResult(null);
        setError(null);
    };

    const renderContent = () => {
        switch (appState) {
            case 'uploading':
                return (
                    <div className="text-center">
                        <FileUpload onFilesChange={handleFilesChange} />
                        {hasSavedState && (
                             <button onClick={handleLoadState} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-600">
                                <FolderOpenIcon className="h-5 w-5" />
                                Load Previous Session
                            </button>
                        )}
                    </div>
                );
            case 'configuring':
                return (
                    <div className="w-full flex flex-col items-center gap-8">
                        <ImageGrid files={files} onDelete={handleDeleteFile} />
                        {error && <div className="p-4 w-full max-w-2xl text-sm text-red-400 bg-red-900/50 rounded-lg" role="alert">{error}</div>}

                        <div className="w-full max-w-2xl flex justify-end gap-3 -mb-4">
                            <button onClick={handleSaveState} className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-600">
                                <SaveIcon className="h-5 w-5" />
                                Save
                            </button>
                             <button onClick={handleLoadState} className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-600">
                                <FolderOpenIcon className="h-5 w-5" />
                                Load
                            </button>
                        </div>

                        <ProcessingOptionsPanel
                            options={options}
                            onOptionsChange={handleOptionsChange}
                            onSubmit={handleSubmit}
                            isProcessing={false}
                            disabled={
                                (options.mode === 'clean' && files.length !== 1) ||
                                (options.mode === 'extract-table' && files.length !== 1) ||
                                (options.mode === 'extract-text' && files.length === 0)
                            }
                        />
                    </div>
                );
            case 'processing':
                return <Loader progress={progress} />;
            case 'done':
                return result ? <ResultDisplay result={result} onReset={handleReset} /> : null;
            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            {notification && (
                <div className="fixed top-5 right-5 bg-green-600/90 backdrop-blur-sm text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
                    {notification}
                </div>
            )}
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Gemini Document Processor
                </h1>
                <p className="text-slate-400 mt-2">Clean images, extract text, and convert tables with the power of AI.</p>
            </header>
            <main className="w-full flex-grow flex items-center justify-center">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;