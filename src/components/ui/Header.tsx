"use client";

import React from "react";
import { Bot } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Bot className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Agent Testing UI
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Connected
          </span>
        </div>
      </div>
    </header>
  );
}

