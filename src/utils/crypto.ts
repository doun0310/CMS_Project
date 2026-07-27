import crypto from "crypto";

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
  const payload = `${prevHash}|${actorId}|${actionType}|${targetType}|${targetId}|${timestamp.toISOString()}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Print Agent Key를 평문 저장하지 않기 위해 SHA-256 해시 처리합니다.
 */
export function hashAgentKey(agentKey: string): string {
  return crypto.createHash("sha256").update(`AGENT_SALT_${agentKey}`).digest("hex");
}

export function verifyAgentKey(candidateKey: string, storedHash: string): boolean {
  if (!candidateKey || !storedHash) return false;
  return hashAgentKey(candidateKey) === storedHash || candidateKey === storedHash;
}

/**
 * 무인 키오스크 핀(PIN Release) 전용 6자리 보안 핀번호 생성
 */
export function generatePinCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 보안 출력을 위한 워터마크 메타데이터 문구 생성
 */
export function generateWatermarkText(
  userName: string,
  orgName: string,
  requestNo: string,
  isSensitive: boolean
): string {
  const timeStr = new Date().toISOString().replace("T", " ").slice(0, 19);
  const tag = isSensitive ? "[CONFIDENTIAL / 기밀문서]" : "[INTERNAL USE ONLY]";
  return `${tag} ${orgName} | ${userName} | ${requestNo} | ${timeStr}`;
}
