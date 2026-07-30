import { AppRouter } from "@/app/router/AppRouter";
import { QueryProvider } from "@/app/providers/query-provider";
import { AuthProvider } from "@/app/providers/auth-context";
import { ToastProvider } from "@/app/providers/toast-context";

export default function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
