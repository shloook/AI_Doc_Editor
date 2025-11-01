
import React from 'react';
import { AppFile } from '../types';
import { XIcon } from './icons';

interface ImageGridProps {
    files: AppFile[];
    onDelete: (id: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ files, onDelete }) => {
    return (
        <div className="w-full mb-8">
             <h2 className="text-2xl font-semibold mb-4 text-slate-200 text-center">Your Images ({files.length}/100)</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-96 overflow-y-auto p-4 bg-slate-800/50 rounded-lg">
                {files.map(file => (
                    <div key={file.id} className="relative group aspect-square">
                        <img
                            src={file.previewUrl}
                            alt={file.file.name}
                            className="w-full h-full object-cover rounded-md shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                             <button
                                onClick={() => onDelete(file.id)}
                                className="absolute top-1 right-1 p-1 bg-slate-800/80 rounded-full text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-red-500"
                                aria-label="Remove image"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageGrid;
