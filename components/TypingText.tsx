
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameContext, SupportingCharacter } from '../types';

interface TypingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  instant?: boolean; 
  context?: GameContext;
  onHoverEntity?: (entity: { type: 'protagonist' | 'npc' | 'location', data: any } | null, rect: DOMRect | null) => void;
}

// Helper to get color class based on entity info
const getEntityColorClass = (info: { type: 'protagonist' | 'npc' | 'location', data: any }) => {
    if (info.type === 'protagonist') {
        return "text-amber-400 border-amber-400/50 hover:text-amber-300 hover:border-amber-300";
    } 
    
    if (info.type === 'npc') {
        const npc = info.data as SupportingCharacter;
        const affinity = npc.affinity || 0;
        
        // Villain / High Hostility
        if (npc.category === 'villain' || affinity <= -20) {
            return "text-red-400 border-red-400/50 hover:text-red-300 hover:border-red-300 font-medium";
        }
        // Hostile / Unfriendly
        if (affinity < -5) {
            return "text-orange-400 border-orange-400/50 hover:text-orange-300 hover:border-orange-300";
        }
        // Intimate / High Affinity
        if (affinity >= 40) {
            return "text-pink-400 border-pink-400/50 hover:text-pink-300 hover:border-pink-300 font-medium";
        }
        // Friendly / Ally
        if (npc.category === 'protagonist' || affinity >= 10) {
            return "text-cyan-400 border-cyan-400/50 hover:text-cyan-300 hover:border-cyan-300";
        }
        // Neutral
        return "text-indigo-300 border-indigo-400/50 hover:text-indigo-200 hover:border-indigo-300";
    } 
    
    if (info.type === 'location') {
        return "text-emerald-300 border-emerald-400/50 hover:text-emerald-200 hover:border-emerald-300";
    }
    
    return "text-blue-300 border-blue-300/50";
};

// Extracted for stability - prevents remounting on parent render
const EntityTrigger = ({ word, info, onHoverEntity }: { 
    word: string, 
    info: { type: 'protagonist' | 'npc' | 'location', data: any },
    onHoverEntity?: (entity: any, rect: DOMRect | null) => void 
}) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    
    // Safety cleanup: if this specific trigger unmounts while hovered (e.g. text change), clear tooltip
    useEffect(() => {
        return () => {
            if (onHoverEntity) onHoverEntity(null, null);
        };
    }, [onHoverEntity]);

    const handleMouseEnter = () => {
        if (onHoverEntity && spanRef.current) {
            onHoverEntity(info, spanRef.current.getBoundingClientRect());
        }
    };

    const handleMouseLeave = () => {
        if (onHoverEntity) {
            onHoverEntity(null, null);
        }
    };

    const colorClass = getEntityColorClass(info);

    return (
        <span 
          ref={spanRef}
          className={`inline-block border-b border-dashed cursor-help transition-all duration-300 ${colorClass}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
            {word}
        </span>
    );
};

export const TypingText: React.FC<TypingTextProps> = ({ text, speed = 30, onComplete, instant = false, context, onHoverEntity }) => {
  const [displayedText, setDisplayedText] = useState(instant ? text : '');
  const [isComplete, setIsComplete] = useState(instant);
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const lastTextRef = useRef(text);

  // Keep the callback ref current
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (instant) {
        setDisplayedText(text);
        setIsComplete(true);
        lastTextRef.current = text;
        if (onCompleteRef.current) onCompleteRef.current();
        return;
    }

    if (text === lastTextRef.current && isComplete) {
        return;
    }

    lastTextRef.current = text;
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    if (!text) return;

    const timer = setInterval(() => {
      if (indexRef.current >= text.length) {
        clearInterval(timer);
        setIsComplete(true);
        if (onCompleteRef.current) onCompleteRef.current();
        return;
      }

      indexRef.current++;
      setDisplayedText(text.slice(0, indexRef.current));
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, instant]);

  // --- Entity Parsing Logic ---
  const entityData = useMemo(() => {
      if (!context) return { pattern: null, map: {} };

      const map: Record<string, { type: 'protagonist' | 'npc' | 'location', data: any }> = {};
      const keywords: string[] = [];

      // Protagonist
      if (context.character.name) {
          keywords.push(context.character.name);
          map[context.character.name] = { type: 'protagonist', data: context.character };
      }

      // NPCs
      context.supportingCharacters.forEach(char => {
          if (char.name) {
              keywords.push(char.name);
              map[char.name] = { type: 'npc', data: char };
          }
      });

      // Current Location (if valid)
      const loc = context.currentSegment?.location;
      if (loc && loc !== '未知区域' && loc.length > 1) {
          keywords.push(loc);
          map[loc] = { type: 'location', data: loc };
      }

      if (keywords.length === 0) return { pattern: null, map: {} };

      // Sort by length desc to match longest names first
      keywords.sort((a, b) => b.length - a.length);
      
      // Escape for regex
      const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(${keywords.map(escapeRegExp).join('|')})`, 'g');

      return { pattern, map };
  }, [context?.character.name, context?.supportingCharacters, context?.currentSegment?.location]);

  const parseChunkWithEntities = (chunk: string) => {
      if (!entityData.pattern) return chunk;
      
      const parts = chunk.split(entityData.pattern);
      if (parts.length === 1) return chunk;

      return parts.map((part, i) => {
          if (entityData.map[part]) {
              return <EntityTrigger key={i} word={part} info={entityData.map[part]} onHoverEntity={onHoverEntity} />;
          }
          return part;
      });
  };

  const renderStyledText = (txt: string) => {
    if (!txt) return null;
    
    // Split text by quotes AND special brackets
    const parts = txt.split(/([“"”].*?[”"“]|【.*?】)/s); 
    
    return parts.map((part, index) => {
      const isDialogue = (part.startsWith('“') || part.startsWith('"') || part.endsWith('”') || part.endsWith('"'));
      const isSpecial = part.startsWith('【') && part.endsWith('】');

      if (isSpecial) {
         return (
            <span key={index} className="text-red-500 font-bold drop-shadow-sm mx-0.5">
              {part}
            </span>
         );
      }
      
      if (isDialogue) {
        return (
          <span key={index} className="text-amber-200 font-medium drop-shadow-sm">
            {parseChunkWithEntities(part)}
          </span>
        );
      }
      
      return <span key={index} className="text-gray-200 opacity-90">{parseChunkWithEntities(part)}</span>;
    });
  };

  return (
    <div className="leading-loose tracking-wide drop-shadow-md whitespace-pre-wrap">
      {renderStyledText(displayedText)}
      {!isComplete && <span className="animate-pulse ml-1 text-gray-400">|</span>}
    </div>
  );
};
