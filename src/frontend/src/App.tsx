import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import { ThemeProvider } from "./context/ThemeContext";
import Assets from "./pages/Assets";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Search from "./pages/Search";
import SelectChain from "./pages/SelectChain";
import Support from "./pages/Support";

// Route definitions
const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <Layout>
        <Outlet />
      </Layout>
    </ThemeProvider>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const selectChainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/select-chain",
  beforeLoad: () => {
    if (!localStorage.getItem("brute-activation-key")) {
      throw redirect({ to: "/login" });
    }
  },
  component: SelectChain,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  beforeLoad: () => {
    if (!localStorage.getItem("brute-activation-key")) {
      throw redirect({ to: "/login" });
    }
  },
  component: Search,
});

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets",
  beforeLoad: () => {
    if (!localStorage.getItem("brute-activation-key")) {
      throw redirect({ to: "/login" });
    }
  },
  component: Assets,
});

const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/support",
  component: Support,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  selectChainRoute,
  searchRoute,
  assetsRoute,
  supportRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
