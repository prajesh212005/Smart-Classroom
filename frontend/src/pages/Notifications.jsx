import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Users,
  Calendar,
  LayoutDashboard,
  BookOpen,
  Home,
  Bell,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Check,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("notifications")

  const userRole = (localStorage.getItem("userRole") || "student").toLowerCase()
  const isFacultyUser = userRole === "faculty"

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    navigate("/", { replace: true })
  }

  // Modern design updates
  const createModernSidebar = () => (
    <div className="w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-slate-700/50 shadow-2xl relative z-10 flex flex-col">
      <div className="p-8 space-y-8 flex-1">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/20 border border-slate-700/60">
            <div className="h-10 w-10 rounded-lg bg-slate-900/40 border border-slate-700/60 flex items-center justify-center">
              <span className="text-sm font-bold gradient-text">SC</span>
            </div>
            <div className="text-sm font-semibold text-slate-100">Smart Classroom</div>
          </div>
        </div>

        <nav className="space-y-2">
          {visibleNavigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeNavItem === item.id
            return (
              <Link key={item.id} to={item.path} onClick={() => setActiveNavItem(item.id)}>
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group/item cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <IconComponent className={`w-5 h-5 transition-all duration-300`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-700/50">
        <Button
          variant="outline"
          onClick={logout}
          className="w-full mt-4 border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
        >
          Logout
        </Button>
      </div>
    </div>
  )
  const [notificationToDelete, setNotificationToDelete] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "low",
  })

  const resetForm = () => {
    setFormData({ title: "", message: "", type: "info", priority: "low" })
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5000/api/notifications")
      setNotifications(Array.isArray(res.data) ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleSubmitNotification = async (e) => {
    e.preventDefault()
    if (!isFacultyUser) return
    setFormLoading(true)
    try {
      await axios.post("http://localhost:5000/api/notifications", formData)
      resetForm()
      setShowForm(false)
      fetchNotifications()
    } catch (error) {
      console.error("Error creating notification:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return
    if (!isFacultyUser) return
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${notificationToDelete._id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== notificationToDelete._id))
    } catch (error) {
      console.error("Error deleting notification:", error)
    } finally {
      setNotificationToDelete(null) // Close the confirmation modal
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id)
    try {
      await Promise.all(unreadIds.map((id) => axios.put(`http://localhost:5000/api/notifications/${id}/read`)))
      fetchNotifications()
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
    { id: "classrooms", label: "Classrooms", icon: BookOpen, path: "/classrooms" },
    { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  const visibleNavigationItems = isFacultyUser
    ? navigationItems.filter((item) => item.id !== "rooms")
    : navigationItems.filter((item) => !["courses", "rooms"].includes(item.id))

  const getNotificationIcon = (type) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getNotificationColor = (type, isRead) => {
    if (isRead) return "bg-slate-800/40 border-slate-700/50"
    switch (type) {
      case "error":
        return "bg-red-500/10 border-red-400/30 border-l-4 border-l-red-400"
      case "warning":
        return "bg-yellow-500/10 border-yellow-400/30 border-l-4 border-l-yellow-400"
      case "success":
        return "bg-green-500/10 border-green-400/30 border-l-4 border-l-green-400"
      case "info":
      default:
        return "bg-blue-500/10 border-blue-400/30 border-l-4 border-l-blue-400"
    }
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500/20 to-rose-600/20 text-red-300 border-red-500/30"
      case "medium":
        return "bg-gradient-to-r from-yellow-500/20 to-amber-600/20 text-yellow-300 border-yellow-500/30"
      case "low":
      default:
        return "bg-gradient-to-r from-slate-600/20 to-slate-700/20 text-slate-300 border-slate-500/30"
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="flex h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s"></div>
      </div>

      {/* Modern Sidebar */}
      <aside className="relative z-10 w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-slate-700/50 shadow-2xl flex flex-col">
        <div className="p-8 space-y-8 flex-1">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/20 border border-slate-700/60">
              <div className="h-10 w-10 rounded-lg bg-slate-900/40 border border-slate-700/60 flex items-center justify-center">
                <span className="text-sm font-bold gradient-text">SC</span>
              </div>
              <div className="text-sm font-semibold text-slate-100">Smart Classroom</div>
            </div>
          </div>

          <nav className="space-y-2">
            {visibleNavigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeNavItem === item.id
              return (
                <Link key={item.id} to={item.path} onClick={() => setActiveNavItem(item.id)}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group/item cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 transition-all duration-300`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-700/50">
          <Button
            variant="outline"
            onClick={logout}
            className="w-full mt-4 border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-5xl lg:text-6xl font-bold text-white">Notifications</h1>
                <p className="text-lg text-slate-400 max-w-2xl">
                  Manage system-wide alerts and informational messages for all users.
                </p>
              </div>
              {isFacultyUser ? (
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/40 transition-all duration-300 px-6 py-3 rounded-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Notification
                </Button>
              ) : (
                <Badge className="bg-slate-700/40 border border-slate-700/60 text-slate-200">Student view</Badge>
              )}
            </div>
          </div>

        {isFacultyUser && showForm && (
          <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10 animate-fade-in-up">
            <CardHeader className="border-b border-slate-700/50 p-6">
              <CardTitle className="text-xl font-semibold text-white">Create New Notification</CardTitle>
              <CardDescription className="text-slate-400">This will be broadcasted to system users.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitNotification} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 font-medium">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50 focus:border-blue-500 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 text-slate-200">
                        <SelectItem value="info" className="hover:bg-slate-700/50 focus:bg-slate-700/50">ℹ️ Info</SelectItem>
                        <SelectItem value="success" className="hover:bg-slate-700/50 focus:bg-slate-700/50">✅ Success</SelectItem>
                        <SelectItem value="warning" className="hover:bg-slate-700/50 focus:bg-slate-700/50">⚠️ Warning</SelectItem>
                        <SelectItem value="error" className="hover:bg-slate-700/50 focus:bg-slate-700/50">❌ Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 font-medium">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600/50 focus:border-blue-500 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 text-slate-200">
                        <SelectItem value="low" className="hover:bg-slate-700/50 focus:bg-slate-700/50">Low</SelectItem>
                        <SelectItem value="medium" className="hover:bg-slate-700/50 focus:bg-slate-700/50">Medium</SelectItem>
                        <SelectItem value="high" className="hover:bg-slate-700/50 focus:bg-slate-700/50">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300 font-medium">Title</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Enter notification title" className="mt-1 bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70" />
                </div>
                <div>
                  <Label className="text-slate-300 font-medium">Message</Label>
                  <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required placeholder="Enter notification message" className="mt-1 bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70 resize-none min-h-24" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={formLoading} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/40 transition-all duration-300 border-0">{formLoading ? "Sending..." : "Send Notification"}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 hover:border-slate-500/70 backdrop-blur-sm transition-all duration-300">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10 animate-fade-in-up">
          <CardHeader className="border-b border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-white">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30 backdrop-blur-sm">
                    <Bell className="h-5 w-5 text-blue-300" />
                  </div>
                  Notification Feed
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {notifications.length} total notifications • {unreadCount} unread
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0} className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 hover:border-slate-500/70 backdrop-blur-sm transition-all duration-300">
                Mark All as Read
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse opacity-75"></div>
                  <div className="absolute inset-1 bg-slate-950 rounded-full"></div>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <div className="flex justify-center mb-4">
                  <Bell className="h-12 w-12 text-slate-600" />
                </div>
                <h3 className="text-sm font-medium text-slate-300">All caught up!</h3>
                <p className="mt-1 text-sm text-slate-500">There are no new notifications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n, index) => (
                  <div
                    key={n._id}
                    className={`p-4 rounded-lg border flex items-start justify-between gap-4 transition-all duration-300 backdrop-blur-sm group/item cursor-pointer hover:shadow-lg ${
                      getNotificationColor(n.type, n.isRead)
                    } animate-fade-in-up`}
                    style={{ "--animation-delay": `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1 flex-shrink-0 text-xl">{getNotificationIcon(n.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold transition-colors ${n.isRead ? "text-slate-400" : "text-slate-100"}`}>{n.title}</p>
                          <Badge
                            variant="outline"
                            className={`capitalize text-xs font-medium ${
                              n.priority === "high"
                                ? "bg-red-500/10 border-red-500/30 text-red-300"
                                : n.priority === "medium"
                                  ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            }`}
                          >
                            {n.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">{n.message}</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          onClick={() => handleMarkAsRead(n._id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {isFacultyUser ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          onClick={() => setNotificationToDelete(n)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </main>

      {notificationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </CardTitle>
              <CardDescription className="text-slate-400">
                Are you sure you want to delete this notification? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-2">
                <p className="font-bold text-slate-200">{notificationToDelete.title}</p>
                <p className="text-slate-400">{notificationToDelete.message}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-slate-900/50 p-4 rounded-b-lg border-t border-slate-700">
              <Button
                variant="outline"
                onClick={() => setNotificationToDelete(null)}
                className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 hover:border-slate-500/70 backdrop-blur-sm transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteNotification}
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/40 transition-all border-0"
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}