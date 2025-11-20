import { Clock, Wrench, Brain, CheckCircle } from 'lucide-react';
import { SessionStats as SessionStatsType } from '../hooks/useCustomEvents';

interface SessionStatsProps {
  stats: SessionStatsType;
}

export function SessionStats({ stats }: SessionStatsProps) {
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
            {stats.totalThinkingTokens.toLocaleString()}
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Wrench className="w-4 h-4" />
            <span className="text-xs font-medium">Tool Calls</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalToolCalls}
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Duration</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.durationSeconds.toFixed(1)}s
          </div>
        </div>
      </div>
      
      {stats.threadId && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="text-xs text-gray-500">
            Thread ID: <span className="font-mono">{stats.threadId.slice(0, 8)}...</span>
          </div>
        </div>
      )}
    </div>
  );
}

