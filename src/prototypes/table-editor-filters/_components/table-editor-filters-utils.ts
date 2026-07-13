import type { EmployeeRow } from "./table-editor-filters-mock-data";

export function filterEmployeesByQuery(
  employees: EmployeeRow[],
  query: string,
): EmployeeRow[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return employees;

  return employees.filter((row) => {
    if (row.name.toLowerCase().includes(normalized)) return true;
    if (String(row.id).includes(normalized)) return true;
    if (row.email?.toLowerCase().includes(normalized)) return true;
    return false;
  });
}
