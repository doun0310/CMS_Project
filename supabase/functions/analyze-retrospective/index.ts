import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type RetrospectiveInput = {
  type: 'went_well' | 'to_improve' | 'action_item';
  content: string;
  votes: number;
  comments: string[];
};

type Analysis = {
  id?: string;
  score: number;
  tone: 'positive' | 'neutral' | 'at_risk';
  summary: string;
  positiveSignals: string[];
  risks: string[];
  recommendedActions: string[];
  createdAt?: string;
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

const limitText = (value: unknown, limit: number) =>
  typeof value === 'string' ? value.trim().slice(0, limit) : '';

const normalizeList = (value: unknown) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string').map(item => item.slice(0, 180)).slice(0, 4)
  : [];

const parseAnalysis = (output: string): Analysis => {
  const normalized = output.replace(/^```json\s*|\s*```$/g, '').trim();
  const parsed = JSON.parse(normalized) as Record<string, unknown>;
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
  const tone = parsed.tone === 'positive' || parsed.tone === 'neutral' || parsed.tone === 'at_risk'
    ? parsed.tone
    : score >= 65 ? 'positive' : score >= 40 ? 'neutral' : 'at_risk';

  return {
    score,
    tone,
    summary: limitText(parsed.summary, 360) || '분석 결과를 요약하지 못했습니다.',
    positiveSignals: normalizeList(parsed.positiveSignals),
    risks: normalizeList(parsed.risks),
    recommendedActions: normalizeList(parsed.recommendedActions),
  };
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  const authorization = request.headers.get('Authorization');

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !openaiApiKey || !authorization) {
    return json({ error: 'AI 분석 서비스가 아직 구성되지 않았습니다.' }, 503);
  }

  const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return json({ error: 'AI 분석을 실행하려면 Supabase 로그인이 필요합니다.' }, 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const projectId = limitText(body.projectId, 120);
  const sprintId = typeof body.sprintId === 'string' ? limitText(body.sprintId, 120) : null;
  if (!projectId) return json({ error: '프로젝트 정보가 필요합니다.' }, 400);

  const db = createClient(supabaseUrl, serviceRoleKey);
  if (body.action === 'latest') {
    let query = db.from('retrospective_sentiment_reports')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (sprintId) query = query.eq('sprint_id', sprintId);
    const { data, error } = await query.maybeSingle();
    if (error) return json({ error: '저장된 분석 결과를 불러오지 못했습니다.' }, 500);
    if (!data) return json({ analysis: null });
    return json({ analysis: {
      id: data.id, score: data.score, tone: data.tone, summary: data.summary,
      positiveSignals: data.positive_signals || [], risks: data.risks || [],
      recommendedActions: data.recommended_actions || [], createdAt: data.created_at,
    } });
  }

  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 40) : [];
  const items: RetrospectiveInput[] = rawItems.map((item): RetrospectiveInput => {
    const source = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return {
      type: source.type === 'went_well' || source.type === 'to_improve' || source.type === 'action_item' ? source.type : 'action_item',
      content: limitText(source.content, 600),
      votes: Math.max(0, Math.min(999, Number(source.votes) || 0)),
      comments: Array.isArray(source.comments) ? source.comments.map(comment => limitText(comment, 400)).filter(Boolean).slice(0, 10) : [],
    };
  }).filter(item => item.content);
  if (!items.length) return json({ error: '분석할 회고 항목 또는 댓글이 없습니다.' }, 400);

  const language = limitText(body.language, 10) || 'ko';
  const prompt = `You are a team retrospective analyst. Analyze only the supplied retrospective text. Do not infer protected traits, diagnose individuals, or identify people. Respond in ${language}. Return JSON only, with exactly: score (integer 0-100), tone (positive|neutral|at_risk), summary (max 2 sentences), positiveSignals (max 4 short strings), risks (max 4 short strings), recommendedActions (max 4 concrete short strings).\n\nRetrospective data:\n${JSON.stringify(items)}`;

  const aiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_MODEL') || 'gpt-5.6-luna',
      store: false,
      input: prompt,
    }),
  });
  if (!aiResponse.ok) return json({ error: 'AI 모델 분석 요청에 실패했습니다.' }, 502);

  try {
    const response = await aiResponse.json();
    const analysis = parseAnalysis(String(response.output_text || ''));
    const { data, error } = await db.from('retrospective_sentiment_reports').insert({
      project_id: projectId, sprint_id: sprintId, user_id: user.id,
      score: analysis.score, tone: analysis.tone, summary: analysis.summary,
      positive_signals: analysis.positiveSignals, risks: analysis.risks,
      recommended_actions: analysis.recommendedActions,
    }).select().single();
    if (error) return json({ error: '분석 결과를 저장하지 못했습니다.' }, 500);
    return json({ analysis: { ...analysis, id: data.id, createdAt: data.created_at } });
  } catch {
    return json({ error: 'AI 분석 결과 형식이 올바르지 않습니다.' }, 502);
  }
});
