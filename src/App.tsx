import { Home } from "./screens/Home";
import { Route, Routes } from "react-router";
import Workload from "./screens/Workload";
import Layout from "./screens/Layout";
import { startSidecarAction } from "./api";
import { useEffect } from "react";

function App() {
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }
  useEffect(() => {
    startSidecarAction();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path=":id" element={<Workload />} />
      </Route>
    </Routes>
  );
}

export default App;
