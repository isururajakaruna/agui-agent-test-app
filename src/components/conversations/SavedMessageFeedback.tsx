"use client";

import React, { useState } from "react";
import { Star, MessageSquare, Check, X } from "lucide-react";

interface SavedMessageFeedbackProps {
  conversationId: string;
  invocationId: string;
  existingRating?: number;
  existingComment?: string;
  onUpdate: () => void; // Callback to refresh the conversation data
  hasToolCalls?: boolean; // Whether tool calls are present
}

export function SavedMessageFeedback({
  conversationId,
  invocationId,
  existingRating,
  existingComment,
  onUpdate,
  hasToolCalls = false,
}: SavedMessageFeedbackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState(existingRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingComment || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please provide a rating");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/conversations/saved/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          invocationId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save feedback");
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsExpanded(false);
        onUpdate(); // Refresh the parent component
      }, 1500);
    } catch (error) {
      console.error("Failed to save feedback:", error);
      alert("Failed to save feedback. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setRating(existingRating || 0);
    setComment(existingComment || "");
    setIsExpanded(false);
  };

  return (
    <div className={`absolute right-0 ${hasToolCalls ? 'top-[30px]' : 'top-[15px]'}`}>
      {!isExpanded ? (
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-lg shadow-md opacity-90 hover:opacity-100 transition-opacity">
          {/* Rating stars (read-only when collapsed) */}
          {existingRating ? (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={`${
                    star <= existingRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
          ) : null}

          {/* Feedback button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title={existingRating ? "Edit feedback" : "Add feedback"}
          >
            <MessageSquare size={14} />
            {existingRating ? null : <span>Add</span>}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700 w-80">
          {/* Action buttons at top */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Rate Response
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSubmit}
                disabled={isSaving || rating === 0}
                className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save feedback"
              >
                {showSuccess ? (
                  <Check size={16} className="text-green-600 dark:text-green-400" />
                ) : (
                  <Check size={16} className="text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                title="Cancel"
              >
                <X size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Star rating */}
          <div className="mb-3">
            <div className="flex items-center gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                {rating} out of 5 stars
              </p>
            )}
          </div>

          {/* Comment textarea */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your feedback..."
              rows={3}
              className="w-full px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

