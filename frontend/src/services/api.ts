import { PrintRequest, Printer, AuditLog, KpiSummary } from '../types'

export const mockKpiData: KpiSummary = {
  totalRequests: 1420,
  pendingApprovals: 12,
  activePrinters: 12,
  totalPrinters: 12,
  paperSavingsPercent: 28.5,
}

export const mockPrintRequests: PrintRequest[] = [
  {
    id: 'PR-2026-EN01',
    documentName: '2026_Q3_Financial_Statement.docx (PII 포함)',
    pageCount: 45,
    copyCount: 2,
    securityLevel: 'CONFIDENTIAL',
    status: 'PENDING',
    requesterName: 'Richard Causey 수석차장 (EMP-3002)',
    requesterDepartment: '재무회계팀 (Finance Risk)',
    createdAt: '2026-07-24 09:30',
  },
  {
    id: 'PR-2026-EN02',
    documentName: 'MSA_Cloud_Architecture_v1.pdf',
    pageCount: 12,
    copyCount: 1,
    securityLevel: 'RESTRICTED',
    status: 'APPROVED',
    requesterName: 'Vince Kaminski 수석연구원 (EMP-2002)',
    requesterDepartment: '기술개발본부 R&D 센터',
    approverName: 'Greg Whalley R&D 본부장',
    createdAt: '2026-07-24 08:50',
  },
  {
    id: 'PR-2026-EN03',
    documentName: 'Global_Product_Flyer_2026.ai',
    pageCount: 4,
    copyCount: 50,
    securityLevel: 'PUBLIC',
    status: 'REJECTED',
    requesterName: 'Lou Pai 해외영업팀장 (EMP-5002)',
    requesterDepartment: '글로벌 사업본부',
    approverName: 'John Lavorato 영업본부장',
    rejectionReason: '컬러 50장 대량 출력 사유 부족. 디지털 PDF 문서 배포 권장',
    createdAt: '2026-07-24 07:15',
  },
  {
    id: 'PR-2026-EN04',
    documentName: '2026_Employee_Evaluation_v3.xlsx',
    pageCount: 8,
    copyCount: 1,
    securityLevel: 'CONFIDENTIAL',
    status: 'PENDING',
    requesterName: 'Sally Beck 총무 매니저 (EMP-4002)',
    requesterDepartment: '인사총무팀',
    createdAt: '2026-07-24 06:40',
  },
]

export const mockPrinters: Printer[] = [
  {
    id: 'PRT-01',
    name: '본사 4층 개발팀 복합기',
    modelName: 'HP LaserJet Pro M404dn',
    ipAddress: '192.168.1.150',
    location: '본사 4F A구역',
    status: 'ONLINE',
    blackTonerLevel: 85,
    paperLevel: 90,
    activeJobCount: 0,
    lastCheckedAt: '방금 전',
  },
  {
    id: 'PRT-02',
    name: '본사 3층 임원실 복합기',
    modelName: 'Xerox VersaLink C400',
    ipAddress: '192.168.1.151',
    location: '본사 3F B구역',
    status: 'LOW_TONER',
    blackTonerLevel: 15,
    colorTonerLevel: 30,
    paperLevel: 40,
    activeJobCount: 1,
    lastCheckedAt: '1분 전',
  },
  {
    id: 'PRT-03',
    name: '본사 2층 마케팅 고속 출력기',
    modelName: 'Canon imageRUNNER ADVANCE',
    ipAddress: '192.168.1.152',
    location: '본사 2F C구역',
    status: 'PRINTING',
    blackTonerLevel: 60,
    colorTonerLevel: 72,
    paperLevel: 65,
    activeJobCount: 3,
    lastCheckedAt: '방금 전',
  },
]

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'LOG-8801',
    action: 'APPROVAL',
    actorName: '이동현 팀장',
    targetResource: 'PR-2026-002 (Project_Alpha_Architecture_v2.pdf)',
    details: '인쇄 요청 승인 완료 (보안등급: RESTRICTED)',
    ipAddress: '10.0.4.12',
    createdAt: '2026-07-23 15:10:22',
  },
  {
    id: 'LOG-8800',
    action: 'REJECTION',
    actorName: '이동현 팀장',
    targetResource: 'PR-2026-003 (Marketing_Flyer_Draft.ai)',
    details: '인쇄 요청 반려 (사유: 컬러 출력 사유 부족)',
    ipAddress: '10.0.4.12',
    createdAt: '2026-07-23 14:05:11',
  },
  {
    id: 'LOG-8799',
    action: 'SYSTEM_ALERT',
    actorName: 'SNMP Monitor',
    targetResource: '3F-Xerox-C8055',
    details: '토너 부족 경고 감지 (블랙 토너 15%)',
    ipAddress: '192.168.1.150',
    createdAt: '2026-07-23 12:00:05',
  },
]

// ==========================================
// 백엔드 REST API 연동 클라이언트 서비스
// ==========================================
const API_BASE_URL = '/api/v1'

function extractNumericId(id: string | number): number {
  if (typeof id === 'number') return id
  const num = parseInt(id.replace(/\D/g, ''), 10)
  return isNaN(num) ? 1 : num
}

export async function fetchPrintRequestsFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/print-requests`)
    if (!res.ok) throw new Error('Failed to fetch print requests')
    const json = await res.json()
    return json.data?.items || json.items || mockPrintRequests
  } catch {
    return mockPrintRequests
  }
}

export async function approvePrintRequestApi(id: string, comment?: string) {
  const numericId = extractNumericId(id)
  const res = await fetch(`${API_BASE_URL}/approvals/${numericId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: comment || '승인 완료' }),
  })
  return res.json()
}

export async function rejectPrintRequestApi(id: string, reason: string) {
  const numericId = extractNumericId(id)
  const res = await fetch(`${API_BASE_URL}/approvals/${numericId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })
  return res.json()
}

export async function syncPrinterSnmpApi(printerId: number = 1) {
  const res = await fetch(`${API_BASE_URL}/printers/${printerId}/snmp-sync`, {
    method: 'POST',
  })
  return res.json()
}

export async function fetchPrintersFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/printers`)
    if (!res.ok) throw new Error('Failed to fetch printers')
    const json = await res.json()
    return json.data?.items || json.items || mockPrinters
  } catch {
    return mockPrinters
  }
}

export async function fetchPoliciesFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/approval-policies`)
    if (!res.ok) throw new Error('Failed to fetch policies')
    const json = await res.json()
    return json.data?.items || json.items
  } catch {
    return null
  }
}

export async function fetchDashboardKpisApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard-kpis`)
    if (!res.ok) throw new Error('Failed to fetch KPIs')
    const json = await res.json()
    return json.data || mockKpiData
  } catch {
    return mockKpiData
  }
}

export async function fetchAuditLogsFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/audit-logs`)
    if (!res.ok) throw new Error('Failed to fetch audit logs')
    const json = await res.json()
    return json.data?.items || mockAuditLogs
  } catch {
    return mockAuditLogs
  }
}
