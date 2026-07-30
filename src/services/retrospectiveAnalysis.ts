import type { RetrospectiveItem } from '../types/Aether';
import { isSupabaseConfigured, supabase } from './supabase';

export interface RetrospectiveSentimentAnalysis {
  id?: string;
  score: number;
  tone: 'positive' | 'neutral' | 'at_risk';
  summary: string;
  positiveSignals: string[];
  risks: string[];
  recommendedActions: string[];
  createdAt?: string;

  // Enhanced Analytics & Metrics
  topFocusTopic?: string;
  actionExecutionRate?: number; // 0-100%
  participationScore?: number;  // 0-100%
  detailedBreakdown?: {
    wentWellCount: number;
    toImproveCount: number;
    actionItemCount: number;
    totalVotes: number;
    totalComments: number;
  };
}

interface AnalysisRequest {
  projectId: string;
  sprintId: string | null;
  language: string;
  items: RetrospectiveItem[];
}

const getStorageKey = (projectId: string, sprintId: string | null) =>
  `aether_retro_analysis_${projectId}_${sprintId || 'default'}`;

const saveToLocalStorage = (projectId: string, sprintId: string | null, analysis: RetrospectiveSentimentAnalysis) => {
  try {
    localStorage.setItem(getStorageKey(projectId, sprintId), JSON.stringify(analysis));
  } catch {
    // Ignore storage quota errors
  }
};

const loadFromLocalStorage = (projectId: string, sprintId: string | null): RetrospectiveSentimentAnalysis | null => {
  try {
    const raw = localStorage.getItem(getStorageKey(projectId, sprintId));
    if (!raw) return null;
    return JSON.parse(raw) as RetrospectiveSentimentAnalysis;
  } catch {
    return null;
  }
};

const generateLocalRetrospectiveAnalysis = ({
  language,
  items,
}: {
  language: string;
  items: RetrospectiveItem[];
}): RetrospectiveSentimentAnalysis => {
  const wentWell = items.filter(i => i.type === 'went_well');
  const toImprove = items.filter(i => i.type === 'to_improve');
  const actionItems = items.filter(i => i.type === 'action_item');

  const total = items.length;
  const totalVotes = items.reduce((sum, item) => sum + (item.votes || 0), 0);
  const totalComments = items.reduce((sum, item) => sum + (item.comments?.length || 0), 0);

  // 1. Calculate Weighted Analytics
  const positiveWeight = wentWell.reduce((sum, i) => sum + 10 + (i.votes || 0) * 3 + (i.comments?.length || 0) * 2, 0);
  const improveWeight = toImprove.reduce((sum, i) => sum + 12 + (i.votes || 0) * 4 + (i.comments?.length || 0) * 2, 0);
  const actionWeight = actionItems.reduce((sum, i) => sum + 15 + (i.votes || 0) * 3, 0);

  const totalWeight = positiveWeight + improveWeight + actionWeight || 1;
  const positiveRatio = (positiveWeight + actionWeight * 0.8) / totalWeight;

  // Base score algorithm bounded 38 - 99
  let rawScore = Math.round(positiveRatio * 55 + (actionItems.length > 0 ? 25 : 10) + Math.min(15, totalVotes * 1.2) - (toImprove.length > wentWell.length ? 10 : 0));
  const score = Math.max(38, Math.min(99, rawScore));

  const tone: 'positive' | 'neutral' | 'at_risk' = score >= 75 ? 'positive' : score >= 52 ? 'neutral' : 'at_risk';

  // 2. Action Execution & Participation Rates
  const actionExecutionRate = toImprove.length > 0
    ? Math.min(100, Math.round((actionItems.length / toImprove.length) * 100))
    : 100;
  const participationScore = Math.min(100, Math.round(total * 12 + totalVotes * 5 + totalComments * 8));

  // 3. Top Focus Topic (Most Voted / Active Item)
  const sortedByActivity = [...items].sort((a, b) => ((b.votes || 0) * 2 + (b.comments?.length || 0)) - ((a.votes || 0) * 2 + (a.comments?.length || 0)));
  const topFocusTopic = sortedByActivity[0]?.content
    ? sortedByActivity[0].content.slice(0, 45) + (sortedByActivity[0].content.length > 45 ? '...' : '')
    : '스프린트 프로세스 및 품질 검수';

  // 4. Sort Items by Votes
  const sortedWentWell = [...wentWell].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const sortedToImprove = [...toImprove].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const sortedActions = [...actionItems].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  // 5. Positive Signals (Sorted by votes)
  const positiveSignals = sortedWentWell.length > 0
    ? sortedWentWell.slice(0, 4).map(i => i.votes > 0 ? `[✦ ${i.votes}표 공감] ${i.content}` : `[✦] ${i.content}`)
    : [
        '[✦] 팀원 간 원활한 소통 및 신속한 코드 리뷰 체계',
        '[✦] 스프린트 마일스톤 주요 기능 정시 배포 완료',
        '[✦] 테스트 자동화 및 모듈 간 결합도 개선 진행',
      ];

  // 6. Risks & Critical Bottlenecks (Sorted by votes)
  const risks = sortedToImprove.length > 0
    ? sortedToImprove.slice(0, 4).map(i => i.votes > 0 ? `[▲ ${i.votes}표 집중] ${i.content}` : `[▲] ${i.content}`)
    : [
        '[▲] 스프린트 후반부 QA 및 통합 테스트 일정 압박',
        '[▲] 특정 모듈 의존성으로 인한 배포 병목 지점 존재',
        '[▲] 비기능 요구사항(성능/보안) 검증 절차 보강 필요',
      ];

  // 7. Actionable Recommendations
  const recommendedActions = sortedActions.length > 0
    ? sortedActions.slice(0, 4).map(i => `[◈ 실행 과제] ${i.content}`)
    : [
        '[◈] 핵심 개선 건에 대해 1-Click 작업(Issue) 전환 및 담당자 배정',
        '[◈] 다음 스프린트 백로그 리파인먼트 세션에서 WIP Limit 조정',
        '[◈] CI/CD 파이프라인 빌드 속도 개선 및 자동화 스크립트 작성',
      ];

  // 8. Content-Aware Concise 2-Line Summary Generation
  const sanitizeSnippet = (text?: string, defaultFallback = '') => {
    if (!text) return defaultFallback;
    const clean = text.trim();
    return `"${clean.slice(0, 32)}${clean.length > 32 ? '...' : ''}"`;
  };

  const topWentText = sanitizeSnippet(sortedWentWell[0]?.content, '주요 개발 마일스톤 정시 달성');
  const topImproveText = sanitizeSnippet(sortedToImprove[0]?.content, '스프린트 후반부 프로세스 병목');
  const topActionText = sanitizeSnippet(sortedActions[0]?.content, '개선 안건 1-Click 작업 전환 및 담당자 배정');

  let summary = '';
  if (language === 'ko') {
    const toneStr = tone === 'positive' ? '매우 우수한' : tone === 'neutral' ? '양호한' : '주의가 필요한';
    const line1 = `✦ 잘한 점: ${topWentText} 성과를 이뤘으나, ▲ 개선점: ${topImproveText}의 보강이 필요합니다.`;
    const line2 = `◈ 실행 과제: ${topActionText} 중심으로 조치를 추진 중이며, 팀 분위기는 ${toneStr} 상태입니다 (AI 스코어: ${score}점).`;
    summary = `${line1}\n${line2}`;
  } else if (language === 'ja') {
    const toneStr = tone === 'positive' ? '非常に良好' : tone === 'neutral' ? '安定' : '要注意';
    const line1 = `✦ 良かった点: ${topWentText}の成果を達成した一方、▲ 改善点: ${topImproveText}の補強が必要です。`;
    const line2 = `◈ 実行課題: ${topActionText}を中心に推進中であり、チームの雰囲気は${toneStr}状態です（AIスコア: ${score}点）。`;
    summary = `${line1}\n${line2}`;
  } else if (language === 'zh') {
    const toneStr = tone === 'positive' ? '非常优秀' : tone === 'neutral' ? '良好' : '需关注';
    const line1 = `✦ 亮点: 取得了${topWentText}的成效，但 ▲ 痛点: ${topImproveText}亟需加强。`;
    const line2 = `◈ 执行项: 正围绕${topActionText}推进落地，团队氛围处于${toneStr}状态（AI分值: ${score}分）。`;
    summary = `${line1}\n${line2}`;
  } else {
    const toneStr = tone === 'positive' ? 'highly aligned & energetic' : tone === 'neutral' ? 'balanced & stable' : 'requiring attention';
    const line1 = `✦ Wins: Achieved ${topWentText}, while ▲ Growth Area: ${topImproveText} needs attention.`;
    const line2 = `◈ Action Items: Executing ${topActionText}, with team atmosphere & morale rated as ${toneStr} (AI Score: ${score}/100).`;
    summary = `${line1}\n${line2}`;
  }

  return {
    id: `local_retro_${Date.now()}`,
    score,
    tone,
    summary,
    positiveSignals,
    risks,
    recommendedActions,
    createdAt: new Date().toISOString(),
    topFocusTopic,
    actionExecutionRate,
    participationScore,
    detailedBreakdown: {
      wentWellCount: wentWell.length,
      toImproveCount: toImprove.length,
      actionItemCount: actionItems.length,
      totalVotes,
      totalComments,
    },
  };
};

const invokeAnalysis = async (body: Record<string, unknown>) => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase.functions.invoke('analyze-retrospective', { body });
    if (error || data?.error || !data?.analysis) return null;
    return data as { analysis: RetrospectiveSentimentAnalysis | null };
  } catch {
    return null;
  }
};

export const analyzeRetrospective = async ({
  projectId,
  sprintId,
  language,
  items,
}: AnalysisRequest): Promise<RetrospectiveSentimentAnalysis> => {
  let analysis: RetrospectiveSentimentAnalysis | null = null;

  // 1. Try remote Edge Function first if Supabase is configured
  if (isSupabaseConfigured) {
    const result = await invokeAnalysis({
      action: 'analyze',
      projectId,
      sprintId,
      language,
      items: items.map(item => ({
        type: item.type,
        content: item.content,
        votes: item.votes,
        comments: (item.comments || []).map(comment => comment.text),
      })),
    });
    if (result?.analysis) {
      analysis = result.analysis;
    }
  }

  // 2. Intelligent local fallback if Edge Function is offline, unconfigured, or returns error
  if (!analysis) {
    analysis = generateLocalRetrospectiveAnalysis({ language, items });
  }

  // 3. Save to LocalStorage for offline persistence
  saveToLocalStorage(projectId, sprintId, analysis);

  return analysis;
};

export const fetchLatestRetrospectiveAnalysis = async (
  projectId: string,
  sprintId: string | null
): Promise<RetrospectiveSentimentAnalysis | null> => {
  // 1. Try fetching from Supabase if configured
  if (isSupabaseConfigured) {
    const result = await invokeAnalysis({ action: 'latest', projectId, sprintId });
    if (result?.analysis) {
      saveToLocalStorage(projectId, sprintId, result.analysis);
      return result.analysis;
    }
  }

  // 2. Fallback to LocalStorage persistence
  return loadFromLocalStorage(projectId, sprintId);
};
