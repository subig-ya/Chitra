import { Routes, Route, Outlet } from "react-router-dom";
import RequireAuth from "./components/RequireAuth.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import Landing from "./pages/Landing.jsx";
import Feed from "./pages/Feed.jsx";
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/feed" element={<Feed />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/artworks/:id" element={<ArtworkDetail />} />
        <Route path="/artists" element={<Home />} />
        <Route path="/artists/:id" element={<ArtistDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:id" element={<StoryDetail />} />
        <Route path="/advisory" element={<Advisory />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/messages" element={<Conversations />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payment/return" element={<PaymentReturn />} />
        <Route
          path="/artworks/mine"
          element={
            <RequireAuth roles={["artist"]}>
              <MyArtworks />
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

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
