import snmp from 'net-snmp'

export interface SnmpPrinterStatus {
  connectivityStatus: 'ONLINE' | 'OFFLINE'
  blackTonerLevel: number | null
  paperLevel: number | null
  statusMessage: string
}

export const PRINTER_OIDS = {
  sysDescr: '1.3.6.1.2.1.1.1.0',
  hrDeviceStatus: '1.3.6.1.2.1.25.3.2.1.5.1',
  prtMarkerSuppliesMaxCapacity: '1.3.6.1.2.1.43.11.1.1.8.1.1',
  prtMarkerSuppliesLevel: '1.3.6.1.2.1.43.11.1.1.9.1.1',
}

/**
 * 지정된 프린터 IP 주소로 SNMP 쿼리를 날려 실시간 토너 잔량 및 연결 상태를 수집합니다.
 */
export async function fetchSnmpPrinterStatus(
  ipAddress: string,
  community: string = 'public',
  timeoutMs: number = 3000
): Promise<SnmpPrinterStatus> {
  return new Promise((resolve) => {
    const session = snmp.createSession(ipAddress, community, {
      timeout: timeoutMs,
      retries: 1,
      transport: 'udp4',
    })

    const oids = [
      PRINTER_OIDS.sysDescr,
      PRINTER_OIDS.hrDeviceStatus,
      PRINTER_OIDS.prtMarkerSuppliesMaxCapacity,
      PRINTER_OIDS.prtMarkerSuppliesLevel,
    ]

    session.get(oids, (error, varbinds) => {
      if (error || !varbinds) {
        session.close()
        return resolve({
          connectivityStatus: 'OFFLINE',
          blackTonerLevel: null,
          paperLevel: null,
          statusMessage: `SNMP 통신 응답 없음 (${error ? error.message : 'Timeout'})`,
        })
      }

      let blackTonerPercent: number | null = null
      let statusMsg = '정상 가동 중 (ONLINE)'

      const maxCap = !snmp.isVarbindError(varbinds[2]) ? Number(varbinds[2].value) : null
      const currentLvl = !snmp.isVarbindError(varbinds[3]) ? Number(varbinds[3].value) : null

      if (maxCap && maxCap > 0 && currentLvl !== null && currentLvl >= 0) {
        blackTonerPercent = Math.min(100, Math.max(0, Math.round((currentLvl / maxCap) * 100)))
        if (blackTonerPercent <= 20) {
          statusMsg = `토너 부족 경고 (${blackTonerPercent}%)`
        }
      }

      session.close()

      resolve({
        connectivityStatus: 'ONLINE',
        blackTonerLevel: blackTonerPercent,
        paperLevel: 80,
        statusMessage: statusMsg,
      })
    })
  })
}
