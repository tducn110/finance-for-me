import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Bills from "./pages/Bills";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Wireframes from "./pages/Wireframes";
import UserFlows from "./pages/UserFlows";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-7xl">😕</div>
      <h1 className="text-[24px] font-bold" style={{ color: "#1E293B" }}>Trang không tồn tại</h1>
      <a href="/" className="text-[14px] font-medium" style={{ color: "#3B82F6" }}>← Về Dashboard</a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/wireframes",
    Component: Wireframes,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "transactions", Component: Transactions },
      { path: "goals", Component: Goals },
      { path: "bills", Component: Bills },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
      { path: "userflows", Component: UserFlows },
      { path: "*", Component: NotFound },
    ],
  },
]);