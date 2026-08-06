import React, { useState, useEffect } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { DailySummary, SummaryItem } from '../../types/dailySummary';
import {
  collectEventsForDate,
  generateRuleBasedSummary,
  generateAISummary,
  getSavedDailySummary,
  saveDailySummary,
} from '../../services/dailySummaryService';
import { isGeminiConfigured } from '../../services/geminiService';
import { ExportSummaryModal } from '../modals/ExportSummaryModal';

export const DailySummaryView: React.FC = () => {
  const { issues, authUser } = useAether();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAI, setUseAI] = useState<boolean>(isGeminiConfigured);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load or generate summary on date or issues change
  useEffect(() => {
    const saved = getSavedDailySummary(selectedDate);
    if (saved) {
      setSummary(saved);
    } else {
      handleGenerateSummary(selectedDate, useAI);
    }
  }, [selectedDate]);

  const handleGenerateSummary = async (dateStr: string, aiMode: boolean) => {
    setIsGenerating(true);
    try {
      const events = collectEventsForDate(dateStr, issues, authUser?.id);
      let res: DailySummary;
      if (aiMode && isGeminiConfigured) {
        res = await generateAISummary(dateStr, events, issues, authUser?.id);
      } else {
        res = generateRuleBasedSummary(dateStr, events, issues, authUser?.id);
      }
      setSummary(res);
      saveDailySummary(res);
    } catch (e) {
      console.error('Failed to generate daily summary', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDateChange = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleAddItem = (category: 'doneToday' | 'planTomorrow' | 'blockers') => {
    if (!summary) return;
    const title = prompt('추가할 업무 또는 이슈 내용을 입력하세요:');
    if (!title) return;

    const newItem: SummaryItem = {
      id: `manual-${Date.now()}`,
      title,
      category,
    };

    const updated: DailySummary = {
      ...summary,
      [category]: [...summary[category], newItem],
      updatedAt: new Date().toISOString(),
    };

    setSummary(updated);
    saveDailySummary(updated);
  };

  const handleRemoveItem = (category: 'doneToday' | 'planTomorrow' | 'blockers', id: string) => {
    if (!summary) return;
    const updated: DailySummary = {
      ...summary,
      [category]: summary[category].filter((item) => item.id !== id),
      updatedAt: new Date().toISOString(),
    };
    setSummary(updated);
    saveDailySummary(updated);
  };

  const totalEventsCount = summary
    ? summary.doneToday.length + summary.planTomorrow.length + summary.blockers.length
    : 0;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        backgroundColor: '#1e293b',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            ⚡
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              오늘의 개발 요약 (Today's Summary)
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
              일일 변경 이벤트 및 태스크 상태를 자동 분석하여 데일리 스탠드업 보고서를 생성합니다.
            </p>
          </div>
        </div>

        {/* Date Controls & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Date Picker Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            borderRadius: '10px',
            padding: '4px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={() => handleDateChange(-1)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
            >
              ◀
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontWeight: 600,
                fontSize: '13px',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            />
            <button
              onClick={() => handleDateChange(1)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                padding: '6px 12px',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
            >
              ▶
            </button>
          </div>

          {/* AI vs Rule Toggle */}
          <button
            onClick={() => {
              const nextMode = !useAI;
              setUseAI(nextMode);
              handleGenerateSummary(selectedDate, nextMode);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: useAI ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: useAI ? 'rgba(139, 92, 246, 0.15)' : '#0f172a',
              color: useAI ? '#c084fc' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>{useAI ? '🤖 AI 엔진 (Gemini)' : '⚙️ 템플릿 엔진'}</span>
          </button>

          {/* Regenerate Button */}
          <button
            onClick={() => handleGenerateSummary(selectedDate, useAI)}
            disabled={isGenerating}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              opacity: isGenerating ? 0.6 : 1
            }}
          >
            {isGenerating ? '🔄 분석 중...' : '🔄 새로고침'}
          </button>

          {/* Export Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={!summary}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📋 복사 / 내보내기</span>
          </button>
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <span style={{ fontSize: '28px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px' }}>✅</span>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>오늘 완료 (Done Today)</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
              {summary ? summary.doneToday.length : 0} <span style={{ fontSize: '13px', fontWeight: 400, color: '#94a3b8' }}>건</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <span style={{ fontSize: '28px', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>🚀</span>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>내일 목표 (Plan)</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>
              {summary ? summary.planTomorrow.length : 0} <span style={{ fontSize: '13px', fontWeight: 400, color: '#94a3b8' }}>건</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <span style={{ fontSize: '28px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px' }}>🚨</span>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>주의 & 이슈 (Blockers)</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>
              {summary ? summary.blockers.length : 0} <span style={{ fontSize: '13px', fontWeight: 400, color: '#94a3b8' }}>건</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <span style={{ fontSize: '28px', backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '10px', borderRadius: '12px' }}>📊</span>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>총 수집 항목</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#c084fc' }}>
              {totalEventsCount} <span style={{ fontSize: '13px', fontWeight: 400, color: '#94a3b8' }}>개</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      {summary?.aiInsights && (
        <div style={{
          backgroundColor: '#1e1b4b',
          border: '1px solid rgba(129, 140, 248, 0.3)',
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)'
        }}>
          <span style={{ fontSize: '26px' }}>💡</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#a5b4fc' }}>AI 생산성 총평 및 제언</span>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: summary.engineUsed === 'AI' ? '#4c1d95' : '#334155',
                color: summary.engineUsed === 'AI' ? '#d8b4fe' : '#cbd5e1',
                fontWeight: 600
              }}>
                {summary.engineUsed === 'AI' ? 'Gemini 2.0 AI' : 'Rule Engine'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#e0e7ff', lineHeight: 1.6 }}>
              {summary.aiInsights}
            </p>
          </div>
        </div>
      )}

      {/* 3 Major Content Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* Column 1: Today Done */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>💚</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#34d399' }}>1. 오늘 한 일 (Done Today)</h3>
            </div>
            <button
              onClick={() => handleAddItem('doneToday')}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: 'none',
                color: '#34d399',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              + 항목 추가
            </button>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {summary?.doneToday.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1 }}>
                  {item.issueKey && (
                    <span style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#6ee7b7',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}>
                      {item.issueKey}
                    </span>
                  )}
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#f8fafc', lineHeight: 1.4 }}>{item.title}</div>
                  {item.detail && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{item.detail}</div>}
                </div>
                <button
                  onClick={() => handleRemoveItem('doneToday', item.id)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Plan Tomorrow */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>💙</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#60a5fa' }}>2. 내일 할 일 (Plan)</h3>
            </div>
            <button
              onClick={() => handleAddItem('planTomorrow')}
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                border: 'none',
                color: '#60a5fa',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              + 항목 추가
            </button>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {summary?.planTomorrow.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1 }}>
                  {item.issueKey && (
                    <span style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#93c5fd',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}>
                      {item.issueKey}
                    </span>
                  )}
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#f8fafc', lineHeight: 1.4 }}>{item.title}</div>
                  {item.detail && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{item.detail}</div>}
                </div>
                <button
                  onClick={() => handleRemoveItem('planTomorrow', item.id)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Risks & Blockers */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🔴</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f87171' }}>3. 주의 사항 & 블로커</h3>
            </div>
            <button
              onClick={() => handleAddItem('blockers')}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: 'none',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              + 항목 추가
            </button>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {summary?.blockers.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1 }}>
                  {item.issueKey && (
                    <span style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#fca5a5',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}>
                      {item.issueKey}
                    </span>
                  )}
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#f8fafc', lineHeight: 1.4 }}>{item.title}</div>
                  {item.detail && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{item.detail}</div>}
                </div>
                <button
                  onClick={() => handleRemoveItem('blockers', item.id)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {summary && (
        <ExportSummaryModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          summary={summary}
        />
      )}
    </div>
  );
};

export default DailySummaryView;
