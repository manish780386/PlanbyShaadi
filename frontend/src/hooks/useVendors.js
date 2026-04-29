import { useQuery } from "@tanstack/react-query";
import { getVendors, getVendorDetail } from "../api/vendors.js";

export function useVendors(filters = {}) {
  return useQuery({
    queryKey: ["vendors", filters],
    queryFn:  () => getVendors(filters).then((r) => r.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });
}

export function useVendorDetail(id) {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn:  () => getVendorDetail(id).then((r) => r.data),
    enabled:  !!id,
    staleTime: 1000 * 60 * 5,
  });
}