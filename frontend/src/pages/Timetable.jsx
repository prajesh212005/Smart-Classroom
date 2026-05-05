import React, { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DepartmentSelect, DEFAULT_DEPARTMENT_OPTIONS } from "@/components/DepartmentSelect"
import {
  Trash2,
  Sparkles,
  Download,
  Share,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Calendar as CalendarIconLucide,
  LayoutDashboard,
  BookOpen,
  Users as UsersIcon,
  Home as HomeIcon,
  Bell,
} from "lucide-react"

// Axios configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "14:00-15:00",
  "15:00-16:00",
]

function TimetableGrid({ timetable, courses, faculty, rooms }) {
  const getEntry = (day, slot) => {
    if (!timetable || !timetable.schedule) return null
    return (
      timetable.schedule.find(
        (e) => e.day.toLowerCase() === day.toLowerCase() && `${e.startTime}-${e.endTime}` === slot,
      ) || null
    )
  }

  const findCourse = (id) => courses.find((c) => c._id === id) || null
  const findFaculty = (id) => faculty.find((f) => f._id === id) || null
  const findRoom = (id) => rooms.find((r) => r._id === id) || null

  const typeColor = (t) => {
    switch (t) {
      case "lecture":
        return "bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-200 border border-cyan-500/30"
      case "lab":
        return "bg-gradient-to-br from-emerald-500/20 to-green-600/20 text-emerald-200 border border-emerald-500/30"
      case "tutorial":
        return "bg-gradient-to-br from-purple-500/20 to-violet-600/20 text-purple-200 border border-purple-500/30"
      case "exam":
        return "bg-gradient-to-br from-red-500/20 to-rose-600/20 text-red-200 border border-red-500/30"
      default:
        return "bg-gradient-to-br from-slate-600/20 to-gray-700/20 text-slate-200 border border-slate-500/30"
    }
  }

  return (
    <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-cyan-500/10">
      <CardHeader className="border-b border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-cyan-100">{timetable.name}</CardTitle>
            <div className="text-sm text-slate-400">
              {timetable.department} • Semester {timetable.semester} • {timetable.year}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Badge
              className={
                timetable.status === "published"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0"
                  : "bg-slate-700/50 text-slate-300 border border-slate-600/50"
              }
            >
              {timetable.status}
            </Badge>
            {timetable.conflicts && timetable.conflicts.length > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0">
                {timetable.conflicts.length} conflicts
              </Badge>
            )}
            <Badge className="bg-slate-700/50 text-slate-300 border border-slate-600/50">
              {timetable.metadata?.utilizationRate || 0}% utilized
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-6 gap-3 min-w-[900px]">
            <div className="font-semibold text-center p-3 bg-slate-700/30 backdrop-blur-sm rounded-xl text-cyan-200 border border-slate-600/50">
              Time
            </div>
            {DAYS.map((d) => (
              <div
                key={d}
                className="font-semibold text-center p-3 bg-slate-700/30 backdrop-blur-sm rounded-xl text-cyan-200 border border-slate-600/50"
              >
                {d}
              </div>
            ))}

            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="contents">
                <div className="text-sm text-center p-3 bg-slate-800/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-400 border border-slate-700/50">
                  <Clock className="h-3 w-3 mr-1" />
                  {slot}
                </div>

                {DAYS.map((day) => {
                  const entry = getEntry(day, slot)
                  if (!entry) {
                    return (
                      <div key={`${day}-${slot}`} className="min-h-[80px] p-1">
                        <div className="h-full bg-slate-800/20 backdrop-blur-sm rounded-xl border-2 border-dashed border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300" />
                      </div>
                    )
                  }

                  const course = findCourse(entry.courseId)
                  const prof = findFaculty(entry.facultyId)
                  const room = findRoom(entry.roomId)

                  return (
                    <div key={`${day}-${slot}`} className="min-h-[80px] p-1">
                      <div
                        className={`p-3 rounded-xl text-xs h-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm ${typeColor(
                          course?.type || "lecture",
                        )}`}
                      >
                        <div className="font-semibold leading-tight mb-2 line-clamp-2 text-base">
                          {course ? `${course.name} (${course.code})` : entry.courseId}
                        </div>
                        <div className="space-y-1 text-xs opacity-90">
                          <div className="flex items-center gap-1 truncate">
                            <User className="h-3 w-3" />
                            <span className="truncate">{prof ? prof.name : entry.facultyId}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{room ? room.name : entry.roomId}</span>
                          </div>
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs px-1 py-0  text-white backdrop-blur-sm">
                              {course?.type || entry.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {timetable.conflicts && timetable.conflicts.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Conflicts Detected
            </h4>
            {timetable.conflicts.map((c, i) => (
              <div key={i} className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-red-400">{(c.type || "CONFLICT").replace("_", " ")}</span>
                  <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 text-xs">High</Badge>
                </div>
                <p className="text-sm text-red-300">{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function TimetablePage() {
  const navigate = useNavigate()
  const [timetables, setTimetables] = useState([])
  const [selected, setSelected] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [courses, setCourses] = useState([])
  const [faculty, setFaculty] = useState([])
  const [rooms, setRooms] = useState([])
  const [error, setError] = useState(null)
  const [activeNavItem, setActiveNavItem] = useState("timetables")

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
  const [form, setForm] = useState({
    department: "",
    semester: "5",
    academicYear: new Date().getFullYear(),
  })

  const departmentOptions = useMemo(() => {
    const courseDepartments = courses.map((course) => course.department).filter(Boolean)
    return courseDepartments.length > 0
      ? [...new Set(courseDepartments)]
      : DEFAULT_DEPARTMENT_OPTIONS
  }, [courses])

  useEffect(() => {
    fetchTimetables()
    fetchSupportingData()
  }, [])

  // All async data fetching and handler functions remain the same...
  async function fetchTimetables() {
    setLoadingList(true)
    setError(null)
    try {
      const response = await api.get("/timetables")
      const data = response.data
      setTimetables(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching timetables:", err)
      const errorMessage = err.response?.data?.error || err.message || "Failed to load timetables"
      setError(`Failed to load timetables: ${errorMessage}. Please check your backend connection.`)
      setTimetables([])
    } finally {
      setLoadingList(false)
    }
  }

  async function fetchSupportingData() {
    try {
      const [coursesRes, facultyRes, roomsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/faculty"),
        api.get("/rooms"),
      ])
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
      setFaculty(Array.isArray(facultyRes.data) ? facultyRes.data : [])
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : [])
    } catch (err) {
      console.error("Error fetching supporting data:", err)
      const errorMessage = err.response?.data?.error || err.message || "Unknown error"
      setError(`Failed to load courses, faculty, or rooms data: ${errorMessage}`)
    }
  }

  async function viewTimetable(id) {
    setLoadingDetail(true)
    setSelected(null)
    setError(null)
    try {
      const response = await api.get(`/timetables/${id}`)
      setSelected(response.data)
    } catch (err) {
      console.error("Error fetching timetable:", err)
      const errorMessage = err.response?.data?.error || err.message || "Unknown error"
      if (err.response?.status === 404) {
        setError("Timetable not found.")
      } else {
        setError(`Failed to load timetable details: ${errorMessage}`)
      }
    } finally {
      setLoadingDetail(false)
    }
  }

  async function generateTimetable(e) {
    e.preventDefault()
    if (!form.department || !form.semester) {
      setError("Please fill in department and semester")
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const payload = {
        department: form.department,
        semester: Number.parseInt(form.semester),
        academicYear: Number.parseInt(form.academicYear),
      }
      const response = await api.post("/timetables/generate", payload)
      const newTimetable = response.data
      await fetchTimetables()
      if (newTimetable._id) {
        await viewTimetable(newTimetable._id)
      }
      setError(null)
      alert("Timetable generated successfully!")
    } catch (err) {
      console.error("Error generating timetable:", err)
      const errorMessage = err.response?.data?.error || err.message || "Unknown error"
      setError(`Failed to generate timetable: ${errorMessage}`)
    } finally {
      setGenerating(false)
    }
  }

  async function optimizeSelected() {
    if (!selected) return
    setOptimizing(true)
    setError(null)
    try {
      const response = await api.post(`/timetables/${selected._id}/optimize`)
      const result = response.data
      await viewTimetable(selected._id)
      if (result.suggestions && result.suggestions.length > 0) {
        alert("Optimization complete!\n\nSuggestions:\n• " + result.suggestions.join("\n• "))
      } else {
        alert("Optimization completed successfully!")
      }
    } catch (err) {
      console.error("Error optimizing timetable:", err)
      const errorMessage = err.response?.data?.error || err.message || "Unknown error"
      setError(`Optimization failed: ${errorMessage}`)
    } finally {
      setOptimizing(false)
    }
  }

  async function togglePublish(timetable) {
    setError(null)
    try {
      const newStatus = timetable.status === "published" ? "draft" : "published"
      const updatedData = { ...timetable, status: newStatus }
      await api.put(`/timetables/${timetable._id}`, updatedData)
      await fetchTimetables()
      if (selected && selected._id === timetable._id) {
        await viewTimetable(timetable._id)
      }
    } catch (err) {
      console.error("Error updating timetable:", err)
      const errorMessage = err.response?.data?.error || err.message || "Unknown error"
      setError(`Failed to change timetable status: ${errorMessage}`)
    }
  }

  async function deleteTimetable(timetable) {
    if (!confirm(`Delete timetable "${timetable.name}"? This cannot be undone.`)) return
    setError(null)
    try {
      await api.delete(`/timetables/${timetable._id}`)
      await fetchTimetables()
      if (selected && selected._id === timetable._id) {
        setSelected(null)
      }
      alert("Timetable deleted successfully")
    } catch (err) {
      console.error("Error deleting timetable:", err)
      const errorMessage = err.response?.data?.error || err.message || "Unknown error"
      if (err.response?.status === 404) {
        setError("Timetable not found.")
      } else {
        setError(`Failed to delete timetable: ${errorMessage}`)
      }
    }
  }

  function exportTimetable() {
    if (!selected) return
    const dataStr = JSON.stringify(selected, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${selected.name.replace(/\s+/g, "_")}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "rooms", label: "Rooms", icon: HomeIcon, path: "/rooms" },
    { id: "classrooms", label: "Classrooms", icon: BookOpen, path: "/classrooms" },
    { id: "timetables", label: "Timetables", icon: CalendarIconLucide, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  const visibleNavigationItems = isFacultyUser
    ? navigationItems.filter((item) => item.id !== "rooms")
    : navigationItems.filter((item) => !["courses", "rooms"].includes(item.id))

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

      <main className="flex-1 p-8 relative z-10 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-3">
              <h1 className="text-5xl lg:text-6xl font-bold text-white">Timetable Generator</h1>
              <p className="text-lg text-slate-400 max-w-2xl">
                Generate, optimize and manage academic timetables with AI assistance
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/30 text-red-300 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in-up">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isFacultyUser ? (
            <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10 animate-fade-in-up">
              <CardHeader className="">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5  text-blue-300" />
                    Generate New Timetable
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/40">
                    AI Powered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={generateTimetable} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                      <DepartmentSelect
                        value={form.department}
                        onChange={(department) => setForm({ ...form, department })}
                        options={departmentOptions}
                        placeholder="Select department"
                        customPlaceholder="Type department name"
                        required
                        selectClassName="bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70 w-full"
                        inputClassName="bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Semester</label>
                      <Select value={form.semester} onValueChange={(value) => setForm({ ...form, semester: value })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 text-slate-200">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()} className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                              Sem {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Academic Year</label>
                      <Input
                        type="number"
                        value={form.academicYear}
                        onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                        min="2020"
                        max="2030"
                        className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/40 transition-all duration-300 border-0"
                      disabled={generating}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {generating ? "Generating..." : "Generate Timetable"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setForm({
                          department: "",
                          semester: "5",
                          academicYear: new Date().getFullYear(),
                        })
                      }
                      className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 hover:border-slate-500/70 backdrop-blur-sm transition-all duration-300"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10 animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Student view</CardTitle>
                  <Badge className="bg-slate-700/50 text-slate-200 border border-slate-600/50">Read only</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-slate-300">
                View published timetables below. Ask your faculty to generate or update schedules.
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10 animate-fade-in-up">
              <CardHeader className="border-b border-slate-700/50 p-6">
                <CardTitle className="text-white">Existing Timetables ({timetables.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loadingList ? (
                  <div className="text-center py-8">
                    <div className="relative w-8 h-8 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse opacity-75"></div>
                      <div className="absolute inset-1 bg-slate-950 rounded-full"></div>
                    </div>
                    <p className="text-slate-400">Loading timetables...</p>
                  </div>
                ) : timetables.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No timetables found. Generate your first timetable above!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timetables.map((t) => (
                      <div
                        key={t._id}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm hover:bg-slate-700/40 transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/30"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-white">{t.name}</div>
                          <div className="text-sm text-slate-400">
                            {t.department} • Semester {t.semester} • {t.year}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={
                                t.status === "published"
                                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0"
                                  : "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                              }
                            >
                              {t.status}
                            </Badge>
                            <Badge className="bg-slate-700/50 text-slate-300 border border-slate-600/50 text-xs">
                              {t.metadata?.totalHours || 0} hours
                            </Badge>
                            {t.conflicts && t.conflicts.length > 0 && (
                              <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 text-xs">
                                {t.conflicts.length} conflicts
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewTimetable(t._id)}
                            className="text-cyan-300 hover:text-white hover:bg-cyan-500/20"
                          >
                            View
                          </Button>
                          {isFacultyUser ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => togglePublish(t)}
                                className="bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-600/50"
                              >
                                {t.status === "published" ? "Unpublish" : "Publish"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteTimetable(t)}
                                className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 border-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              {loadingDetail ? (
                <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
                  <CardContent className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-cyan-200">Loading timetable details...</p>
                  </CardContent>
                </Card>
              ) : !selected ? (
                <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-cyan-100">Timetable Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-12">
                    <div className="text-slate-500">
                      <CalendarIconLucide className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2 text-slate-300">No Timetable Selected</p>
                      <p className="text-sm">Select a timetable from the list to view details, grid, and management options.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <TimetableGrid timetable={selected} courses={courses} faculty={faculty} rooms={rooms} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}