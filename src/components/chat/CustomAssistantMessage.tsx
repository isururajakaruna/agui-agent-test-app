"use client";

import { type AssistantMessageProps } from "@copilotkit/react-ui";
import { useChatContext, Markdown } from "@copilotkit/react-ui";
import { Bot } from "lucide-react";

export default function CustomAssistantMessage(props: AssistantMessageProps) {
  const { icons } = useChatContext();
  const { message, isLoading, subComponent } = props;

  const avatarStyles = "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 min-h-10 min-w-10 rounded-full text-gray-700 dark:text-gray-300 flex items-center justify-center";
  const messageStyles = "px-4 py-2 rounded-xl";

  const avatar = (
    <div className={avatarStyles}>
      <Bot className="h-5 w-5" />
    </div>
  );

  // Custom components for table rendering (GFM support)
  const markdownComponents = {
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
    ),
    tbody: ({ node, ...props }: any) => (
      <tbody {...props} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr className="border-b border-gray-200 dark:border-gray-700" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm" {...props} />
    ),
  };

  // Check if there's actual text content to display
  const hasTextContent = message?.content && message.content.trim().length > 0;
  
  // If only subComponent (tool cards, thinking), render without message wrapper
  if (subComponent && !hasTextContent) {
    return <div className="my-2">{subComponent}</div>;
  }

  // If no content and no subComponent, don't render anything (empty message)
  if (!hasTextContent && !subComponent && !isLoading) {
    return null;
  }

  return (
    <div className="py-2">
      <div className="flex items-start gap-3">
        {avatar}
        <div className={messageStyles}>
          {hasTextContent && <Markdown content={message.content} components={markdownComponents} />}
          {isLoading && icons.spinnerIcon}
        </div>
      </div>
      {/* Render subComponent below text if both exist */}
      {subComponent && <div className="my-2 ml-[52px]">{subComponent}</div>}
    </div>
  );
}

