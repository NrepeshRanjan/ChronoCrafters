import React from 'react';

interface MarkdownRendererProps {
  content: string;
  title?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, title }) => {
  // A very basic markdown-like renderer for demonstration.
  // In a real application, you would use a library like 'marked' or 'react-markdown'.
  // For simplicity and avoiding external dependencies for this specific task,
  // we'll implement a minimal renderer.

  const renderContent = (markdown: string) => {
    const lines = markdown.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mb-4 mt-6 text-indigo-300">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mb-3 mt-5 text-indigo-400">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mb-2 mt-4 text-indigo-500">{line.substring(4)}</h3>;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={index} className="ml-6 list-disc text-gray-200">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />; // Render empty lines as breaks
      }
      // Basic link detection (simple regex, not robust)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const processedLine = line.replace(linkRegex, (match, text, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline">${text}</a>`;
      });

      return <p key={index} className="mb-2 text-gray-200" dangerouslySetInnerHTML={{ __html: processedLine }}></p>;
    });
  };

  return (
    <div className="prose prose-invert max-w-none"> {/* Tailwind prose plugin for basic styling */}
      {title && <h1 className="text-4xl font-extrabold mb-6 text-white">{title}</h1>}
      {renderContent(content)}
    </div>
  );
};