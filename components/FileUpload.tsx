import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from './icons';

interface FileUploadProps {
    onFilesChange: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFilesChange(Array.from(e.target.files));
        }
    };

    // Fix: Corrected the drag event type to HTMLLabelElement to match the element it's used on.
    const handleDragEvent = useCallback((e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    }, []);

    // Fix: Corrected the drag event type to HTMLLabelElement to match the element it's used on.
    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        handleDragEvent(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesChange(Array.from(e.dataTransfer.files));
            e.dataTransfer.clearData();
        }
    }, [handleDragEvent, onFilesChange]);

    return (
        <div className="w-full max-w-2xl text-center animate-fade-in">
            <label
                htmlFor="file-upload"
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDrop={handleDrop}
                className={`
                    flex flex-col items-center justify-center w-full h-64 px-4 
                    border-2 border-dashed rounded-lg cursor-pointer
                    transition-colors duration-300
                    ${isDragging ? 'border-cyan-400 bg-slate-700' : 'border-slate-600 bg-slate-800 hover:bg-slate-700'}
                `}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloudIcon className="w-12 h-12 mb-4 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-300">
                        <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG, or GIF (up to 100 images)</p>
                </div>
                <input id="file-upload" type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
            </label>
        </div>
    );
};

export default FileUpload;
