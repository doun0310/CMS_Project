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
import {
  IconZap,
  IconAiSpark,
  IconCheckCircle,
  IconAlertTriangle,
  IconClock,
  IconPlus,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconCalendar,
  IconRefresh
} from '../common/Icons';
import '../../styles/dailySummaryView.css';

export const DailySummaryView: React.FC = () => {
  const { issues, currentUser } = useAether();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAI, setUseAI] = useState<boolean>(isGeminiConfigured);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load or generate summary on date change
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
      const events = collectEventsForDate(dateStr, issues, currentUser?.id);
      let res: DailySummary;
      if (aiMode && isGeminiConfigured) {
        res = await generateAISummary(dateStr, events, issues, currentUser?.id);
      } else {
        res = generateRuleBasedSummary(dateStr, events, issues, currentUser?.id);
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
    <div className="daily-summary-container animate-fade-in">
      {/* Header Glass Banner */}
      <div className="daily-summary-header-card">
        <div className="daily-summary-header-title-group">
          <div className="daily-summary-header-icon">
            <IconZap size={24} />
          </div>
          <div>
            <h1 className="daily-summary-header-title">오늘의 개발 요약</h1>
            <p className="daily-summary-header-subtitle">
              일일 변경 이벤트 및 태스크 상태를 자동 분석하여 데일리 스탠드업 보고서를 생성합니다.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="daily-summary-actions">
          {/* Date Picker Bar */}
          <div className="daily-summary-date-picker">
            <button className="daily-summary-date-btn" onClick={() => handleDateChange(-1)} title="이전 날짜">
              <IconChevronLeft size={16} />
            </button>
            <input
              type="date"
              className="daily-summary-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button className="daily-summary-date-btn" onClick={() => handleDateChange(1)} title="다음 날짜">
              <IconChevronRight size={16} />
            </button>
          </div>

          {/* Engine Toggle Button */}
          <button
            className={`daily-summary-mode-btn ${!useAI ? 'template-mode' : ''}`}
            onClick={() => {
              const nextMode = !useAI;
              setUseAI(nextMode);
              handleGenerateSummary(selectedDate, nextMode);
            }}
          >
            <IconAiSpark size={16} />
            <span>{useAI ? 'Gemini AI 엔진' : '템플릿 규칙 엔진'}</span>
          </button>

          {/* Refresh Button */}
          <button
            className="daily-summary-btn daily-summary-btn-secondary"
            onClick={() => handleGenerateSummary(selectedDate, useAI)}
            disabled={isGenerating}
          >
            <IconRefresh size={16} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? '분석 중...' : '새로고침'}</span>
          </button>

          {/* Export Button */}
          <button
            className="daily-summary-btn daily-summary-btn-primary"
            onClick={() => setIsExportModalOpen(true)}
            disabled={!summary}
          >
            <IconDownload size={16} />
            <span>보고서 내보내기</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="daily-summary-kpi-grid">
        <div className="daily-summary-kpi-card">
          <div className="daily-summary-kpi-icon done">
            <IconCheckCircle size={22} />
          </div>
          <div>
            <div className="daily-summary-kpi-label">오늘 완료 (Done)</div>
            <div className="daily-summary-kpi-value" style={{ color: '#10b981' }}>
              {summary ? summary.doneToday.length : 0}
              <span className="daily-summary-kpi-unit">건</span>
            </div>
          </div>
        </div>

        <div className="daily-summary-kpi-card">
          <div className="daily-summary-kpi-icon plan">
            <IconClock size={22} />
          </div>
          <div>
            <div className="daily-summary-kpi-label">내일 목표 (Plan)</div>
            <div className="daily-summary-kpi-value" style={{ color: '#3b82f6' }}>
              {summary ? summary.planTomorrow.length : 0}
              <span className="daily-summary-kpi-unit">건</span>
            </div>
          </div>
        </div>

        <div className="daily-summary-kpi-card">
          <div className="daily-summary-kpi-icon blocker">
            <IconAlertTriangle size={22} />
          </div>
          <div>
            <div className="daily-summary-kpi-label">주의 & 블로커</div>
            <div className="daily-summary-kpi-value" style={{ color: '#ef4444' }}>
              {summary ? summary.blockers.length : 0}
              <span className="daily-summary-kpi-unit">건</span>
            </div>
          </div>
        </div>

        <div className="daily-summary-kpi-card">
          <div className="daily-summary-kpi-icon total">
            <IconCalendar size={22} />
          </div>
          <div>
            <div className="daily-summary-kpi-label">총 수집 항목</div>
            <div className="daily-summary-kpi-value" style={{ color: '#a855f7' }}>
              {totalEventsCount}
              <span className="daily-summary-kpi-unit">개</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      {summary?.aiInsights && (
        <div className="daily-summary-ai-banner">
          <div style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }}>
            <IconAiSpark size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>AI 생산성 총평 및 제언</span>
              <span className={`daily-summary-ai-badge ${summary.engineUsed === 'AI' ? 'ai' : 'template'}`}>
                {summary.engineUsed === 'AI' ? 'Gemini 2.0 AI' : 'Rule Engine'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {summary.aiInsights}
            </p>
          </div>
        </div>
      )}

      {/* 3 Major Content Columns */}
      <div className="daily-summary-columns">
        {/* Column 1: Today Done */}
        <div className="daily-summary-column-card">
          <div className="daily-summary-column-header done">
            <h3 className="daily-summary-column-title done">
              <IconCheckCircle size={18} />
              <span>1. 오늘 한 일 (Done Today)</span>
            </h3>
            <button className="daily-summary-add-btn done" onClick={() => handleAddItem('doneToday')}>
              <IconPlus size={14} />
              <span>추가</span>
            </button>
          </div>

          <div className="daily-summary-item-list">
            {summary?.doneToday.length === 0 ? (
              <div className="daily-summary-empty-state">오늘 완료된 항목이 없습니다.</div>
            ) : (
              summary?.doneToday.map((item) => (
                <div key={item.id} className="daily-summary-item-card">
                  <div style={{ flex: 1 }}>
                    {item.issueKey && <span className="daily-summary-item-key done">{item.issueKey}</span>}
                    <div className="daily-summary-item-title">{item.title}</div>
                    {item.detail && <div className="daily-summary-item-detail">{item.detail}</div>}
                  </div>
                  <button
                    className="daily-summary-remove-btn"
                    onClick={() => handleRemoveItem('doneToday', item.id)}
                    title="삭제"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Plan Tomorrow */}
        <div className="daily-summary-column-card">
          <div className="daily-summary-column-header plan">
            <h3 className="daily-summary-column-title plan">
              <IconClock size={18} />
              <span>2. 내일 할 일 (Plan for Tomorrow)</span>
            </h3>
            <button className="daily-summary-add-btn plan" onClick={() => handleAddItem('planTomorrow')}>
              <IconPlus size={14} />
              <span>추가</span>
            </button>
          </div>

          <div className="daily-summary-item-list">
            {summary?.planTomorrow.length === 0 ? (
              <div className="daily-summary-empty-state">내일 계획된 항목이 없습니다.</div>
            ) : (
              summary?.planTomorrow.map((item) => (
                <div key={item.id} className="daily-summary-item-card">
                  <div style={{ flex: 1 }}>
                    {item.issueKey && <span className="daily-summary-item-key plan">{item.issueKey}</span>}
                    <div className="daily-summary-item-title">{item.title}</div>
                    {item.detail && <div className="daily-summary-item-detail">{item.detail}</div>}
                  </div>
                  <button
                    className="daily-summary-remove-btn"
                    onClick={() => handleRemoveItem('planTomorrow', item.id)}
                    title="삭제"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Risks & Blockers */}
        <div className="daily-summary-column-card">
          <div className="daily-summary-column-header blocker">
            <h3 className="daily-summary-column-title blocker">
              <IconAlertTriangle size={18} />
              <span>3. 주의 사항 & 블로커</span>
            </h3>
            <button className="daily-summary-add-btn blocker" onClick={() => handleAddItem('blockers')}>
              <IconPlus size={14} />
              <span>추가</span>
            </button>
          </div>

          <div className="daily-summary-item-list">
            {summary?.blockers.length === 0 ? (
              <div className="daily-summary-empty-state">주의 사항 및 특이 블로커가 없습니다.</div>
            ) : (
              summary?.blockers.map((item) => (
                <div key={item.id} className="daily-summary-item-card">
                  <div style={{ flex: 1 }}>
                    {item.issueKey && <span className="daily-summary-item-key blocker">{item.issueKey}</span>}
                    <div className="daily-summary-item-title">{item.title}</div>
                    {item.detail && <div className="daily-summary-item-detail">{item.detail}</div>}
                  </div>
                  <button
                    className="daily-summary-remove-btn"
                    onClick={() => handleRemoveItem('blockers', item.id)}
                    title="삭제"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ))
            )}
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
