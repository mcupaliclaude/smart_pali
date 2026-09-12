/**
 * RFC 4180 compliant CSV Parser & Serializer
 * Supports UTF-8 BOM, quoted fields with commas/newlines, escaped quotes (""), and CRLF/LF.
 */

const UTF8_BOM = "\uFEFF";

export interface CsvColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
}

export interface ParseCsvOptions {
  delimiter?: string;
  trimHeaders?: boolean;
  trimValues?: boolean;
}

/**
 * Parse CSV text into array of rows as objects keyed by header names.
 */
export function parseCsv(
  text: string,
  options: ParseCsvOptions = {},
): { headers: string[]; rows: Record<string, string>[] } {
  const delimiter = options.delimiter ?? ",";
  const trimHeaders = options.trimHeaders ?? true;
  const trimValues = options.trimValues ?? true;

  // Strip UTF-8 BOM if present
  let cleanText = text;
  if (cleanText.startsWith(UTF8_BOM)) {
    cleanText = cleanText.slice(UTF8_BOM.length);
  }

  const rawRows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // skip next quote
        } else {
          // End of quote
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(trimValues ? currentField.trim() : currentField);
        currentField = "";
      } else if (char === "\r") {
        if (nextChar === "\n") {
          i++; // handle CRLF
        }
        currentRow.push(trimValues ? currentField.trim() : currentField);
        rawRows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(trimValues ? currentField.trim() : currentField);
        rawRows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  // Flush remaining field/row
  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(trimValues ? currentField.trim() : currentField);
    rawRows.push(currentRow);
  }

  // Filter out empty rows (e.g. trailing empty line)
  const nonEmptyRows = rawRows.filter((r) => r.some((val) => val.length > 0));

  if (nonEmptyRows.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = nonEmptyRows[0];
  const headers = trimHeaders ? rawHeaders.map((h) => h.trim()) : rawHeaders;
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < nonEmptyRows.length; r++) {
    const rowData: Record<string, string> = {};
    const rowValues = nonEmptyRows[r];
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      if (header) {
        rowData[header] = rowValues[c] ?? "";
      }
    }
    rows.push(rowData);
  }

  return { headers, rows };
}

/**
 * Format a single value according to CSV RFC 4180 rules.
 */
export function formatCsvValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV string with UTF-8 BOM for Microsoft Excel compatibility.
 */
export function generateCsv<T extends Record<string, unknown>>(
  columns: CsvColumn<T>[],
  rows: T[],
  options: { includeBom?: boolean; delimiter?: string } = {},
): string {
  const includeBom = options.includeBom ?? true;
  const delimiter = options.delimiter ?? ",";

  const headerLine = columns.map((c) => formatCsvValue(c.label)).join(delimiter);
  const dataLines = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key as keyof T];
        return formatCsvValue(val);
      })
      .join(delimiter),
  );

  const content = [headerLine, ...dataLines].join("\r\n");
  return includeBom ? `${UTF8_BOM}${content}` : content;
}
