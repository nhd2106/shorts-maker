import { api } from "@/api";

export interface CaptionStyle {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

export const getCaptionStyles = async (): Promise<CaptionStyle[]> => {
  const data = await api.get("/api/caption-styles");

  return data.data;
};
