import { describe, expect, it } from "vitest";

import { MOCK_EMPLOYEES } from "./table-editor-filters-mock-data";
import { filterEmployeesByQuery } from "./table-editor-filters-utils";

describe("filterEmployeesByQuery", () => {
  it("returns all employees when query is empty", () => {
    expect(filterEmployeesByQuery(MOCK_EMPLOYEES, "")).toEqual(MOCK_EMPLOYEES);
    expect(filterEmployeesByQuery(MOCK_EMPLOYEES, "   ")).toEqual(MOCK_EMPLOYEES);
  });

  it("filters employees by name case-insensitively", () => {
    expect(filterEmployeesByQuery(MOCK_EMPLOYEES, "richard")).toEqual([
      MOCK_EMPLOYEES[1],
    ]);
    expect(filterEmployeesByQuery(MOCK_EMPLOYEES, "Monica")).toEqual([
      MOCK_EMPLOYEES[2],
    ]);
  });

  it("returns no employees when name does not match", () => {
    expect(filterEmployeesByQuery(MOCK_EMPLOYEES, "Jared")).toEqual([]);
  });
});
