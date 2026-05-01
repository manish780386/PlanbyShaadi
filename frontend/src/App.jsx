import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import Navbar          from "./components/Navbar.jsx";
import Footer          from "./components/Footer.jsx";
import ProtectedRoute  from "./components/ProtectedRoute.jsx";

import Home            from "./pages/Home.jsx";
import Vendors         from "./pages/Vendors.jsx";
import VendorDetail    from "./pages/VendorDetail.jsx";
import Chatbot         from "./pages/Chatbot.jsx";
import HowItWorks      from "./pages/HowItWorks.jsx";
import Login           from "./pages/Login.jsx";
import Register        from "./pages/Register.jsx";
import UserDashboard   from "./pages/UserDashboard.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      refetchOnWindowFocus: false,
    },
  },
});

const NO_LAYOUT = ["/login", "/register", "/vendor/login", "/vendor/register"];

function Layout() {
  const location  = useLocation();
  const hideLayout = NO_LAYOUT.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/"            element={<Home />} />
        <Route path="/vendors"     element={<Vendors />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/plan"        element={<Chatbot />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />

        {/* User Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["USER"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Vendor Protected */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute roles={["VENDOR"]}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!hideLayout && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}