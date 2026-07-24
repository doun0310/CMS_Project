export type UserRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'STAFF'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department: string
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type SecurityLevel = 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED'

export interface PrintRequest {
  id: string
  documentName: string
  pageCount: number
  copyCount: number
  securityLevel: SecurityLevel
  status: ApprovalStatus
  requesterName: string
  requesterDepartment: string
  approverName?: string
  rejectionReason?: string
  createdAt: string
}

export type PrinterStatus = 'ONLINE' | 'PRINTING' | 'LOW_TONER' | 'ERROR' | 'OFFLINE'

export interface Printer {
  id: string
  name: string
  modelName: string
  ipAddress: string
  location: string
  status: PrinterStatus
  blackTonerLevel: number
  colorTonerLevel?: number
  paperLevel: number
  activeJobCount: number
  lastCheckedAt: string
}

export interface AuditLog {
  id: string
  action: string
  actorName: string
  targetResource: string
  details: string
  ipAddress: string
  createdAt: string
}

export interface KpiSummary {
  totalRequests: number
  pendingApprovals: number
  activePrinters: number
  totalPrinters: number
  paperSavingsPercent: number
}
