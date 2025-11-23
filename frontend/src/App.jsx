import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./routes";
import {
  AdminAdditives,
  AdminAllergens,
  AdminDashboard,
  AdminDiseases,
  AdminHistory,
  AdminUsers,
  AdminArticles,
  AdminLocalization,
  AdminProducts,
} from "./pages/admin";
import {
  Home,
  Login,
  Register,
  ForgotPassword,
  Dashboard,
  Products,
  Profile,
  Scanner,
  Favorites,
  History,
  HistoryDetail,
  Articles,
  ArticleDetail,
  About,
  FAQ,
  Contact,
  Privacy,
  Terms,
  NotFound,
} from "./pages";
import { useTheme } from "./hooks/useCommon";

const queryClient = new QueryClient();

function App() {
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            {/* --- PUBLIC ROUTES (Guest & User) --- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Core Features (Bisa Guest sesuai SRS) */}
            <Route path="/products" element={<Products />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:type/:id" element={<HistoryDetail />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />

            {/* Static Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* --- PROTECTED ROUTES (Login Required) --- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/history"
              element={
                <AdminRoute>
                  <AdminHistory />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/allergens"
              element={
                <AdminRoute>
                  <AdminAllergens />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/additives"
              element={
                <AdminRoute>
                  <AdminAdditives />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/diseases"
              element={
                <AdminRoute>
                  <AdminDiseases />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/articles"
              element={
                <AdminRoute>
                  <AdminArticles />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/localization"
              element={
                <AdminRoute>
                  <AdminLocalization />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
