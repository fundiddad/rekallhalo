
import React, { useState, useEffect, useRef } from 'react';
import { PlotChapter, SupportingCharacter, generateUUID, GameContext, ScheduledEvent } from '../../types';
import { AddEventModal } from '../modals/GameplayModals';

interface PlotBlueprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    context: GameContext;
    setContext: React.Dispatch<React.SetStateAction<GameContext>>;
}

interface Coords {
    x: number;
    y: number;
}

// Extracted Editor Component to fix input focus loss
const ChapterEditor: React.FC<{
    chapter: PlotChapter;
    characters: SupportingCharacter[];
    events: ScheduledEvent[];
    onUpdate: (id: string, field: keyof PlotChapter, value: any) => void;
    onUpdateCriteria: (id: string, field: 'minKeyEvents' | 'minInteractions', value: number) => void;
    onToggleCharacter: (id: string, charName: string) => void;
    onAddPrereq: (id: string, req: string) => void;
    onRemovePrereq: (id: string, req: string) => void;
    onOpenAddEvent: () => void;
    onOpenEditEvent: (e: ScheduledEvent) => void;
    onDeleteEvent: (id: string) => void;
    onClose: () => void;
}> = ({ chapter, characters, events, onUpdate, onUpdateCriteria, onToggleCharacter, onAddPrereq, onRemovePrereq, onOpenAddEvent, onOpenEditEvent, onDeleteEvent, onClose }) => {
    
    // Internal state for input field to prevent flicker/focus loss on parent re-render
    const [localPrereq, setLocalPrereq] = useState('');
    const isCompleted = chapter.status === 'completed';

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            {/* FIXED HEADER - Sticky Top */}
            <div className="flex-none flex justify-between items-center px-6 py-4 border-b border-stone-100 bg-white z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">章节详情</h2>
                    {isCompleted && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-bold border border-green-200">已完结</span>}
                    {chapter.status === 'active' && <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-0.5 rounded font-bold border border-cyan-200 animate-pulse">进行中</span>}
                </div>
                <button 
                    onClick={onClose} 
                    className="bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-500 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors shadow-sm"
                    title="关闭面板"
                >
                    ✕
                </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 animate-fade-in-right text-gray-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                
                {/* Adjusted Grid */}
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="space-y-1 flex-1 w-full">
                        <label className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">章节标题</label>
                        <input 
                            value={chapter.title} 
                            onChange={(e) => onUpdate(chapter.id, 'title', e.target.value)}
                            className="w-full text-base font-bold border-b border-stone-300 focus:border-cyan-500 outline-none py-1 bg-transparent text-gray-800 placeholder-gray-300 transition-colors h-9"
                            placeholder="例如：初入江湖"
                            disabled={isCompleted} 
                        />
                    </div>
                    <div className="space-y-1 flex-1 w-full">
                        <label className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider flex justify-between">
                            <span>剧情节奏</span>
                            <span className="text-gray-400 text-[9px]">{chapter.pacing === 'fast' ? '紧凑激烈' : chapter.pacing === 'slow' ? '铺垫舒缓' : '标准推进'}</span>
                        </label>
                        <div className="flex bg-stone-100 p-1 rounded border border-stone-200 h-9">
                            {['fast', 'standard', 'slow'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => onUpdate(chapter.id, 'pacing', p)}
                                    className={`flex-1 text-[10px] rounded font-bold transition-all ${
                                        chapter.pacing === p 
                                        ? 'bg-cyan-500 text-white shadow-sm' 
                                        : 'text-gray-500 hover:bg-stone-200'
                                    } ${isCompleted ? 'opacity-70 cursor-default' : ''}`}
                                    disabled={isCompleted}
                                >
                                    {p === 'fast' ? '快速' : p === 'standard' ? '标准' : '缓慢'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Prerequisites Section */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider flex items-center justify-between">
                        <span>前置条件 / 解锁要求</span>
                        <span className="text-[9px] text-gray-400">如: 需完成前章、需持有物品</span>
                    </label>
                    <div className="flex gap-2">
                        <input 
                            value={localPrereq}
                            onChange={(e) => setLocalPrereq(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { onAddPrereq(chapter.id, localPrereq); setLocalPrereq(''); } }}
                            className="flex-1 bg-white border border-stone-300 rounded px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-cyan-500 placeholder-gray-400"
                            placeholder="输入条件后回车 (例: 获得古剑)"
                            disabled={isCompleted}
                        />
                        <button 
                            onClick={() => { onAddPrereq(chapter.id, localPrereq); setLocalPrereq(''); }}
                            className="px-3 bg-cyan-100 text-cyan-700 text-xs font-bold rounded hover:bg-cyan-200"
                            disabled={isCompleted || !localPrereq}
                        >
                            添加
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {(chapter.prerequisites || []).map((req, i) => (
                            <div key={i} className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] px-2 py-1 rounded shadow-sm">
                                <span>🔒 {req}</span>
                                {!isCompleted && (
                                    <button onClick={() => onRemovePrereq(chapter.id, req)} className="text-amber-400 hover:text-amber-600 font-bold ml-1">✕</button>
                                )}
                            </div>
                        ))}
                        {(!chapter.prerequisites || chapter.prerequisites.length === 0) && (
                            <div className="text-[10px] text-gray-400 italic">默认逻辑：自动承接上一章</div>
                        )}
                    </div>
                </div>

                {/* Completion Criteria (Sliders) */}
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">章节完成条件</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Word Count Slider */}
                        <div>
                            <div className="flex justify-between text-[9px] text-gray-500 mb-1">
                                <span>目标字数</span>
                                <span className="font-bold text-cyan-600 font-mono">{chapter.targetWordCount}</span>
                            </div>
                            <input 
                                type="range" min="500" max="10000" step="100" 
                                value={chapter.targetWordCount}
                                onChange={(e) => onUpdate(chapter.id, 'targetWordCount', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                disabled={isCompleted}
                            />
                        </div>
                        
                        {/* Key Events Slider */}
                        <div>
                            <div className="flex justify-between text-[9px] text-gray-500 mb-1">
                                <span>最少伏笔触发</span>
                                <span className="font-bold text-cyan-600 font-mono">{chapter.completionCriteria?.minKeyEvents || 0}</span>
                            </div>
                            <input 
                                type="range" min="0" max="10" step="1"
                                value={chapter.completionCriteria?.minKeyEvents || 0}
                                onChange={(e) => onUpdateCriteria(chapter.id, 'minKeyEvents', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                disabled={isCompleted}
                            />
                        </div>
                        
                        {/* Interactions Slider */}
                        <div>
                            <div className="flex justify-between text-[9px] text-gray-500 mb-1">
                                <span>最少关键互动</span>
                                <span className="font-bold text-cyan-600 font-mono">{chapter.completionCriteria?.minInteractions || 0}</span>
                            </div>
                            <input 
                                type="range" min="0" max="20" step="1"
                                value={chapter.completionCriteria?.minInteractions || 0}
                                onChange={(e) => onUpdateCriteria(chapter.id, 'minInteractions', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                disabled={isCompleted}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">关键出场人物</label>
                    <div className="flex flex-wrap gap-2 p-2 bg-stone-50 rounded border border-stone-200 min-h-[42px]">
                        {characters.map(char => (
                            <button
                                key={char.id}
                                onClick={() => !isCompleted && onToggleCharacter(chapter.id, char.name)}
                                className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                                    chapter.keyCharacters.includes(char.name)
                                    ? 'bg-cyan-500 text-white border-cyan-600 shadow-sm'
                                    : 'bg-white text-gray-500 border-stone-200 hover:border-cyan-300 hover:text-cyan-600'
                                } ${isCompleted ? 'opacity-70 cursor-default' : ''}`}
                            >
                                {char.name}
                            </button>
                        ))}
                        {characters.length === 0 && <span className="text-[10px] text-gray-400 italic">请先在「配角 / 羁绊」面板添加角色</span>}
                    </div>
                </div>

                {/* Local Key Events */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">关键事件 / 硬性约束 (本章必做)</label>
                        <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 rounded">用于控制本章节奏</span>
                    </div>
                    <input 
                        value={chapter.keyEvents} 
                        onChange={(e) => onUpdate(chapter.id, 'keyEvents', e.target.value)}
                        className="w-full bg-red-50/30 border border-red-100 rounded px-3 py-2 text-xs text-gray-800 placeholder-red-200 focus:border-red-300 outline-none transition-colors"
                        placeholder="本章必须发生的情节点，例如：主角获得神器..."
                        disabled={isCompleted}
                    />
                </div>

                {/* Global Scheduled Events Section */}
                <div className="space-y-2 pt-2 border-t border-stone-100 mt-2">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">预设伏笔 / 事件队列 (全局悬浮)</h4>
                        <button 
                            onClick={onOpenAddEvent}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded px-2 py-0.5 text-[10px] font-bold transition-colors shadow-sm flex items-center gap-1"
                            title="添加新预设"
                        >
                            <span>+</span> 新增
                        </button>
                    </div>
                    <div className="text-[9px] text-gray-400 mb-2">这些事件不局限于当前章节，AI会根据剧情发展灵活插入。</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {events.filter(e => e.status === 'pending').map(e => (
                            <div 
                                key={e.id} 
                                onClick={() => onOpenEditEvent(e)}
                                className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded shadow-sm relative group cursor-pointer hover:bg-yellow-100 transition-colors"
                            >
                                <div className="text-[9px] text-gray-500 flex justify-between font-bold">
                                    <span>{e.type}</span>
                                    <button 
                                        onClick={(evt) => { evt.stopPropagation(); onDeleteEvent(e.id); }}
                                        className="text-red-300 hover:text-red-500 font-bold px-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="text-[10px] text-gray-800 mt-1 leading-tight line-clamp-2">{e.description}</div>
                            </div>
                        ))}
                        {events.filter(e => e.status === 'pending').length === 0 && (
                            <div className="text-[10px] text-gray-400 text-center italic py-2 border-2 border-dashed border-stone-100 rounded col-span-full">暂无待触发伏笔</div>
                        )}
                    </div>
                </div>

                <div className="space-y-1 flex-1 flex flex-col pt-2">
                    <label className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">剧情摘要 / 细纲</label>
                    <textarea 
                        value={chapter.summary}
                        onChange={(e) => onUpdate(chapter.id, 'summary', e.target.value)}
                        className="w-full h-32 bg-white border border-stone-300 rounded p-3 text-sm text-gray-700 leading-relaxed outline-none focus:border-cyan-500 transition-all resize-none placeholder-gray-300 custom-scrollbar"
                        placeholder="简要描述本章的起承转合..."
                        disabled={isCompleted}
                    />
                </div>
            </div>
        </div>
    );
};

export const PlotBlueprintModal: React.FC<PlotBlueprintModalProps> = ({ 
    isOpen, onClose, context, setContext 
}) => {
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<ScheduledEvent | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
    
    // Bulk Mode State
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
    const [bulkWordCount, setBulkWordCount] = useState<number>(3000); 

    // Graph View State
    const [nodePositions, setNodePositions] = useState<Record<string, {x: number, y: number}>>({});
    const [canvasPan, setCanvasPan] = useState<Coords>({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [lastMousePos, setLastMousePos] = useState<Coords>({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

    const chapters = context.plotBlueprint || [];
    const characters = context.supportingCharacters || [];
    const events = context.scheduledEvents || [];

    const setChapters = (val: PlotChapter[]) => {
        setContext(prev => ({ ...prev, plotBlueprint: val }));
    };

    const filteredChapters = chapters.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.summary && c.summary.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Initial positioning for graph nodes
    useEffect(() => {
        if (isOpen && viewMode === 'graph') {
            setNodePositions(prev => {
                const newPositions = { ...prev };
                let hasChanges = false;
                
                chapters.forEach((c, i) => {
                    if (!newPositions[c.id]) {
                        // Default layout: Horizontal line with some organic jitter
                        newPositions[c.id] = { 
                            x: 100 + (i * 280), 
                            y: 300 + (Math.sin(i) * 50) 
                        };
                        hasChanges = true;
                    }
                });
                
                return hasChanges ? newPositions : prev;
            });
        }
    }, [isOpen, viewMode, chapters.length]);

    // Exit bulk mode when switching views
    useEffect(() => {
        if (viewMode === 'graph') {
            setIsBulkMode(false);
            setSelectedChapterIds(new Set());
        }
    }, [viewMode]);

    if (!isOpen) return null;

    // --- Bulk Logic ---
    const toggleChapterSelection = (id: string) => {
        const newSet = new Set(selectedChapterIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedChapterIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedChapterIds.size === filteredChapters.length) {
            setSelectedChapterIds(new Set());
        } else {
            setSelectedChapterIds(new Set(filteredChapters.map(c => c.id)));
        }
    };

    const handleBulkUpdate = (field: keyof PlotChapter, value: any) => {
        if (selectedChapterIds.size === 0) return;
        const updatedChapters = chapters.map(c => 
            selectedChapterIds.has(c.id) ? { ...c, [field]: value } : c
        );
        setChapters(updatedChapters);
        // Do NOT clear selection to allow multiple edits
    };

    const handleBulkDelete = () => {
        if (selectedChapterIds.size === 0) return;
        if (!confirm(`确定要删除选中的 ${selectedChapterIds.size} 个章节吗？`)) return;
        const updatedChapters = chapters.filter(c => !selectedChapterIds.has(c.id));
        setChapters(updatedChapters);
        setSelectedChapterIds(new Set());
        setIsBulkMode(false);
    };

    // --- CRUD Logic ---

    const handleAddChapter = () => {
        const newChapter: PlotChapter = {
            id: generateUUID(),
            title: `第 ${chapters.length + 1} 章`,
            targetWordCount: 3000,
            summary: '',
            keyCharacters: [],
            keyEvents: '',
            pacing: 'standard',
            status: 'pending',
            trackedStats: { currentWordCount: 0, eventsTriggered: 0, interactionsCount: 0 },
            prerequisites: []
        };
        setChapters([...chapters, newChapter]);
        setActiveChapterId(newChapter.id);
        
        // Auto-position new node relative to the last one (or center if none)
        if (viewMode === 'graph') {
            const lastChapter = chapters[chapters.length - 1];
            const lastPos = lastChapter ? nodePositions[lastChapter.id] : { x: 0, y: 300 };
            setNodePositions(prev => ({
                ...prev,
                [newChapter.id]: { x: (lastPos?.x || 0) + 280, y: lastPos?.y || 300 }
            }));
        }
        
        if (searchTerm) setSearchTerm('');
    };

    const handleDeleteChapter = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setChapters(chapters.filter(c => c.id !== id));
        if (activeChapterId === id) setActiveChapterId(null);
        // Also remove position to keep state clean
        setNodePositions(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const updateChapter = (id: string, field: keyof PlotChapter, value: any) => {
        setChapters(chapters.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const updateCompletionCriteria = (id: string, field: 'minKeyEvents' | 'minInteractions', value: number) => {
        setChapters(chapters.map(c => {
            if (c.id !== id) return c;
            const newCriteria = { ...(c.completionCriteria || {}) };
            newCriteria[field] = value;
            return { ...c, completionCriteria: newCriteria };
        }));
    };

    const toggleCharacter = (chapterId: string, charName: string) => {
        const chapter = chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        
        let newChars = chapter.keyCharacters || [];
        if (newChars.includes(charName)) {
            newChars = newChars.filter(n => n !== charName);
        } else {
            newChars = [...newChars, charName];
        }
        updateChapter(chapterId, 'keyCharacters', newChars);
    };

    // Prerequisites Logic
    const addPrerequisite = (chapterId: string, prereq: string) => {
        const chapter = chapters.find(c => c.id === chapterId);
        if (!chapter || !prereq.trim()) return;
        const currentPrereqs = chapter.prerequisites || [];
        if (!currentPrereqs.includes(prereq.trim())) {
            updateChapter(chapterId, 'prerequisites', [...currentPrereqs, prereq.trim()]);
        }
    };

    const removePrerequisite = (chapterId: string, prereq: string) => {
        const chapter = chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        const currentPrereqs = chapter.prerequisites || [];
        updateChapter(chapterId, 'prerequisites', currentPrereqs.filter(p => p !== prereq));
    };

    // --- List Mode Drag ---
    const handleListDragStart = (e: React.DragEvent, idx: number) => {
        setDraggedIdx(idx);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleListDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleListDrop = (e: React.DragEvent, dropIdx: number) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === dropIdx) return;
        if (searchTerm || isBulkMode) return; // Disable drag in bulk mode

        const newChapters = [...chapters];
        const [movedChapter] = newChapters.splice(draggedIdx, 1);
        newChapters.splice(dropIdx, 0, movedChapter);
        setChapters(newChapters);
        setDraggedIdx(null);
    };

    // --- Graph Canvas Interaction ---
    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        setIsPanning(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDraggingNodeId(id);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setCanvasPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        } else if (draggingNodeId) {
            const dx = (e.clientX - lastMousePos.x) / scale;
            const dy = (e.clientY - lastMousePos.y) / scale;
            setNodePositions(prev => ({
                ...prev,
                [draggingNodeId]: {
                    x: (prev[draggingNodeId]?.x || 0) + dx,
                    y: (prev[draggingNodeId]?.y || 0) + dy
                }
            }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleCanvasMouseUp = () => {
        setIsPanning(false);
        setDraggingNodeId(null);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(scale + delta, 0.2), 2);
        
        // Zoom towards center logic is simplified here to just zoom center
        setScale(newScale);
    };

    const handleResetLayout = () => {
        const newPositions: Record<string, {x: number, y: number}> = {};
        chapters.forEach((c, i) => {
            newPositions[c.id] = { x: 100 + (i * 280), y: 300 + (Math.sin(i) * 50) };
        });
        setNodePositions(newPositions);
        setCanvasPan({ x: 0, y: 0 });
        setScale(1);
    };

    // Event Management
    const handleAddEvent = (eventData: Omit<ScheduledEvent, 'id' | 'createdTurn' | 'status'>) => {
        const newEvent: ScheduledEvent = {
            ...eventData,
            id: generateUUID(),
            createdTurn: 0,
            status: 'pending'
        };
        setContext(prev => ({
            ...prev,
            scheduledEvents: [...(prev.scheduledEvents || []), newEvent]
        }));
    };

    const handleUpdateEvent = (updatedEvent: ScheduledEvent) => {
        setContext(prev => ({
            ...prev,
            scheduledEvents: (prev.scheduledEvents || []).map(e => e.id === updatedEvent.id ? updatedEvent : e)
        }));
    };

    const handleDeleteEvent = (id: string) => {
        setContext(prev => ({
            ...prev,
            scheduledEvents: (prev.scheduledEvents || []).filter(e => e.id !== id)
        }));
    };

    const openAddEvent = () => {
        setEventToEdit(null);
        setShowEventModal(true);
    };

    const openEditEvent = (event: ScheduledEvent) => {
        setEventToEdit(event);
        setShowEventModal(true);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in-up">
            <div className="w-full h-full md:w-[85%] max-h-[75vh] min-h-[550px] max-w-6xl bg-stone-100 md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
                
                {/* Global Close Button - Only show if NO chapter is selected in list mode (or if we need a fallback). 
                    When a chapter is selected, the ChapterEditor provides its own fixed close button. 
                */}
                {viewMode === 'list' && !activeChapterId && (
                    <div className="absolute top-0 right-0 p-4 z-[120]">
                        <button onClick={onClose} className="bg-stone-200 hover:bg-red-100 text-stone-500 hover:text-red-500 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl transition-colors shadow-sm">✕</button>
                    </div>
                )}

                {/* Left Panel: Grows to full width if viewMode is 'graph' */}
                <div className={`flex flex-col h-1/3 md:h-full overflow-hidden shrink-0 transition-all duration-300 ${viewMode === 'graph' ? 'w-full bg-stone-100' : 'w-full md:w-72 bg-stone-50 border-r border-stone-200 relative'}`}>
                    <div className={`p-5 border-b border-stone-200 bg-stone-100 flex justify-between items-center ${viewMode === 'graph' ? 'absolute top-0 left-0 right-0 z-[70] bg-white/90 backdrop-blur-sm shadow-sm' : ''}`}>
                        <h3 className="text-lg font-bold text-cyan-800 tracking-widest uppercase flex items-center gap-2">
                            <span>剧情细纲</span>
                            {viewMode === 'graph' && <span className="text-[10px] bg-cyan-100 text-cyan-700 px-2 rounded-full">思维导图模式</span>}
                        </h3>
                        <div className="flex gap-2">
                            {viewMode === 'graph' && (
                                <button 
                                    onClick={handleResetLayout}
                                    className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors border border-gray-300"
                                    title="重置节点排列"
                                >
                                    ↺ 重置布局
                                </button>
                            )}
                            {viewMode === 'list' && (
                                <button 
                                    onClick={() => { setIsBulkMode(!isBulkMode); setSelectedChapterIds(new Set()); setActiveChapterId(null); }}
                                    className={`text-[10px] px-2 py-1 rounded transition-colors border ${isBulkMode ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-bold' : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'}`}
                                >
                                    {isBulkMode ? '完成管理' : '批量管理'}
                                </button>
                            )}
                            <button 
                                onClick={() => setViewMode(viewMode === 'list' ? 'graph' : 'list')}
                                className="text-[10px] bg-cyan-100 text-cyan-700 px-2 py-1 rounded hover:bg-cyan-200 transition-colors z-[70] relative border border-cyan-200"
                                title={viewMode === 'list' ? "切换至自由拖拽视图" : "切换至列表排序"}
                            >
                                {viewMode === 'list' ? '☊ 脑图视图' : '☰ 列表视图'}
                            </button>
                            {viewMode === 'graph' && (
                                 <button onClick={onClose} className="bg-stone-200 hover:bg-red-100 text-stone-500 hover:text-red-500 rounded px-3 py-1 font-bold transition-colors shadow-sm text-xs">退出</button>
                            )}
                        </div>
                    </div>
                    
                    {/* Search Bar - Only in List Mode */}
                    {viewMode === 'list' && !isBulkMode && (
                        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="搜索章节..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-stone-300 rounded-lg py-1.5 pl-8 pr-2 text-xs text-gray-700 outline-none focus:border-cyan-500 transition-all placeholder-gray-400"
                                />
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex-1 overflow-hidden relative">
                        {viewMode === 'list' ? (
                            <>
                                <div className={`h-full overflow-y-auto p-4 space-y-0 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${isBulkMode ? 'pb-32' : ''}`}>
                                    {/* Chapters List with DnD */}
                                    <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-stone-200 pointer-events-none"></div>
                                    
                                    {filteredChapters.length === 0 && searchTerm && (
                                        <div className="pl-10 pb-4 text-xs text-gray-400 italic">未找到匹配章节</div>
                                    )}

                                    {filteredChapters.map((chapter, idx) => {
                                        const isCompleted = chapter.status === 'completed';
                                        const isActive = chapter.status === 'active';
                                        const isSelected = selectedChapterIds.has(chapter.id);
                                        
                                        let borderClass = 'border-stone-200 hover:border-cyan-300';
                                        if (isBulkMode && isSelected) borderClass = 'bg-cyan-50 border-cyan-400 shadow-sm';
                                        else if (isCompleted) borderClass = 'border-l-4 border-l-green-500 border-t border-r border-b border-green-200 bg-green-50/50';
                                        else if (isActive) borderClass = 'border-l-4 border-l-cyan-500 border-t border-r border-b border-cyan-200 bg-cyan-50 shadow-[0_0_10px_rgba(6,182,212,0.2)] animate-pulse-slow';
                                        else if (activeChapterId === chapter.id) borderClass = 'bg-white border-cyan-400 shadow-md translate-x-1 ring-1 ring-cyan-200';
                                        else borderClass = 'bg-white border-stone-200 hover:border-cyan-300';

                                        const isDragging = draggedIdx === idx;

                                        return (
                                            <div 
                                                key={chapter.id} 
                                                draggable={!searchTerm && !isBulkMode} // Disable drag when searching or bulk
                                                onDragStart={(e) => handleListDragStart(e, idx)}
                                                onDragOver={(e) => handleListDragOver(e, idx)}
                                                onDrop={(e) => handleListDrop(e, idx)}
                                                onClick={() => {
                                                    if (isBulkMode) toggleChapterSelection(chapter.id);
                                                    else setActiveChapterId(chapter.id);
                                                }}
                                                className={`relative cursor-pointer group transition-opacity duration-300 ${isBulkMode ? 'pl-12 pb-4' : 'pl-10 pb-6'} ${activeChapterId === chapter.id ? 'opacity-100' : 'opacity-80 hover:opacity-100'} ${isDragging ? 'opacity-30' : ''}`}
                                            >
                                                {/* Checkbox for Bulk Mode */}
                                                {isBulkMode && (
                                                    <div className="absolute left-2 top-4 w-6 h-6 flex items-center justify-center z-20">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-600' : 'bg-white border-stone-300'}`}>
                                                            {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Timeline Node */}
                                                <div className={`absolute left-5 top-1 w-4 h-4 rounded-full border-2 transition-all z-10 flex items-center justify-center 
                                                    ${isCompleted ? 'bg-green-500 border-green-600' : isActive ? 'bg-cyan-500 border-cyan-300 scale-125' : activeChapterId === chapter.id ? 'bg-cyan-500 border-cyan-300' : 'bg-white border-stone-300 group-hover:border-cyan-400'}`}>
                                                    {isCompleted && <span className="text-[8px] text-white font-bold">✓</span>}
                                                </div>
                                                
                                                <div className={`p-2.5 rounded-lg border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:shadow-md ${borderClass}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                            {!isBulkMode && <span className="cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500" title="拖拽调整顺序">⣿</span>}
                                                            #{chapters.findIndex(c => c.id === chapter.id) + 1}
                                                        </span>
                                                        <span className={`text-[9px] font-mono px-1 rounded border ${isCompleted ? 'text-green-700 bg-green-100 border-green-200' : 'text-cyan-600 bg-white border-cyan-100'}`}>
                                                            {chapter.targetWordCount}字
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center mb-1 gap-2">
                                                        <div className={`font-bold text-sm truncate ${activeChapterId === chapter.id ? 'text-cyan-900' : 'text-gray-700'}`}>{chapter.title || "未命名章节"}</div>
                                                        <button 
                                                            onClick={(e) => handleDeleteChapter(chapter.id, e)}
                                                            className="text-[9px] text-red-300 hover:text-red-500 hover:bg-red-50 rounded px-1 transition-colors flex items-center gap-1 flex-shrink-0"
                                                            title="删除章节"
                                                        >
                                                            <span>🗑</span> 删除
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Prerequisites Indicator */}
                                                    {chapter.prerequisites && chapter.prerequisites.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {chapter.prerequisites.map((req, i) => (
                                                                <span key={i} className="text-[8px] bg-amber-100 text-amber-700 border border-amber-200 px-1 rounded truncate max-w-full">
                                                                    🔒 {req}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {isCompleted && (
                                                        <div className="text-[8px] text-green-600 mt-1 pt-1 border-t border-green-200">
                                                            耗时 {chapter.finishedTurnCount || '?'} 幕
                                                        </div>
                                                    )}
                                                    {isActive && (
                                                        <div className="text-[8px] text-cyan-600 mt-1 pt-1 border-t border-cyan-200 animate-pulse">
                                                            当前进行中...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {!isBulkMode && (
                                        <button 
                                            onClick={handleAddChapter}
                                            className="ml-12 w-[calc(100%-3rem)] mb-6 py-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-400 hover:text-cyan-600 hover:border-cyan-300 hover:bg-cyan-50 transition-all text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <span>+</span> 新增章节
                                        </button>
                                    )}
                                </div>

                                {/* Bulk Actions Toolbar Overlay */}
                                {isBulkMode && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30 animate-fade-in-up">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedChapterIds.size > 0 && selectedChapterIds.size === filteredChapters.length} 
                                                    onChange={toggleSelectAll} 
                                                    className="cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-gray-700">已选 {selectedChapterIds.size} 项</span>
                                            </div>
                                            {selectedChapterIds.size > 0 && (
                                                <button onClick={handleBulkDelete} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors" title="删除所选">
                                                    🗑
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Bulk Pacing */}
                                            <div className="flex bg-stone-100 rounded border border-stone-200 p-0.5">
                                                {['fast', 'standard', 'slow'].map((p) => {
                                                    // Determine effective state: if all selected have this pacing
                                                    const isEffective = selectedChapterIds.size > 0 && Array.from(selectedChapterIds).every(id => chapters.find(c => c.id === id)?.pacing === p);
                                                    return (
                                                        <button
                                                            key={p}
                                                            onClick={() => handleBulkUpdate('pacing', p)}
                                                            disabled={selectedChapterIds.size === 0}
                                                            className={`flex-1 text-[8px] rounded font-bold transition-all py-1 ${
                                                                isEffective 
                                                                ? 'bg-cyan-600 text-white shadow-md transform scale-105' 
                                                                : (selectedChapterIds.size === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-white hover:shadow-sm')
                                                            }`}
                                                            title={`设为${p === 'fast' ? '快速' : p === 'slow' ? '缓慢' : '标准'}节奏`}
                                                        >
                                                            {p === 'fast' ? '快' : p === 'standard' ? '标' : '慢'}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* Bulk Word Count */}
                                            <div className="flex-1 border border-stone-200 rounded bg-stone-50 p-1 flex flex-col justify-center overflow-hidden">
                                                <div className="flex justify-between items-end mb-1 px-1">
                                                    <span className="text-[8px] text-gray-500 font-bold">目标字数</span>
                                                    <span className="text-[9px] font-mono font-bold text-indigo-600">{bulkWordCount}</span>
                                                </div>
                                                <div className="flex gap-2 items-center px-1 w-full">
                                                    <input 
                                                        type="range" min="500" max="10000" step="100" 
                                                        value={bulkWordCount}
                                                        onChange={e => setBulkWordCount(parseInt(e.target.value))}
                                                        className="flex-1 min-w-0 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 block" 
                                                    />
                                                    <button 
                                                        onClick={() => handleBulkUpdate('targetWordCount', bulkWordCount)}
                                                        disabled={selectedChapterIds.size === 0}
                                                        className="bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded text-[9px] font-bold whitespace-nowrap hover:bg-indigo-200 transition-colors shadow-sm shrink-0"
                                                    >
                                                        设
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div 
                                className="relative w-full h-full bg-stone-100 overflow-hidden cursor-grab active:cursor-grabbing"
                                ref={containerRef}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseUp}
                                onWheel={handleWheel}
                            >
                                <div 
                                    className="absolute inset-0 opacity-10 pointer-events-none transition-transform duration-75"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
                                        backgroundSize: `${30 * scale}px ${30 * scale}px`,
                                        backgroundPosition: `${canvasPan.x}px ${canvasPan.y}px`
                                    }}
                                ></div>

                                {/* Transform Container */}
                                <div 
                                    className="absolute left-0 top-0 w-full h-full origin-top-left transition-transform duration-75 ease-out"
                                    style={{
                                        transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${scale})`
                                    }}
                                >
                                    {/* Connections Layer */}
                                    <svg className="absolute top-[-5000px] left-[-5000px] w-[10000px] h-[10000px] pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
                                        {chapters.map((chapter, i) => {
                                            if (i < chapters.length - 1) {
                                                const start = nodePositions[chapter.id] || {x:0, y:0};
                                                const next = chapters[i+1];
                                                const end = nodePositions[next.id] || {x:0, y:0};
                                                
                                                // Bezier Curve Logic
                                                const dist = Math.abs(end.x - start.x);
                                                const cpOffset = Math.max(dist * 0.5, 50);
                                                
                                                // Adjust start/end to be middle of box (approx width 240, height 100)
                                                const sX = start.x + 120;
                                                const sY = start.y + 50;
                                                const eX = end.x + 120;
                                                const eY = end.y + 50;

                                                // Global offset
                                                const globalOffX = 5000;
                                                const globalOffY = 5000;

                                                return (
                                                    <path 
                                                        key={i} 
                                                        d={`M ${sX + globalOffX} ${sY + globalOffY} C ${sX + cpOffset + globalOffX} ${sY + globalOffY}, ${eX - cpOffset + globalOffX} ${eY + globalOffY}, ${eX + globalOffX} ${eY + globalOffY}`} 
                                                        fill="none"
                                                        stroke="#94a3b8" 
                                                        strokeWidth="2" 
                                                        strokeDasharray="4"
                                                    />
                                                );
                                            }
                                            return null;
                                        })}
                                    </svg>
                                    
                                    {/* Nodes Layer */}
                                    {chapters.map((chapter, i) => {
                                        const pos = nodePositions[chapter.id] || {x:0, y:0};
                                        const isActive = activeChapterId === chapter.id;
                                        const isCompleted = chapter.status === 'completed';
                                        
                                        return (
                                            <div 
                                                key={chapter.id}
                                                onMouseDown={(e) => handleNodeMouseDown(e, chapter.id)}
                                                onClick={(e) => { e.stopPropagation(); setActiveChapterId(chapter.id); }}
                                                onDoubleClick={(e) => { e.stopPropagation(); setActiveChapterId(chapter.id); setViewMode('list'); }}
                                                className={`absolute w-60 p-3 bg-white rounded-xl shadow-md border-2 transition-shadow cursor-pointer flex flex-col
                                                    ${isActive ? 'border-cyan-500 ring-4 ring-cyan-500/10 z-20' : 'border-stone-200 hover:border-cyan-300 z-10'}
                                                    ${isCompleted ? 'border-green-500 bg-green-50/30' : ''}
                                                `}
                                                style={{ left: pos.x, top: pos.y }}
                                            >
                                                {/* Handle for Drag visual cue */}
                                                <div className="w-8 h-1 bg-stone-200 rounded-full mx-auto mb-2"></div>

                                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex justify-between items-center">
                                                    <span className="select-none">CHAPTER {i + 1}</span>
                                                    <div className="flex items-center gap-1">
                                                        {isCompleted && <span className="text-green-600">✓</span>}
                                                        <button 
                                                            onClick={(e) => handleDeleteChapter(chapter.id, e)}
                                                            className="text-stone-300 hover:text-red-500 font-bold px-1 transition-colors"
                                                            title="删除"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-sm text-gray-800 line-clamp-1 select-none">{chapter.title}</div>
                                                {chapter.summary && <div className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight select-none">{chapter.summary}</div>}
                                                
                                                {/* Stats Pill */}
                                                <div className="mt-2 flex gap-1">
                                                    <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200 select-none">
                                                        {chapter.targetWordCount}字
                                                    </span>
                                                    {chapter.prerequisites && chapter.prerequisites.length > 0 && (
                                                        <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 select-none">
                                                            🔒 {chapter.prerequisites.length}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Floating Add Button in Graph Mode */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAddChapter(); }}
                                    className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-cyan-600 text-white shadow-xl hover:bg-cyan-500 hover:scale-110 transition-all flex items-center justify-center text-3xl font-light z-50 border-4 border-white"
                                    title="添加新章节节点"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Editor Panel (Conditionally rendered or overlay in Graph Mode) */}
                <div 
                    className={`
                        flex-1 bg-white flex flex-col min-w-0 relative transition-all duration-300 shadow-2xl z-[80]
                        ${viewMode === 'graph' 
                            ? (activeChapterId ? 'absolute right-0 top-0 bottom-0 w-[400px] border-l border-stone-200 translate-x-0' : 'absolute right-0 top-0 bottom-0 w-0 translate-x-full overflow-hidden') 
                            : 'h-2/3 md:h-full'
                        }
                    `}
                >
                    {activeChapterId && (
                        (() => {
                            const activeChapter = chapters.find(c => c.id === activeChapterId);
                            if(!activeChapter) return null;
                            
                            return (
                                <>
                                    {/* Use extracted component for stability */}
                                    <ChapterEditor 
                                        key={activeChapter.id} // Important: Force remount if chapter changes to reset local state
                                        chapter={activeChapter}
                                        characters={characters}
                                        events={events}
                                        onUpdate={updateChapter}
                                        onUpdateCriteria={updateCompletionCriteria}
                                        onToggleCharacter={toggleCharacter}
                                        onAddPrereq={addPrerequisite}
                                        onRemovePrereq={removePrerequisite}
                                        onOpenAddEvent={openAddEvent}
                                        onOpenEditEvent={openEditEvent}
                                        onDeleteEvent={handleDeleteEvent}
                                        onClose={onClose} // Passed directly to close modal
                                    />
                                </>
                            );
                        })()
                    )}
                    
                    {!activeChapterId && viewMode === 'list' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-stone-300">
                            <p className="text-sm font-bold">请选择或新建章节</p>
                        </div>
                    )}
                </div>
            </div>

            {showEventModal && (
                <AddEventModal 
                    onClose={() => setShowEventModal(false)}
                    onConfirm={(data) => {
                        if (eventToEdit) handleUpdateEvent(data);
                        else handleAddEvent(data);
                    }}
                    characters={characters}
                    protagonistName={context.character.name}
                    initialEvent={eventToEdit}
                />
            )}
        </div>
    );
};

export const SetupPlotPanel: React.FC<{ 
    className?: string; 
    style?: React.CSSProperties; 
    onClick?: () => void; 
    context: any; 
    onOpenModal: () => void;
}> = ({ className, style, onClick, context, onOpenModal }) => {
    return (
        <div 
            className={`${className} bg-stone-100/95 backdrop-blur-md border-cyan-700 text-gray-800 group hover:shadow-cyan-500/20`}
            style={style}
            onClick={onClick}
        >
            <div className="flex flex-col h-full items-center justify-center text-center relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-10 left-10 w-32 h-32 border-2 border-cyan-900 rounded-full"></div>
                    <div className="absolute bottom-20 right-10 w-48 h-48 border border-cyan-900 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1px] bg-cyan-900 rotate-45"></div>
                </div>

                <div className="mb-8 z-10">
                    <h3 className="text-3xl font-bold text-cyan-900 mb-2 tracking-[0.2em] font-serif">剧情蓝图</h3>
                    <div className="w-16 h-1 bg-cyan-600 mx-auto rounded-full mb-4"></div>
                    <p className="text-sm text-cyan-700/70 font-bold max-w-[80%] mx-auto leading-relaxed">
                        以时间为轴，以此为界。<br/>规划命运的既定轨迹，约束无序的混沌走向。
                    </p>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Ensure button click doesn't just trigger panel switch if inactive
                        onOpenModal();
                    }}
                    className="bg-cyan-800 hover:bg-cyan-700 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 z-10"
                >
                    <span></span>
                    <span>进入构想空间</span>
                </button>

                <div className="mt-8 flex gap-4 text-xs text-cyan-600/50 font-mono z-10">
                    <span>已规划章节: {context.plotBlueprint?.length || 0}</span>
                    <span>|</span>
                    <span>预设伏笔: {context.scheduledEvents?.filter((e: any) => e.status === 'pending').length || 0}</span>
                </div>
            </div>
        </div>
    );
};
