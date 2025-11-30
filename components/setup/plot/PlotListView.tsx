
import React, { useState } from 'react';
import { PlotChapter } from '../../../types';

interface PlotListViewProps {
    chapters: PlotChapter[];
    setChapters: (val: PlotChapter[]) => void;
    activeChapterId: string | null;
    setActiveChapterId: (id: string | null) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isBulkMode: boolean;
    setIsBulkMode: (val: boolean) => void;
    onAddChapter: () => void;
    onDeleteChapter: (id: string, e: React.MouseEvent) => void;
}

export const PlotListView: React.FC<PlotListViewProps> = ({
    chapters, setChapters, activeChapterId, setActiveChapterId, 
    searchTerm, setSearchTerm, isBulkMode, setIsBulkMode,
    onAddChapter, onDeleteChapter
}) => {
    const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
    const [bulkWordCount, setBulkWordCount] = useState<number>(3000); 
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

    const filteredChapters = chapters.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.summary && c.summary.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Bulk Actions
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
    };

    const handleBulkDelete = () => {
        if (selectedChapterIds.size === 0) return;
        if (!confirm(`确定要删除选中的 ${selectedChapterIds.size} 个章节吗？`)) return;
        const updatedChapters = chapters.filter(c => !selectedChapterIds.has(c.id));
        setChapters(updatedChapters);
        setSelectedChapterIds(new Set());
        setIsBulkMode(false);
    };

    // Drag and Drop
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
        if (searchTerm || isBulkMode) return;

        const newChapters = [...chapters];
        const [movedChapter] = newChapters.splice(draggedIdx, 1);
        newChapters.splice(dropIdx, 0, movedChapter);
        setChapters(newChapters);
        setDraggedIdx(null);
    };

    return (
        <>
            <div className={`h-full overflow-y-auto p-4 space-y-0 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] ${isBulkMode ? 'pb-32' : ''}`}>
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
                            draggable={!searchTerm && !isBulkMode} 
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
                                        onClick={(e) => onDeleteChapter(chapter.id, e)}
                                        className="text-[9px] text-red-300 hover:text-red-500 hover:bg-red-50 rounded px-1 transition-colors flex items-center gap-1 flex-shrink-0"
                                        title="删除章节"
                                    >
                                        <span>🗑</span> 删除
                                    </button>
                                </div>
                                
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
                        onClick={onAddChapter}
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
    );
};
