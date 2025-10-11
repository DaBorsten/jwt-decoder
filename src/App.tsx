import React from "react";
import "./index.css";

import "./index.css";

import JWTDecoder from "./components/JWTDecoder";
import { Toaster } from "sonner";

export function App() {
  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <main id="main" role="main" tabIndex={-1} className="w-screen h-screen min-h-screen">
        <JWTDecoder />
      </main>
    </>
  );
}

export default App;
