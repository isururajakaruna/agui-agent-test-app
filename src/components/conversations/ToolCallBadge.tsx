"use client";

import React, { useState } from "react";
import { Wrench, X } from "lucide-react";
import { JsonFormatter } from "./JsonFormatter";

interface ToolCallBadgeProps {
  toolName: string;
  args: any;
  result?: any;
}

export function ToolCallBadge({ toolName, args, result }: ToolCallBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Badge */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
      >
        <Wrench size={12} />
        <span>{toolName}</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Wrench size={20} className="text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tool Call: {toolName}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Arguments */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Request (Arguments)
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto border border-gray-200 dark:border-gray-700">
                  <JsonFormatter data={args} defaultExpanded={true} />
                </div>
              </div>

              {/* Result */}
              {result && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Response (Result)
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <JsonFormatter data={result} defaultExpanded={true} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

