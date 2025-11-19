import React from "react";
import { cn } from "@/lib/utils";

interface ThinkingIndicatorProps {
  className?: string;
  message?: string;
}

export default function ThinkingIndicator({
  className,
  message = "Thinking...",
}: ThinkingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800",
        className
      )}
    >
      <div className="flex gap-1">
        <span
          className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">
        {message}
      </span>
    </div>
  );
}

