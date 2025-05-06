import { useQuery } from "@tanstack/react-query";
import { HOUR } from "./constants";
import { getVoices } from "@/apis/elevenlabs";

export const useElevenLabsVoices = (apiKey: string) => {
  return useQuery({
    enabled: !!apiKey,
    queryKey: ["elevenlabs-voices"],
    queryFn: () => getVoices(apiKey),
    ...HOUR,
  });
};
