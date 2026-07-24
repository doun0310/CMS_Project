import React, { useState, useEffect } from 'react'
import { mockAuditLogs, fetchAuditLogsFromBackend } from '../services/api'
import { exportToCsv } from '../utils/csvExporter'
import { AuditIntegrityModal } from '../components/AuditIntegrityModal'
import { useTranslation } from '../hooks/useTranslation'
import { Download, Search, Lock, Printer } from 'lucide-react'

export const AuditLogsPage: React.FC = () => {
  const { t } = useTranslation()
  const [logs, setLogs] = useState(mockAuditLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState(false)
  const [dataNotice, setDataNotice] = useState<string | null>(null)

  useEffect(() => {
    fetchAuditLogsFromBackend()
      .then((data) => {
        setLogs(data)
        setDataNotice(null)
      })
      .catch(() => {
        setDataNotice('백엔드 연결을 확인할 수 없어 예시 감사 로그를 표시하고 있습니다.')
      })
  }, [])

  const filteredLogs = logs.filter((log) =>
    (log.actorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.targetResource || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportCsv = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    exportToCsv(`cms_audit_logs_${today}`, filteredLogs)
  }

  const handlePrintReport = () => {
    window.print()
  }

  return (
    <div className="page-stack" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{t('audit_title')}</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>{t('audit_sub')}</p>
          {dataNotice && <p className="status-message" style={{ color: '#fbbf24', fontSize: '13px', marginTop: '4px' }}>{dataNotice}</p>}
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrintReport}
            className="btn btn-md btn-primary"
          >
            <Printer size={14} /> {t('btn_print_pdf')}
          </button>
          <button
            onClick={() => setIsIntegrityModalOpen(true)}
            className="btn btn-md btn-success"
          >
            <Lock size={14} /> {t('btn_integrity')}
          </button>
          <button
            onClick={handleExportCsv}
            className="btn btn-md btn-secondary"
          >
            <Download size={14} /> {t('btn_export_csv')}
          </button>
        </div>
      </div>

      <AuditIntegrityModal
        isOpen={isIntegrityModalOpen}
        onClose={() => setIsIntegrityModalOpen(false)}
      />

      <div className="glass-card compact-search-card" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="사용자명, 문서명, 조치 유형 검색..."
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', width: '100%', outline: 'none' }}
        />
      </div>

      <div className="glass-card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>로그 ID</th>
              <th>조치 유형</th>
              <th>행위자</th>
              <th>대상 자원</th>
              <th>세부 조치 내용</th>
              <th>IP 주소</th>
              <th>일시</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontWeight: 600, color: '#38bdf8' }}>{log.id}</td>
                <td>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}>{log.action}</span>
                </td>
                <td>{log.actorName}</td>
                <td style={{ color: '#cbd5e1' }}>{log.targetResource}</td>
                <td style={{ color: '#94a3b8' }}>{log.details}</td>
                <td style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{log.ipAddress}</td>
                <td style={{ fontSize: '12px', color: '#94a3b8' }}>{log.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
