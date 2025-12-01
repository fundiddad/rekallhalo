
import React, { useMemo } from 'react';
import { SavedGame, SaveType, StoryGenre } from '../../../types';
import { resolveBackground } from './utils';

interface LoadGameListProps {
    savedGames: SavedGame[];
    searchTerm: string;
    selectedGenreFilter: string;
    setSearchTerm: (term: string) => void;
    setSelectedGenreFilter: (filter: string) => void;
    onLoad: (save: SavedGame, forceSetup?: boolean) => void;
    onDeleteSession: (sessionId: string) => void;
    onSwitchToCanvas: (sessionId?: string) => void;
    onDownload: (save: SavedGame) => void;
    playClickSound: () => void;
}

export const LoadGameList: React.FC<LoadGameListProps> = ({
    savedGames, searchTerm, selectedGenreFilter, setSearchTerm, setSelectedGenreFilter,
    onLoad, onDeleteSession, onSwitchToCanvas, onDownload, playClickSound
}) => {
    // Group Saves by Session
    const sessionGroups = useMemo(() => {
        const groups: Record<string, SavedGame[]> = {};
        
        const filteredSaves = savedGames.filter(save => {
            const matchSearch = searchTerm === '' || 
                (save.storyName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                (save.characterName || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchGenre = selectedGenreFilter === 'all' || save.genre === selectedGenreFilter;

            return matchSearch && matchGenre;
        });

        filteredSaves.forEach(save => {
            if (!groups[save.sessionId]) groups[save.sessionId] = [];
            groups[save.sessionId].push(save);
        });
        
        return Object.values(groups).map(group => {
            group.sort((a, b) => b.timestamp - a.timestamp);
            
            let displaySave = group[0];
            const gameSaves = group.filter(s => s.type !== SaveType.SETUP);
            if (gameSaves.length > 0) {
                displaySave = gameSaves[0]; // Latest game save
            }

            return {
                latest: displaySave, 
                count: group.length,
                root: group.find(s => !s.parentId) || group[group.length - 1],
                all: group
            };
        }).sort((a, b) => b.latest.timestamp - a.latest.timestamp);
    }, [savedGames, searchTerm, selectedGenreFilter]);

    return (
        <div className="w-full h-full pt-28 px-4 md:px-12 pb-12 overflow-y-auto custom-scrollbar bg-stone-100 animate-fade-in-up">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-2">
                    故事列表
                    {searchTerm && <span className="text-sm font-sans font-normal text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">筛选中...</span>}
                </h2>
                
                {sessionGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
                        <span className="text-4xl mb-2 grayscale opacity-50">📂</span>
                        <p>未找到相关存档记录</p>
                        {searchTerm && <button onClick={() => { setSearchTerm(''); setSelectedGenreFilter('all'); }} className="text-indigo-500 text-sm mt-2 hover:underline">清除筛选条件</button>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessionGroups.map((group) => {
                            const save = group.latest;
                            const bg = resolveBackground(save, savedGames);
                            const hasGameSave = save.type !== SaveType.SETUP;
                            return (
                                <div key={group.latest.sessionId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500 hover:ring-4 hover:ring-indigo-500/10 active:scale-[0.98]">
                                    <div className="h-32 bg-gray-100 relative overflow-hidden">
                                        {bg ? ( <img src={bg} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" /> ) : ( <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"></div> )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-3 left-4 text-white"><h3 className="text-lg font-bold shadow-black drop-shadow-md">{save.storyName || save.characterName}</h3><p className="text-[10px] opacity-80">{save.genre.split(' - ')[0]}</p></div>
                                        {save.type === SaveType.SETUP && ( <div className="absolute top-2 left-2 bg-blue-500/90 text-white text-[10px] px-2 py-0.5 rounded shadow-lg backdrop-blur font-bold">初始设定</div> )}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); playClickSound(); onDownload(save); }} className="bg-black/40 hover:bg-black/60 text-white/90 hover:text-white w-6 h-6 rounded flex items-center justify-center transition-all backdrop-blur-sm shadow-sm" title="下载故事数据"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteSession(group.latest.sessionId); }} className="bg-black/40 hover:bg-red-600 text-white/90 hover:text-white w-6 h-6 rounded flex items-center justify-center transition-all backdrop-blur-sm shadow-sm" title="删除整个存档"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col h-[180px]">
                                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3 font-mono">
                                            <span>{new Date(save.timestamp).toLocaleString()}</span>
                                            <span>{save.metaData?.turnCount ? `第 ${save.metaData.turnCount} 幕` : `${group.count} 节点`}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 group-hover:text-gray-900 transition-colors flex-1">{save.summary}</p>
                                        <div className={`grid gap-2 pt-3 border-t border-gray-100 ${hasGameSave ? 'grid-cols-3' : 'grid-cols-1'}`}>
                                            <button onClick={() => onLoad(save)} className="py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-center clip-path-polygon" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>{save.type === SaveType.SETUP ? '编辑配置' : '读取进度'}</button>
                                            {hasGameSave && ( <> <button onClick={() => onSwitchToCanvas(group.latest.sessionId)} className="py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-center clip-path-polygon" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>查看世界线</button> <button onClick={() => onLoad(save, true)} className="py-2 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center justify-center clip-path-polygon" style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>查看配置</button> </> )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
