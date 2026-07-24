import React, { useState } from 'react'
import { X, ShoppingCart, Send, CheckCircle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (msg: string) => void
}

export const ConsumableReorderModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedPrinter, setSelectedPrinter] = useState('PRT-3F-XR01')
  const [itemType, setItemType] = useState('BLACK_TONER')
  const [quantity, setQuantity] = useState(2)
  const [note, setNote] = useState('3F R&D 센터 블랙 토너 잔량 15% - 긴급 발주 요청')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onSuccess(`[${selectedPrinter}] 장비 소모품(${itemType} x ${quantity}개) 발주 신청이 구매팀으로 전송되었습니다.`)
      setSubmitting(false)
      onClose()
    }, 500)
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <ShoppingCart color="#10b981" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>프린터 소모품 긴급 재주문 발주</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>토너/드럼 부족 장비 자동 구매 발주 요청</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>대상 네트워크 프린터</label>
            <select
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            >
              <option value="PRT-3F-XR01">Xerox AltaLink C8055 (3F R&D) - K토너 15%</option>
              <option value="PRT-2F-HP01">HP Color LaserJet M856 (2F 경영지원) - K토너 85%</option>
              <option value="PRT-4F-CN01">Canon imageRUNNER (4F 재무) - K토너 62%</option>
              <option value="PRT-1F-RICOH">Ricoh MP 6055 Mono (1F 로비) - K토너 5% (경고)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>발주 소모품 품목</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              >
                <option value="BLACK_TONER">블랙 토너 카트리지 (K)</option>
                <option value="CYAN_TONER">시안 토너 카트리지 (C)</option>
                <option value="MAGENTA_TONER">마젠타 토너 카트리지 (M)</option>
                <option value="YELLOW_TONER">옐로우 토너 카트리지 (Y)</option>
                <option value="OPC_DRUM">OPC 감광 드럼 유닛</option>
                <option value="WASTE_BOX">폐토너 통 (Waste Container)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>발주 수량</label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>구매팀 전달 메모</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
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
              <Send size={14} /> {submitting ? '발주 중...' : '소모품 발주 신청'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
