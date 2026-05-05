"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  Plus,
  Sparkles,
  Users,
  BookOpen,
  Home,
  CheckCircle,
  Bell,
  LayoutDashboard,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [faculty, setFaculty] = useState([])
  const [rooms, setRooms] = useState([])
  const [timetables, setTimetables] = useState([])
  const [notifications, setNotifications] = useState([])
  const [pendingTasks, setPendingTasks] = useState(0)
  const [activeNavItem, setActiveNavItem] = useState("dashboard")

  const userRole = (localStorage.getItem("userRole") || "student").toLowerCase()
  const isFacultyUser = userRole === "faculty"

  const currentUserId = localStorage.getItem("userId") || ""
  const currentUserName = localStorage.getItem("userName") || ""

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    navigate("/", { replace: true })
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, facultyRes, roomsRes, timetablesRes, notificationsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/courses"),
          axios.get("http://localhost:5000/api/faculty"),
          axios.get("http://localhost:5000/api/rooms"),
          axios.get("http://localhost:5000/api/timetables"),
          axios.get("http://localhost:5000/api/notifications"),
        ])

        setCourses(coursesRes.data)
        setFaculty(facultyRes.data)
        setRooms(roomsRes.data)
        setTimetables(timetablesRes.data)
        setNotifications(notificationsRes.data)

        if (!isFacultyUser) {
          try {
            const pendingRes = await axios.get("http://localhost:5000/api/classrooms/pending-tasks", {
              params: {
                studentId: currentUserId,
                studentName: currentUserName,
              },
            })
            setPendingTasks(Number(pendingRes.data?.pendingTasks || 0))
          } catch (error) {
            console.error("Failed to fetch pending tasks:", error)
            setPendingTasks(0)
          }
        } else {
          setPendingTasks(0)
        }

        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // --- Loading State with enhanced animations ---
  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s"></div>
        </div>

        {/* Sidebar Loading */}
        <div className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700 shadow-2xl relative z-10">
          <div className="p-6 space-y-6">
            <div className="h-8 bg-slate-700 animate-pulse rounded-xl w-32" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-700 animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Loading */}
        <div className="flex-1 p-8 relative z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="h-12 bg-slate-700 animate-pulse rounded-xl w-80" />
            <div className="h-6 bg-slate-700 animate-pulse rounded-lg w-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-800 animate-pulse rounded-2xl shadow-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    totalCourses: courses.length,
    totalRooms: rooms.length,
    totalTimetables: timetables.length,
    utilizationRate: timetables.length
      ? Math.round((timetables.filter((t) => t.schedule?.length).length / timetables.length) * 100)
      : 0,
    pendingTasks,
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead).length

  const recentTimetables = timetables.slice(0, 3)
  const recentNotifications = notifications.slice(0, 3)

  const statCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "from-blue-400 to-cyan-400",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: Home,
      color: "from-violet-400 to-purple-400",
      bgColor: "from-violet-500/10 to-purple-500/10",
      iconBg: "bg-violet-500/20",
      iconColor: "text-violet-400",
      borderColor: "border-violet-500/20",
    },
    {
      title: "Total Timetables",
      value: stats.totalTimetables,
      icon: Calendar,
      color: "from-amber-400 to-orange-400",
      bgColor: "from-amber-500/10 to-orange-500/10",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Bell,
      color: "from-orange-400 to-red-400",
      bgColor: "from-orange-500/10 to-red-500/10",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
      borderColor: "border-orange-500/20",
    },
  ]

  return (
    <div className="flex h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-6s"></div>
      </div>

      {/* Modern Sidebar */}
      <div className="w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-slate-700/50 shadow-2xl relative z-10 flex flex-col group">
        <div className="p-8 space-y-8 flex-1">
          {/* Logo & Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/20 border border-slate-700/60">
              <div className="h-10 w-10 rounded-lg bg-slate-900/40 border border-slate-700/60 flex items-center justify-center">
                <span className="text-sm font-bold gradient-text">SC</span>
              </div>
              <div className="text-sm font-semibold text-slate-100">Smart Classroom</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {visibleNavigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeNavItem === item.id
              return (
                <Link key={item.id} to={item.path} onClick={() => setActiveNavItem(item.id)}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group/item cursor-pointer ${ isActive
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 transition-all duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover/item:text-slate-200"}`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.id === "notifications" && unreadNotifications > 0 && (
                      <div className="ml-auto bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {unreadNotifications}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="p-8 space-y-8">
          {/* Header Section */}
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-3 animate-fade-in-up">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Dashboard
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                  Monitor and manage your smart classroom scheduling system with real-time insights and analytics.
                </p>
              </div>
              <div className="flex gap-3 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <Link to="/timetables">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 px-6 py-3 rounded-xl border border-blue-400/30 font-medium">
                    <Calendar className="h-5 w-5 mr-2" />
                    View Timetables
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((stat, index) => {
              const IconComponent = stat.icon
              return (
              <Card
                  key={index}
                  className={`bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/30 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-2 group animate-fade-in-up`}
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.bgColor} border border-slate-700/50 group-hover:border-slate-600/80 transition-all duration-300 group-hover:scale-110`}>
                          <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                        </div>
                        <TrendingUp className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                        <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`h-1.5 rounded-full bg-gradient-to-r ${stat.color} opacity-30 group-hover:opacity-100 transition-opacity duration-300`} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Timetables Section */}
            <div className="xl:col-span-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader className="border-b border-slate-700/50 p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        Recent Timetables
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Latest generated schedules and their status
                      </CardDescription>
                    </div>
                    <Link to="/timetables">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 bg-slate-700/40 hover:bg-slate-600/60 text-slate-200 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-300 rounded-lg"
                      >
                        View All →
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {recentTimetables.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center backdrop-blur-sm border border-blue-500/20">
                        <Calendar className="h-12 w-12 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-white">No Timetables Yet</h3>
                      <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                        Create your first timetable to get started with scheduling your classes and resources.
                      </p>
                      <Link to="/timetables/generate">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/40 transition-all duration-300 rounded-xl">
                          <Plus className="h-5 w-5 mr-2" />
                          Generate Timetable
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentTimetables.map((t) => (
                        <div
                          key={t._id}
                          className="flex items-center justify-between p-5 bg-slate-700/20 border border-slate-600/30 rounded-xl hover:bg-slate-600/40 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm group/item"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="font-semibold text-white text-lg group-hover/item:text-blue-400 transition-colors">{t.name}</h4>
                              <Badge
                                variant={t.status === "published" ? "default" : "secondary"}
                                className={
                                  t.status === "published"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-slate-600/30 text-slate-300 border-slate-500/30"
                                }
                              >
                                {t.status}
                              </Badge>
                              {t.conflicts?.length > 0 && (
                                <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                                  {t.conflicts.length} conflicts
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-400">
                              {t.department} • Semester {t.semester} • {t.schedule?.length || 0} classes scheduled
                            </p>
                          </div>
                          <Link to={`/timetables/`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 bg-slate-700/30 hover:bg-slate-600/50 text-slate-200 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-300 rounded-lg ml-4 whitespace-nowrap"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              {/* Quick Actions */}
              <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-slate-700/50 p-6">
                  <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-slate-400">Frequently used operations</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-3 flex flex-col">
                  <Link to="/courses" className="group">
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/40 hover:to-cyan-600/40 border border-blue-500/20 hover:border-blue-500/40 text-slate-200 hover:text-blue-300 transition-all duration-300 h-11 rounded-xl font-medium"
                    >
                      <Plus className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                      Add Course
                    </Button>
                  </Link>
                  <Link to="/rooms" className="group">
                    <Button
                      className="w-full justify-start bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/40 hover:to-purple-600/40 border border-violet-500/20 hover:border-violet-500/40 text-slate-200 hover:text-violet-300 transition-all duration-300 h-11 rounded-xl font-medium"
                    >
                      <Home className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                      Add Room
                    </Button>
                  </Link>
                  <Link to="/timetables/generate" className="group pt-2">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 h-11 rounded-xl font-medium">
                      <Sparkles className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                      Generate Timetable
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-slate-700/50 p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <Bell className="h-5 w-5 text-amber-400" />
                        Notifications
                      </CardTitle>
                      <CardDescription className="text-slate-400">Recent system alerts</CardDescription>
                    </div>
                    <Link to="/notifications">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 bg-slate-700/30 hover:bg-slate-600/50 text-slate-200 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-300 rounded-lg"
                      >
                        View All →
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentNotifications.map((n) => (
                        <div
                          key={n._id}
                          className="flex items-start gap-4 p-4 bg-slate-700/20 border border-slate-600/30 rounded-xl hover:bg-slate-600/40 hover:border-blue-500/20 transition-all duration-300 backdrop-blur-sm group/notif"
                        >
                          <div
                            className={`p-2.5 rounded-lg flex-shrink-0 ${
                              n.type === "error"
                                ? "bg-red-500/20 border border-red-500/30 group-hover/notif:border-red-500/50"
                                : n.type === "warning"
                                  ? "bg-amber-500/20 border border-amber-500/30 group-hover/notif:border-amber-500/50"
                                  : n.type === "success"
                                    ? "bg-green-500/20 border border-green-500/30 group-hover/notif:border-green-500/50"
                                    : "bg-blue-500/20 border border-blue-500/30 group-hover/notif:border-blue-500/50"
                            } transition-all duration-300`}
                          >
                            {["error", "warning"].includes(n.type) ? (
                              <AlertTriangle
                                className={`h-4 w-4 ${n.type === "error" ? "text-red-400" : "text-amber-400"}`}
                              />
                            ) : (
                              <TrendingUp
                                className={`h-4 w-4 ${n.type === "success" ? "text-green-400" : "text-blue-400"}`}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white mb-1 group-hover/notif:text-blue-300 transition-colors">{n.title}</p>
                            <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2 animate-pulse" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
