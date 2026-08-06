import type { Issue, ProjectBudget, MemberHourlyRate, ProjectExpense, BudgetSummary } from '../types/Aether';

const DEFAULT_FALLBACK_HOURLY_RATE = 50000; // ₩50,000 / hr default if not set

export function calculateBudgetSummary(
  budget: ProjectBudget,
  rates: MemberHourlyRate[],
  expenses: ProjectExpense[],
  issues: Issue[]
): BudgetSummary {
  const rateMap = new Map<string, number>();
  rates.forEach(r => rateMap.set(r.userId, r.hourlyRate));

  // 1. Calculate Labor Spend (Cumulative hours logged * hourly rate)
  let laborSpend = 0;
  issues.forEach(issue => {
    const hours = issue.timeLogged || (issue.status === 'done' ? issue.originalEstimate || 8 : 0);
    const userId = issue.assigneeId;
    const hourlyRate = (userId && rateMap.get(userId)) || DEFAULT_FALLBACK_HOURLY_RATE;
    laborSpend += hours * hourlyRate;
  });

  // 2. Calculate Operational / Fixed Expense Spend
  let operationalSpend = 0;
  const now = new Date();
  expenses.forEach(exp => {
    const expDate = new Date(exp.expenseDate);
    if (expDate <= now) {
      if (exp.recurringType === 'monthly') {
        // Calculate months elapsed since expense start date or project start
        const start = new Date(budget.startDate || '2026-06-01');
        const monthsDiff = Math.max(
          1,
          (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1
        );
        operationalSpend += exp.amount * monthsDiff;
      } else {
        operationalSpend += exp.amount;
      }
    }
  });

  // 3. Totals and remaining budget
  const totalSpend = laborSpend + operationalSpend;
  const remainingBudget = budget.totalBudget - totalSpend;
  const burnRatePercent = budget.totalBudget > 0 ? (totalSpend / budget.totalBudget) * 100 : 0;

  // 4. Time progress & Projection calculation
  const startDate = new Date(budget.startDate || '2026-06-01');
  const endDate = new Date(budget.endDate || '2026-12-31');
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  const dailyBurnRate = daysElapsed > 0 ? totalSpend / daysElapsed : 0;
  const projectedTotalSpend = Math.round(dailyBurnRate * totalDays);

  // 5. Risk Assessment Logic
  const plannedSpendPercent = (daysElapsed / totalDays) * 100;
  const overrunDiffPercent = burnRatePercent - plannedSpendPercent;

  let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';
  let riskMessage: string | undefined = undefined;

  if (totalSpend > budget.totalBudget || projectedTotalSpend > budget.totalBudget * 1.1) {
    riskLevel = 'danger';
    riskMessage = `예산 초과 경고! 현재 소진 속도로 진행 시 프로젝트 종료 시점에 약 ${(projectedTotalSpend - budget.totalBudget).toLocaleString()}원 예산이 초과될 위험이 있습니다.`;
  } else if (overrunDiffPercent > (budget.alertThresholdPercent || 10) || burnRatePercent > 80) {
    riskLevel = 'warning';
    riskMessage = `예산 소진 주의! 목표 소진 곡선보다 ${overrunDiffPercent.toFixed(1)}% 빠르게 예산이 소진되고 있습니다.`;
  }

  // 6. Generate Spend Curve Data (Weekly / Monthly Points for Chart)
  const targetSpendCurve: { day: string; planned: number; actual: number; projected?: number }[] = [];
  const stepCount = 8; // 8 time points
  const dayStep = totalDays / (stepCount - 1);

  for (let i = 0; i < stepCount; i++) {
    const pointDayOffset = Math.round(i * dayStep);
    const pointDate = new Date(startDate.getTime() + pointDayOffset * 24 * 60 * 60 * 1000);
    const dateStr = `${pointDate.getMonth() + 1}/${pointDate.getDate()}`;

    // Ideal linear planned spend
    const planned = Math.round((budget.totalBudget / totalDays) * pointPointOffsetClamp(pointDayOffset, totalDays));

    // Actual or projected spend
    if (pointDayOffset <= daysElapsed) {
      const ratio = pointDayOffset / (daysElapsed || 1);
      const actual = Math.round(totalSpend * ratio);
      targetSpendCurve.push({ day: dateStr, planned, actual });
    } else {
      // Future projected points
      const projected = Math.round(totalSpend + dailyBurnRate * (pointDayOffset - daysElapsed));
      targetSpendCurve.push({ day: dateStr, planned, actual: totalSpend, projected });
    }
  }

  return {
    totalBudget: budget.totalBudget,
    currency: budget.currency || 'KRW',
    laborSpend,
    operationalSpend,
    totalSpend,
    remainingBudget,
    burnRatePercent: Number(burnRatePercent.toFixed(1)),
    projectedTotalSpend,
    riskLevel,
    riskMessage,
    targetSpendCurve
  };
}

function pointPointOffsetClamp(offset: number, max: number): number {
  return Math.min(Math.max(offset, 0), max);
}

export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);
}
