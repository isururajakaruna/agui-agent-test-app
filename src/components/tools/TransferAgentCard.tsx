import React from "react";
import { ArrowRightCircle, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface TransferAgentCardProps {
  agentName?: string;
  status?: "inProgress" | "executing" | "complete" | "error";
  className?: string;
}

export default function TransferAgentCard({
  agentName,
  status = "inProgress",
  className,
}: TransferAgentCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "inProgress":
      case "executing":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case "complete":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <ArrowRightCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30",
        "border-2 border-blue-300 dark:border-blue-700",
        "rounded-xl p-5 shadow-lg animate-slide-up",
        "transition-all duration-300 hover:shadow-xl",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/50 dark:bg-black/30 rounded-lg">
          {getStatusIcon()}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-lg">
              Agent Transfer
            </h4>
            <Badge variant="info">{status}</Badge>
          </div>
          {agentName && (
            <div className="space-y-1">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Transferring to:
              </p>
              <div className="flex items-center gap-2 bg-white/50 dark:bg-black/30 rounded-lg px-3 py-2">
                <ArrowRightCircle className="w-4 h-4 text-blue-600" />
                <span className="font-mono font-semibold text-blue-900 dark:text-blue-100">
                  {agentName}
                </span>
              </div>
            </div>
          )}
          {status === "complete" && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ Successfully transferred conversation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

