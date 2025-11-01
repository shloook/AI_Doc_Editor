
import React from 'react';
import { CheckCircleIcon, DownloadIcon, RefreshCwIcon } from './icons';

interface ResultDisplayProps {
    result: {
        url: string;
        fileName: string;
        format: string;
    };
    onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
    return (
        <div className="text-center animate-fade-in p-8 bg-slate-800 rounded-lg shadow-2xl w-full max-w-md">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Conversion Complete!</h2>
            <p className="text-slate-400 mb-6">Your {result.format.toUpperCase()} file is ready for download.</p>
            
            <a
                href={result.url}
                download={result.fileName}
                className="w-full mb-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50 flex items-center justify-center"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download File
            </a>

            <button
                onClick={onReset}
                className="w-full bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-200 flex items-center justify-center"
            >
                <RefreshCwIcon className="w-5 h-5 mr-2" />
                Convert More Files
            </button>
        </div>
    );
};

export default ResultDisplay;
