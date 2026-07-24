// Business logic mocks for integration testing
export function processPrintApproval(status: string, approverName: string) {
  if (status === 'PENDING') {
    return { status: 'APPROVED', approverName, approvedAt: new Date().toISOString() }
  }
  throw new Error('Already processed request')
}

export function detectPiiKeywords(text: string): string[] {
  const detected: string[] = []
  if (/\d{3}-\d{2,3}-\d{4,6}/.test(text)) detected.push('ACCOUNT_NUMBER')
  if (/\d{6}-[1-4]\d{6}/.test(text)) detected.push('RESIDENT_ID')
  if (text.includes('CONFIDENTIAL')) detected.push('CONFIDENTIAL_STAMP')
  return detected
}

export function calculateRemainingQuota(currentQuota: number, requestedPages: number): number {
  if (requestedPages > currentQuota) {
    throw new Error('Quota Exceeded')
  }
  return currentQuota - requestedPages
}

describe('CMS Print Hub Business Logic Integration Tests', () => {
  it('should approve a pending print request successfully', () => {
    const result = processPrintApproval('PENDING', '이동현 팀장')
    expect(result.status).toBe('APPROVED')
    expect(result.approverName).toBe('이동현 팀장')
    expect(result.approvedAt).toBeDefined()
  })

  it('should throw error when approving already processed request', () => {
    expect(() => processPrintApproval('APPROVED', '이동현 팀장')).toThrow('Already processed request')
  })

  it('should detect account numbers and confidential stamps correctly', () => {
    const sampleText = '입금 계좌: 신한 110-123-45678 및 STRICTLY CONFIDENTIAL'
    const piiResults = detectPiiKeywords(sampleText)
    expect(piiResults).toContain('ACCOUNT_NUMBER')
    expect(piiResults).toContain('CONFIDENTIAL_STAMP')
  })

  it('should deduct user print quota correctly', () => {
    const remaining = calculateRemainingQuota(500, 30)
    expect(remaining).toBe(470)
  })

  it('should throw error when requested pages exceed current quota', () => {
    expect(() => calculateRemainingQuota(10, 50)).toThrow('Quota Exceeded')
  })
})
