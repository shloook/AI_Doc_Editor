import React from 'react';
import { ProcessingOptions, ProcessingMode } from '../types';
import { Wand2Icon, FileTextIcon, SheetIcon } from './icons';

interface ProcessingOptionsPanelProps {
    options: ProcessingOptions;
    onOptionsChange: (newOptions: Partial<ProcessingOptions>) => void;
    onSubmit: () => void;
    isProcessing: boolean;
    disabled: boolean;
}

const ProcessingOptionsPanel: React.FC<ProcessingOptionsPanelProps> = ({
    options,
    onOptionsChange,
    onSubmit,
    isProcessing,
    disabled
}) => {

    const modes: { id: ProcessingMode; name: string; description: string; icon: React.FC<any> }[] = [
        { id: 'clean', name: 'Clean Image', description: 'Remove marks, smudges, or artifacts.', icon: Wand2Icon },
        { id: 'extract-text', name: 'Extract Text (OCR)', description: 'Pull all text from the document(s).', icon: FileTextIcon },
        { id: 'extract-table', name: 'Extract Table (CSV)', description: 'Convert a table into CSV format.', icon: SheetIcon },
    ];

    const handleModeChange = (mode: ProcessingMode) => {
        onOptionsChange({ mode });
    };

    return (
        <div className="w-full max-w-2xl p-6 bg-slate-800 rounded-lg shadow-xl animate-fade-in">
            <h2 className="text-2xl font-semibold mb-4 text-slate-200 text-center">Processing Options</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => handleModeChange(mode.id)}
                        disabled={disabled}
                        className={`
                            p-4 text-left rounded-lg border-2 transition-all duration-200
                            flex flex-col items-center justify-center text-center
                            ${options.mode === mode.id
                                ? 'border-cyan-400 bg-cyan-900/30 ring-2 ring-cyan-400'
                                : 'border-slate-600 bg-slate-700 hover:bg-slate-600/70'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <mode.icon className="w-8 h-8 mb-2 text-cyan-300" />
                        <span className="font-semibold text-slate-100">{mode.name}</span>
                        <p className="text-xs text-slate-400 mt-1">{mode.description}</p>
                    </button>
                ))}
            </div>

            {options.mode === 'clean' && (
                <div className="space-y-6 mb-6">
                    <div>
                        <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-slate-300">
                            Instructions
                        </label>
                        <textarea
                            id="prompt"
                            rows={3}
                            value={options.prompt}
                            onChange={(e) => onOptionsChange({ prompt: e.target.value })}
                            disabled={disabled}
                            className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
                            placeholder="e.g., 'Remove the coffee stain from the top right corner.'"
                        />
                    </div>
                    <div>
                        <label htmlFor="cleanSensitivity" className="block mb-2 text-sm font-medium text-slate-300">
                            Clean Sensitivity: {options.cleanSensitivity}
                        </label>
                        <input
                            id="cleanSensitivity"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={options.cleanSensitivity}
                            onChange={(e) => onOptionsChange({ cleanSensitivity: parseFloat(e.target.value) })}
                            disabled={disabled}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label htmlFor="temperature" className="block mb-2 text-sm font-medium text-slate-300">
                        Creativity (Temperature): {options.temperature}
                    </label>
                    <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={options.temperature}
                        onChange={(e) => onOptionsChange({ temperature: parseFloat(e.target.value) })}
                        disabled={disabled}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50"
                    />
                </div>
                
                {options.mode !== 'clean' && (
                    <div className="flex items-center justify-center">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={options.thinkingMode}
                                onChange={(e) => onOptionsChange({ thinkingMode: e.target.checked })}
                                disabled={disabled}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            <span className="ms-3 text-sm font-medium text-slate-300">
                                High Accuracy Mode
                            </span>
                        </label>
                    </div>
                 )}
            </div>

            <button
                onClick={onSubmit}
                disabled={disabled || isProcessing}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {isProcessing ? 'Processing...' : `Start ${modes.find(m => m.id === options.mode)?.name}`}
            </button>
        </div>
    );
};

export default ProcessingOptionsPanel;