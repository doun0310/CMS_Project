import React, { useState } from 'react';
import type { DailySummary, ExportFormat } from '../../types/dailySummary';
import { formatExportText } from '../../services/dailySummaryService';
import { IconDownload, IconCheckCircle, IconX } from '../common/Icons';

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
        backgroundColor: 'var(--card-bg, #1e293b)',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '650px',
        color: 'var(--text-primary, #f8fafc)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconDownload size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>일일 보고서 1-Click 내보내기</h3>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-secondary, #94a3b8)' }}>
                {summary.summaryDate} 개발자 보고서 포맷을 선택하고 클립보드에 복사하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #94a3b8)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="닫기"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div style={{
          padding: '16px 24px 0',
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))'
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
                color: format === fmt ? '#ffffff' : 'var(--text-secondary, #94a3b8)',
                fontWeight: format === fmt ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {fmt === 'slack' ? '💬 Slack 전송용' : fmt === 'notion' ? '📝 Notion 마크다운' : fmt === 'markdown' ? '📄 표준 Markdown' : '📋 일반 텍스트'}
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
              backgroundColor: 'var(--bg-secondary, #0f172a)',
              color: '#38bdf8',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
              borderRadius: '10px',
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
          backgroundColor: 'var(--bg-secondary, #0f172a)',
          borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.15))',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary, #94a3b8)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            취소
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
            {copied ? <IconCheckCircle size={16} /> : <IconDownload size={16} />}
            <span>{copied ? '복사 완료!' : '클립보드에 복사'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
