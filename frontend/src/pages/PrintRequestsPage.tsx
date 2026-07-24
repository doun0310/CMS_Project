import React, { useState, useCallback, useEffect } from 'react'
import { mockPrintRequests, approvePrintRequestApi, rejectPrintRequestApi, fetchPrintRequestsFromBackend } from '../services/api'
import { CreatePrintRequestModal } from '../components/CreatePrintRequestModal'
import { PinReleaseModal } from '../components/PinReleaseModal'
import { PiiInspectorModal } from '../components/PiiInspectorModal'
import { DocumentComparisonModal } from '../components/DocumentComparisonModal'
import { UrgentEscalationModal } from '../components/UrgentEscalationModal'
import { AiRiskInspectorBadge } from '../components/AiRiskInspectorBadge'
import { useRealtimeSync } from '../hooks/useRealtimeSync'
import { useSseRealtimePush } from '../hooks/useSseRealtimePush'
import { useTranslation } from '../hooks/useTranslation'
import { CheckCircle, XCircle, Plus, KeyRound, ShieldAlert, CheckSquare, RefreshCw, ArrowRightLeft, AlertTriangle } from 'lucide-react'

export const PrintRequestsPage: React.FC = () => {
  const { t } = useTranslation()
  const [requests, setRequests] = useState(mockPrintRequests)
  const [message, setMessage] = useState<string | null>(null)
  const [dataNotice, setDataNotice] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false)
  const [pinTarget, setPinTarget] = useState<{ id: string; name: string } | null>(null)
  const [piiTargetDoc, setPiiTargetDoc] = useState<string | null>(null)
  const [compareTargetDoc, setCompareTargetDoc] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const refreshRequests = useCallback(async () => {
    try {
      setRequests(await fetchPrintRequestsFromBackend())
      setDataNotice(null)
    } catch {
      setDataNotice('백엔드 연결을 확인할 수 없어 예시 요청을 표시하고 있습니다.')
    }
  }, [])

  useEffect(() => {
    refreshRequests()
  }, [refreshRequests])

  const syncCallback = useCallback(() => {
    return refreshRequests()
  }, [refreshRequests])

  useRealtimeSync(syncCallback, dataNotice ? 30000 : 10000)

  const handleSsePush = useCallback((payload: any) => {
    setMessage(`⚡ [SSE PUSH] ${payload.message}`)
  }, [])

  useSseRealtimePush(handleSsePush)

  const handleApprove = async (id: string) => {
    try {
      await approvePrintRequestApi(id, '팀장 승인 완료')
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED', approverName: '이동현 팀장' } : r))
      )
      setMessage(`[${id}] 요청이 성공적으로 승인되었습니다.`)
    } catch (error) {
      setMessage(error instanceof Error ? `승인 실패: ${error.message}` : `[${id}] 승인 처리에 실패했습니다.`)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectPrintRequestApi(id, '출력 사유 부족')
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED', approverName: '이동현 팀장' } : r))
      )
      setMessage(`[${id}] 요청이 반려 처리되었습니다.`)
    } catch (error) {
      setMessage(error instanceof Error ? `반려 실패: ${error.message}` : `[${id}] 반려 처리에 실패했습니다.`)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return
    const results = await Promise.allSettled(
      selectedIds.map((id) => approvePrintRequestApi(id, '일괄 승인'))
    )
    const succeededIds = selectedIds.filter((_, index) => results[index].status === 'fulfilled')
    setRequests((prev) =>
      prev.map((r) => (succeededIds.includes(r.id) ? { ...r, status: 'APPROVED', approverName: '이동현 팀장 (일괄승인)' } : r))
    )
    setMessage(`${succeededIds.length}건 승인 완료, ${selectedIds.length - succeededIds.length}건 실패`)
    setSelectedIds([])
  }

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return
    const results = await Promise.allSettled(
      selectedIds.map((id) => rejectPrintRequestApi(id, '일괄 반려'))
    )
    const succeededIds = selectedIds.filter((_, index) => results[index].status === 'fulfilled')
    setRequests((prev) =>
      prev.map((r) => (succeededIds.includes(r.id) ? { ...r, status: 'REJECTED', approverName: '이동현 팀장 (일괄반려)' } : r))
    )
    setMessage(`${succeededIds.length}건 반려 완료, ${selectedIds.length - succeededIds.length}건 실패`)
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
    <div className="page-stack" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>인쇄 승인 결재함</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>사내 임직원의 인쇄 요청 결재 및 재인쇄 통제 관리</p>
          {message && <p className="status-message" style={{ color: '#38bdf8', fontSize: '13px', marginTop: '6px' }}>{message}</p>}
          {dataNotice && <p className="status-message" style={{ color: '#fbbf24', fontSize: '13px', marginTop: '4px' }}>{dataNotice}</p>}
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>{selectedIds.length}건 선택됨</span>
              <button
                onClick={handleBulkApprove}
                className="btn btn-sm btn-success"
              >
                <CheckCircle size={13} /> {t('btn_bulk_approve')}
              </button>
              <button
                onClick={handleBulkReject}
                className="btn btn-sm btn-danger"
              >
                <XCircle size={13} /> {t('btn_bulk_reject')}
              </button>
            </div>
          )}
          <button
            onClick={() => setIsUrgentModalOpen(true)}
            className="btn btn-md btn-danger"
          >
            <AlertTriangle size={15} /> {t('btn_escalation')}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-md btn-primary"
          >
            <Plus size={16} /> {t('btn_new_request')}
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

      <div className="glass-card table-card" style={{ width: '100%' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ minWidth: '950px' }}>
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
                <th style={{ whiteSpace: 'nowrap' }}>{t('col_request_id')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('col_doc_name')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('col_requester')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('col_security_level')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('col_created_at')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('col_status')}</th>
                <th style={{ whiteSpace: 'nowrap' }}>{t('col_actions')}</th>
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
                  <td style={{ fontWeight: 600, color: '#38bdf8', whiteSpace: 'nowrap' }}>{req.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, flexWrap: 'wrap' }}>
                      <span style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{req.documentName}</span>
                      <AiRiskInspectorBadge
                        documentName={req.documentName}
                        score={req.documentName.includes('PII') || req.securityLevel === 'CONFIDENTIAL' ? 92 : 25}
                        riskFactors={
                          req.documentName.includes('PII') || req.securityLevel === 'CONFIDENTIAL'
                            ? ['신한은행 계좌번호 (ACCOUNT_NUMBER) 포함', 'STRICTLY CONFIDENTIAL 기밀 직인 감지', '외부 유출 시 손실 위험도 상(HIGH)']
                            : ['사내 서식 표준 문서', '특이 유출 위험 키워드 미감지']
                        }
                      />
                      {req.documentName.includes('PII') && (
                        <button
                          onClick={() => setPiiTargetDoc(req.documentName)}
                          style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', color: '#f87171', fontSize: '10px', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '2px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          <ShieldAlert size={10} /> PII 검사
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{req.pageCount} Pages × {req.copyCount} Copies</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div>{req.requesterName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{req.requesterDepartment}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: req.securityLevel === 'CONFIDENTIAL' ? '#f87171' : '#94a3b8' }}>
                      {req.securityLevel}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{req.createdAt}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`badge badge-${req.status.toLowerCase()}`}>{req.status}</span>
                  </td>
                  <td>
                    {req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="btn btn-sm btn-success"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <CheckCircle size={14} /> {t('btn_approve')}
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="btn btn-sm btn-danger"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <XCircle size={14} /> {t('btn_reject')}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{req.approverName ? `${req.approverName} 처리` : '처리완료'}</span>
                        {req.status === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => setCompareTargetDoc(req.documentName)}
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: '11px', padding: '4px 8px', whiteSpace: 'nowrap' }}
                            >
                              <ArrowRightLeft size={11} /> 🔍 대조 검증
                            </button>
                            <button
                              onClick={() => setPinTarget({ id: req.id, name: req.documentName })}
                              className="btn btn-sm btn-primary"
                              style={{ fontSize: '11px', padding: '4px 8px', whiteSpace: 'nowrap' }}
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
    </div>
  )
}
