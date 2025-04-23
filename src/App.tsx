import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router";
import Layout from "./screens/Layout";
import Loading from "./screens/Loading";
import { Login } from "./screens/Login";

const Workload = lazy(() => import("./screens/Workload"));
const Home = lazy(() => import("./screens/Home"));

function App() {
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
      <Route path="/auth" element={<Login />} />
    </Routes>
  );
}

export default App;
