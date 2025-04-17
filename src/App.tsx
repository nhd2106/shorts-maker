import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router";
import Layout from "./screens/Layout";
import Loading from "./screens/Loading";

const Workload = lazy(() => import("./screens/Workload"));
const Home = lazy(() => import("./screens/Home"));

function App() {
  // const [isSidecarRunning, setIsSidecarRunning] = useState(false);
  // const [startupStatus, setStartupStatus] = useState(
  //   "Starting sidecar process..."
  // );
  // const cleanupRef = useRef<(() => void) | null>(null);
  // const isInitializedRef = useRef(false);
  // const startAttemptRef = useRef(false);

  // useEffect(() => {
  //   // Prevent multiple initializations
  //   if (isInitializedRef.current) return;
  //   isInitializedRef.current = true;

  //   const initSidecar = async () => {
  //     // Prevent multiple start attempts
  //     if (startAttemptRef.current) return;
  //     startAttemptRef.current = true;

  //     setIsSidecarRunning(true);
  //     try {
  //       // First try to shutdown any existing sidecar
  //       try {
  //         await shutdownSidecarAction();
  //       } catch (e) {
  //         console.log(e);
  //         console.log("No existing sidecar to shutdown");
  //       }

  //       // Listen for sidecar messages to update status
  //       const cleanup = await startSidecarAction((message) => {
  //         console.log(message);
  //         setStartupStatus(message);
  //         if (message.includes("started successfully")) {
  //           setStartupStatus("Sidecar is running...");
  //         } else if (
  //           message.includes("Error:") ||
  //           message.includes("Failed to execute script")
  //         ) {
  //           setIsSidecarRunning(false);
  //           startAttemptRef.current = false; // Allow retry on error
  //           toast.error(message);
  //         }
  //       });
  //       cleanupRef.current = cleanup;
  //     } catch (error) {
  //       toast.error(`Failed to start sidecar process: ${error}`);
  //       setStartupStatus(`Failed to start sidecar: ${error}`);
  //       setIsSidecarRunning(false);
  //       startAttemptRef.current = false; // Allow retry on error
  //     }
  //   };

  //   initSidecar();

  //   // Cleanup function
  //   return () => {
  //     if (cleanupRef.current) {
  //       cleanupRef.current();
  //     }
  //     shutdownSidecarAction().catch((err) => {
  //       console.error("Failed to shutdown sidecar:", err);
  //       toast.error("Failed to shutdown sidecar");
  //     });
  //   };
  // }, []);

  // if (isSidecarRunning) {
  //   return <Loading status={startupStatus} />;
  // }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<Loading status="Loading application..." />}>
            <Layout />
          </Suspense>
        }
      >
        <Route index element={<Home />} />
        <Route path=":id" element={<Workload />} />
      </Route>
    </Routes>
  );
}

export default App;
