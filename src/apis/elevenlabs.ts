import axios from "axios";

export const getVoices = async (apiKey: string) => {
  const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
    headers: {
      "xi-api-key": apiKey,
    },
  });

  return response.data;
};
