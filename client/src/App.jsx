import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ArtworkDetail from "./pages/ArtworkDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import MyArtworks from "./pages/MyArtworks.jsx";
import Collections from "./pages/Collections.jsx";
import CollectionDetail from "./pages/CollectionDetail.jsx";
import Stories from "./pages/Stories.jsx";
import StoryDetail from "./pages/StoryDetail.jsx";
import Advisory from "./pages/Advisory.jsx";
import Conversations from "./pages/Conversations.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ArtistDetail from "./pages/ArtistDetail.jsx";
import Requests from "./pages/Requests.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import PaymentReturn from "./pages/PaymentReturn.jsx";
import Profile from "./pages/Profile.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import NotFound from "./pages/NotFound.jsx";
import PanelLayout from "./components/panel/PanelLayout.jsx";
import PanelOverview from "./pages/panel/PanelOverview.jsx";
import PanelNotifications from "./pages/panel/PanelNotifications.jsx";
import PanelReports from "./pages/panel/PanelReports.jsx";
import PanelSettings from "./pages/panel/PanelSettings.jsx";

function MarketplaceLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<MarketplaceLayout />}>
        <Route path="/shop" element={<Shop />} />
        <Route path="/artworks/:id" element={<ArtworkDetail />} />
        <Route path="/artists" element={<Home />} />
        <Route path="/artists/:id" element={<ArtistDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:id" element={<StoryDetail />} />
        <Route path="/advisory" element={<Advisory />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment/return" element={<PaymentReturn />} />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <Cart />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="/wishlist"
          element={
            <RequireAuth>
              <Wishlist />
            </RequireAuth>
          }
        />
        <Route
          path="/messages"
          element={
            <RequireAuth>
              <Conversations />
            </RequireAuth>
          }
        />
        <Route
          path="/artworks/mine"
          element={
            <RequireAuth roles={["artist"]}>
              <MyArtworks />
            </RequireAuth>
          }
        />
        <Route
          path="/requests"
          element={
            <RequireAuth>
              <Requests />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <Orders />
            </RequireAuth>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <RequireAuth>
              <OrderDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth roles={["admin"]}>
              <AdminPanel />
            </RequireAuth>
          }
        />
      </Route>

      <Route
        path="/panel"
        element={
          <RequireAuth roles={["artist", "buyer"]}>
            <PanelLayout />
          </RequireAuth>
        }
      >
        <Route index element={<PanelOverview />} />
        <Route
          path="artworks"
          element={<MyArtworks />}
        />
        <Route path="orders" element={<Orders />} />
        <Route path="favourites" element={<Wishlist />} />
        <Route path="requests" element={<Requests />} />
        <Route path="messages" element={<Conversations />} />
        <Route path="notifications" element={<PanelNotifications />} />
        <Route path="reports" element={<PanelReports />} />
        <Route path="settings" element={<PanelSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
