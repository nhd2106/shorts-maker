import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Copy, Hash, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScriptContentProps {
  content: {
    filename: string;
    url: string;
  };
}

export default function ScriptContent({ content }: ScriptContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState({
    title: false,
    script: false,
    tags: false,
  });
  const [parsedContent, setParsedContent] = useState<{
    title: string;
    script: string;
    hashtags: string[];
  } | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!content.url) {
          throw new Error("No content URL provided");
        }

        const response = await fetch(content.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.statusText}`);
        }

        const text = await response.text();

        const parsed = parseContent(text);

        if (!parsed) {
          throw new Error("Failed to parse content");
        }

        setParsedContent(parsed);
      } catch (err) {
        console.log("Error fetching content:", err);
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    if (content.url) {
      fetchContent();
    }
  }, [content?.url]);

  const handleCopy = async (
    text: string,
    type: "title" | "script" | "tags"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [type]: true }));
      toast.success("Copied to clipboard!");
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy text");
      console.error("Failed to copy text", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!parsedContent) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No content available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{parsedContent.title}</h3>
          <p className="text-sm text-muted-foreground">Generated Script</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleCopy(parsedContent.title, "title")}
          >
            {copied.title ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy Title
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleCopy(parsedContent.script, "script")}
          >
            {copied.script ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy Script
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleCopy(parsedContent.hashtags.join(" "), "tags")}
          >
            {copied.tags ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy Tags
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <p className="whitespace-pre-wrap text-sm">{parsedContent.script}</p>
      </Card>

      {parsedContent.hashtags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span>Hashtags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {parsedContent.hashtags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleCopy(tag, "tags")}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function parseContent(content: string) {
  try {
    // Remove any BOM characters that might be present
    content = content.replace(/^\uFEFF/, "");

    // Split content by newlines and filter out empty lines
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length === 0) {
      throw new Error("Content is empty");
    }

    // First non-empty line is the title
    const title = lines[0].trim();

    // Find hashtags (they usually start with #)
    const hashtagLine = lines.find((line) => line.includes("#")) || "";
    const hashtags = hashtagLine
      .split(" ")
      .filter((word) => word.startsWith("#"))
      .map((tag) => tag.trim());

    // Everything between title and hashtags is the script
    const scriptLines = lines
      .slice(1, hashtags.length > 0 ? lines.indexOf(hashtagLine) : undefined)
      .filter((line) => line.trim() && !line.includes("#"));

    const script = scriptLines.join("\n").trim();

    return {
      title,
      script,
      hashtags: hashtags.length > 0 ? hashtags : [],
    };
  } catch (err) {
    console.log("Error parsing content:", err);
    return null;
  }
}
