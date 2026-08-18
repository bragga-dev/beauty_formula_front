import { AppRouter } from "@/app/router/AppRouter";
import { QueryProvider } from "@/app/providers/query-provider";
import { AuthProvider } from "@/app/providers/auth-context";
import { ToastProvider } from "@/app/providers/toast-context";
import { ErrorBoundary } from "@/app/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}