import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface MarketSummaryCardProps {
  riskProfile?: string;
  currencies?: string[];
  result?: any;
  status?: "inProgress" | "executing" | "complete" | "error";
  className?: string;
}

export default function MarketSummaryCard({
  riskProfile,
  currencies,
  result,
  status = "inProgress",
  className,
}: MarketSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "inProgress":
      case "executing":
        return <Loader2 className="w-5 h-5 animate-spin text-purple-500" />;
      case "complete":
        return <BarChart3 className="w-5 h-5 text-green-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
        "border-2 border-purple-300 dark:border-purple-700",
        "rounded-xl p-5 shadow-lg animate-slide-up",
        "transition-all duration-300 hover:shadow-xl",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/50 dark:bg-black/30 rounded-lg">
          {getStatusIcon()}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-purple-900 dark:text-purple-100 text-lg">
                Market Summary
              </h4>
              <Badge variant="info">{status}</Badge>
            </div>
            {result && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-white/50 dark:hover:bg-black/30 rounded transition-colors"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-3">
            {riskProfile && (
              <div className="bg-white/50 dark:bg-black/30 rounded-lg px-3 py-2">
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Risk Profile
                </p>
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  {riskProfile}
                </p>
              </div>
            )}
            {currencies && currencies.length > 0 && (
              <div className="bg-white/50 dark:bg-black/30 rounded-lg px-3 py-2">
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Currencies
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currencies.map((currency) => (
                    <Badge key={currency} variant="default" className="text-xs">
                      {currency}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          {result && status === "complete" && (
            <div
              className={cn(
                "space-y-2 transition-all duration-300",
                isExpanded ? "block" : "hidden"
              )}
            >
              <div className="bg-white/50 dark:bg-black/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Market Insights
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  {typeof result === "string" ? (
                    <p>{result}</p>
                  ) : (
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === "complete" && !isExpanded && result && (
            <p className="text-xs text-purple-600 dark:text-purple-400 italic">
              Click arrow to view details
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

