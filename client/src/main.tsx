import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import App from "./App.tsx";
import { Provider as ChakraUiProvider } from "./components/ui/provider.tsx";
import { SocketProvider } from "./providers/SocketProvider.tsx";
import store from "./store";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ChakraUiProvider>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <App />
          </SocketProvider>
        </QueryClientProvider>
      </ChakraUiProvider>
    </ReduxProvider>
  </StrictMode>,
);
