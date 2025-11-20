"use client";

import React, { useState } from "react";
import { Wrench, Loader2, CheckCircle2, AlertCircle, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import JsonViewer from "@/components/ui/JsonViewer";
import Tooltip from "@/components/ui/Tooltip";

interface GenericToolCardProps {
  toolName: string;
  args?: Record<string, any>;
  result?: any;
  status?: "inProgress" | "executing" | "complete" | "error";
  className?: string;
}

export default function GenericToolCard({
  toolName,
  args,
  result,
  status = "inProgress",
  className,
}: GenericToolCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "inProgress":
      case "executing":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Wrench className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "inProgress":
      case "executing":
        return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20";
      case "complete":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20";
      case "error":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20";
      default:
        return "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  const formatToolName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getTooltipContent = () => {
    return `Tool Call: ${toolName}`;
  };

  return (
    <>
      {/* Compact Card */}
      <Tooltip content={getTooltipContent()}>
        <div
          onClick={() => setIsModalOpen(true)}
          className={cn(
            "rounded-lg border px-4 py-3 cursor-pointer transition-all hover:shadow-md",
            getStatusColor(),
            "flex items-center justify-between gap-3",
            className
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getStatusIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {formatToolName(toolName)}
                </span>
                <Badge
                  variant={
                    status === "complete"
                      ? "success"
                      : status === "error"
                      ? "error"
                      : "info"
                  }
                >
                  tool
                </Badge>
                <Info className="w-3 h-3 text-gray-400 flex-shrink-0" />
              </div>
            {args && Object.keys(args).length > 0 && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {Object.keys(args).length} parameter{Object.keys(args).length > 1 ? "s" : ""}
              </p>
            )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </Tooltip>

      {/* Modal for Full Details */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={formatToolName(toolName)}
      >
        <div className="space-y-4">
          {/* Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <span className="font-semibold">Status</span>
            </div>
            <Badge
              variant={
                status === "complete"
                  ? "success"
                  : status === "error"
                  ? "error"
                  : "info"
              }
            >
              {status}
            </Badge>
          </div>

          {/* Arguments */}
          {args && Object.keys(args).length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Parameters</h4>
              <JsonViewer data={args} />
            </div>
          )}

          {/* Result */}
          {result && status === "complete" && (
            <div>
              <h4 className="font-semibold mb-2">Result</h4>
              <JsonViewer data={result} />
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                Tool execution failed
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

