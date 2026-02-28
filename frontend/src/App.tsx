import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { fetchMe } from './store/slices/authSlice'

import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ItemsPage from './pages/items/ItemsPage'
import ItemDetailPage from './pages/items/ItemDetailPage'
import ReportItemPage from './pages/items/ReportItemPage'
import MatchesPage from './pages/MatchesPage'
import MatchDetailPage from './pages/MatchDetailPage'
import ChatListPage from './pages/chat/ChatListPage'
import ChatRoomPage from './pages/chat/ChatRoomPage'
import ClaimsPage from './pages/ClaimsPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminChats from './pages/admin/AdminChats'
import AdminItems from './pages/admin/AdminItems'
import AdminClaims from './pages/admin/AdminClaims'

export default function App() {
  const dispatch = useAppDispatch()
  const { accessToken } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (accessToken) dispatch(fetchMe())
  }, [accessToken, dispatch])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/items/report" element={<ReportItemPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:id" element={<MatchDetailPage />} />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:roomId" element={<ChatRoomPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin — also requires ADMIN or SECURITY role */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/items" element={<AdminItems />} />
              <Route path="/admin/chats" element={<AdminChats />} />
              <Route path="/admin/claims" element={<AdminClaims />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
