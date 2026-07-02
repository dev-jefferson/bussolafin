import { useQuery } from "@tanstack/react-query";
import * as dashboardApi from "./api";

export function useComparison(months = 6) {
  return useQuery({
    queryKey: ["dashboard", "comparison", months],
    queryFn: () => dashboardApi.getComparison(months),
  });
}
