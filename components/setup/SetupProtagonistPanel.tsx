

import React, { useState } from 'react';
import { GameContext, generateUUID, NarrativePerspective } from '../../types';

interface SetupProtagonistPanelProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    context: GameContext;
    setContext: React.Dispatch<React.SetStateAction<GameContext>>;
    isProtagonistValid: boolean;
    onAddSkill: () => void;
    onEditSkill: (skill: any) => void;
    onRemoveSkill: (id: string, e: React.MouseEvent) => void;
}

export const SetupProtagonistPanel: React.FC<SetupProtagonistPanelProps> = ({
    className, style, onClick, context, setContext, isProtagonistValid, onAddSkill, onEditSkill, onRemoveSkill
}) => {
    // Local state for the collapsible advanced settings
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    return (
        <div 
            className={`${className} bg-stone-100/95 backdrop-blur-md text-gray-800 group ${!isProtagonistValid ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-yellow-500'}`}
            style={style}
            onClick={onClick}
        >
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${!isProtagonistValid ? 'text-red-500 animate-pulse' : 'text-yellow-700'}`}>
                <span className={`w-1 h-4 block ${!isProtagonistValid ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                主角档案 {!isProtagonistValid && <span className="text-[10px] text-red-500 ml-2 font-normal">(必填)</span>}
            </h3>
            {/* No Scrollbar Utility */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {/* Name & Gender: Compact Row */}
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">主角设定</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={context.character.name} 
                            onChange={(e) => setContext(prev => ({ ...prev, character: { ...prev.character, name: e.target.value } }))} 
                            className="flex-1 bg-white border border-stone-300 rounded px-3 py-1.5 text-sm text-gray-800 focus:border-yellow-500 outline-none transition-all placeholder-gray-400 focus:shadow-sm" 
                            placeholder="姓名" 
                        />
                        <div className="flex bg-stone-100 p-1 rounded border border-stone-200 shrink-0 gap-1">
                                {['male', 'female', 'other'].map((g) => {
                                const isSelected = context.character.gender === g;
                                let activeClass = '';
                                let inactiveClass = '';
                                let icon = '';
                                let label = '';

                                if (g === 'male') {
                                    activeClass = 'bg-blue-500 text-white shadow-md ring-1 ring-blue-600';
                                    inactiveClass = 'text-gray-400 hover:text-blue-500 hover:bg-blue-50';
                                    icon = '♂';
                                    label = '男';
                                } else if (g === 'female') {
                                    activeClass = 'bg-pink-500 text-white shadow-md ring-1 ring-pink-600';
                                    inactiveClass = 'text-gray-400 hover:text-pink-500 hover:bg-pink-50';
                                    icon = '♀';
                                    label = '女';
                                } else {
                                    activeClass = 'bg-purple-500 text-white shadow-md ring-1 ring-purple-600';
                                    inactiveClass = 'text-gray-400 hover:text-purple-500 hover:bg-purple-50';
                                    icon = '⚥';
                                    label = '其他';
                                }

                                return (
                                    <button 
                                        key={g} 
                                        onClick={() => setContext(prev => ({ ...prev, character: { ...prev.character, gender: g as any } }))} 
                                        className={`px-3 py-1.5 text-xs rounded transition-all flex items-center justify-center gap-1 font-bold ${isSelected ? activeClass : inactiveClass}`}
                                        title={label}
                                    >
                                        <span className="text-sm leading-none">{icon}</span>
                                        <span>{label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Perspective Selector */}
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">叙事视角</label>
                    <div className="flex bg-white border border-stone-300 rounded p-1">
                        {[
                            { id: 'third', label: '第三人称 (他/她)', desc: '上帝视角，全知全能' },
                            { id: 'first', label: '第一人称 (我)', desc: '代入感强，主观体验' },
                            { id: 'second', label: '第二人称 (你)', desc: '跑团风格，互动感' },
                            { id: 'omniscient', label: '全知视角', desc: '宏大叙事，群像描写' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setContext(prev => ({ ...prev, character: { ...prev.character, perspective: opt.id as NarrativePerspective } }))}
                                className={`flex-1 py-1.5 text-[10px] md:text-xs rounded font-bold transition-all ${
                                    (context.character.perspective || 'third') === opt.id 
                                    ? 'bg-yellow-100 text-yellow-800 shadow-sm border border-yellow-200' 
                                    : 'text-gray-500 hover:bg-stone-100'
                                }`}
                                title={opt.desc}
                            >
                                {opt.label.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">核心特质</label>
                    <textarea 
                        value={context.character.trait} 
                        onChange={(e) => setContext(prev => ({ ...prev, character: { ...prev.character, trait: e.target.value } }))} 
                        className="w-full h-24 bg-white border border-stone-300 rounded px-3 py-1.5 text-sm text-gray-800 focus:border-yellow-500 outline-none transition-all placeholder-gray-400 resize-y focus:shadow-sm leading-tight custom-scrollbar" 
                        placeholder="描述主角的性格、外貌或特殊能力..." 
                    />
                </div>

                {/* Special Rules: Moved from Panel 1 */}
                <div className="border-t border-stone-200 pt-2">
                        <button 
                        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                        className={`w-full flex items-center justify-between p-2 rounded border transition-all ${showAdvancedSettings ? 'bg-stone-200 border-gray-400' : 'bg-white border-stone-200 hover:bg-stone-50'}`}
                    >
                        <div className="flex flex-col text-left">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">特殊规则配置</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                                {(() => {
                                    const actives = [];
                                    if (context.worldSettings.isHarem) actives.push("后宫");
                                    if (context.worldSettings.isAdult) actives.push("成人");
                                    if (context.worldSettings.hasSystem) actives.push("系统");
                                    return actives.length > 0 ? `已开启: ${actives.join(', ')}` : "点击展开 (可多选)";
                                })()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 mr-1">
                                {context.worldSettings.isHarem && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm" title="后宫模式"></div>}
                                {context.worldSettings.isAdult && <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm" title="成人内容"></div>}
                                {context.worldSettings.hasSystem && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" title="系统加持"></div>}
                            </div>
                            <span className={`text-gray-400 text-xs transform transition-transform duration-300 ${showAdvancedSettings ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                    </button>

                    {showAdvancedSettings && (
                        <div className="space-y-1 animate-fade-in-up p-2 bg-stone-50 rounded border border-stone-200 mt-1">
                            <button onClick={() => setContext(prev => ({ ...prev, worldSettings: { ...prev.worldSettings, isHarem: !prev.worldSettings.isHarem } }))} className={`w-full flex items-center justify-between p-2 rounded border transition-all ${context.worldSettings.isHarem ? 'bg-purple-100 border-purple-500 text-purple-800' : 'bg-white border-stone-200 text-gray-500 hover:bg-stone-50'}`}>
                                <div className="flex flex-col text-left"><span className="text-xs font-bold">后宫模式</span><span className="text-[10px] opacity-70">多重羁绊 / 情感线</span></div>
                                <div className={`w-3 h-3 rounded-full border border-stone-300 ${context.worldSettings.isHarem ? 'bg-purple-500 shadow-sm' : 'bg-gray-300'}`}></div>
                            </button>
                            <button onClick={() => setContext(prev => ({ ...prev, worldSettings: { ...prev.worldSettings, isAdult: !prev.worldSettings.isAdult } }))} className={`w-full flex items-center justify-between p-2 rounded border transition-all ${context.worldSettings.isAdult ? 'bg-red-100 border-red-500 text-red-800' : 'bg-white border-stone-200 text-gray-500 hover:bg-stone-50'}`}>
                                <div className="flex flex-col text-left"><span className="text-xs font-bold">成人内容</span><span className="text-[10px] opacity-70">深度剧情 / 人性黑暗面</span></div>
                                <div className={`w-3 h-3 rounded-full border border-stone-300 ${context.worldSettings.isAdult ? 'bg-red-500 shadow-sm' : 'bg-gray-300'}`}></div>
                            </button>
                            <button onClick={() => setContext(prev => ({ ...prev, worldSettings: { ...prev.worldSettings, hasSystem: !prev.worldSettings.hasSystem } }))} className={`w-full flex items-center justify-between p-2 rounded border transition-all ${context.worldSettings.hasSystem ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-white border-stone-200 text-gray-500 hover:bg-stone-50'}`}>
                                <div className="flex flex-col text-left"><span className="text-xs font-bold">系统加持</span><span className="text-[10px] opacity-70">任务辅助 / 奖励机制</span></div>
                                <div className={`w-3 h-3 rounded-full border border-stone-300 ${context.worldSettings.hasSystem ? 'bg-blue-500 shadow-sm' : 'bg-gray-300'}`}></div>
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-1 border-t border-stone-200 pt-2">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2 font-bold">
                            <span>技能系统</span>
                            <span className="text-[10px] text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded">总等级: Lv.{context.character.skills.reduce((acc, s) => acc + s.level, 0) || 1}</span>
                        </label>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAddSkill(); }}
                            className="w-6 h-6 rounded-full bg-yellow-50 border border-yellow-300 text-yellow-600 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all shadow-sm active:scale-95 pointer-events-auto"
                            title="添加技能"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="space-y-1.5">
                        {context.character.skills.length === 0 ? (
                            <div className="bg-stone-50 p-3 rounded border border-stone-200 text-center">
                                <span className="text-[10px] text-gray-400 italic">暂无技能，点击右上角 + 添加</span>
                            </div>
                        ) : (
                            context.character.skills.map(skill => (
                                <div 
                                    key={skill.id} 
                                    onClick={(e) => { e.stopPropagation(); onEditSkill(skill); }}
                                    className={`bg-white p-2 rounded border shadow-sm flex justify-between items-start text-xs transition-colors cursor-pointer border-stone-200 hover:border-yellow-300 hover:bg-stone-50`}
                                    title="点击编辑"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-800 flex items-center gap-1 mb-0.5">
                                            <span className={`text-[9px] px-1 rounded font-bold shrink-0 ${skill.type === 'passive' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {skill.type === 'passive' ? '被' : '主'}
                                            </span>
                                            <span className="truncate">{skill.name}</span>
                                            <span className="text-[9px] text-yellow-700 bg-yellow-200 px-1 rounded ml-1 font-bold shrink-0">Lv.{skill.level || 1}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 break-words whitespace-pre-wrap leading-tight">{skill.description}</div>
                                    </div>
                                    <button onClick={(e) => onRemoveSkill(skill.id, e)} className="text-gray-400 hover:text-red-500 ml-2 p-1 font-bold shrink-0">✕</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};