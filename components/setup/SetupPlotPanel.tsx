
import React, { useState } from 'react';
import { GameContext } from '../../types';

export const SetupPlotPanel: React.FC<{ 
    className?: string; 
    style?: React.CSSProperties; 
    onClick?: () => void; 
    context: GameContext; 
    onOpenModal: (id?: string, viewMode?: 'list' | 'graph') => void;
}> = ({ className, style, onClick, context, onOpenModal }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const chapters = context.plotBlueprint || [];
    const filteredChapters = chapters.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.summary && c.summary.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div 
            className={`${className} bg-stone-100/95 backdrop-blur-md border-cyan-700 text-gray-800 group hover:shadow-cyan-500/20 flex flex-col`}
            style={style}
            onClick={onClick}
        >
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none overflow-hidden">
                <div className="absolute top-10 left-10 w-32 h-32 border-2 border-cyan-900 rounded-full"></div>
                <div className="absolute bottom-20 right-10 w-48 h-48 border border-cyan-900 rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1px] bg-cyan-900 rotate-45"></div>
            </div>

            {/* Header: Title + Button */}
            <div className="flex justify-between items-center p-4 border-b border-cyan-200/30 z-10 shrink-0">
                <h3 className="text-xl font-bold text-cyan-900 tracking-[0.2em] font-serif flex items-center gap-2">
                    <span className="w-1 h-4 bg-cyan-600 block"></span>
                    剧情蓝图
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal(undefined, 'graph');
                        }}
                        className="bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-md hover:shadow-cyan-500/30 transition-all active:scale-95 flex items-center gap-1"
                        title="查看剧情思维导图"
                    >
                        <span>☊</span>
                        <span>脑图视图</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal(undefined, 'list');
                        }}
                        className="bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-md hover:shadow-cyan-500/30 transition-all active:scale-95 flex items-center gap-1"
                    >
                        <span>进入章节</span>
                        <span>→</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 py-2 border-b border-cyan-100/50 z-10 bg-cyan-50/10">
                 <input
                    type="text"
                    placeholder="搜索章节..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-white/60 border border-cyan-200 rounded px-2 py-1 text-xs text-cyan-900 outline-none focus:bg-white focus:border-cyan-400 transition-all placeholder-cyan-800/30"
                 />
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {chapters.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-cyan-900/20">
                         <div className="text-6xl font-serif select-none pointer-events-none mb-2">§</div>
                         <span className="text-xs">暂无规划</span>
                    </div>
                ) : filteredChapters.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-cyan-900/30">
                        <span className="text-xs">未找到匹配章节</span>
                    </div>
                ) : (
                    filteredChapters.map((chapter, idx) => (
                        <div 
                            key={chapter.id} 
                            className="bg-white/60 border border-cyan-100 p-2.5 rounded hover:bg-white hover:shadow-sm hover:border-cyan-300 transition-all cursor-pointer group/card"
                            onClick={(e) => { e.stopPropagation(); onOpenModal(chapter.id, 'list'); }}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-cyan-800 group-hover/card:text-cyan-600">
                                    {chapter.title}
                                </span>
                                <div className="flex gap-1">
                                    {chapter.status === 'completed' && <span className="text-[8px] text-green-600">✓</span>}
                                    <span className={`text-[8px] px-1 rounded border ${chapter.status === 'completed' ? 'text-green-600 bg-green-50 border-green-200' : 'text-cyan-600 bg-cyan-50 border-cyan-100'}`}>
                                        {chapter.targetWordCount}字
                                    </span>
                                </div>
                            </div>
                            <div className="text-[9px] text-gray-500 line-clamp-2 leading-tight">
                                {chapter.summary || <span className="italic opacity-50">暂无摘要...</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer: Stats */}
            <div className="p-3 border-t border-cyan-200/30 bg-cyan-50/20 flex justify-between text-[10px] text-cyan-800/60 font-mono z-10 shrink-0">
                <span>{chapters.length} 章节</span>
                <span>{context.scheduledEvents?.filter((e: any) => e.status === 'pending').length || 0} 伏笔</span>
            </div>
        </div>
    );
};
