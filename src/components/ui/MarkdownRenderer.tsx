import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none break-words", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [isCopied, setIsCopied] = useState(false);

            const handleCopy = () => {
              navigator.clipboard.writeText(codeString);
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            };

            if (!inline && match) {
              return (
                <div className="relative my-4 rounded-md overflow-hidden bg-[#1E1E1E] border border-zinc-700">
                  <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-800 text-xs text-zinc-400 select-none">
                    <span>{language}</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
                      title="Copy code"
                    >
                      {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={language}
                    PreTag="div"
                    customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code className={cn("bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5 text-sm", className)} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
