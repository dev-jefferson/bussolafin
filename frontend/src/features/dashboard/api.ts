import { apiClient } from "@/lib/api-client";
import type { MonthComparisonItem } from "@/types/api";

export function getComparison(months = 6) {
  return apiClient.get<MonthComparisonItem[]>(`/dashboard/comparison?months=${months}`);
}
