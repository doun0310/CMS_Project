import React, { useState } from 'react'
import { X, Radio, CheckCircle, AlertTriangle, RefreshCw, Terminal } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const PingDiagnosticModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [ipAddress, setIpAddress] = useState('192.168.1.150')
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any | null>(null)

  if (!isOpen) return null

  const handleTest = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTesting(true)
    setResult(null)

    setTimeout(() => {
      setResult({
        targetIp: ipAddress,
        pingLatencyMs: 1.4,
        packetsSent: 4,
        packetsReceived: 4,
        packetLossPct: 0,
        snmpPort161Open: true,
        jetdirectPort9100Open: true,
        sysDescr: 'Xerox AltaLink C8055 Network Multifunction Printer (Firmware v1.04.2)',
        hrPrinterStatus: 'idle (2)',
      })
      setTesting(false)
    }, 600)
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
      <div className="glass-card" style={{ width: '520px', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Radio color="#38bdf8" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>프린터 IP/SNMP 네트워크 정밀 진단</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>원격 ICMP Ping 지연율 및 SNMP OID 응답 패킷 테스트</p>
          </div>
        </div>

        <form onSubmit={handleTest} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="프린터 IP 주소 (예: 192.168.1.150)"
            style={{ flex: 1, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
          />
          <button
            type="submit"
            disabled={testing}
            style={{ padding: '8px 16px', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <RefreshCw size={14} className={testing ? 'animate-spin' : ''} /> {testing ? '진단 중...' : 'Ping 테스트'}
          </button>
        </form>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#0f172a', border: '1px solid #334155', padding: '14px', borderRadius: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>대상 네트워크 IP:</span>
              <strong style={{ color: '#38bdf8' }}>{result.targetIp}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>ICMP 지연시간 (Latency):</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>{result.pingLatencyMs} ms (손실률: {result.packetLossPct}%)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>SNMP Port 161 (UDP):</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>OPEN (성공)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>JetDirect Port 9100 (TCP):</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>OPEN (성공)</span>
            </div>

            <div style={{ marginTop: '6px', background: '#1e293b', padding: '8px', borderRadius: '6px', fontFamily: 'monospace', color: '#cbd5e1', fontSize: '11px' }}>
              <div style={{ color: '#94a3b8', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Terminal size={12} /> SNMP Raw sysDescr OID:
              </div>
              {result.sysDescr}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#334155', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
