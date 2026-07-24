import React, { useState } from 'react'
import { X, Printer, Plus } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newPrinter: any) => void
}

export const CreatePrinterModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState(`PRT-${Math.floor(100 + Math.random() * 900)}`)
  const [name, setName] = useState('')
  const [printerType, setPrinterType] = useState('COLOR_LASER')
  const [connectionType, setConnectionType] = useState('NETWORK_SNMP')
  const [ipAddress, setIpAddress] = useState('192.168.1.')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !ipAddress.trim()) return

    setSubmitting(true)
    try {
      await fetch('/api/v1/admin/printers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          printerType,
          connectionType,
          ipAddress,
          location,
        }),
      })

      const newPrt = {
        id: `PRT-${Date.now()}`,
        name,
        modelName: `${name} (${printerType})`,
        ipAddress,
        location: location || '사내 전용 구역',
        status: 'ONLINE',
        blackTonerLevel: 100,
        activeJobCount: 0,
      }

      onSuccess(newPrt)
      onClose()
    } catch {
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-card" style={{ width: '480px', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Printer color="#10b981" size={22} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>신규 네트워크 프린터 등록</h3>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>장비 코드 / 관리식별자</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>프린터 장비명</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 3F-Xerox-C8055 연구소 복합기"
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>장비 종류</label>
              <select
                value={printerType}
                onChange={(e) => setPrinterType(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              >
                <option value="COLOR_LASER">컬러 레이저 복합기</option>
                <option value="MONO_LASER">흑백 레이저 프린터</option>
                <option value="COLOR_INKJET">컬러 잉크젯 복합기</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>연결 방식</label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              >
                <option value="NETWORK_SNMP">SNMP 네트워크 (UDP 161)</option>
                <option value="AGENT_DIRECT">Print Agent 직접 연결</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>네트워크 IP 주소</label>
              <input
                type="text"
                required
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.150"
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>설치 위치</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 3층 개발존 중앙, 사내 전용 구역"
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', background: '#334155', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '8px 16px', background: '#10b981', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Plus size={14} /> {submitting ? '등록 중...' : '프린터 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
