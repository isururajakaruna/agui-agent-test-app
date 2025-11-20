/**
 * Activity Message Renderer
 * 
 * Renders AG-UI Protocol ACTIVITY_SNAPSHOT events:
 * - THINKING activities: Extended thinking steps with token counts
 * - SESSION_STATS activities: Session completion statistics
 */

import { Brain, Sparkles, CheckCircle, Clock, Wrench } from 'lucide-react';

interface ActivityContent {
  [key: string]: any;
}

interface ActivityRendererProps {
  activityType: string;
  content: ActivityContent;
  messageId: string;
}

export function ActivityRenderer({ activityType, content, messageId }: ActivityRendererProps) {
  // Render THINKING activities
  if (activityType === 'THINKING') {
    const status = content.status || 'in_progress';
    const isActive = status === 'in_progress';
    const thoughtsTokenCount = content.thoughtsTokenCount || 0;
    const totalTokenCount = content.totalTokenCount || 0;
    const model = content.model || 'unknown';

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
            {thoughtsTokenCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                {thoughtsTokenCount} tokens
              </span>
            )}
          </div>
          
          {model && model !== 'unknown' && (
            <div className="text-xs text-gray-500 mt-1">
              {model}
            </div>
          )}
        </div>

        {totalTokenCount > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Total Tokens</div>
            <div className="text-sm font-medium text-gray-700">
              {totalTokenCount.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render SESSION_STATS activities
  if (activityType === 'SESSION_STATS') {
    const totalThinkingTokens = content.totalThinkingTokens || 0;
    const totalToolCalls = content.totalToolCalls || 0;
    const durationSeconds = content.durationSeconds || 0;

    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-green-900">Session Complete</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Brain className="w-4 h-4" />
              <span className="text-xs font-medium">Thinking Tokens</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalThinkingTokens.toLocaleString()}
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Wrench className="w-4 h-4" />
              <span className="text-xs font-medium">Tool Calls</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalToolCalls}
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Duration</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {durationSeconds.toFixed(1)}s
            </div>
          </div>
        </div>
        
        {content.threadId && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="text-xs text-gray-500">
              Thread ID: <span className="font-mono">{content.threadId.slice(0, 8)}...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback for unknown activity types
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Activity: {activityType}
      </div>
      <pre className="text-xs text-gray-600 overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

