import React, { useLayoutEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CartDrawer from "./components/cart/CartDrawer";

// Store pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import MyAccount from "./pages/MyAccount";
import MyOrders from "./pages/MyOrders";
import InfoPage from "./pages/InfoPage";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute";


// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Brands from "./pages/admin/Brands";
import ProductsAdmin from "./pages/admin/Products";
import ProductForm from "./pages/admin/ProductForm";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import Reviews from "./pages/admin/Reviews";
import AdminRoute from "./routes/AdminRoute";
import { useAuth } from "./context/AuthContext";
import { useI18n } from "./context/I18nContext";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function GuestOnlyRoute({ children }) {
  const { user, booting } = useAuth();

  if (booting) return null;

  if (user) {
    const destination = String(user?.role || "").toLowerCase() === "admin" ? "/admin" : "/";
    return <Navigate to={destination} replace />;
  }

  return children;
}

function AppContent() {
  const loc = useLocation();
  const { booting } = useAuth();
  const { pick } = useI18n();
  const isAdminArea = loc.pathname.startsWith("/admin");
  const ui = pick({
    fr: { loading: "Chargement..." },
    en: { loading: "Loading..." },
    ar: { loading: "جارٍ التحميل..." },
  });

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
          {ui.loading}
        </div>
      </div>
    );
  }

  return (
    <>
      {!isAdminArea && <Header />}
      {!isAdminArea && <CartDrawer />}

      <Routes>
        {/* =======================
            PUBLIC STORE ROUTES
        ======================== */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<CartPage />} />

        {/* =======================
            AUTH ROUTES
        ======================== */}
        <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
        <Route path="/register" element={<GuestOnlyRoute><Register /></GuestOnlyRoute>} />

        <Route path="/forgot-password" element={<GuestOnlyRoute><ForgotPassword /></GuestOnlyRoute>} />
        <Route path="/reset-password" element={<GuestOnlyRoute><ResetPassword /></GuestOnlyRoute>} />

        {/* =======================
            PROTECTED STORE ROUTES
        ======================== */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/my-account"
          element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route path="/info/:slug" element={<InfoPage />} />

        {/* =======================
            ADMIN ROUTES (PROTECTED + ROLE)
        ======================== */}
        <Route path="/admin" element={
          <AdminRoute>
          <AdminLayout/>
          </AdminRoute>
          }>

          <Route index element={<Dashboard/>}/>
          <Route path="categories" element={<Categories/>}/>
          <Route path="brands" element={<Brands/>}/>
          <Route path="products" element={<ProductsAdmin/>}/>
          <Route path="products/new" element={<ProductForm/>}/>
          <Route path="products/:id/edit" element={<ProductForm/>}/>
          <Route path="orders" element={<Orders/>}/>
          <Route path="users" element={<Users/>}/>
          <Route path="reviews" element={<Reviews/>}/>

          </Route>

      
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminArea && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
