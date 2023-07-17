import { ConnectWallet } from "@thirdweb-dev/react";
import "./index.css";

import Content from "./components/Content"
import MainApp from "./components/MainApp";
import NavBar from "./components/NavBar"
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function Home() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={() => (<div className=" flex h-screen bg-[#181818] bg-[url('./assets/span.png')] bg-cover flex-col  justify-between" >
          <NavBar />
          <Content />
        </div>)} />
        <Route path="/app" element={<MainApp />} />

      </Routes>
    </BrowserRouter>
  );
}
