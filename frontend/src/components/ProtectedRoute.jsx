import { Navigate, useLocation } from "react-router-dom"

function safeParseJwt(token) {
  try {
    const parts = String(token || "").split(".")
    if (parts.length !== 3) return null
    const payloadBase64 = parts[1]
    const payload = payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=")
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token")
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    let role = localStorage.getItem("userRole")
    let userId = localStorage.getItem("userId")
    if (!role) {
      const payload = safeParseJwt(token)
      role = payload?.role
      if (role) localStorage.setItem("userRole", String(role).trim().toLowerCase())
    }

    if (role) role = String(role).trim().toLowerCase()

    if (!userId) {
      const payload = safeParseJwt(token)
      userId = payload?.sub
      if (userId) localStorage.setItem("userId", String(userId))
    }

    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}
