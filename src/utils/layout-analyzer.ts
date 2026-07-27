export type DocLayNetCategory =
  | "Title"
  | "Section-header"
  | "Text"
  | "Table"
  | "Picture"
  | "Page-header"
  | "Page-footer"
  | "Footnote"
  | "Caption"
  | "List-item"
  | "Formula";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentElement {
  id: string;
  category: DocLayNetCategory;
  bbox: BoundingBox;
  textSnippet?: string;
  confidence?: number;
}

export interface LayoutAnalysisResult {
  documentType: string;
  totalElements: number;
  categoryDistribution: Record<string, number>;
  hasTable: boolean;
  hasPicture: boolean;
  hasHeaderFooter: boolean;
  recommendedMargins: { top: number; bottom: number; left: number; right: number };
  elements: DocumentElement[];
}

export function analyzeDocumentLayout(
  elements: DocumentElement[],
  documentTypeHint?: string
): LayoutAnalysisResult {
  const distribution: Record<string, number> = {};
  let hasTable = false;
  let hasPicture = false;
  let hasHeaderFooter = false;

  for (const elem of elements) {
    distribution[elem.category] = (distribution[elem.category] || 0) + 1;
    if (elem.category === "Table") hasTable = true;
    if (elem.category === "Picture") hasPicture = true;
    if (elem.category === "Page-header" || elem.category === "Page-footer") {
      hasHeaderFooter = true;
    }
  }

  let docType = documentTypeHint || "FINANCIAL_REPORT";
  if (hasTable && (distribution["Section-header"] || 0) > 2) {
    docType = "FINANCIAL_STATEMENT";
  } else if (distribution["Formula"] && distribution["Formula"] > 2) {
    docType = "SCIENTIFIC_PAPER";
  } else if (distribution["Title"] && distribution["Text"]) {
    docType = "OFFICIAL_MEMO";
  }

  return {
    documentType: docType,
    totalElements: elements.length,
    categoryDistribution: distribution,
    hasTable,
    hasPicture,
    hasHeaderFooter,
    recommendedMargins: {
      top: hasHeaderFooter ? 15 : 20,
      bottom: hasHeaderFooter ? 15 : 20,
      left: 20,
      right: 20
    },
    elements
  };
}
