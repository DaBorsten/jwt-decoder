import "./index.css";

import "./index.css";

import JWTDecoder from "./components/JWTDecoder";
import { Toaster } from "sonner";

export function App() {
  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <div className="container mx-auto p-8">
        <JWTDecoder />
      </div>
    </>
  );
}

export default App;
