import { supabase, isSupabaseConfigured } from './supabase';
import type { ProjectBudget, MemberHourlyRate, ProjectExpense } from '../types/Aether';

const LOCAL_STORAGE_BUDGET_KEY = 'aether_project_budget';
const LOCAL_STORAGE_RATES_KEY = 'aether_member_rates';
const LOCAL_STORAGE_EXPENSES_KEY = 'aether_project_expenses';

function generateId(): string {
  return 'bgt-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

// Default initial mock budget data for rich demonstration
export const DEFAULT_MOCK_BUDGET: ProjectBudget = {
  id: 'bgt-default-1',
  projectId: 'proj-1',
  totalBudget: 150000000, // 1억 5,000만원
  currency: 'KRW',
  startDate: '2026-06-01',
  endDate: '2026-12-31',
  alertThresholdPercent: 10
};

export const DEFAULT_MOCK_RATES: MemberHourlyRate[] = [
  { id: 'rate-1', projectId: 'proj-1', userId: 'u1', hourlyRate: 65000, currency: 'KRW' }, // Alex Chen (Lead)
  { id: 'rate-2', projectId: 'proj-1', userId: 'u2', hourlyRate: 50000, currency: 'KRW' }, // Sarah Jenkins
  { id: 'rate-3', projectId: 'proj-1', userId: 'u3', hourlyRate: 45000, currency: 'KRW' }, // Marcus Vance
  { id: 'rate-4', projectId: 'proj-1', userId: 'u4', hourlyRate: 55000, currency: 'KRW' }, // Elena Rostova
  { id: 'rate-5', projectId: 'proj-1', userId: 'u5', hourlyRate: 42000, currency: 'KRW' }  // Kenji Sato
];

export const DEFAULT_MOCK_EXPENSES: ProjectExpense[] = [
  {
    id: 'exp-1',
    projectId: 'proj-1',
    title: 'AWS Cloud Infra & Kubernetes Cluster',
    category: 'infrastructure',
    amount: 4500000,
    recurringType: 'monthly',
    expenseDate: '2026-06-05',
    description: 'AWS Production EKS Cluster & RDS Multi-AZ'
  },
  {
    id: 'exp-2',
    projectId: 'proj-1',
    title: 'OpenAI API & Vector Search DB License',
    category: 'software',
    amount: 1800000,
    recurringType: 'monthly',
    expenseDate: '2026-06-10',
    description: 'Smart AI Query Completion & Embedding Services'
  },
  {
    id: 'exp-3',
    projectId: 'proj-1',
    title: 'External Security & Penetration Audit',
    category: 'outsourcing',
    amount: 12000000,
    recurringType: 'one_time',
    expenseDate: '2026-07-15',
    description: 'ISMS-P & SOC2 Third-party Security Audit'
  },
  {
    id: 'exp-4',
    projectId: 'proj-1',
    title: 'Figma Organization & Jira Cloud Enterprise',
    category: 'software',
    amount: 950000,
    recurringType: 'monthly',
    expenseDate: '2026-06-01',
    description: 'UI/UX Design Systems & Collaboration Tools'
  }
];

// Helper to get from LocalStorage with fallbacks
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to set localStorage key:', key, e);
  }
}

// ─── Project Budget CRUD ──────────────────────────────────────────────────

export async function fetchProjectBudget(projectId: string): Promise<ProjectBudget> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('project_budgets')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (data && !error) {
        return {
          id: data.id,
          projectId: data.project_id,
          totalBudget: Number(data.total_budget),
          currency: data.currency || 'KRW',
          startDate: data.start_date || '2026-06-01',
          endDate: data.end_date || '2026-12-31',
          alertThresholdPercent: data.alert_threshold_percent ?? 10
        };
      }
    } catch (e) {
      console.warn('Supabase fetch project budget failed, using local storage fallback:', e);
    }
  }

  const stored = getLocalItem<ProjectBudget | null>(`${LOCAL_STORAGE_BUDGET_KEY}_${projectId}`, null);
  if (stored) return stored;

  const defaultBgt = { ...DEFAULT_MOCK_BUDGET, projectId };
  setLocalItem(`${LOCAL_STORAGE_BUDGET_KEY}_${projectId}`, defaultBgt);
  return defaultBgt;
}

export async function saveProjectBudget(budget: ProjectBudget): Promise<ProjectBudget> {
  setLocalItem(`${LOCAL_STORAGE_BUDGET_KEY}_${budget.projectId}`, budget);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('project_budgets').upsert({
        id: budget.id,
        project_id: budget.projectId,
        total_budget: budget.totalBudget,
        currency: budget.currency,
        start_date: budget.startDate,
        end_date: budget.endDate,
        alert_threshold_percent: budget.alertThresholdPercent,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to update project budget in Supabase:', e);
    }
  }

  return budget;
}

// ─── Member Hourly Rates CRUD ─────────────────────────────────────────────

export async function fetchMemberHourlyRates(projectId: string): Promise<MemberHourlyRate[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('member_hourly_rates')
        .select('*')
        .eq('project_id', projectId);

      if (data && !error && data.length > 0) {
        return data.map(d => ({
          id: d.id,
          projectId: d.project_id,
          userId: d.user_id,
          hourlyRate: Number(d.hourly_rate),
          currency: d.currency || 'KRW'
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch hourly rates failed, using local storage fallback:', e);
    }
  }

  const stored = getLocalItem<MemberHourlyRate[] | null>(`${LOCAL_STORAGE_RATES_KEY}_${projectId}`, null);
  if (stored && stored.length > 0) return stored;

  setLocalItem(`${LOCAL_STORAGE_RATES_KEY}_${projectId}`, DEFAULT_MOCK_RATES);
  return DEFAULT_MOCK_RATES;
}

export async function saveMemberHourlyRate(rate: MemberHourlyRate): Promise<MemberHourlyRate[]> {
  const currentRates = await fetchMemberHourlyRates(rate.projectId);
  const idx = currentRates.findIndex(r => r.userId === rate.userId);

  let updated: MemberHourlyRate[];
  if (idx !== -1) {
    updated = [...currentRates];
    updated[idx] = rate;
  } else {
    updated = [...currentRates, rate];
  }

  setLocalItem(`${LOCAL_STORAGE_RATES_KEY}_${rate.projectId}`, updated);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('member_hourly_rates').upsert({
        id: rate.id,
        project_id: rate.projectId,
        user_id: rate.userId,
        hourly_rate: rate.hourlyRate,
        currency: rate.currency,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to save member rate in Supabase:', e);
    }
  }

  return updated;
}

// ─── Project Expenses CRUD ────────────────────────────────────────────────

export async function fetchProjectExpenses(projectId: string): Promise<ProjectExpense[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('project_expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('expense_date', { ascending: false });

      if (data && !error && data.length > 0) {
        return data.map(d => ({
          id: d.id,
          projectId: d.project_id,
          title: d.title,
          category: d.category,
          amount: Number(d.amount),
          recurringType: d.recurring_type,
          expenseDate: d.expense_date,
          description: d.description
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch project expenses failed, using local storage fallback:', e);
    }
  }

  const stored = getLocalItem<ProjectExpense[] | null>(`${LOCAL_STORAGE_EXPENSES_KEY}_${projectId}`, null);
  if (stored) return stored;

  setLocalItem(`${LOCAL_STORAGE_EXPENSES_KEY}_${projectId}`, DEFAULT_MOCK_EXPENSES);
  return DEFAULT_MOCK_EXPENSES;
}

export async function addProjectExpense(expense: Omit<ProjectExpense, 'id'>): Promise<ProjectExpense[]> {
  const newExpense: ProjectExpense = {
    ...expense,
    id: generateId()
  };

  const currentExpenses = await fetchProjectExpenses(expense.projectId);
  const updated = [newExpense, ...currentExpenses];
  setLocalItem(`${LOCAL_STORAGE_EXPENSES_KEY}_${expense.projectId}`, updated);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('project_expenses').insert({
        id: newExpense.id,
        project_id: newExpense.projectId,
        title: newExpense.title,
        category: newExpense.category,
        amount: newExpense.amount,
        recurring_type: newExpense.recurringType,
        expense_date: newExpense.expenseDate,
        description: newExpense.description
      });
    } catch (e) {
      console.error('Failed to add expense to Supabase:', e);
    }
  }

  return updated;
}

export async function deleteProjectExpense(projectId: string, expenseId: string): Promise<ProjectExpense[]> {
  const currentExpenses = await fetchProjectExpenses(projectId);
  const updated = currentExpenses.filter(e => e.id !== expenseId);
  setLocalItem(`${LOCAL_STORAGE_EXPENSES_KEY}_${projectId}`, updated);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('project_expenses').delete().eq('id', expenseId);
    } catch (e) {
      console.error('Failed to delete expense from Supabase:', e);
    }
  }

  return updated;
}
