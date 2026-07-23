import crypto from 'crypto'

/**
 * 이전 감사 로그 해시와 현재 액션 로그 정보를 조합하여
 * 변조 불가능한 SHA-256 해시 체인을 생성합니다.
 */
export function generateAuditHash(
  prevHash: string,
  actorId: number,
  actionType: string,
  targetType: string,
  targetId: number,
  timestamp: Date = new Date()
): string {
  const payload = `${prevHash}|${actorId}|${actionType}|${targetType}|${targetId}|${timestamp.toISOString()}`
  return crypto.createHash('sha256').update(payload).digest('hex')
}
