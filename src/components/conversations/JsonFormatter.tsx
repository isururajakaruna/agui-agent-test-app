"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface JsonFormatterProps {
  data: any;
  defaultExpanded?: boolean;
}

export function JsonFormatter({ data, defaultExpanded = true }: JsonFormatterProps) {
  return (
    <div className="font-mono text-xs">
      <JsonNode data={data} level={0} defaultExpanded={defaultExpanded} />
    </div>
  );
}

interface JsonNodeProps {
  data: any;
  level: number;
  defaultExpanded?: boolean;
  propertyKey?: string;
}

function JsonNode({ data, level, defaultExpanded = true, propertyKey }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const indent = "  ".repeat(level);

  if (data === null) {
    return (
      <span className="text-gray-500">
        {propertyKey && <span className="text-blue-600 dark:text-blue-400">&quot;{propertyKey}&quot;: </span>}
        <span className="text-purple-600 dark:text-purple-400">null</span>
      </span>
    );
  }

  if (typeof data === "boolean") {
    return (
      <span>
        {propertyKey && <span className="text-blue-600 dark:text-blue-400">&quot;{propertyKey}&quot;: </span>}
        <span className="text-purple-600 dark:text-purple-400">{data.toString()}</span>
      </span>
    );
  }

  if (typeof data === "number") {
    return (
      <span>
        {propertyKey && <span className="text-blue-600 dark:text-blue-400">&quot;{propertyKey}&quot;: </span>}
        <span className="text-green-600 dark:text-green-400">{data}</span>
      </span>
    );
  }

  if (typeof data === "string") {
    return (
      <span>
        {propertyKey && <span className="text-blue-600 dark:text-blue-400">&quot;{propertyKey}&quot;: </span>}
        <span className="text-orange-600 dark:text-orange-400">&quot;{data}&quot;</span>
      </span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <span>
          {propertyKey && <span className="text-blue-600 dark:text-blue-400">&quot;{propertyKey}&quot;: </span>}
          <span className="text-gray-600 dark:text-gray-400">[]</span>
        </span>
      );
    }

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 -ml-1"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {propertyKey && <span className="text-blue-600 dark:text-blue-400 ml-1">&quot;{propertyKey}&quot;: </span>}
          <span className="text-gray-600 dark:text-gray-400 ml-1">[{data.length}]</span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l border-gray-300 dark:border-gray-700 pl-2">
            {data.map((item, index) => (
              <div key={index} className="my-0.5">
                <span className="text-gray-500">{index}: </span>
                <JsonNode data={item} level={level + 1} defaultExpanded={false} />
                {index < data.length - 1 && <span className="text-gray-500">,</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return (
        <span>
          {propertyKey && <span className="text-blue-600 dark:text-blue-400">&quot;{propertyKey}&quot;: </span>}
          <span className="text-gray-600 dark:text-gray-400">{"{}"}</span>
        </span>
      );
    }

    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 -ml-1"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {propertyKey && <span className="text-blue-600 dark:text-blue-400 ml-1">&quot;{propertyKey}&quot;: </span>}
          <span className="text-gray-600 dark:text-gray-400 ml-1">{"{"}{keys.length}{"}"}</span>
        </button>
        {isExpanded && (
          <div className="ml-4 border-l border-gray-300 dark:border-gray-700 pl-2">
            {keys.map((key, index) => (
              <div key={key} className="my-0.5">
                <JsonNode data={data[key]} level={level + 1} defaultExpanded={false} propertyKey={key} />
                {index < keys.length - 1 && <span className="text-gray-500">,</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span className="text-gray-600 dark:text-gray-400">{String(data)}</span>;
}

