export interface CSVColumn<T> {
  key?: keyof T;
  getValue?: (row: T) => string | number | null | undefined;
  label: string;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  if (data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map(col => `"${col.label}"`).join(',');
  
  // Create data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = col.getValue ? col.getValue(row) : (col.key ? row[col.key] : undefined);
      // Convert value to string and escape quotes
      // Handle arrays by joining with semicolon
      const stringValue = value === null || value === undefined 
        ? '' 
        : Array.isArray(value) 
          ? value.join('; ') 
          : String(value);
      const escapedValue = stringValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Main export function - converts data to CSV and downloads it
 */
export function exportToCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const csvContent = arrayToCSV(data, columns);
  downloadCSV(csvContent, filename);
}