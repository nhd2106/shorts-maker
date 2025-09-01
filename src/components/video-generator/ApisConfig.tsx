import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ApiKeys = {
  openai: string;
  together: string;
  elevenlabs: string;
  google: string;
};

const ApisConfig = () => {
  const [open, setOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    const savedKeys = localStorage.getItem("api-keys");
    return savedKeys
      ? JSON.parse(savedKeys)
      : {
          openai: "",
          together: "",
          elevenlabs: "",
          google: "",
        };
  });

  const handleSaveApiKeys = () => {
    localStorage.setItem("api-keys", JSON.stringify(apiKeys));
    toast.success("API keys saved");
  };
  return (
    <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure API Keys
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="openai">
                OpenAI API Key{" "}
                <span className="text-xs text-blue-500 underline">
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    target="_blank"
                  >
                    Get API Key
                  </a>
                </span>
              </Label>
              <Input
                id="openai"
                type="password"
                value={apiKeys.openai}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, openai: e.target.value })
                }
                placeholder="sk-..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="together">
                Together AI API Key{" "}
                <span className="text-xs text-blue-500 underline">
                  <a href="https://api.together.ai/signin" target="_blank">
                    Get API Key
                  </a>
                </span>
              </Label>
              <Input
                id="together"
                type="password"
                value={apiKeys.together}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, together: e.target.value })
                }
                placeholder="tok-..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elevenlabs">
                ElevenLabs API Key{" "}
                <span className="text-xs text-blue-500 underline">
                  <a href="https://elevenlabs.io/app/home" target="_blank">
                    Get API Key
                  </a>
                </span>
              </Label>
              <Input
                id="elevenlabs"
                type="password"
                value={apiKeys.elevenlabs}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, elevenlabs: e.target.value })
                }
              />
            </div>
            {/* TODO: add google api key selection */}
            <div className="space-y-2">
              <Label htmlFor="google">
                Google API Key{" "}
                <span className="text-xs text-blue-500 underline">
                  <a
                    href="https://console.developers.google.com/"
                    target="_blank"
                  >
                    Get API Key
                  </a>
                </span>
              </Label>
              <Input
                id="google"
                type="password"
                value={apiKeys.google}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, google: e.target.value })
                }
              />
            </div>
            <Button onClick={handleSaveApiKeys} className="w-full">
              Save API Keys
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

ApisConfig.propTypes = {};

export default ApisConfig;
