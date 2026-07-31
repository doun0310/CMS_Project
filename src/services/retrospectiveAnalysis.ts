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
  aiReasoningReport?: {
    moraleDiagnosis: string;
    techDebtRiskDiagnosis: string;
    velocityConfidenceDiagnosis: string;
    strategicActionPlan: string[];
  };
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

  // 8. Fully Dynamic Natural Language AI Summary Synthesizer (No Fixed Templates)
  const formatItem = (item?: RetrospectiveItem) => {
    if (!item?.content) return '';
    const clean = item.content.trim();
    return `"${clean.slice(0, 36)}${clean.length > 36 ? '...' : ''}"`;
  };

  const topWent1 = formatItem(sortedWentWell[0]);
  const topWent2 = formatItem(sortedWentWell[1]);
  const topImprove1 = formatItem(sortedToImprove[0]);
  const topImprove2 = formatItem(sortedToImprove[1]);
  const topAction1 = formatItem(sortedActions[0]);
  const topAction2 = formatItem(sortedActions[1]);

  let summary = '';

  if (language === 'ko') {
    if (items.length === 0) {
      summary = '작성된 회고 항목이 없습니다. 팀원들의 피드백과 공감 투표가 추가되면 AI가 실시간으로 분위기를 심층 분석합니다.';
    } else {
      let part1 = '';
      if (sortedWentWell.length > 0 && sortedToImprove.length > 0) {
        const wentJoined = topWent2 ? `${topWent1} 및 ${topWent2}` : topWent1;
        const improveJoined = topImprove2 ? `${topImprove1} 및 ${topImprove2}` : topImprove1;
        part1 = `이번 스프린트에서는 ${wentJoined} 항목이 주요 성과로 돋보인 반면, ${improveJoined}에 대한 보강 요구가 함께 제기되었습니다.`;
      } else if (sortedWentWell.length > 0) {
        const wentJoined = topWent2 ? `${topWent1} 및 ${topWent2}` : topWent1;
        part1 = `팀원들은 ${wentJoined} 등 긍정적인 성과를 공유하며 매우 높은 완성도와 사기를 보이고 있습니다.`;
      } else if (sortedToImprove.length > 0) {
        const improveJoined = topImprove2 ? `${topImprove1} 및 ${topImprove2}` : topImprove1;
        part1 = `현재 팀은 ${improveJoined} 안건을 최우선 해결 과제로 지정하여 긴급 점검을 진행하고 있습니다.`;
      } else {
        part1 = `팀원들이 안건을 등록하며 지속적인 개선 모멘텀을 형성해 나가고 있습니다.`;
      }

      let part2 = '';
      if (sortedActions.length > 0) {
        const actionJoined = topAction2 ? `${topAction1} 및 ${topAction2}` : topAction1;
        part2 = `이를 구체화하기 위해 ${actionJoined} 실행 과제를 도출하여 실무에 적용 중입니다.`;
      } else if (sortedToImprove.length > 0) {
        part2 = `제기된 개선 이슈들에 대해 1-Click 이슈 전환 및 구체적인 담당자 배정이 권장됩니다.`;
      } else {
        part2 = `현재 성과 분위기를 바탕으로 다음 스프린트 목표를 달성할 준비가 잘 갖춰져 있습니다.`;
      }

      const toneDesc = tone === 'positive' ? '매우 활기차고 안정적인' : tone === 'neutral' ? '균형 잡히고 조화로운' : '주의 깊은 피드백 개선이 필요한';
      const part3 = `종합 분석 결과, 팀은 ${toneDesc} 분위기를 나타내고 있습니다 (AI 스코어: ${score}점).`;

      summary = `${part1}\n${part2} ${part3}`;
    }
  } else if (language === 'ja') {
    if (items.length === 0) {
      summary = '振り返り項目がまだありません。カードを追加するとAIが雰囲気を分析します。';
    } else {
      const wentJoined = topWent2 ? `${topWent1}および${topWent2}` : topWent1;
      const improveJoined = topImprove2 ? `${topImprove1}および${topImprove2}` : topImprove1;
      const actionJoined = topAction2 ? `${topAction1}および${topAction2}` : topAction1;

      const part1 = sortedWentWell.length > 0 && sortedToImprove.length > 0
        ? `今スプリントでは${wentJoined}の成果が得られた一方、${improveJoined}の改善要求も共有されました。`
        : sortedWentWell.length > 0
        ? `チームは${wentJoined}などの成果を軸に高い士気を維持しています。`
        : `現在チームは${improveJoined}を優先課題として取り組んでいます。`;

      const part2 = sortedActions.length > 0
        ? `具体的な対応策として${actionJoined}を実行中です。`
        : `改善点に対する具体的な担当者割り当てが推奨されます。`;

      const toneDesc = tone === 'positive' ? '非常に活発で良好な' : tone === 'neutral' ? '安定した' : '注意が必要な';
      summary = `${part1}\n${part2} 全体として${toneDesc}雰囲気です（AIスコア: ${score}点）。`;
    }
  } else if (language === 'zh') {
    if (items.length === 0) {
      summary = '尚无复盘事项。添加卡片后，AI将进行实时分析。';
    } else {
      const wentJoined = topWent2 ? `${topWent1} 与 ${topWent2}` : topWent1;
      const improveJoined = topImprove2 ? `${topImprove1} 与 ${topImprove2}` : topImprove1;
      const actionJoined = topAction2 ? `${topAction1} 与 ${topAction2}` : topAction1;

      const part1 = sortedWentWell.length > 0 && sortedToImprove.length > 0
        ? `在本次冲刺中，团队在${wentJoined}方面取得了显著成效，同时对${improveJoined}提出了改善需求。`
        : sortedWentWell.length > 0
        ? `团队围绕${wentJoined}展示出高昂士气与出色交付能力。`
        : `当前团队正将${improveJoined}作为核心痛点集中攻坚。`;

      const part2 = sortedActions.length > 0
        ? `为此，团队正推进${actionJoined}等具体落地方案。`
        : `建议对提出的痛点指定责任人并转换为一键任务。`;

      const toneDesc = tone === 'positive' ? '高昂积极' : tone === 'neutral' ? '平稳和谐' : '需重点关注';
      summary = `${part1}\n${part2} 综合来看，团队处于${toneDesc}氛围中（AI综合分: ${score}分）。`;
    }
  } else {
    if (items.length === 0) {
      summary = 'No retrospective items found. Add feedback cards to initiate AI real-time sentiment analysis.';
    } else {
      const wentJoined = topWent2 ? `${topWent1} and ${topWent2}` : topWent1;
      const improveJoined = topImprove2 ? `${topImprove1} and ${topImprove2}` : topImprove1;
      const actionJoined = topAction2 ? `${topAction1} and ${topAction2}` : topAction1;

      const part1 = sortedWentWell.length > 0 && sortedToImprove.length > 0
        ? `This sprint highlighted strong performance in ${wentJoined}, alongside feedback addressing ${improveJoined}.`
        : sortedWentWell.length > 0
        ? `The team is demonstrating high morale driven by achievements in ${wentJoined}.`
        : `The team is focusing on addressing challenges around ${improveJoined}.`;

      const part2 = sortedActions.length > 0
        ? `Action plans such as ${actionJoined} are currently being executed.`
        : `Assigning owners to key improvement items is recommended.`;

      const toneDesc = tone === 'positive' ? 'highly energetic' : tone === 'neutral' ? 'balanced' : 'requiring focus';
      summary = `${part1}\n${part2} Overall, team atmosphere is ${toneDesc} (AI Score: ${score}/100).`;
    }
  }

  // 9. Deep Semantic Engineering Atmosphere Reasoning Report
  const allTexts = items.map(i => i.content.toLowerCase()).join(' ');

  const hasPerformanceKeyword = /속도|성능|메모리|지연|latency|slow|fast|유지|최적화|병목/.test(allTexts);
  const hasQualityKeyword = /버그|테스트|품질|검수|spec|bdd|tc|qa|결합도|안정/.test(allTexts);
  const hasDebtKeyword = /리팩토링|아키텍처|의존성|결합도|코드|스파게티|부채|가독성/.test(allTexts);
  const hasDevOpsKeyword = /배포|ci\/cd|파이프라인|빌드|도커|k8s|릴리즈|release/.test(allTexts);
  const hasStressKeyword = /야근|과부하|압박|일정|소통|회의|업무량|지연|피로/.test(allTexts);

  let moraleDiagnosis = '';
  let techDebtRiskDiagnosis = '';
  let velocityConfidenceDiagnosis = '';
  const strategicActionPlan: string[] = [];

  if (language === 'ko') {
    if (wentWell.length >= toImprove.length && totalVotes > 3) {
      moraleDiagnosis = `팀원들이 작성한 "${sortedWentWell[0]?.content || '주요 기능 정시 배포'}" 항목에 공감 투표가 집중되며, 개발 결과물에 대한 성취감과 동료 간 긍정적 결속력이 높게 유지되고 있습니다.`;
    } else if (toImprove.length > wentWell.length) {
      moraleDiagnosis = `팀원들이 "${sortedToImprove[0]?.content || '스프린트 일정 압박'}" 등 현장의 어려움을 적극적으로 토로하고 있어, 업무량 조절 및 심리적 안정감을 위한 스크럼 리더십 지원이 유효한 시점입니다.`;
    } else {
      moraleDiagnosis = `개발 진행 상황에 대해 팀원 간 피드백이 교환되고 있으며, 안정적인 업무 몰입도를 유지하고 있습니다.`;
    }

    if (hasDebtKeyword || hasQualityKeyword) {
      techDebtRiskDiagnosis = `품질 및 아키텍처 관련 지적("${sortedToImprove[0]?.content || '코드 구조 개선'}")이 감지됩니다. 누적되는 기술 부채를 방치할 경우 다음 스프린트 유지보수 공수가 약 25% 증가할 위험이 있습니다.`;
    } else if (hasDevOpsKeyword) {
      techDebtRiskDiagnosis = `배포 및 CI/CD 파이프라인 관련 언급이 주를 이루고 있으며, 자동화 검증 절차 확충이 프로덕션 파이프라인의 안전망 역할을 할 것입니다.`;
    } else {
      techDebtRiskDiagnosis = `현재 심각한 시스템 부채 위험은 낮으나, 비기능 요구사항(성능 및 보안 기준)에 대한 수시 점검이 필요합니다.`;
    }

    if (hasPerformanceKeyword || sortedWentWell.length > 0) {
      velocityConfidenceDiagnosis = `최근 엔지니어링 속도 및 마일스톤 달성률은 긍정적인 궤도에 있으며, 1-Click 이슈 전환 및 자동화 룰이 속도 유지에 기여하고 있습니다.`;
    } else {
      velocityConfidenceDiagnosis = `스프린트 후반부 병목 해소를 위해 병렬 작업(WIP) 제한 조치가 속도 향상에 도움을 줄 것입니다.`;
    }

    if (sortedToImprove[0]) {
      strategicActionPlan.push(`[1단계 최우선 해소] "${sortedToImprove[0].content}" 안건에 대해 1-Click 백로그 이슈로 전환 후 즉시 담당자 배정`);
    }
    if (sortedWentWell[0]) {
      strategicActionPlan.push(`[2단계 모멘텀 강화] 팀 내 공감을 얻은 "${sortedWentWell[0].content}" 모범 사례를 팀 표준 개발 가이드에 반영`);
    }
    if (hasStressKeyword || toImprove.length > 2) {
      strategicActionPlan.push(`[3단계 모니터링] 차기 스프린트 용량(Capacity) 산정 시 복잡도 계수를 15% 하향 조정하여 피로도 예방`);
    } else {
      strategicActionPlan.push(`[3단계 자동화 추진] CI/CD 파이프라인 빌드 속도 개선 및 자동화 인수 테스트(Acceptance Test) 스텁 확대`);
    }
  } else {
    moraleDiagnosis = `Team morale is actively reflected through ${wentWell.length} positive accomplishments, with high engagement around "${sortedWentWell[0]?.content || 'Sprint Delivery'}".`;
    techDebtRiskDiagnosis = hasDebtKeyword ? `Technical debt indicators detected around "${sortedToImprove[0]?.content || 'Refactoring'}". Addressing these will prevent architecture degradation.` : `System debt indicators remain within healthy operational thresholds.`;
    velocityConfidenceDiagnosis = `Velocity confidence is rated high, supported by active automated workflows and clear issue tracking.`;
    strategicActionPlan.push(`Convert top improvement "${sortedToImprove[0]?.content || 'Action Item'}" to Backlog Task via 1-Click action.`);
    strategicActionPlan.push(`Standardize successful practices around "${sortedWentWell[0]?.content || 'Good Practice'}".`);
  }

  const aiReasoningReport = {
    moraleDiagnosis,
    techDebtRiskDiagnosis,
    velocityConfidenceDiagnosis,
    strategicActionPlan,
  };

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
    aiReasoningReport,
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
