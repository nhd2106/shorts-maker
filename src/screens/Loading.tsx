import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  status: string;
}

export default function Loading({ status }: LoadingProps) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Initializing Shorts Maker
          </h1>
        </div>
        <div className="max-w-[400px] space-y-2">
          <p className="text-sm text-muted-foreground">{status}</p>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
