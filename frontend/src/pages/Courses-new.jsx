import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CourseForm } from "@/components/CourseForm"
import { DataTable } from "@/components/Data-table"
import { Plus, BookOpen, Users, Calendar, LayoutDashboard, Home, Bell, Trash2, Edit3 } from "lucide-react"
import { Link } from "react-router-dom"

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("courses")
  const [editingCourse, setEditingCourse] = useState(null)

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
    { id: "classrooms", label: "Classrooms", icon: BookOpen, path: "/classrooms" },
    { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
  ]

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/courses/")
      setCourses(res.data)
    } catch (err) {
      console.error("Failed to fetch courses:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleCreateCourse = async (courseData) => {
    try {
      setFormLoading(true)
      await axios.post("http://localhost:5000/api/courses/", courseData)
      setShowForm(false)
      setEditingCourse(null)
      fetchCourses()
    } catch (error) {
      console.error("Failed to create course:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateCourse = async (id, courseData) => {
    try {
      setFormLoading(true)
      await axios.put(`http://localhost:5000/api/courses/${id}`, courseData)
      setEditingCourse(null)
      setShowForm(false)
      fetchCourses()
    } catch (error) {
      console.error("Failed to update course:", error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCourse = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`)
      if (editingCourse && editingCourse._id === id) {
        setEditingCourse(null)
        setShowForm(false)
      }
      fetchCourses()
    } catch (error) {
      console.error("Failed to delete course:", error)
    }
  }

  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (course) => (
        <div className="font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30 inline-block">
          {course.code}
        </div>
      ),
    },
    {
      key: "name",
      label: "Course Name",
      sortable: true,
      render: (course) => <div className="font-medium text-slate-100 group-hover:text-white transition-colors">{course.name}</div>,
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (course) => <div className="text-slate-300">{course.department}</div>,
    },
    {
      key: "credits",
      label: "Credits",
      render: (course) => (
        <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30 hover:from-emerald-500/30 hover:to-teal-500/30">
          {course.credits} hrs
        </Badge>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (course) => (
        <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
          {course.type}
        </Badge>
      ),
    },
    {
      key: "semester",
      label: "Semester",
      render: (course) => (
        <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/30">
          Sem {course.semester}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (course) => (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            className="bg-blue-600/80 hover:bg-blue-700 text-white transition-all duration-300 rounded-lg h-8 px-3"
            onClick={() => {
              setEditingCourse(course)
              setShowForm(true)
            }}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            className="bg-red-600/80 hover:bg-red-700 text-white transition-all duration-300 rounded-lg h-8 px-3"
            onClick={() => handleDeleteCourse(course._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s"></div>
        </div>

        <div className="w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-slate-700/50 shadow-2xl relative z-10" />
        <div className="flex-1 p-8 relative z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="h-12 bg-slate-700 animate-pulse rounded-xl w-80" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s"></div>
      </div>

      {/* Modern Sidebar */}
      <div className="w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-slate-700/50 shadow-2xl relative z-10 flex flex-col">
        <div className="p-8 space-y-8 flex-1">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <span className="text-white font-bold">SC</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-white">SmartClass</h2>
                <p className="text-xs text-slate-400">Scheduler v1.0</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
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

        <div className="p-6 border-t border-slate-700/50" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-5xl lg:text-6xl font-bold text-white">Courses</h1>
                <p className="text-lg text-slate-400 max-w-2xl">
                  Manage and organize academic courses with detailed information and prerequisites.
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingCourse(null)
                  setShowForm(!showForm)
                }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/40 transition-all duration-300 px-6 py-3 rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Course
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/30">
                <CardContent className="p-5">
                  <div className="text-3xl font-bold text-blue-400">{courses.length}</div>
                  <p className="text-xs text-slate-400 mt-1">Total Courses</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/30">
                <CardContent className="p-5">
                  <div className="text-3xl font-bold text-cyan-400">{[...new Set(courses.map(c => c.department))].length}</div>
                  <p className="text-xs text-slate-400 mt-1">Departments</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-500/30">
                <CardContent className="p-5">
                  <div className="text-3xl font-bold text-emerald-400">{[...new Set(courses.map(c => c.semester))].length}</div>
                  <p className="text-xs text-slate-400 mt-1">Semesters</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/30">
                <CardContent className="p-5">
                  <div className="text-3xl font-bold text-purple-400">{courses.reduce((sum, c) => sum + (c.credits || 0), 0)}</div>
                  <p className="text-xs text-slate-400 mt-1">Total Credits</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/30 shadow-lg animate-fade-in-up">
              <CardHeader className="border-b border-slate-700/50 p-6">
                <CardTitle className="text-xl font-semibold text-white">
                  {editingCourse ? "✏️ Edit Course" : "➕ Add New Course"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CourseForm
                  initialData={editingCourse}
                  onSubmit={(data) => {
                    if (editingCourse) handleUpdateCourse(editingCourse._id, data)
                    else handleCreateCourse(data)
                  }}
                  loading={formLoading}
                />
              </CardContent>
            </Card>
          )}

          {/* Courses Table */}
          <Card className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/30 shadow-lg animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <CardHeader className="border-b border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    All Courses
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {courses.length} courses in the system
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-slate-900/30 rounded-xl border border-slate-700/30 overflow-hidden">
                <DataTable data={courses} columns={columns} searchKey="name" loading={loading} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
