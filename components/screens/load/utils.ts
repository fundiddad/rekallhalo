
import { SavedGame } from '../../../types';

export const GRID_SIZE = 25;
export const NODE_POSITIONS_KEY = 'protagonist_node_positions';

export const CHAPTER_COLORS = [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#f43f5e', // Rose
    '#6366f1', // Indigo
    '#84cc16', // Lime
    '#d946ef', // Fuchsia
];

// Helper to resolve background image recursively
export const resolveBackground = (save: SavedGame | null, allSaves: SavedGame[]): string | undefined => {
    if (!save) return undefined;
    let curr: SavedGame | undefined = save;
    while (curr) {
        if (curr.context.currentSegment?.backgroundImage) return curr.context.currentSegment.backgroundImage;
        if (!curr.parentId) break;
        const pid = curr.parentId;
        curr = allSaves.find(s => s.storyId === pid);
    }
    return undefined;
};
