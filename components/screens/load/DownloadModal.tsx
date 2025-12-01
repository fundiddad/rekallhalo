
import React, { useState } from 'react';
import { SavedGame } from '../../../types';

interface DownloadModalProps {
    save: SavedGame;
    resolvedBackground?: string;
    onClose: () => void;
    onBackupSession: (includeImages: boolean) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ save, resolvedBackground, onClose, onBackupSession }) => {
    const [includeImages, setIncludeImages] = useState(true);

    const handleDownloadConfig = () => {
        const configData = {
            storyName: save.storyName,
            genre: save.genre,
            customGenre: save.context.customGenre,
            character: save.context.character,
            worldSettings: save.context.worldSettings,
            supportingCharacters: save.context.supportingCharacters,
            plotBlueprint: save.context.plotBlueprint || [],
            scheduledEvents: save.context.scheduledEvents || [],
            exportedAt: new Date().toISOString()
        };
        
        downloadJson(configData, `config_${save.storyName || save.characterName}_${new Date().toISOString().slice(0,10)}.json`);
        onClose();
    };

    const handleDownloadFull = () => {
        const fullData = JSON.parse(JSON.stringify(save));
        
        if (fullData.context.currentSegment && !fullData.context.currentSegment.backgroundImage && resolvedBackground) {
            fullData.context.currentSegment.backgroundImage = resolvedBackground;
        }

        fullData.exportedAt = new Date().toISOString();
        fullData.version = "2.5";

        downloadJson(fullData, `save_${save.storyName || save.characterName}_${new Date().toISOString().slice(0,10)}.json`);
        onClose();
    };

    const downloadJson = (data: any, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-stone-100 border border-stone-200 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-2">
                     <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        下载数据
                     </h3>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-800">✕</button>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                    请选择您要导出的数据类型。
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={handleDownloadConfig}
                        className="w-full flex flex-col items-start p-3 rounded border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors group"
                    >
                        <div className="flex items-center gap-2 font-bold text-blue-700 mb-1">
                            下载故事配置
                        </div>
                        <div className="text-[10px] text-blue-500/80">包含设定、主角、世界观、剧情蓝图与预设伏笔。</div>
                    </button>

                    <button 
                        onClick={handleDownloadFull}
                        className="w-full flex flex-col items-start p-3 rounded border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors group"
                    >
                        <div className="flex items-center gap-2 font-bold text-purple-700 mb-1">
                            下载当前节点存档
                        </div>
                        <div className="text-[10px] text-purple-500/80 leading-relaxed">
                            包含完整的剧情历史、剧情蓝图与伏笔数据。<br/>
                            <span className="text-rose-500 font-bold">注意：此选项仅保存当前节点，不包含其他平行分支。</span>
                        </div>
                    </button>
                    
                    <div className="w-full flex flex-col items-start p-3 rounded border border-emerald-200 bg-emerald-50 group">
                        <div className="font-bold text-emerald-700 mb-1">备份整条世界线 (全部节点)</div>
                        <div className="text-[10px] text-emerald-600/80 leading-relaxed mb-3">
                            将打包导出该故事线下的所有平行宇宙分支与历史节点。<br/>
                            <span className="font-bold">注意：包含大量冗余数据与图片，文件体积可能较大。</span>
                        </div>
                        
                        <div className="space-y-2 mb-3 w-full bg-white/50 p-2 rounded border border-emerald-200">
                            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-not-allowed opacity-70">
                                <input type="checkbox" checked disabled className="w-4 h-4" />
                                <span>包含文本与蓝图数据 (必需)</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={includeImages} 
                                    onChange={(e) => setIncludeImages(e.target.checked)}
                                    className="w-4 h-4 accent-emerald-600"
                                />
                                <span>包含图片文件 (可能很大)</span>
                            </label>
                        </div>

                        <button 
                            onClick={() => { onBackupSession(includeImages); onClose(); }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2 rounded transition-colors"
                        >
                            开始备份
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
