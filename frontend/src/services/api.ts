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
    id: 'PR-2026-001',
    documentName: '2026_Q3_Financial_Report.docx',
    pageCount: 45,
    copyCount: 2,
    securityLevel: 'CONFIDENTIAL',
    status: 'PENDING',
    requesterName: '김민수 대리',
    requesterDepartment: '재무회계팀',
    createdAt: '2026-07-23 16:30',
  },
  {
    id: 'PR-2026-002',
    documentName: 'Project_Alpha_Architecture_v2.pdf',
    pageCount: 12,
    copyCount: 1,
    securityLevel: 'RESTRICTED',
    status: 'APPROVED',
    requesterName: '박서연 과장',
    requesterDepartment: '기술개발본부',
    approverName: '이동현 팀장',
    createdAt: '2026-07-23 15:10',
  },
  {
    id: 'PR-2026-003',
    documentName: 'Marketing_Flyer_Draft.ai',
    pageCount: 4,
    copyCount: 50,
    securityLevel: 'PUBLIC',
    status: 'REJECTED',
    requesterName: '정수진 사원',
    requesterDepartment: '마케팅팀',
    approverName: '이동현 팀장',
    rejectionReason: '컬러 50장 출력 사유 부족. 디지털 문서 배포 권장',
    createdAt: '2026-07-23 14:05',
  },
  {
    id: 'PR-2026-004',
    documentName: 'Employee_Evaluation_2026.xlsx',
    pageCount: 8,
    copyCount: 1,
    securityLevel: 'CONFIDENTIAL',
    status: 'PENDING',
    requesterName: '최현우 차장',
    requesterDepartment: '인사총무팀',
    createdAt: '2026-07-23 13:45',
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

export async function fetchPrintRequestsFromBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/print-requests`)
    if (!res.ok) throw new Error('Failed to fetch print requests')
    return await res.json()
  } catch {
    return { items: mockPrintRequests }
  }
}

export async function approvePrintRequestApi(id: string, comment?: string) {
  const res = await fetch(`${API_BASE_URL}/approvals/print-requests/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: comment || '승인 완료' }),
  })
  return res.json()
}

export async function rejectPrintRequestApi(id: string, reason: string) {
  const res = await fetch(`${API_BASE_URL}/approvals/print-requests/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })
  return res.json()
}

export async function syncPrinterSnmpApi(printerId: number = 1) {
  const res = await fetch(`${API_BASE_URL}/admin/printers/${printerId}/snmp-sync`, {
    method: 'POST',
  })
  return res.json()
}
