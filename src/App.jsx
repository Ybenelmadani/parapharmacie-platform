import React, { useEffect } from "react";
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

function StoreOnlyRoute({ children }) {
  const { user, booting } = useAuth();

  if (booting) return null;

  if (String(user?.role || "").toLowerCase() === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function AppContent() {
  const loc = useLocation();
  const { booting } = useAuth();
  const isAdminArea = loc.pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
          Loading...
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
        <Route path="/" element={<StoreOnlyRoute><Home /></StoreOnlyRoute>} />
        <Route path="/products" element={<StoreOnlyRoute><Products /></StoreOnlyRoute>} />
        <Route path="/products/:id" element={<StoreOnlyRoute><ProductDetails /></StoreOnlyRoute>} />
        <Route path="/cart" element={<StoreOnlyRoute><CartPage /></StoreOnlyRoute>} />

        {/* =======================
            AUTH ROUTES
        ======================== */}
        <Route path="/login" element={<StoreOnlyRoute><Login /></StoreOnlyRoute>} />
        <Route path="/register" element={<StoreOnlyRoute><Register /></StoreOnlyRoute>} />

        {/* =======================
            PROTECTED STORE ROUTES
        ======================== */}
        <Route
          path="/checkout"
          element={
            <StoreOnlyRoute>
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            </StoreOnlyRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <StoreOnlyRoute>
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            </StoreOnlyRoute>
          }
        />
        <Route path="/info/:slug" element={<StoreOnlyRoute><InfoPage /></StoreOnlyRoute>} />

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
