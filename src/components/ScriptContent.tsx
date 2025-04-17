import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Copy, Hash, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScriptContentProps {
  title: string;
  script: string;
  hashtags: string[];
}

export default function ScriptContent({
  title,
  script,
  hashtags,
}: ScriptContentProps) {
  const [copied, setCopied] = useState({
    title: false,
    script: false,
    tags: false,
  });

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

  if (!title || !script || !hashtags) {
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

  if (!title || !script || !hashtags) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No content available. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!title || !script || !hashtags) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No content available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className=" gap-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleCopy(title, "title")}
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
            onClick={() => handleCopy(script, "script")}
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
            onClick={() => handleCopy(hashtags.join(" "), "tags")}
          >
            {copied.tags ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy Tags
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            Upload to Youtube
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Generated Script</p>
      <Card className="p-4">
        <p className="whitespace-pre-wrap text-sm">{script}</p>
      </Card>

      {hashtags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span>Hashtags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
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
