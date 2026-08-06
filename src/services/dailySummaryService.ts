import type { Issue } from '../types/Aether';
import type { DailyEvent, DailySummary, SummaryItem, ExportFormat } from '../types/dailySummary';
import { callGemini, isGeminiConfigured } from './geminiService';

const SUMMARY_STORAGE_KEY_PREFIX = 'aether_daily_summary_';

/**
 * Collect events for a given date from issues and mock data.
 */
export function collectEventsForDate(dateStr: string, issues: Issue[], userId?: string): DailyEvent[] {
  const events: DailyEvent[] = [];

  issues.forEach((issue) => {
    // Check updated date
    const updatedDate = issue.updatedAt ? issue.updatedAt.slice(0, 10) : dateStr;
    
    // Filter by user if specified
    if (userId && issue.assigneeId !== userId) return;

    if (updatedDate === dateStr || !issue.updatedAt) {
      if (issue.status === 'done') {
        events.push({
          id: `evt-done-${issue.id}`,
          userId: issue.assigneeId || 'user-1',
          userName: 'Current User',
          eventType: 'status_changed',
          title: `[완료] ${issue.summary}`,
          description: `상태 변경: Done (우선순위: ${issue.priority})`,
          timestamp: issue.updatedAt || new Date().toISOString(),
          issueKey: issue.key,
          issueId: issue.id,
          statusTo: 'done',
        });
      } else if (issue.status === 'in_progress' || issue.status === 'in_review') {
        events.push({
          id: `evt-progress-${issue.id}`,
          userId: issue.assigneeId || 'user-1',
          userName: 'Current User',
          eventType: 'status_changed',
          title: `[진행 중] ${issue.summary}`,
          description: `상태: ${issue.status === 'in_review' ? 'In Review' : 'In Progress'}`,
          timestamp: issue.updatedAt || new Date().toISOString(),
          issueKey: issue.key,
          issueId: issue.id,
          statusTo: issue.status,
        });
      }

      const isBlocked = Boolean(issue.blockedBy && issue.blockedBy.length > 0);
      if (isBlocked || issue.priority === 'highest') {
        events.push({
          id: `evt-blocker-${issue.id}`,
          userId: issue.assigneeId || 'user-1',
          userName: 'Current User',
          eventType: 'blocker_flagged',
          title: `[주의/블로커] ${issue.summary}`,
          description: isBlocked ? '이슈가 차단(Blocked)되었습니다.' : '긴급 최우선(Highest) 이슈',
          timestamp: issue.updatedAt || new Date().toISOString(),
          issueKey: issue.key,
          issueId: issue.id,
        });
      }
    }
  });

  // If no events found for the target date, provide default mock events for demonstaton
  if (events.length === 0) {
    events.push(
      {
        id: 'evt-demo-1',
        userId: userId || 'user-1',
        userName: 'Current User',
        eventType: 'status_changed',
        title: '[완료] 사용자 인증 API 및 Supabase Auth 연동 완료',
        description: '로그인 모달 및 JWT 토큰 처리 로직 검증 완료',
        timestamp: `${dateStr}T10:30:00Z`,
        issueKey: 'PROJ-101',
        statusTo: 'done',
      },
      {
        id: 'evt-demo-2',
        userId: userId || 'user-1',
        userName: 'Current User',
        eventType: 'status_changed',
        title: '[진행 중] 일일 개발 요약 AI 프롬프트 엔진 및 템플릿 개발',
        description: 'Rule-based 및 Gemini Dual Engine 모듈 통합 작업',
        timestamp: `${dateStr}T14:15:00Z`,
        issueKey: 'PROJ-102',
        statusTo: 'in_progress',
      },
      {
        id: 'evt-demo-3',
        userId: userId || 'user-1',
        userName: 'Current User',
        eventType: 'blocker_flagged',
        title: '[주의] 외부 API 호출 쿼터 제한 및 네트워크 레이턴시 점검',
        description: 'API 처리 시간 500ms 이상 지연 발생 가능성 검토 필요',
        timestamp: `${dateStr}T16:45:00Z`,
        issueKey: 'PROJ-103',
      }
    );
  }

  return events;
}

/**
 * Generate a Rule-based Daily Summary (Offline / Template Engine Mode).
 */
export function generateRuleBasedSummary(dateStr: string, events: DailyEvent[], issues: Issue[], userId: string = 'user-1'): DailySummary {
  const doneToday: SummaryItem[] = [];
  const planTomorrow: SummaryItem[] = [];
  const blockers: SummaryItem[] = [];

  // Group events into 3 sections
  events.forEach((evt) => {
    if (evt.statusTo === 'done') {
      doneToday.push({
        id: `done-${evt.id}`,
        issueKey: evt.issueKey,
        title: evt.title.replace(/^\[완료\]\s*/, ''),
        detail: evt.description,
        status: 'done',
      });
    } else if (evt.eventType === 'blocker_flagged' || evt.title.includes('[주의')) {
      blockers.push({
        id: `block-${evt.id}`,
        issueKey: evt.issueKey,
        title: evt.title.replace(/^\[주의\/블로커\]\s*/, '').replace(/^\[주의\]\s*/, ''),
        detail: evt.description,
        status: 'blocked',
        priority: 'high',
      });
    } else {
      planTomorrow.push({
        id: `plan-${evt.id}`,
        issueKey: evt.issueKey,
        title: evt.title.replace(/^\[진행 중\]\s*/, ''),
        detail: evt.description,
        status: 'in_progress',
      });
    }
  });

  // Additional in-progress issues for tomorrow's plan if available
  issues
    .filter((i) => i.status === 'in_progress' || i.status === 'todo')
    .slice(0, 3)
    .forEach((issue) => {
      if (!planTomorrow.some((item) => item.issueKey === issue.key)) {
        planTomorrow.push({
          id: `plan-extra-${issue.id}`,
          issueKey: issue.key,
          title: issue.summary,
          detail: `상태: ${issue.status} (우선순위: ${issue.priority})`,
          status: issue.status,
          priority: issue.priority,
        });
      }
    });

  return {
    id: `summary-${dateStr}`,
    userId,
    summaryDate: dateStr,
    doneToday: doneToday.length > 0 ? doneToday : [{ id: 'd1', title: '당일 완료된 주요 태스크 및 코드 리뷰 진행' }],
    planTomorrow: planTomorrow.length > 0 ? planTomorrow : [{ id: 'p1', title: '잔여 백로그 작업 및 단위 테스트 작성' }],
    blockers: blockers.length > 0 ? blockers : [{ id: 'b1', title: '특이 사항 없음 (정상 진행 중)' }],
    aiInsights: '💡 [Rule Engine] 템플릿 엔진이 이벤트를 카테고리별로 자동 분류하였습니다. AI 키 설정 시 자연어 분석 인사이트가 추가됩니다.',
    engineUsed: 'TEMPLATE',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate AI-based Daily Summary using Gemini API with Fallback to Rule-based summary.
 */
export async function generateAISummary(
  dateStr: string,
  events: DailyEvent[],
  issues: Issue[],
  userId: string = 'user-1'
): Promise<DailySummary> {
  const fallbackSummary = generateRuleBasedSummary(dateStr, events, issues, userId);

  if (!isGeminiConfigured) {
    return fallbackSummary;
  }

  try {
    const prompt = `
당신은 애자일 프로젝트 매니저 및 수석 개발자 AI입니다.
아래 수집된 일일 개발자 이벤트 데이터를 바탕으로 JSON 포맷으로 "오늘의 개발 요약"을 정리해주세요.

[일일 이벤트 데이터]
${JSON.stringify(events, null, 2)}

[요청 사항]
다음 구조의 정교한 JSON 응답만 반환하세요 (Markdown backticks 제외):
{
  "doneToday": [{"title": "오늘 완료한 핵심 업무 내용", "issueKey": "PROJ-101", "detail": "세부사항"}],
  "planTomorrow": [{"title": "내일 진행할 업무 및 목표", "issueKey": "PROJ-102", "detail": "세부사항"}],
  "blockers": [{"title": "주의사항 또는 블로커 요소", "issueKey": "PROJ-103", "detail": "세부사항 및 대응방안"}],
  "aiInsights": "오늘의 전체적인 생산성 분석 및 내일 업무를 위한 제언 (2~3문장)"
}
`;

    const systemInstruction = 'You output clean raw JSON only without markdown syntax.';
    const responseText = await callGemini(prompt, systemInstruction);

    // Clean JSON response if wrapped in codeblocks
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      id: `summary-${dateStr}`,
      userId,
      summaryDate: dateStr,
      doneToday: Array.isArray(parsed.doneToday) && parsed.doneToday.length > 0 ? parsed.doneToday : fallbackSummary.doneToday,
      planTomorrow: Array.isArray(parsed.planTomorrow) && parsed.planTomorrow.length > 0 ? parsed.planTomorrow : fallbackSummary.planTomorrow,
      blockers: Array.isArray(parsed.blockers) && parsed.blockers.length > 0 ? parsed.blockers : fallbackSummary.blockers,
      aiInsights: parsed.aiInsights || '✨ 오늘 높은 생산성을 유지하며 핵심 기능이 정상 개발되었습니다.',
      engineUsed: 'AI',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Gemini AI Summary call failed, falling back to Rule Engine:', error);
    return {
      ...fallbackSummary,
      aiInsights: '⚠️ AI 엔진 호출 중 오류가 발생하여 템플릿 규칙 엔진 모드로 자동 전환되었습니다.',
    };
  }
}

/**
 * Storage helpers
 */
export function getSavedDailySummary(dateStr: string): DailySummary | null {
  try {
    const raw = localStorage.getItem(`${SUMMARY_STORAGE_KEY_PREFIX}${dateStr}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDailySummary(summary: DailySummary): void {
  try {
    localStorage.setItem(`${SUMMARY_STORAGE_KEY_PREFIX}${summary.summaryDate}`, JSON.stringify(summary));
  } catch (e) {
    console.error('Failed to save daily summary to localStorage', e);
  }
}

/**
 * Export summary text format builder (Slack, Notion, Markdown, Text)
 */
export function formatExportText(summary: DailySummary, format: ExportFormat): string {
  const date = summary.summaryDate;

  if (format === 'slack') {
    return `*📅 [일일 개발 요약] ${date}*\n\n` +
      `*✅ [오늘 한 일]*\n` +
      summary.doneToday.map((item) => `• ${item.issueKey ? `\`${item.issueKey}\` ` : ''}${item.title}${item.detail ? ` _(${item.detail})_` : ''}`).join('\n') +
      `\n\n*🚀 [내일 할 일]*\n` +
      summary.planTomorrow.map((item) => `• ${item.issueKey ? `\`${item.issueKey}\` ` : ''}${item.title}`).join('\n') +
      `\n\n*🚨 [주의 사항 & 블로커]*\n` +
      summary.blockers.map((item) => `• ${item.title}`).join('\n') +
      (summary.aiInsights ? `\n\n💡 *AI 인사이트*: ${summary.aiInsights}` : '');
  }

  if (format === 'notion' || format === 'markdown') {
    return `# 📅 오늘의 개발 요약 (${date})\n\n` +
      `> **생성 엔진**: ${summary.engineUsed === 'AI' ? '🤖 Gemini AI Engine' : '⚙️ Template Rule Engine'}\n\n` +
      `## ✅ 오늘 한 일 (Done Today)\n` +
      summary.doneToday.map((item) => `- ${item.issueKey ? `**[${item.issueKey}]** ` : ''}${item.title}${item.detail ? `\n  - *${item.detail}*` : ''}`).join('\n') +
      `\n\n## 🚀 내일 할 일 (Plan for Tomorrow)\n` +
      summary.planTomorrow.map((item) => `- ${item.issueKey ? `**[${item.issueKey}]** ` : ''}${item.title}`).join('\n') +
      `\n\n## 🚨 주의 사항 및 이슈 (Risks & Blockers)\n` +
      summary.blockers.map((item) => `- ${item.title}`).join('\n') +
      (summary.aiInsights ? `\n\n--- \n### 💡 AI 총평 & 제언\n${summary.aiInsights}` : '');
  }

  // Plain Text
  return `[오늘의 개발 요약 - ${date}]\n\n` +
    `1. 오늘 한 일:\n` +
    summary.doneToday.map((i, idx) => `  ${idx + 1}. ${i.title}`).join('\n') +
    `\n\n2. 내일 할 일:\n` +
    summary.planTomorrow.map((i, idx) => `  ${idx + 1}. ${i.title}`).join('\n') +
    `\n\n3. 주의 사항:\n` +
    summary.blockers.map((i, idx) => `  ${idx + 1}. ${i.title}`).join('\n');
}
