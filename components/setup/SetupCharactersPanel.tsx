
import React from 'react';
import { GameContext, SupportingCharacter } from '../../types';

interface SetupCharactersPanelProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    context: GameContext;
    onAddChar: () => void;
    onEditChar: (char: SupportingCharacter, e: React.MouseEvent) => void;
    onRemoveChar: (id: string, e: React.MouseEvent) => void;
}

export const SetupCharactersPanel: React.FC<SetupCharactersPanelProps> = ({
    className, style, onClick, context, onAddChar, onEditChar, onRemoveChar
}) => {
    
    const getCharacterLabel = (char: SupportingCharacter, allChars: SupportingCharacter[]) => {
        const sameCategory = allChars.filter(c => c.category === char.category);
        const index = sameCategory.findIndex(c => c.id === char.id);
        const numberStr = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][index] || (index + 1).toString();
        
        switch(char.category) {
            case 'protagonist': return `主角(友方) ${numberStr}`;
            case 'villain': return `反派 ${numberStr}`;
            case 'other': return `其他 ${numberStr}`;
            case 'supporting': default: return `配角 ${numberStr}`;
        }
    }

    return (
        <div 
            className={`${className} bg-stone-100/95 backdrop-blur-md border-blue-500 text-gray-800 group`}
            style={style}
            onClick={onClick}
        >
            
            {/* Header with Add Button */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 block"></span>
                    配角 / 羁绊
                </h3>
                <button 
                    onClick={(e) => { e.stopPropagation(); onAddChar(); }}
                    className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-95 z-50 pointer-events-auto"
                    title="添加新配角"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Character List - No Scrollbar Utility */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {context.supportingCharacters.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                            <span className="text-2xl mb-2">👥</span>
                            <span className="text-xs italic">至少添加一位重要配角</span>
                        </div>
                    ) : (
                        context.supportingCharacters.map(char => (
                            <div 
                                key={char.id} 
                                onClick={(e) => onEditChar(char, e)}
                                className={`relative bg-white border p-3 rounded-lg flex justify-between items-center transition-all group hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-stone-200 hover:border-blue-500`}
                                title="点击编辑信息"
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-bold ${char.gender === 'female' ? 'text-pink-600' : char.gender === 'male' ? 'text-blue-600' : 'text-gray-600'}`}>
                                            {char.name}
                                        </span>
                                        <span className={`text-[10px] px-1.5 rounded-sm border ${char.gender === 'female' ? 'border-pink-200 text-pink-500 bg-pink-50' : char.gender === 'male' ? 'border-blue-200 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
                                                {char.gender === 'female' ? '♀' : char.gender === 'male' ? '♂' : '?'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] bg-stone-100 text-gray-600 px-1 rounded border border-stone-200">{getCharacterLabel(char, context.supportingCharacters)}</span>
                                        {char.archetype && (
                                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded border border-indigo-200 font-bold">{char.archetype}</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1">{char.role}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-xs font-bold font-mono ${(char.affinity || char.initialAffinity || 0) >= 0 ? 'text-pink-500' : 'text-blue-500'}`}>
                                                {char.affinity || char.initialAffinity || 0}
                                            </span>
                                            <span className="text-[8px] text-gray-400 uppercase tracking-wider">好感度</span>
                                        </div>
                                        <button 
                                            onClick={(e) => onRemoveChar(char.id, e)} 
                                            className="w-6 h-6 flex items-center justify-center rounded-full bg-stone-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors z-20"
                                            title="移除羁绊"
                                        >
                                            ✕
                                        </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
