/**
 * Session Stats Card Component
 * Shows aggregate statistics for the entire conversation
 * Appears at the end of the session
 */

interface SessionStatsCardProps {
  args: {
    totalThinkingTokens?: number;
    totalToolCalls?: number;
    durationSeconds?: number;
    threadId?: string;
    runId?: string;
  };
}

export default function SessionStatsCard({ args }: SessionStatsCardProps) {
  const {
    totalThinkingTokens,
    totalToolCalls,
    durationSeconds,
  } = args;

  // Format concise summary (like "1 parameter")
  const summary = totalToolCalls 
    ? `${totalToolCalls} tool call${totalToolCalls > 1 ? 's' : ''}`
    : 'No tools';

  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 max-w-fit">
      {/* Checkmark icon (matches tool cards exactly) */}
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0">
        <span className="text-sm">✓</span>
      </div>

      {/* Content (matches tool card layout) */}
      <div className="min-w-0">
        <div className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
          Session Complete
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap">
          {summary}
        </div>
      </div>

      {/* Status badge */}
      <div className="px-2.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        complete
      </div>
    </div>
  );
}

