import React, { useState, useEffect } from 'react'
import { X, KeyRound, Copy, Check, QrCode, Clock } from 'lucide-react'

interface Props {
  isOpen: boolean
  requestId: string
  documentName: string
  onClose: () => void
}

export const PinReleaseModal: React.FC<Props> = ({
  isOpen,
  requestId,
  documentName,
  onClose,
}) => {
  const [pin, setPin] = useState('849-201')
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15분

  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen])

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(pin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegeneratePin = () => {
    const newPin = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`
    setPin(newPin)
    setTimeLeft(900)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

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
      <div className="glass-card" style={{ width: '450px', padding: '24px', position: 'relative', textAlign: 'center' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={24} color="#38bdf8" />
          </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>무인 프린터 PIN 번호 발급</h3>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>사내 키오스크/복합기 터치스크린에 입력하여 즉시 출력하세요.</p>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', margin: '16px 0', fontSize: '13px', textAlign: 'left' }}>
          <div style={{ color: '#94a3b8' }}>요청 ID: <strong style={{ color: '#38bdf8' }}>{requestId}</strong></div>
          <div style={{ color: '#94a3b8', marginTop: '4px' }}>문서명: <strong style={{ color: '#fff' }}>{documentName}</strong></div>
        </div>

        {/* PIN Code Box */}
        <div style={{ background: '#0f172a', border: '2px dashed #0284c7', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>One-Time Release PIN Code</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#38bdf8', letterSpacing: '4px', margin: '6px 0', fontFamily: 'monospace' }}>
            {pin}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b' }}>
            <Clock size={14} /> 유효 남은 시간: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={handleCopy}
            style={{ padding: '8px 14px', background: '#334155', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? '복사됨' : 'PIN 복사'}
          </button>
          <button
            onClick={handleRegeneratePin}
            style={{ padding: '8px 14px', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <QrCode size={14} /> PIN 재발급
          </button>
        </div>
      </div>
    </div>
  )
}
