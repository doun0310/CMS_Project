import React, { useState } from 'react'
import { X, MapPin, Printer, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const mockFloorData = [
  {
    floor: '3F (R&D 센터)',
    printers: [
      { id: 'PRT-3F-XR01', name: 'Xerox AltaLink C8055', x: '45%', y: '40%', status: 'ONLINE', ip: '192.168.1.151', zone: '개발 3존 중앙' },
      { id: 'PRT-3F-HP03', name: 'HP Color LaserJet', x: '75%', y: '65%', status: 'ONLINE', ip: '192.168.1.155', zone: '연구소 서브 출력구역' },
    ],
  },
  {
    floor: '2F (경영지원실)',
    printers: [
      { id: 'PRT-2F-HP01', name: 'HP Color LaserJet M856', x: '30%', y: '50%', status: 'ONLINE', ip: '192.168.1.150', zone: '경영지원실 앞' },
    ],
  },
  {
    floor: '4F (재무회계팀)',
    printers: [
      { id: 'PRT-4F-CN01', name: 'Canon imageRUNNER C5560i', x: '60%', y: '35%', status: 'ONLINE', ip: '192.168.1.152', zone: '재무팀 보안구역' },
    ],
  },
  {
    floor: '1F (로비 무인 키오스크)',
    printers: [
      { id: 'PRT-1F-RICOH', name: 'Ricoh MP 6055 Mono Kiosk', x: '50%', y: '80%', status: 'OFFLINE', ip: '192.168.1.154', zone: '본관 1층 안내데스크' },
    ],
  },
]

export const PrinterMapModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0)
  const [activePin, setActivePin] = useState<any | null>(null)

  if (!isOpen) return null

  const currentFloor = mockFloorData[selectedFloorIndex]

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
      <div className="glass-card" style={{ width: '650px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin color="#38bdf8" size={24} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>사내 프린터 장비 층별 위치 지도</h3>
        </div>

        {/* Floor Selection Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {mockFloorData.map((fl, idx) => (
            <button
              key={fl.floor}
              onClick={() => {
                setSelectedFloorIndex(idx)
                setActivePin(null)
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                background: selectedFloorIndex === idx ? '#0284c7' : '#334155',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {fl.floor}
            </button>
          ))}
        </div>

        {/* Interactive Map Area */}
        <div style={{
          width: '100%',
          height: '280px',
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '10px',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
            {currentFloor.floor} Floor Plan Grid
          </div>

          {currentFloor.printers.map((prt) => (
            <div
              key={prt.id}
              onClick={() => setActivePin(prt)}
              style={{
                position: 'absolute',
                top: prt.y,
                left: prt.x,
                transform: 'translate(-50%, -50%)',
                background: prt.status === 'ONLINE' ? '#059669' : '#dc2626',
                color: '#fff',
                padding: '8px',
                borderRadius: '50%',
                boxShadow: '0 0 12px rgba(0, 0, 0, 0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s',
              }}
              title={prt.name}
            >
              <Printer size={18} />
            </div>
          ))}

          {/* Active Pin Tooltip */}
          {activePin && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(30, 41, 59, 0.95)',
              border: '1px solid #0284c7',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            }}>
              <div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{activePin.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>IP: {activePin.ip} ({activePin.zone})</div>
              </div>
              <span style={{ color: activePin.status === 'ONLINE' ? '#34d399' : '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {activePin.status === 'ONLINE' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />} {activePin.status}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
