import { Brain, Sparkles } from 'lucide-react';
import { ThinkingEvent } from '../hooks/useCustomEvents';

interface ThinkingIndicatorProps {
  thinkingEvent: ThinkingEvent;
  isActive?: boolean;
}

export function ThinkingIndicator({ thinkingEvent, isActive = false }: ThinkingIndicatorProps) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border
      ${isActive 
        ? 'bg-purple-50 border-purple-200 animate-pulse' 
        : 'bg-gray-50 border-gray-200'
      }
    `}>
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-full
        ${isActive ? 'bg-purple-100' : 'bg-gray-200'}
      `}>
        {isActive ? (
          <Brain className="w-4 h-4 text-purple-600 animate-pulse" />
        ) : (
          <Sparkles className="w-4 h-4 text-gray-500" />
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isActive ? 'text-purple-700' : 'text-gray-700'}`}>
            {isActive ? 'Thinking...' : 'Extended Thinking'}
          </span>
          {thinkingEvent.thoughtsTokenCount && thinkingEvent.thoughtsTokenCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
              {thinkingEvent.thoughtsTokenCount} tokens
            </span>
          )}
        </div>
        
        {thinkingEvent.model && (
          <div className="text-xs text-gray-500 mt-1">
            {thinkingEvent.model}
          </div>
        )}
      </div>

      {thinkingEvent.totalTokenCount && (
        <div className="text-right">
          <div className="text-xs text-gray-500">Total Tokens</div>
          <div className="text-sm font-medium text-gray-700">
            {thinkingEvent.totalTokenCount.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

interface ThinkingListProps {
  thinkingEvents: ThinkingEvent[];
  activeThinking?: ThinkingEvent;
}

export function ThinkingList({ thinkingEvents, activeThinking }: ThinkingListProps) {
  const thinkingSteps = thinkingEvents.filter(t => t.status === 'start');
  
  if (thinkingSteps.length === 0 && !activeThinking) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-1">
        Thinking Steps
      </div>
      
      {activeThinking && (
        <ThinkingIndicator thinkingEvent={activeThinking} isActive={true} />
      )}
      
      {thinkingSteps.map((thinking, index) => (
        <ThinkingIndicator 
          key={index} 
          thinkingEvent={thinking} 
          isActive={false}
        />
      ))}
    </div>
  );
}

