
import React from 'react';
import { GameContext } from '../../types';
import { NARRATIVE_STRUCTURES, NARRATIVE_TECHNIQUES } from '../../constants';

interface SetupNarrativePanelProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    context: GameContext;
    setContext: React.Dispatch<React.SetStateAction<GameContext>>;
}

export const SetupNarrativePanel: React.FC<SetupNarrativePanelProps> = ({
    className, style, onClick, context, setContext
}) => {
    return (
        <div 
            className={`${className} bg-stone-100/95 backdrop-blur-md border-teal-500 text-gray-800 group`}
            style={style}
            onClick={onClick}
        >
            
            <div className="mb-4 border-b border-stone-200 pb-2">
                <h3 className="text-lg font-bold text-teal-800 flex items-center gap-2">
                    <span className="w-1 h-4 bg-teal-500 block"></span>
                    叙事架构与手法
                </h3>
            </div>
            
            {/* No Scrollbar Utility + Grid Layout */}
            <div className="flex-1 overflow-y-auto pr-1 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] space-y-6">
                
                {/* Section 1: Structure */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-teal-700 uppercase tracking-wider font-bold">叙事架构</label>
                        <div className="flex gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setContext(prev => ({ ...prev, narrativeMode: 'none' })); }}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${context.narrativeMode === 'none' ? 'bg-stone-600 text-white border-stone-700' : 'bg-stone-200 text-gray-600 border-stone-300 hover:bg-stone-300'}`}
                            >
                                无
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setContext(prev => ({ ...prev, narrativeMode: 'auto' })); }}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${context.narrativeMode === 'auto' ? 'bg-teal-500 text-white border-teal-600 shadow-sm' : 'bg-white text-teal-600 border-teal-200 hover:bg-teal-50'}`}
                            >
                                自动
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {NARRATIVE_STRUCTURES.map(structure => (
                            <button 
                                key={structure.id}
                                onClick={(e) => { e.stopPropagation(); setContext(prev => ({ ...prev, narrativeMode: prev.narrativeMode === structure.id ? 'auto' : structure.id })); }}
                                title={structure.tooltipText} 
                                className={`
                                    flex flex-col items-center justify-center text-center px-1 py-3 rounded border transition-all relative overflow-hidden
                                    ${context.narrativeMode === structure.id 
                                        ? 'bg-teal-100 border-teal-500 text-teal-900 shadow-sm font-bold' 
                                        : 'bg-white border-stone-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50'
                                    }
                                `}
                            >
                                {context.narrativeMode === structure.id && <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-transparent border-r-teal-500 z-10"></div>}
                                <span className="text-[10px] leading-tight">{structure.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 2: Technique */}
                <div>
                    <div className="flex justify-between items-center mb-2 border-t border-stone-200 pt-4">
                        <label className="text-xs text-teal-700 uppercase tracking-wider font-bold">叙事手法</label>
                        <div className="flex gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setContext(prev => ({ ...prev, narrativeTechnique: 'none' })); }}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${context.narrativeTechnique === 'none' ? 'bg-stone-600 text-white border-stone-700' : 'bg-stone-200 text-gray-600 border-stone-300 hover:bg-stone-300'}`}
                            >
                                无
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setContext(prev => ({ ...prev, narrativeTechnique: 'auto' })); }}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${context.narrativeTechnique === 'auto' ? 'bg-teal-500 text-white border-teal-600 shadow-sm' : 'bg-white text-teal-600 border-teal-200 hover:bg-teal-50'}`}
                            >
                                自动
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {NARRATIVE_TECHNIQUES.map(tech => (
                            <button 
                                key={tech.id}
                                onClick={(e) => { e.stopPropagation(); setContext(prev => ({ ...prev, narrativeTechnique: prev.narrativeTechnique === tech.id ? 'auto' : tech.id })); }}
                                title={tech.tooltipText} 
                                className={`
                                    flex flex-col items-center justify-center text-center px-1 py-3 rounded border transition-all relative overflow-hidden
                                    ${context.narrativeTechnique === tech.id 
                                        ? 'bg-teal-100 border-teal-500 text-teal-900 shadow-sm font-bold' 
                                        : 'bg-white border-stone-200 text-gray-600 hover:border-teal-300 hover:bg-teal-50'
                                    }
                                `}
                            >
                                {context.narrativeTechnique === tech.id && <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-transparent border-r-teal-500 z-10"></div>}
                                <span className="text-[10px] leading-tight">{tech.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
