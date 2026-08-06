import React, { useState } from 'react';
import type { DailySummary, ExportFormat } from '../../types/dailySummary';
import { formatExportText } from '../../services/dailySummaryService';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DailySummary;
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({ isOpen, onClose, summary }) => {
  const [format, setFormat] = useState<ExportFormat>('slack');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exportContent = formatExportText(summary, format);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '650px',
        color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📋</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>일일 요약 복사 및 내보내기</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{summary.summaryDate} 개발자 보고서 포맷 선택</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Format selector tabs */}
        <div style={{
          padding: '16px 24px 0',
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          {(['slack', 'notion', 'markdown', 'text'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                backgroundColor: format === fmt ? '#3b82f6' : 'transparent',
                color: format === fmt ? '#ffffff' : '#94a3b8',
                fontWeight: format === fmt ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase'
              }}
            >
              {fmt === 'slack' ? '💬 Slack' : fmt === 'notion' ? '📝 Notion' : fmt === 'markdown' ? '📄 Markdown' : 'TXT 일반'}
            </button>
          ))}
        </div>

        {/* Preview Content */}
        <div style={{ padding: '20px 24px' }}>
          <textarea
            readOnly
            value={exportContent}
            style={{
              width: '100%',
              height: '240px',
              backgroundColor: '#0f172a',
              color: '#38bdf8',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '14px',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: 1.5,
              resize: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#0f172a',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            닫기
          </button>
          <button
            onClick={handleCopy}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: copied ? '#10b981' : '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
          >
            {copied ? '✓ 복사 완료!' : '📋 클립보드 복사'}
          </button>
        </div>
      </div>
    </div>
  );
};
