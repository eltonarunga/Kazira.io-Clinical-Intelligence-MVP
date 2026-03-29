import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportContentProps {
  text: string;
}

const ReportContent: React.FC<ReportContentProps> = ({ text }) => {
  return (
    <div className="markdown-body prose prose-slate max-w-none prose-headings:scroll-mt-24">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({node, ...props}) => {
            const id = props.children?.toString().toLowerCase().includes('executive summary') ? 'exec-summary' : 
                       props.children?.toString().toLowerCase().includes('why it changed') ? 'why-changed' :
                       props.children?.toString().toLowerCase().includes('at risk') ? 'at-risk' :
                       props.children?.toString().toLowerCase().includes('next steps') ? 'next-steps' : undefined;
            return <h2 id={id} className="text-2xl font-bold text-ink mt-8 mb-4 pb-2 border-b border-border2 font-serif" {...props} />;
          },
          h3: ({node, ...props}) => <h3 className="text-xl font-bold text-ink2 mt-6 mb-3 font-serif" {...props} />,
          p: ({node, ...props}) => {
            const content = props.children?.toString() || '';
            if (content.includes('🟢')) return <p className="flex items-center gap-2 py-1 text-emerald-700 font-medium"><span className="text-emerald-500">🟢</span> {content.replace('🟢', '').trim()}</p>;
            if (content.includes('🟡')) return <p className="flex items-center gap-2 py-1 text-amber-700 font-medium"><span className="text-amber-500">🟡</span> {content.replace('🟡', '').trim()}</p>;
            if (content.includes('🔴')) return <p className="flex items-center gap-2 py-1 text-warn font-medium"><span className="text-warn">🔴</span> {content.replace('🔴', '').trim()}</p>;
            return <p className="text-ink3 leading-relaxed mb-4" {...props} />;
          },
          li: ({node, ...props}) => <li className="text-ink3 mb-2" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="bg-accent-light border-l-4 border-accent p-4 my-6 italic text-ink2" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default ReportContent;
