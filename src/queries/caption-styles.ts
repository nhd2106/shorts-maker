import { useQuery } from "@tanstack/react-query";
import { getCaptionStyles } from "@/apis/caption-styles";

export const useCaptionStyles = () => {
  return useQuery({
    queryKey: ["caption-styles"],
    queryFn: getCaptionStyles,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};