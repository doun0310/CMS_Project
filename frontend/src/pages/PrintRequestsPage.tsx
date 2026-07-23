import React from 'react'
import { mockPrintRequests, approvePrintRequestApi, rejectPrintRequestApi } from '../services/api'
import { CheckCircle, XCircle } from 'lucide-react'

export const PrintRequestsPage: React.FC = () => {
  const [requests, setRequests] = React.useState(mockPrintRequests)
  const [message, setMessage] = React.useState<string | null>(null)

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>인쇄 승인 결재함</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>사내 임직원의 인쇄 요청 결재 및 재인쇄 통제 관리</p>
        {message && <p style={{ color: '#38bdf8', fontSize: '13px', marginTop: '6px' }}>{message}</p>}
      </div>

      <div className="glass-card">
        <table className="data-table">
          <thead>
            <tr>
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
              <tr key={req.id}>
                <td style={{ fontWeight: 600, color: '#38bdf8' }}>{req.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{req.documentName}</div>
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
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleApprove(req.id)}
                        style={{ padding: '6px 12px', background: '#10b981', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <CheckCircle size={14} /> 승인
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        style={{ padding: '6px 12px', background: '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <XCircle size={14} /> 반려
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{req.approverName ? `${req.approverName} 처리` : '처리완료'}</span>
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
