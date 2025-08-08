import "./index.css";

import "./index.css";

import JWTDecoder from "./components/JWTDecoder";
import { Toaster } from "sonner";

export function App() {
  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <div className="w-screen h-screen min-h-screen">
        <JWTDecoder />
      </div>
    </>
  );
}

export default App;
