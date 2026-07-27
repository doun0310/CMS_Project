export interface PIISpan {
  label: string;
  value: string;
  start: number;
  end: number;
  bcType: string;
}

export interface PIIAnalysisResult {
  hasPII: boolean;
  sensitiveScore: number;
  detectedTypes: string[];
  spans: PIISpan[];
  maskedText: string;
}

const PII_PATTERNS: Array<{
  label: string;
  bcType: string;
  regex: RegExp;
  weight: number;
}> = [
  {
    label: "RRN",
    bcType: "주민등록번호",
    regex: /\b\d{6}-[1-4]\d{6}\b/g,
    weight: 5
  },
  {
    label: "CARDNUM",
    bcType: "카드번호",
    regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    weight: 4
  },
  {
    label: "PHONE_MOBILE",
    bcType: "전화번호",
    regex: /\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/g,
    weight: 3
  },
  {
    label: "EMAIL",
    bcType: "이메일주소",
    regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    weight: 2
  },
  {
    label: "DOB",
    bcType: "생년월일",
    regex: /\b(?:19|20)\d{2}[-/.](?:0[1-9]|1[0-2])[-/.](?:0[1-9]|[12]\d|3[01])\b/g,
    weight: 2
  },
  {
    label: "ACCOUNT",
    bcType: "계좌번호",
    regex: /\b\d{3,6}[-]\d{2,6}[-]\d{3,6}\b/g,
    weight: 3
  },
  {
    label: "PASSPORT",
    bcType: "여권번호",
    regex: /\b[M1-9]\d{8}\b/g,
    weight: 4
  }
];

export function detectPII(text: string | null | undefined): PIIAnalysisResult {
  if (!text || typeof text !== "string") {
    return {
      hasPII: false,
      sensitiveScore: 0,
      detectedTypes: [],
      spans: [],
      maskedText: text || ""
    };
  }

  const spans: PIISpan[] = [];
  const detectedTypeSet = new Set<string>();
  let totalScore = 0;

  for (const pattern of PII_PATTERNS) {
    const matches = text.matchAll(pattern.regex);
    for (const match of matches) {
      if (match.index !== undefined) {
        const val = match[0];
        spans.push({
          label: pattern.label,
          bcType: pattern.bcType,
          value: val,
          start: match.index,
          end: match.index + val.length
        });
        detectedTypeSet.add(pattern.bcType);
        totalScore += pattern.weight;
      }
    }
  }

  spans.sort((a, b) => a.start - b.start);

  let maskedText = "";
  let lastIndex = 0;

  for (const span of spans) {
    if (span.start >= lastIndex) {
      maskedText += text.slice(lastIndex, span.start);
      maskedText += `[${span.bcType}_마스킹]`;
      lastIndex = span.end;
    }
  }
  maskedText += text.slice(lastIndex);

  return {
    hasPII: spans.length > 0,
    sensitiveScore: totalScore,
    detectedTypes: Array.from(detectedTypeSet),
    spans,
    maskedText
  };
}
