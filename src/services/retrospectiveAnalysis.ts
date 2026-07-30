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
}

interface AnalysisRequest {
  projectId: string;
  sprintId: string | null;
  language: string;
  items: RetrospectiveItem[];
}

const invokeAnalysis = async (body: Record<string, unknown>) => {
  if (!isSupabaseConfigured) {
    throw new Error('AI 분석을 사용하려면 Supabase 연결이 필요합니다.');
  }

  const { data, error } = await supabase.functions.invoke('analyze-retrospective', { body });
  if (error) throw new Error(error.message || 'AI 분석 요청에 실패했습니다.');
  if (data?.error) throw new Error(data.error);
  return data as { analysis: RetrospectiveSentimentAnalysis | null };
};

export const analyzeRetrospective = async ({ projectId, sprintId, language, items }: AnalysisRequest) => {
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

  if (!result.analysis) throw new Error('AI 분석 결과를 받지 못했습니다.');
  return result.analysis;
};

export const fetchLatestRetrospectiveAnalysis = async (projectId: string, sprintId: string | null) => {
  const result = await invokeAnalysis({ action: 'latest', projectId, sprintId });
  return result.analysis;
};
