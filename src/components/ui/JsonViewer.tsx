"use client";

import React, { useState } from "react";
import { Copy, Check, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: any;
  className?: string;
}

interface JsonNodeProps {
  data: any;
  name?: string;
  isLast?: boolean;
  level?: number;
}

function JsonNode({ data, name, isLast = false, level = 0 }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const isObject = typeof data === "object" && data !== null && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const isCollapsible = isObject || isArray;

  const indent = "  ".repeat(level);

  if (!isCollapsible) {
    // Primitive value
    return (
      <div className="font-mono text-sm">
        {name && (
          <>
            <span className="text-blue-400">&quot;{name}&quot;</span>
            <span className="text-gray-500">: </span>
          </>
        )}
        {typeof data === "string" && (
          <span className="text-orange-400">&quot;{data}&quot;</span>
        )}
        {typeof data === "number" && (
          <span className="text-green-400">{data}</span>
        )}
        {typeof data === "boolean" && (
          <span className="text-blue-300">{data.toString()}</span>
        )}
        {data === null && <span className="text-gray-500">null</span>}
        {!isLast && <span className="text-gray-500">,</span>}
      </div>
    );
  }

  const entries = isArray ? data : Object.entries(data);
  const count = isArray ? data.length : Object.keys(data).length;
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  return (
    <div className="font-mono text-sm">
      {/* Collapsible Header */}
      <div
        className="flex items-center gap-1 hover:bg-gray-800 cursor-pointer rounded px-1 -ml-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
        )}
        {name && (
          <>
            <span className="text-blue-400">&quot;{name}&quot;</span>
            <span className="text-gray-500">: </span>
          </>
        )}
        <span className="text-gray-300">{openBracket}</span>
        {!isExpanded && (
          <>
            <span className="text-gray-500 text-xs">
              {count} {isArray ? "items" : "keys"}
            </span>
            <span className="text-gray-300">{closeBracket}</span>
          </>
        )}
        {!isExpanded && !isLast && <span className="text-gray-500">,</span>}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          <div className="pl-4 border-l border-gray-700 ml-2">
            {isArray
              ? data.map((item: any, index: number) => (
                  <JsonNode
                    key={index}
                    data={item}
                    isLast={index === data.length - 1}
                    level={level + 1}
                  />
                ))
              : entries.map(([key, value]: [string, any], index: number) => (
                  <JsonNode
                    key={key}
                    name={key}
                    data={value}
                    isLast={index === entries.length - 1}
                    level={level + 1}
                  />
                ))}
          </div>
          <div className="flex">
            <span className="text-gray-300">{closeBracket}</span>
            {!isLast && <span className="text-gray-500">,</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default function JsonViewer({ data, className }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const jsonString =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse string data if needed
  const parsedData = typeof data === "string" ? JSON.parse(data) : data;

  return (
    <div className={cn("relative", className)}>
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors z-10"
        aria-label="Copy JSON"
        title={copied ? "Copied!" : "Copy JSON"}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-300" />
        )}
      </button>

      {/* JSON Tree Display */}
      <div className="bg-gray-900 rounded-lg p-4 pr-12 overflow-x-auto">
        <JsonNode data={parsedData} />
      </div>
    </div>
  );
}
