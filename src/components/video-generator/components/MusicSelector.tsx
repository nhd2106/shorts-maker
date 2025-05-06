import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { motion } from "motion/react";
import { API_BASE_URL } from "@/api";

interface MusicSelectorProps {
  onMusicSelect: (music: string) => void;
  selectedMusic: string;
}

export function MusicSelector({
  onMusicSelect,
  selectedMusic,
}: MusicSelectorProps) {
  const [musicList, setMusicList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchMusic() {
      try {
        // Assume /api/music returns { music: string[] }
        const response = await fetch(`${API_BASE_URL}/api/music`);
        if (!response.ok) {
          throw new Error("Failed to fetch music list");
        }
        const data = await response.json();
        // Extract filenames from the paths returned by the API
        const filenames = (data || []).map(
          (path: string) => path.split("/").pop() || path
        );
        setMusicList(filenames); // Store only filenames
        setError(null);
      } catch (err) {
        console.error("Error fetching music:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setMusicList([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    }
    fetchMusic();
  }, []);

  // Effect to manage audio playback state and cleanup
  useEffect(() => {
    const audioElement = audioRef.current;

    const handleAudioEnd = () => {
      setIsPlaying(false);
    };

    if (audioElement) {
      audioElement.addEventListener("ended", handleAudioEnd);
    }

    // Cleanup function
    return () => {
      if (audioElement) {
        audioElement.removeEventListener("ended", handleAudioEnd);
        audioElement.pause(); // Stop playback on component unmount or selection change
      }
      audioRef.current = null; // Clear the ref
      setIsPlaying(false); // Reset playing state
    };
  }, [selectedMusic]); // Rerun cleanup/setup when selectedMusic changes

  const handlePreviewToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!selectedMusic) return;

    // Construct URL using the selected filename. Assumes files are in /public/music/
    const musicUrl = `${API_BASE_URL}/api/music/${selectedMusic}`;

    if (audioRef.current && audioRef.current.src.endsWith(musicUrl)) {
      // If the same audio is loaded, toggle play/pause
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    } else {
      // Load new audio or first time load
      if (audioRef.current) {
        audioRef.current.pause(); // Stop previous audio if any
      }
      const newAudio = new Audio(musicUrl);
      audioRef.current = newAudio;
      newAudio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Error playing audio:", err);
          setError(`Failed to load or play ${selectedMusic}`);
          setIsPlaying(false);
        });
    }
  };

  const handleMusicChange = (value: string) => {
    // Stop current playback when selection changes
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    onMusicSelect(value === "none" ? "" : value); // Pass empty string if 'none' is selected
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 items-end">
          <div className="space-y-2">
            <Label>Background Music</Label>
            <Select
              value={selectedMusic}
              onValueChange={handleMusicChange} // Use the new handler
              disabled={isLoading || !!error}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isLoading ? "Loading music..." : "Select music"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {error ? (
                  <SelectItem value="error" disabled>
                    Error loading music
                  </SelectItem>
                ) : musicList.length === 0 && !isLoading ? (
                  <SelectItem value="no-music" disabled>
                    No music available
                  </SelectItem>
                ) : (
                  musicList.map((music) => (
                    <SelectItem key={music} value={music}>
                      {music}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {selectedMusic &&
            selectedMusic !== "" &&
            selectedMusic !== "error" &&
            selectedMusic !== "no-music" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handlePreviewToggle}
                disabled={!selectedMusic}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isPlaying ? "Pause" : "Preview"}
              </Button>
            )}
        </div>
      </Card>
    </motion.div>
  );
}
