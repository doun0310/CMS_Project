import React, { useState, useEffect } from 'react'
import { fetchPrintersFromBackend, mockPrinters, syncPrinterSnmpApi } from '../services/api'
import { CreatePrinterModal } from '../components/CreatePrinterModal'
import { PrinterMapModal } from '../components/PrinterMapModal'
import { PingDiagnosticModal } from '../components/PingDiagnosticModal'
import { ConsumableReorderModal } from '../components/ConsumableReorderModal'
import { SlaTrackerModal } from '../components/SlaTrackerModal'
import { useTranslation } from '../hooks/useTranslation'
import { RefreshCw, Plus, Clock, MapPin, Radio, ShoppingCart, FileText } from 'lucide-react'

export const PrintersPage: React.FC = () => {
  const { t } = useTranslation()
  const [printers, setPrinters] = useState(mockPrinters)
  const [loading, setLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [dataNotice, setDataNotice] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [isPingModalOpen, setIsPingModalOpen] = useState(false)
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false)
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false)
  const [autoPolling, setAutoPolling] = useState(false)

  useEffect(() => {
    fetchPrintersFromBackend()
      .then((items) => {
        setPrinters(items)
        setDataNotice(null)
      })
      .catch(() => {
        setDataNotice('백엔드 연결을 확인할 수 없어 예시 프린터를 표시하고 있습니다.')
      })
  }, [])

  const handleSnmpSyncAll = async () => {
    setLoading(true)
    setSyncStatus('네트워크 프린터 SNMP 상태 수집 중...')
    try {
      const printerIds = printers
        .map((printer) => Number(printer.id))
        .filter((id) => Number.isInteger(id) && id > 0)
      if (printerIds.length === 0) {
        throw new Error('백엔드에서 불러온 프린터가 없어 동기화할 수 없습니다.')
      }
      const results = await Promise.allSettled(printerIds.map(syncPrinterSnmpApi))
      const succeeded = results.filter((result) => result.status === 'fulfilled').length
      const failed = results.length - succeeded
      setSyncStatus(`SNMP 동기화 완료: 성공 ${succeeded}대, 실패 ${failed}대`)
    } catch (error) {
      setSyncStatus(error instanceof Error ? `SNMP 동기화 실패: ${error.message}` : 'SNMP 동기화에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    if (autoPolling) {
      setSyncStatus('⏱️ 30초 주기 SNMP 자동 동기화 활성화됨')
      timer = setInterval(() => {
        handleSnmpSyncAll()
      }, 30000)
    } else {
      setSyncStatus(null)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [autoPolling])

  const handleCreateSuccess = (newPrt: any) => {
    setPrinters((prev) => [newPrt, ...prev])
    setSyncStatus(`신규 프린터 장비(${newPrt.name})가 등록되었습니다.`)
  }

  const handleReorderSuccess = (msg: string) => {
    setSyncStatus(msg)
  }

  return (
    <div className="page-stack" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Title & Primary Action Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{t('printers_title')}</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{t('printers_sub')}</p>
          {syncStatus && <p className="status-message" style={{ color: '#38bdf8', fontSize: '13px', marginTop: '4px', whiteSpace: 'nowrap' }}>{syncStatus}</p>}
          {dataNotice && <p className="status-message" style={{ color: '#fbbf24', fontSize: '13px', marginTop: '4px' }}>{dataNotice}</p>}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-md btn-primary"
          style={{ flexShrink: 0 }}
        >
          <Plus size={16} /> {t('btn_new_printer')}
        </button>
      </div>

      {/* Control Toolbar */}
      <div className="compact-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsSlaModalOpen(true)}
            className="btn btn-sm btn-secondary"
          >
            <FileText size={14} /> {t('btn_sla_asset')}
          </button>
          <button
            onClick={() => setIsPingModalOpen(true)}
            className="btn btn-sm btn-primary"
          >
            <Radio size={14} /> {t('btn_ip_diag')}
          </button>
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="btn btn-sm btn-secondary"
          >
            <MapPin size={14} /> {t('btn_map')}
          </button>
          <button
            onClick={() => setIsReorderModalOpen(true)}
            className="btn btn-sm btn-secondary"
          >
            <ShoppingCart size={14} /> {t('btn_reorder')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: autoPolling ? '#38bdf8' : '#94a3b8', background: 'rgba(30, 41, 59, 0.8)', padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={autoPolling}
              onChange={(e) => setAutoPolling(e.target.checked)}
            />
            <Clock size={13} /> 30초 SNMP 수집
          </label>
          <button
            onClick={handleSnmpSyncAll}
            disabled={loading}
            className="btn btn-sm btn-secondary"
            style={{ whiteSpace: 'nowrap' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? '동기화 중...' : t('btn_snmp_sync')}
          </button>
        </div>
      </div>

      <SlaTrackerModal
        isOpen={isSlaModalOpen}
        onClose={() => setIsSlaModalOpen(false)}
        onSuccess={(msg) => setSyncStatus(msg)}
      />

      <ConsumableReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        onSuccess={handleReorderSuccess}
      />

      <PrinterMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />

      <PingDiagnosticModal
        isOpen={isPingModalOpen}
        onClose={() => setIsPingModalOpen(false)}
      />

      <CreatePrinterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Printer Cards Grid */}
      <div className="printer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {printers.map((prt) => (
          <div key={prt.id} className="glass-card printer-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prt.name}</h3>
                <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prt.modelName}</div>
              </div>
              <span className={`badge badge-${prt.status.toLowerCase()}`} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{prt.status}</span>
            </div>

            <div className="printer-card-details" style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>IP 주소:</span>
                <span style={{ whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{prt.ipAddress}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>위치:</span>
                <span style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{prt.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>현재 출력 작업:</span>
                <span style={{ color: '#38bdf8', fontWeight: 600, whiteSpace: 'nowrap' }}>{prt.activeJobCount} 건</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', whiteSpace: 'nowrap' }}>소모품 수집 상태</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  <span>블랙 토너</span>
                  <span>{prt.blackTonerLevel}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${prt.blackTonerLevel}%`, height: '100%', background: prt.blackTonerLevel <= 20 ? '#ef4444' : '#10b981' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
