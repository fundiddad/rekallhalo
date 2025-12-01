
import React from 'react';
import { SupportingCharacter } from '../../types';

// --- Character Edit Modal ---
interface CharacterEditModalProps {
    isEditing: boolean;
    tempChar: Partial<SupportingCharacter>;
    setTempChar: React.Dispatch<React.SetStateAction<Partial<SupportingCharacter>>>;
    onClose: () => void;
    onSave: () => void;
    onAutoGenerate: () => void;
    isGenerating: boolean;
}

export const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
    isEditing, tempChar, setTempChar, onClose, onSave, onAutoGenerate, isGenerating
}) => {
    // Determine if the character represents an organization/group
    const isOrg = tempChar.category === 'other' || tempChar.gender === 'organization';

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
            <div className="bg-stone-100 border border-stone-200 p-6 rounded-xl shadow-2xl max-w-sm w-full relative text-gray-800 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                    {isEditing ? '编辑羁绊' : '建立新羁绊'}
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">基本信息</label>
                        <div className="flex gap-2">
                            <input 
                                placeholder="姓名" 
                                value={tempChar.name} 
                                onChange={e => setTempChar(prev => ({ ...prev, name: e.target.value }))} 
                                className="w-[65%] bg-white border border-stone-300 rounded px-2 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 placeholder-gray-400 transition-colors" 
                            />
                            <select 
                                value={tempChar.gender || ""} 
                                onChange={e => setTempChar(prev => ({ ...prev, gender: e.target.value as any }))}
                                className={`w-[35%] rounded px-1 py-2 text-sm outline-none border transition-colors appearance-none text-center cursor-pointer 
                                    ${tempChar.gender === 'male' ? 'text-blue-600 font-bold bg-blue-50 border-blue-300' : 
                                      tempChar.gender === 'female' ? 'text-pink-600 font-bold bg-pink-50 border-pink-300' : 
                                      tempChar.gender === 'other' ? 'text-purple-600 font-bold bg-purple-50 border-purple-300' : 
                                      tempChar.gender === 'organization' ? 'text-slate-600 font-bold bg-slate-50 border-slate-300' :
                                      'text-gray-400 bg-white border-stone-300 hover:bg-stone-50'}`}
                            >
                                <option value="" disabled>选择性别</option>
                                <option value="female">♀ 女性</option>
                                <option value="male">♂ 男性</option>
                                <option value="organization">组织</option>
                                <option value="other">? 其他/无</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">定位与关系</label>
                        <div className="flex flex-col gap-2">
                            <select 
                                value={tempChar.category} 
                                onChange={e => {
                                    const val = e.target.value as any;
                                    setTempChar(prev => ({ 
                                        ...prev, 
                                        category: val,
                                        // Auto-sync gender to 'organization' if category is 'other', unless already set
                                        gender: val === 'other' ? 'organization' : prev.gender 
                                    }));
                                }}
                                className="w-full bg-white border border-stone-300 rounded px-2 py-2 text-sm text-gray-600 outline-none focus:border-blue-500 cursor-pointer hover:bg-stone-50 transition-colors"
                            >
                                <option value="supporting">配角</option>
                                <option value="protagonist">主角(友)</option>
                                <option value="villain">反派</option>
                                <option value="other">其他 (组织/势力)</option>
                            </select>
                            <input 
                                placeholder="关系描述 (例: 青梅竹马, 宿敌)" 
                                value={tempChar.role} 
                                onChange={e => setTempChar(prev => ({ ...prev, role: e.target.value }))} 
                                className="w-full bg-white border border-stone-300 rounded px-2 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 placeholder-gray-400 transition-colors" 
                            />
                        </div>
                    </div>

                    {/* Initial Affinity Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold">初始好感度</label>
                            <span className={`text-xs font-mono font-bold ${(tempChar.initialAffinity || 0) >= 0 ? 'text-pink-600' : 'text-blue-600'}`}>
                                {tempChar.initialAffinity || 0}
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="-50"
                            max="50"
                            step="1"
                            value={tempChar.initialAffinity || 0}
                            onChange={e => setTempChar(prev => ({ ...prev, initialAffinity: parseInt(e.target.value) }))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #ec4899 100%)`
                            }}
                        />
                        <div className="flex justify-between text-[8px] text-gray-400 mt-1">
                            <span>敌对 (-50)</span>
                            <span>中立 (0)</span>
                            <span>亲密 (+50)</span>
                        </div>
                    </div>

                    {/* Display Archetype Info */}
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">角色原型</label>
                        <div className="w-full bg-indigo-50 border border-indigo-100 rounded px-2 py-1.5 text-xs text-gray-700">
                            {isOrg ? (
                                <div className="text-gray-400 italic">组织/势力实体无需设定个人原型</div>
                            ) : (
                                isEditing ? (
                                    tempChar.archetype ? (
                                        <details className="group">
                                            <summary className="list-none flex items-center justify-between cursor-pointer outline-none">
                                                    <div className="font-bold text-indigo-700">{tempChar.archetype}</div>
                                                    <span className="text-[10px] text-indigo-400 transition-transform group-open:rotate-180">▼</span>
                                            </summary>
                                            <div className="text-[10px] text-gray-600 mt-1 pt-1 border-t border-indigo-100/50 animate-fade-in-up">
                                                {tempChar.archetypeDescription}
                                            </div>
                                        </details>
                                    ) : (
                                        <span className="text-gray-400 italic">此角色暂无原型定义</span>
                                    )
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-500 italic text-xs">
                                        <span>🎲</span>
                                        <span>角色原型将在创建时随机赋予...</span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex justify-between items-center">
                            <span>{isOrg ? '组织/群体特征' : '性格与外貌'}</span>
                            <button 
                                onClick={onAutoGenerate}
                                disabled={isGenerating || !tempChar.name || !tempChar.role || !tempChar.gender}
                                className={`
                                    text-[9px] px-2 py-0.5 rounded border transition-colors flex items-center gap-1
                                    ${isGenerating || !tempChar.name || !tempChar.role || !tempChar.gender
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                    }
                                `}
                                title="AI将根据姓名与定位自动生成描述"
                            >
                                {isGenerating ? <span className="animate-spin">⟳</span> : <span></span>}
                                {isGenerating ? '生成中...' : 'AI 自动补全'}
                            </button>
                        </label>
                        <div className="flex flex-col gap-2">
                            <input 
                                placeholder={isOrg ? "组织宗旨/风格 (例: 替天行道, 唯利是图)" : "性格关键词 (例: 傲娇, 腹黑)"} 
                                value={tempChar.personality} 
                                onChange={e => setTempChar(prev => ({ ...prev, personality: e.target.value }))} 
                                className="w-full bg-white border border-stone-300 rounded px-2 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 placeholder-gray-400 transition-colors" 
                            />
                            <textarea 
                                placeholder={isOrg ? "规模与据点描述 (例: 遍布天下, 总舵位于...)" : "外貌描述 (例: 银发红瞳, 身着机甲)"} 
                                value={tempChar.appearance} 
                                onChange={e => setTempChar(prev => ({ ...prev, appearance: e.target.value }))} 
                                className="w-full h-16 bg-white border border-stone-300 rounded px-2 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 placeholder-gray-400 transition-colors resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']" 
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2 text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 clip-path-polygon hover:shadow-lg transition-all active:translate-y-0.5"
                        style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                    >
                        取消
                    </button>
                    <button 
                        onClick={onSave}
                        disabled={!tempChar.name || !tempChar.role || !tempChar.gender}
                        className={`flex-1 py-2 text-sm font-bold clip-path-polygon transition-all shadow-lg active:translate-y-0.5
                            ${(!tempChar.name || !tempChar.role || !tempChar.gender) 
                                ? 'bg-stone-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-500 text-white'}
                        `}
                        style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                    >
                        确认保存
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Skill Edit Modal ---
interface SkillEditModalProps {
    isEditing: boolean;
    tempSkill: { name: string, description: string, level: number, type: 'active' | 'passive' };
    setTempSkill: any; // Using any to allow flexible setter (callback or direct)
    onClose: () => void;
    onSave: () => void;
    onAutoGenerate: () => void;
    isGenerating: boolean;
}

export const SkillEditModal: React.FC<SkillEditModalProps> = ({
    isEditing, tempSkill, setTempSkill, onClose, onSave, onAutoGenerate, isGenerating
}) => {
    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
            <div className="bg-stone-100 border border-stone-200 p-6 rounded-xl shadow-2xl max-w-sm w-full relative text-gray-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h3 className="text-lg font-bold text-yellow-700 mb-4 flex items-center gap-2">
                        {isEditing ? '编辑技能' : '添加新技能'}
                </h3>
                
                <div className="space-y-4">
                    {/* Row 1: Name & Level */}
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">技能信息</label>
                        <div className="flex gap-2">
                            <input 
                                placeholder="技能名称 (如: 炎龙破)" 
                                value={tempSkill.name} 
                                onChange={e => setTempSkill((prev: any) => ({ ...prev, name: e.target.value }))} 
                                className="flex-1 bg-white border border-stone-300 rounded px-2 py-2 text-sm text-gray-800 outline-none focus:border-yellow-500 placeholder-gray-400 transition-colors" 
                            />
                            <input 
                                type="number" 
                                min="1" 
                                max="99" 
                                value={tempSkill.level || 1} 
                                onChange={e => setTempSkill((prev: any) => ({ ...prev, level: parseInt(e.target.value) || 1 }))} 
                                className="w-16 bg-white border border-stone-300 rounded px-2 py-2 text-sm text-gray-800 outline-none focus:border-yellow-500 text-center" 
                                title="技能等级"
                            />
                        </div>
                    </div>

                    {/* Row 2: Type Selection */}
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">技能类型</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setTempSkill((prev: any) => ({...prev, type: 'active'}))} 
                                className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${tempSkill.type === 'active' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 shadow-sm' : 'bg-white text-gray-500 border-stone-300 hover:bg-stone-50'}`}
                            >
                                主动技能
                            </button>
                            <button 
                                onClick={() => setTempSkill((prev: any) => ({...prev, type: 'passive'}))} 
                                className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${tempSkill.type === 'passive' ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm' : 'bg-white text-gray-500 border-stone-300 hover:bg-stone-50'}`}
                            >
                                被动技能
                            </button>
                        </div>
                    </div>

                    {/* Row 3 & 4: Description */}
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex justify-between items-center">
                            <span>效果描述</span>
                            <button 
                                onClick={onAutoGenerate}
                                disabled={isGenerating || !tempSkill.name}
                                className={`
                                    text-[9px] px-2 py-0.5 rounded border transition-colors flex items-center gap-1
                                    ${isGenerating || !tempSkill.name
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100'
                                    }
                                `}
                                title="AI自动生成技能描述"
                            >
                                {isGenerating ? <span className="animate-spin">⟳</span> : <span></span>}
                                {isGenerating ? '生成中...' : 'AI 自动补全'}
                            </button>
                        </label>
                        <textarea 
                            placeholder="描述技能效果 (如: 造成范围火焰伤害)" 
                            value={tempSkill.description} 
                            onChange={e => setTempSkill((prev: any) => ({ ...prev, description: e.target.value }))} 
                            className="w-full h-24 bg-white border border-stone-300 rounded px-2 py-2 text-sm text-gray-800 outline-none focus:border-yellow-500 placeholder-gray-400 transition-colors resize-y custom-scrollbar" 
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2 text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 clip-path-polygon hover:shadow-lg transition-all active:translate-y-0.5"
                        style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                    >
                        取消
                    </button>
                    <button 
                        onClick={onSave}
                        disabled={!tempSkill.name || !tempSkill.description}
                        className={`flex-1 py-2 text-sm font-bold clip-path-polygon transition-all shadow-lg active:translate-y-0.5
                            ${(!tempSkill.name || !tempSkill.description)
                                ? 'bg-stone-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-yellow-600 hover:bg-yellow-500 text-white'}
                        `}
                        style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                    >
                        确认保存
                    </button>
                </div>
            </div>
        </div>
    );
};
