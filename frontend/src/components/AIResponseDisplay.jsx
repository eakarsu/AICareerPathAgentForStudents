import React from 'react';

export default function AIResponseDisplay({ content, title }) {
  if (!content) return null;

  const formatContent = (text) => {
    // Convert markdown-style formatting to HTML
    let html = text;

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h4 class="ai-h4">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 class="ai-h3">$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="ai-h2">$1</h2>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Bullet points
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^• (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="ai-list">$&</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="numbered">$1</li>');

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="ai-code"><code>$2</code></pre>');
    html = html.replace(/`(.+?)`/g, '<code class="ai-inline-code">$1</code>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="ai-quote">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="ai-hr" />');

    // Paragraphs (double newline)
    html = html.replace(/\n\n/g, '</p><p>');

    // Single newlines within content
    html = html.replace(/\n/g, '<br/>');

    return '<p>' + html + '</p>';
  };

  return (
    <div className="ai-response-container">
      <div className="ai-response-header">
        <div className="ai-badge">
          <span className="ai-pulse"></span>
          <span>AI-Powered Insight</span>
        </div>
        {title && <h3 className="ai-response-title">{title}</h3>}
      </div>
      <div
        className="ai-response-body"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    </div>
  );
}
