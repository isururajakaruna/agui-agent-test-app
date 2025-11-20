/**
 * Thinking Card Component
 * Displays extended thinking in tool card style (gray, non-clickable)
 * Matches the exact layout of tool cards
 */

interface ThinkingCardProps {
  args: {
    status?: string;
    thoughtsTokenCount?: number;
    totalTokenCount?: number;
    candidatesTokenCount?: number;
    promptTokenCount?: number;
    model?: string;
  };
}

export default function ThinkingCard({ args }: ThinkingCardProps) {
  const {
    status,
    thoughtsTokenCount,
    totalTokenCount,
    candidatesTokenCount,
    promptTokenCount,
  } = args;

  // Don't render if status is "completed" 
  if (status === 'completed') {
    return null; // Already shown as separate "Thinking Complete" message
  }

  // Format token counts (concise like "1 parameter")
  const tokenCount = thoughtsTokenCount ? `${thoughtsTokenCount.toLocaleString()}` : '0';
  const paramText = `${tokenCount} tokens`;
  
  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 max-w-fit">
      {/* Checkmark icon (matches tool cards exactly) */}
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0">
        <span className="text-sm">✓</span>
      </div>

      {/* Content (matches tool card layout) */}
      <div className="min-w-0">
        <div className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
          Thinking
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap">
          {paramText}
        </div>
      </div>

      {/* Status badge (like "complete" in tool cards) */}
      <div className="px-2.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        thinking
      </div>
    </div>
  );
}

