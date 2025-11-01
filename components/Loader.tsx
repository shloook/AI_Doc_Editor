
import React from 'react';
import { ProgressUpdate } from '../types';

interface LoaderProps {
    progress: ProgressUpdate;
}

const Loader: React.FC<LoaderProps> = ({ progress }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in w-full max-w-md">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div 
                    className="absolute inset-0 border-4 border-cyan-400 rounded-full animate-spin"
                    style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }}
                ></div>
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-cyan-400">
                    {Math.round(progress.percentage)}%
                </div>
            </div>
            <h2 className="text-2xl font-semibold text-slate-200 mb-2">Processing...</h2>
            <p className="text-slate-400">{progress.message}</p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-4">
                <div 
                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progress.percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default Loader;
