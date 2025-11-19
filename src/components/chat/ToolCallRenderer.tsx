import React from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCallRendererProps {
  toolCallName: string;
  args?: Record<string, any>;
  result?: any;
  status: "inProgress" | "executing" | "complete" | "error";
  className?: string;
}

export default function ToolCallRenderer({
  toolCallName,
  args,
  result,
  status,
  className,
}: ToolCallRendererProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "inProgress":
      case "executing":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "inProgress":
      case "executing":
        return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30";
      case "complete":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30";
      case "error":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30";
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-2 animate-slide-up",
        getStatusColor(),
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="font-semibold text-sm">
          {toolCallName.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      {/* Arguments */}
      {args && Object.keys(args).length > 0 && (
        <div className="text-xs space-y-1">
          <div className="font-medium text-muted-foreground">Parameters:</div>
          <pre className="bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">
            {JSON.stringify(args, null, 2)}
          </pre>
        </div>
      )}

      {/* Result */}
      {result && status === "complete" && (
        <div className="text-xs space-y-1">
          <div className="font-medium text-muted-foreground">Result:</div>
          <div className="text-sm">
            {typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2).substring(0, 200) +
                (JSON.stringify(result).length > 200 ? "..." : "")}
          </div>
        </div>
      )}
    </div>
  );
}

