import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ReportContent: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="prose prose-ink max-w-none">
      <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
    </div>
  );
};

export default ReportContent;
