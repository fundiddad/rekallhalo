
import React from 'react';
import { GameContext, StoryGenre, StoryMood, MOOD_LABELS } from '../../types';

interface SetupWorldPanelProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    context: GameContext;
    setContext: React.Dispatch<React.SetStateAction<GameContext>>;
    isStoryNameValid: boolean;
    isAutoName: boolean;
    setIsAutoName: (val: boolean) => void;
    isParsing: boolean;
    handleSmartParse: () => void;
}

export const SetupWorldPanel: React.FC<SetupWorldPanelProps> = ({
    className, style, onClick, context, setContext, isStoryNameValid, isAutoName, setIsAutoName, isParsing, handleSmartParse
}) => {
    return (
        <div 
            className={`${className} bg-stone-100/95 backdrop-blur-md border-purple-500 text-gray-800 group ${!isStoryNameValid ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}`}
            style={style}
            onClick={onClick}
        >
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${!isStoryNameValid ? 'text-red-500 animate-pulse' : 'text-purple-800'}`}>
                <span className={`w-1 h-4 block ${!isStoryNameValid ? 'bg-red-500' : 'bg-purple-500'}`}></span>
                世界观 / 附加设定
            </h3>

            {/* No Scrollbar Utility */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                
                {/* Story Name Input */}
                <div>
                    <label className="text-xs text-purple-700 uppercase tracking-wider mb-2 flex items-center justify-between font-bold">
                        <span>故事名称</span>
                        {!isStoryNameValid && <span className="text-[10px] text-red-500 font-normal">(必填 或 勾选自动)</span>}
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            disabled={isAutoName}
                            value={isAutoName ? '' : (context.storyName || '')} 
                            onChange={(e) => setContext(prev => ({ ...prev, storyName: e.target.value }))} 
                            className={`flex-1 bg-white border rounded px-3 py-2 text-sm text-gray-800 outline-none transition-all placeholder-gray-400 focus:shadow-sm ${isAutoName ? 'bg-gray-100 text-gray-400 border-stone-200 cursor-not-allowed' : 'border-stone-300 focus:border-purple-500'}`}
                            placeholder={isAutoName ? "系统将自主生成..." : "输入故事标题..."} 
                        />
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsAutoName(!isAutoName); }}
                            className={`px-3 py-2 rounded border text-xs font-bold transition-all whitespace-nowrap
                                ${isAutoName 
                                    ? 'bg-purple-100 border-purple-500 text-purple-700 shadow-sm' 
                                    : 'bg-white border-stone-300 text-gray-500 hover:bg-stone-50'}
                            `}
                            title="由AI后端根据世界观信息自主命名"
                        >
                            {isAutoName ? "自动" : "手动"}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-purple-700 uppercase tracking-wider mb-2 block font-bold">故事类型</label>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.values(StoryGenre).filter(g => g !== StoryGenre.CUSTOM).map((g) => (
                            <button key={g} onClick={(e) => { e.stopPropagation(); setContext(prev => ({ ...prev, genre: g })); }} className={`px-2 py-2 rounded text-[10px] md:text-xs transition-all border truncate font-medium ${context.genre === g ? 'bg-purple-100 border-purple-500 text-purple-800 shadow-sm font-bold' : 'bg-white border-stone-200 text-gray-500 hover:bg-stone-50'}`}>
                                {g.split(' - ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                    {/* Custom Genre Input - Compact */}
                    <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-purple-700 uppercase tracking-wider font-bold">自定义故事</label>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSmartParse(); }}
                            disabled={isParsing}
                            className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded border border-purple-300 hover:bg-purple-200 transition-colors shadow-sm"
                            title="智能解析文本，自动填写主角与配角信息"
                        >
                            {isParsing ? "解析中..." : "智能解析"}
                        </button>
                    </div>
                    <div className="relative">
                        <textarea 
                            value={context.customGenre || ''} 
                            onChange={(e) => setContext(prev => ({ ...prev, customGenre: e.target.value }))}
                            onFocus={() => setContext(prev => ({ ...prev, genre: StoryGenre.CUSTOM }))}
                            className="w-full h-10 bg-white border border-stone-300 rounded px-3 py-2 text-[10px] text-gray-800 focus:border-purple-500 outline-none transition-all placeholder-gray-400 resize-y custom-scrollbar focus:shadow-sm leading-relaxed" 
                            placeholder="可粘贴故事大纲、设定集或特定风格要求..." 
                        />
                    </div>
                </div>

                {/* Tone Selection */}
                <div className="pt-2 border-t border-stone-200">
                    <label className="text-xs text-purple-700 uppercase tracking-wider mb-2 block font-bold">故事基调</label>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.values(StoryMood).map((mood) => (
                            <button key={mood} onClick={(e) => { e.stopPropagation(); setContext(prev => ({ ...prev, worldSettings: { ...prev.worldSettings, tone: mood } })); }} className={`px-1 py-2 rounded text-[10px] border transition-all truncate font-medium ${context.worldSettings.tone === mood ? 'bg-purple-100 border-purple-500 text-purple-800 shadow-sm' : 'bg-white border-stone-200 text-gray-500 hover:bg-stone-50'}`}>
                                {MOOD_LABELS[mood]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
