import { RouterProvider } from "react-router-dom";
import router from "./routers";
import { ErrorProvider } from "./components/ErrorPopup";

function App() {
  return (
    <ErrorProvider>
      <RouterProvider router={router} />
    </ErrorProvider>
  );
}

export default App;
