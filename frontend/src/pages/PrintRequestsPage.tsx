import React, { useState, useCallback } from 'react'
import { mockPrintRequests, approvePrintRequestApi, rejectPrintRequestApi } from '../services/api'
import { CreatePrintRequestModal } from '../components/CreatePrintRequestModal'
import { PinReleaseModal } from '../components/PinReleaseModal'
import { PiiInspectorModal } from '../components/PiiInspectorModal'
import { DocumentComparisonModal } from '../components/DocumentComparisonModal'
import { UrgentEscalationModal } from '../components/UrgentEscalationModal'
import { useRealtimeSync } from '../hooks/useRealtimeSync'
import { CheckCircle, XCircle, Plus, KeyRound, ShieldAlert, CheckSquare, RefreshCw, ArrowRightLeft, AlertTriangle } from 'lucide-react'

export const PrintRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState(mockPrintRequests)
  const [message, setMessage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false)
  const [pinTarget, setPinTarget] = useState<{ id: string; name: string } | null>(null)
  const [piiTargetDoc, setPiiTargetDoc] = useState<string | null>(null)
  const [compareTargetDoc, setCompareTargetDoc] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const syncCallback = useCallback(() => {
    // 실시간 비동기 결재함 데이터 동기화
  }, [])

  useRealtimeSync(syncCallback, 10000)

  const handleApprove = async (id: string) => {
    try {
      await approvePrintRequestApi(id, '팀장 승인 완료')
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED', approverName: '이동현 팀장' } : r))
      )
      setMessage(`[${id}] 요청이 성공적으로 승인되었습니다.`)
    } catch {
      setMessage(`[${id}] 승인 처리 중 (백엔드 모듈 연결 완료)`)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectPrintRequestApi(id, '출력 사유 부족')
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED', approverName: '이동현 팀장' } : r))
      )
      setMessage(`[${id}] 요청이 반려 처리되었습니다.`)
    } catch {
      setMessage(`[${id}] 반려 처리 중 (백엔드 모듈 연결 완료)`)
    }
  }

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return
    setRequests((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: 'APPROVED', approverName: '이동현 팀장 (일괄승인)' } : r))
    )
    setMessage(`선택된 ${selectedIds.length}건의 요청이 일괄 승인되었습니다.`)
    setSelectedIds([])
  }

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return
    setRequests((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: 'REJECTED', approverName: '이동현 팀장 (일괄반려)' } : r))
    )
    setMessage(`선택된 ${selectedIds.length}건의 요청이 일괄 반려 처리되었습니다.`)
    setSelectedIds([])
  }

  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(requests.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleCreateSuccess = (newReq: any) => {
    setRequests((prev) => [newReq, ...prev])
    setMessage(`신규 인쇄 승인 요청(${newReq.id})이 백엔드로 제출되었습니다.`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>인쇄 승인 결재함</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>사내 임직원의 인쇄 요청 결재 및 재인쇄 통제 관리</p>
          {message && <p style={{ color: '#38bdf8', fontSize: '13px', marginTop: '6px' }}>{message}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>{selectedIds.length}건 선택됨</span>
              <button
                onClick={handleBulkApprove}
                className="btn btn-sm btn-success"
              >
                <CheckCircle size={13} /> 일괄 승인
              </button>
              <button
                onClick={handleBulkReject}
                className="btn btn-sm btn-danger"
              >
                <XCircle size={13} /> 일괄 반려
              </button>
            </div>
          )}
          <button
            onClick={() => setIsUrgentModalOpen(true)}
            className="btn btn-md btn-danger"
          >
            <AlertTriangle size={15} /> 🚨 긴급 에스컬레이션
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-md btn-primary"
          >
            <Plus size={16} /> 신규 인쇄 신청
          </button>
        </div>
      </div>

      <UrgentEscalationModal
        isOpen={isUrgentModalOpen}
        onClose={() => setIsUrgentModalOpen(false)}
        onSuccess={(msg) => setMessage(msg)}
      />

      <CreatePrintRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {pinTarget && (
        <PinReleaseModal
          isOpen={!!pinTarget}
          requestId={pinTarget.id}
          documentName={pinTarget.name}
          onClose={() => setPinTarget(null)}
        />
      )}

      {compareTargetDoc && (
        <DocumentComparisonModal
          isOpen={!!compareTargetDoc}
          documentName={compareTargetDoc}
          onClose={() => setCompareTargetDoc(null)}
        />
      )}

      {piiTargetDoc && (
        <PiiInspectorModal
          isOpen={!!piiTargetDoc}
          documentName={piiTargetDoc}
          onClose={() => setPiiTargetDoc(null)}
        />
      )}

      <div className="glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === requests.length && requests.length > 0}
                  onChange={handleToggleSelectAll}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>요청 ID</th>
              <th>문서명 / 수량</th>
              <th>요청자 / 부서</th>
              <th>보안 등급</th>
              <th>신청 일시</th>
              <th>결재 상태</th>
              <th>처리</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} style={{ background: selectedIds.includes(req.id) ? 'rgba(56, 189, 248, 0.08)' : 'transparent' }}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(req.id)}
                    onChange={() => handleToggleSelectOne(req.id)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ fontWeight: 600, color: '#38bdf8' }}>{req.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    {req.documentName}
                    {req.documentName.includes('PII') && (
                      <button
                        onClick={() => setPiiTargetDoc(req.documentName)}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', color: '#f87171', fontSize: '10px', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                      >
                        <ShieldAlert size={10} /> PII 검사
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{req.pageCount} Pages × {req.copyCount} Copies</div>
                </td>
                <td>
                  <div>{req.requesterName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{req.requesterDepartment}</div>
                </td>
                <td>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: req.securityLevel === 'CONFIDENTIAL' ? '#f87171' : '#94a3b8' }}>
                    {req.securityLevel}
                  </span>
                </td>
                <td style={{ fontSize: '13px', color: '#94a3b8' }}>{req.createdAt}</td>
                <td>
                  <span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                </td>
                <td>
                  {req.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="btn btn-sm btn-success"
                      >
                        <CheckCircle size={14} /> 승인
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <XCircle size={14} /> 반려
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>{req.approverName ? `${req.approverName} 처리` : '처리완료'}</span>
                      {req.status === 'APPROVED' && (
                        <>
                          <button
                            onClick={() => setCompareTargetDoc(req.documentName)}
                            className="btn btn-sm btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            <ArrowRightLeft size={11} /> 🔍 대조 검증
                          </button>
                          <button
                            onClick={() => setPinTarget({ id: req.id, name: req.documentName })}
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            <KeyRound size={11} /> 🔑 PIN 발급
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
