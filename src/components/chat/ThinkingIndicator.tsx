import React from "react";
import { cn } from "@/lib/utils";

interface ThinkingIndicatorProps {
  className?: string;
  message?: string;
}

export default function ThinkingIndicator({
  className,
  message = "Thinking",
}: ThinkingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        className
      )}
    >
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {message}
      </span>
      <div className="flex gap-1">
        <span
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

