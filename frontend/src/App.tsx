import { BrowserRouter, Route, Routes } from "react-router-dom";

import { StarField } from "./components/canvas/StarField";
import { GuestRoute, ProtectedRoute } from "./components/RouteGuards";
import { AuthProvider } from "./context/AuthProvider";
import { ToastProvider } from "./context/ToastProvider";
import { AppLayout } from "./layouts/AppLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import TaskDetail from "./pages/TaskDetail";
import Tasks from "./pages/Tasks";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <StarField />
          <div className="pointer-events-none fixed -left-40 -top-40 -z-10 size-[520px] rounded-full bg-violet/10 blur-[120px]" />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Landing />} />
              <Route path="login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="register" element={<GuestRoute><Register /></GuestRoute>} />
            </Route>
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
