import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Home,
  Bell,
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react"

const API = "http://localhost:5000/api/classrooms"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
  { id: "rooms", label: "Rooms", icon: Home, path: "/rooms" },
  { id: "classrooms", label: "Classrooms", icon: BookOpen, path: "/classrooms" },
  { id: "timetables", label: "Timetables", icon: Calendar, path: "/timetables" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
]

export default function ClassroomsPage() {
  const navigate = useNavigate()
  const [activeNavItem, setActiveNavItem] = useState("classrooms")
  const [loading, setLoading] = useState(false)
  const [classrooms, setClassrooms] = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])

  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [createClassroomError, setCreateClassroomError] = useState("")

  const userRole = (localStorage.getItem("userRole") || "student").toLowerCase()
  const isFaculty = userRole === "faculty"

  const formatDateTimeDMY = (value) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const currentUserId = localStorage.getItem("userId") || ""
  const currentUserName = localStorage.getItem("userName") || ""

  const visibleNavigationItems = useMemo(
    () =>
      isFaculty
        ? NAV_ITEMS.filter((item) => item.id !== "rooms")
        : NAV_ITEMS.filter((item) => !["courses", "rooms"].includes(item.id)),
    [isFaculty]
  )

  const [showCreateClassroom, setShowCreateClassroom] = useState(false)
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [showSubmitWork, setShowSubmitWork] = useState(false)

  const [selectedClassroomId, setSelectedClassroomId] = useState("")
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("")

  const [classroomForm, setClassroomForm] = useState({
    name: "",
    subject: "",
    department: "",
    semester: "",
    section: "A",
    roomName: "",
    description: "",
  })

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxMarks: "100",
    type: "assignment",
  })

  const [submissionForm, setSubmissionForm] = useState({
    studentName: "",
    studentId: "",
    workText: "",
  })

  const [submissionFiles, setSubmissionFiles] = useState([])
  const [submissionError, setSubmissionError] = useState("")
  const [submittingWork, setSubmittingWork] = useState(false)

  const [gradeForm, setGradeForm] = useState({
    submissionId: "",
    marksObtained: "",
    feedback: "",
  })

  const selectedClassroom = useMemo(
    () => classrooms.find((classroom) => classroom._id === selectedClassroomId) || null,
    [classrooms, selectedClassroomId]
  )

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => assignment._id === selectedAssignmentId) || null,
    [assignments, selectedAssignmentId]
  )

  async function fetchClassrooms() {
    setLoading(true)
    try {
      const response = await axios.get(API)
      setClassrooms(response.data || [])

      if (!selectedClassroomId && response.data?.length) {
        setSelectedClassroomId(response.data[0]._id)
      }
    } catch (error) {
      console.error("Failed to fetch classrooms:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAssignments(classroomId) {
    if (!classroomId) {
      setAssignments([])
      setSelectedAssignmentId("")
      return
    }

    try {
      const response = await axios.get(`${API}/${classroomId}/assignments`)
      setAssignments(response.data || [])

      if (!selectedAssignmentId && response.data?.length) {
        setSelectedAssignmentId(response.data[0]._id)
      }
      if (response.data?.length === 0) {
        setSelectedAssignmentId("")
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error)
    }
  }

  async function fetchSubmissions(assignmentId) {
    if (!assignmentId) {
      setSubmissions([])
      return
    }

    try {
      const response = await axios.get(`${API}/assignments/${assignmentId}/submissions`)
      setSubmissions(response.data || [])
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
    }
  }

  useEffect(() => {
    fetchClassrooms()
  }, [])

  useEffect(() => {
    if (!isFaculty) return
    if (!showCreateClassroom) return

    const fetchCourses = async () => {
      try {
        setCoursesLoading(true)
        const response = await axios.get("http://localhost:5000/api/courses")
        setCourses(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [isFaculty, showCreateClassroom])

  useEffect(() => {
    fetchAssignments(selectedClassroomId)
  }, [selectedClassroomId])

  useEffect(() => {
    fetchSubmissions(selectedAssignmentId)
  }, [selectedAssignmentId])

  async function handleCreateClassroom(e) {
    e.preventDefault()

    if (!selectedCourseId) {
      setCreateClassroomError("Please select a course.")
      return
    }

    try {
      setCreateClassroomError("")
      await axios.post(API, {
        ...classroomForm,
        semester: Number(classroomForm.semester),
      })

      setClassroomForm({
        name: "",
        subject: "",
        department: "",
        semester: "",
        section: "A",
        roomName: "",
        description: "",
      })

      setSelectedCourseId("")

      await fetchClassrooms()
      setShowCreateClassroom(false)
    } catch (error) {
      console.error("Failed to create classroom:", error)
      setCreateClassroomError("Failed to create classroom. Please try again.")
    }
  }

  async function handleCreateAssignment(e) {
    e.preventDefault()
    if (!selectedClassroomId) return

    try {
      await axios.post(`${API}/${selectedClassroomId}/assignments`, {
        ...assignmentForm,
        maxMarks: Number(assignmentForm.maxMarks),
      })

      setAssignmentForm({
        title: "",
        description: "",
        dueDate: "",
        maxMarks: "100",
        type: "assignment",
      })

      await fetchAssignments(selectedClassroomId)
      setShowCreateAssignment(false)
    } catch (error) {
      console.error("Failed to create assignment:", error)
    }
  }

  async function handleSubmitWork(e) {
    e.preventDefault()
    if (!selectedAssignmentId) return

    try {
      setSubmissionError("")
      setSubmittingWork(true)
      const studentPayload = isFaculty
        ? submissionForm
        : {
            studentName: currentUserName || "Student",
            studentId: currentUserId || "",
            workText: submissionForm.workText,
          }

      const hasFiles = Array.isArray(submissionFiles) && submissionFiles.length > 0
      const hasText = (studentPayload.workText || "").trim().length > 0
      if (!hasFiles && !hasText) return

      if (hasFiles) {
        const formData = new FormData()
        formData.append("studentName", studentPayload.studentName)
        formData.append("studentId", studentPayload.studentId || "")
        formData.append("workText", studentPayload.workText || "")
        submissionFiles.forEach((file) => formData.append("files", file))

        // Don't set Content-Type manually for FormData.
        // Axios/browser will add the correct multipart boundary.
        await axios.post(`${API}/assignments/${selectedAssignmentId}/submissions`, formData)
      } else {
        await axios.post(`${API}/assignments/${selectedAssignmentId}/submissions`, studentPayload)
      }

      setSubmissionForm({ studentName: "", studentId: "", workText: "" })
      setSubmissionFiles([])
      await fetchSubmissions(selectedAssignmentId)
      setShowSubmitWork(false)
    } catch (error) {
      console.error("Failed to submit work:", error)
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to submit work. Please try again."
      setSubmissionError(message)
    } finally {
      setSubmittingWork(false)
    }
  }

  async function handleUnsubmit() {
    if (isFaculty) return
    if (!mySubmission?._id) return

    try {
      setSubmittingWork(true)
      setSubmissionError("")
      await axios.delete(`${API}/submissions/${mySubmission._id}`)
      setSubmissionForm({ studentName: "", studentId: "", workText: "" })
      setSubmissionFiles([])
      setShowSubmitWork(false)
      await fetchSubmissions(selectedAssignmentId)
    } catch (error) {
      console.error("Failed to unsubmit:", error)
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to unsubmit. Please try again."
      setSubmissionError(message)
    } finally {
      setSubmittingWork(false)
    }
  }

  const mySubmission = useMemo(() => {
    if (isFaculty) return null
    if (!Array.isArray(submissions)) return null
    const byId = currentUserId ? submissions.find((s) => s.studentId === currentUserId) : null
    if (byId) return byId
    const byName = currentUserName ? submissions.find((s) => s.studentName === currentUserName) : null
    return byName || null
  }, [submissions, isFaculty, currentUserId, currentUserName])

  const visibleSubmissions = useMemo(() => {
    if (isFaculty) return submissions
    return mySubmission ? [mySubmission] : []
  }, [isFaculty, submissions, mySubmission])

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    navigate("/", { replace: true })
  }

  async function handleGradeSubmission(e) {
    if (e?.preventDefault) e.preventDefault()
    if (!gradeForm.submissionId) return

    try {
      await axios.put(`${API}/submissions/${gradeForm.submissionId}/grade`, {
        marksObtained: Number(gradeForm.marksObtained),
        feedback: gradeForm.feedback,
      })

      setGradeForm({ submissionId: "", marksObtained: "", feedback: "" })
      await fetchSubmissions(selectedAssignmentId)
    } catch (error) {
      console.error("Failed to grade submission:", error)
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s" />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s" />
      </div>

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
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
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
            className="w-full border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8 relative z-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-semibold text-white">Classrooms</h1>
              <p className="text-slate-400 mt-1">Create classes, post classwork, collect submissions, and grade.</p>
            </div>

            <div className="flex items-center gap-3">
              {isFaculty ? (
                <Button
                  variant="outline"
                  className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
                  onClick={() => setShowCreateClassroom((v) => !v)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create class
                </Button>
              ) : (
                <Badge className="bg-slate-700/40 border border-slate-700/60 text-slate-200">Student view</Badge>
              )}
            </div>
          </div>

          {isFaculty && showCreateClassroom ? (
            <Card className="bg-slate-900/40 border border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Create a class</CardTitle>
                <CardDescription className="text-slate-400">Select a course to auto-fill required details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClassroom} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-slate-200">Course</Label>
                      <Select
                        value={selectedCourseId}
                        onValueChange={(value) => {
                          setSelectedCourseId(value)
                          const selected = Array.isArray(courses) ? courses.find((c) => c._id === value) : null
                          if (!selected) return

                          setClassroomForm((prev) => ({
                            ...prev,
                            subject: selected.name || "",
                            department: selected.department || "",
                            semester: selected.semester != null ? String(selected.semester) : "",
                            name: prev.name?.trim() ? prev.name : `${selected.code || selected.name || ""}`.trim(),
                          }))
                        }}
                      >
                        <SelectTrigger className="bg-slate-800/40 border-slate-600/40 text-slate-100">
                          <SelectValue
                            placeholder={coursesLoading ? "Loading courses..." : courses.length ? "Select course" : "No courses found"}
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 text-slate-200">
                          {courses.map((c) => (
                            <SelectItem
                              key={c._id}
                              value={c._id}
                              className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                            >
                              {c.code} — {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-200">Class name</Label>
                      <Input
                        value={classroomForm.name}
                        onChange={(e) => setClassroomForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                        placeholder="OS Classroom"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-200">Subject</Label>
                      <Input
                        value={classroomForm.subject}
                        readOnly
                        className="bg-slate-800/40 border-slate-600/40 text-slate-100 opacity-80"
                        placeholder="Select a course"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label className="text-slate-200">Department</Label>
                      <Input
                        value={classroomForm.department}
                        readOnly
                        className="bg-slate-800/40 border-slate-600/40 text-slate-100 opacity-80"
                        placeholder="CSE"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-200">Semester</Label>
                      <Input
                        type="number"
                        value={classroomForm.semester}
                        readOnly
                        className="bg-slate-800/40 border-slate-600/40 text-slate-100 opacity-80"
                        placeholder="5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-200">Section</Label>
                      <Input
                        value={classroomForm.section}
                        onChange={(e) => setClassroomForm((prev) => ({ ...prev, section: e.target.value }))}
                        className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                        placeholder="A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-200">Room</Label>
                      <Input
                        value={classroomForm.roomName}
                        onChange={(e) => setClassroomForm((prev) => ({ ...prev, roomName: e.target.value }))}
                        className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                        placeholder="B-204"
                      />
                    </div>
                  </div>

                  {createClassroomError ? <div className="text-sm text-red-300">{createClassroomError}</div> : null}

                  <div className="space-y-2">
                    <Label className="text-slate-200">Description (optional)</Label>
                    <Textarea
                      value={classroomForm.description}
                      onChange={(e) => setClassroomForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                      placeholder="Optional notes"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
                      onClick={() => setShowCreateClassroom(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card className="bg-slate-900/40 border border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Your classes</CardTitle>
              <CardDescription className="text-slate-400">Select a class to view classwork and submissions.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-slate-400">Loading classrooms...</div>
              ) : classrooms.length === 0 ? (
                <div className="text-slate-400">No classes yet. Click “Create class” to add one.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classrooms.map((classroom) => {
                    const isActive = selectedClassroomId === classroom._id
                    return (
                      <button
                        key={classroom._id}
                        onClick={() => {
                          setSelectedClassroomId(classroom._id)
                          setShowCreateAssignment(false)
                          setShowSubmitWork(false)
                          setGradeForm({ submissionId: "", marksObtained: "", feedback: "" })
                        }}
                        className={`text-left rounded-2xl border overflow-hidden transition-all ${
                          isActive ? "border-blue-400/50" : "border-slate-700/50 hover:border-slate-500/60"
                        }`}
                      >
                        <div className="p-4 bg-gradient-to-br from-blue-600/25 to-cyan-600/10">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-white font-semibold">{classroom.name}</div>
                            <Badge className="bg-slate-900/50 border border-slate-700/60 text-slate-200 hover:bg-slate-900/60">
                              Sem {classroom.semester}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-200/80 mt-1">{classroom.subject}</div>
                        </div>
                        <div className="p-4 bg-slate-900/30">
                          <div className="text-xs text-slate-400">
                            {classroom.department} • Section {classroom.section || "A"}
                            {classroom.roomName ? ` • ${classroom.roomName}` : ""}
                          </div>
                          {isActive ? (
                            <div className="mt-3 inline-flex items-center gap-2 text-xs text-blue-200">
                              <CheckCircle className="h-4 w-4" />
                              Selected
                            </div>
                          ) : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedClassroom ? (
            <Card className="bg-slate-900/40 border border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="text-white text-xl font-semibold">{selectedClassroom.name}</div>
                    <div className="text-slate-300">{selectedClassroom.subject}</div>
                    <div className="text-sm text-slate-500">
                      {selectedClassroom.department} • Semester {selectedClassroom.semester} • Section {selectedClassroom.section || "A"}
                      {selectedClassroom.roomName ? ` • ${selectedClassroom.roomName}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFaculty ? (
                      <Button
                        variant="outline"
                        className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
                        onClick={() => setShowCreateAssignment((v) => !v)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New classwork
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {selectedClassroom ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="bg-slate-900/40 border border-slate-700/50 xl:col-span-1">
                <CardHeader>
                  <CardTitle className="text-white">Classwork</CardTitle>
                  <CardDescription className="text-slate-400">Assignments & tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  {assignments.length === 0 ? (
                    <div className="text-slate-400">No classwork yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {assignments.map((assignment) => {
                        const isActive = selectedAssignmentId === assignment._id
                        return (
                          <button
                            key={assignment._id}
                            onClick={() => {
                              setSelectedAssignmentId(assignment._id)
                              setShowSubmitWork(false)
                              setGradeForm({ submissionId: "", marksObtained: "", feedback: "" })
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${
                              isActive
                                ? "bg-blue-500/10 border-blue-400/40"
                                : "bg-slate-800/25 border-slate-700/50 hover:border-slate-500/60"
                            }`}
                          >
                            <div className="text-white font-medium line-clamp-1">{assignment.title}</div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                              <Clock className="h-3.5 w-3.5" />
                              Due {formatDateTimeDMY(assignment.dueDate)}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="xl:col-span-2 space-y-6">
                {isFaculty && showCreateAssignment ? (
                  <Card className="bg-slate-900/40 border border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white">Create classwork</CardTitle>
                      <CardDescription className="text-slate-400">Post an assignment with due date and marks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateAssignment} className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-slate-200">Title</Label>
                          <Input
                            value={assignmentForm.title}
                            onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
                            className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                            placeholder="OS - Process Scheduling"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-200">Description</Label>
                          <Textarea
                            value={assignmentForm.description}
                            onChange={(e) => setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))}
                            className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                            placeholder="Write a short report and attach code link"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-slate-200">Due date</Label>
                            <Input
                              type="datetime-local"
                              value={assignmentForm.dueDate}
                              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                              onFocus={(e) => e.target.showPicker?.()}
                              onClick={(e) => e.target.showPicker?.()}
                              className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-200">Max marks</Label>
                            <Input
                              type="number"
                              value={assignmentForm.maxMarks}
                              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, maxMarks: e.target.value }))}
                              className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                            Post
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
                            onClick={() => setShowCreateAssignment(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : null}

                <Card className="bg-slate-900/40 border border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Details</CardTitle>
                    <CardDescription className="text-slate-400">Assignment + submissions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {!selectedAssignment ? (
                      <div className="text-slate-400">Select a classwork item from the left.</div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <div className="text-white font-semibold text-lg">{selectedAssignment.title}</div>
                          <div className="text-sm text-slate-400 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Due {formatDateTimeDMY(selectedAssignment.dueDate)}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span>{selectedAssignment.maxMarks} marks</span>
                          </div>
                          {selectedAssignment.description ? (
                            <div className="text-slate-300 text-sm whitespace-pre-wrap mt-2">{selectedAssignment.description}</div>
                          ) : null}
                        </div>

                        {!isFaculty ? (
                          <div className="space-y-4">
                            <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 overflow-hidden">
                              <div className="p-4 border-b border-slate-700/50">
                                <div className="text-white font-semibold">Your work</div>
                                <div className="text-xs text-slate-400 mt-1">
                                  {currentUserName ? `Signed in as ${currentUserName}` : "Signed in"}
                                </div>
                              </div>
                              <div className="p-4 space-y-3">
                                {mySubmission ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <Badge
                                        className={
                                          mySubmission.status === "graded"
                                            ? "bg-emerald-500/20 text-emerald-300"
                                            : "bg-blue-500/20 text-blue-300"
                                        }
                                      >
                                        {mySubmission.status}
                                      </Badge>
                                      {mySubmission.status === "graded" ? (
                                        <Badge className="bg-slate-700/60 text-slate-200">
                                          Marks: {mySubmission.marksObtained ?? "—"}
                                        </Badge>
                                      ) : null}
                                    </div>

                                    <div className="text-xs text-slate-400">
                                      Submitted {formatDateTimeDMY(mySubmission.submittedAt)}
                                    </div>

                                    {Array.isArray(mySubmission.attachments) && mySubmission.attachments.length ? (
                                      <div className="space-y-2">
                                        <div className="text-sm text-slate-200 font-medium">Attachments</div>
                                        <div className="space-y-1">
                                          {mySubmission.attachments.map((att) => (
                                            <a
                                              key={att.url}
                                              href={`http://localhost:5000${att.url}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="block text-sm text-blue-200 hover:text-blue-100 underline underline-offset-2"
                                            >
                                              {att.originalName}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null}

                                    {mySubmission.workText ? (
                                      <div className="text-sm text-slate-300 whitespace-pre-wrap">{mySubmission.workText}</div>
                                    ) : null}
                                  </div>
                                ) : (
                                  <Badge className="bg-slate-700/40 border border-slate-700/60 text-slate-200">
                                    Not submitted
                                  </Badge>
                                )}

                                <Button
                                  variant="outline"
                                  className="w-full border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
                                  onClick={() => setShowSubmitWork((v) => !v)}
                                >
                                  {mySubmission ? "Resubmit" : "Submit work"}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>

                                {mySubmission ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
                                    onClick={handleUnsubmit}
                                    disabled={submittingWork}
                                  >
                                    {submittingWork ? "Unsubmitting..." : "Unsubmit"}
                                  </Button>
                                ) : null}

                                {showSubmitWork ? (
                                  <form onSubmit={handleSubmitWork} className="space-y-3">
                                    <div className="space-y-2">
                                      <Label className="text-slate-200">Work (optional)</Label>
                                      <Textarea
                                        value={submissionForm.workText}
                                        onChange={(e) => setSubmissionForm((prev) => ({ ...prev, workText: e.target.value }))}
                                        className="bg-slate-800/40 border-slate-600/40 text-slate-100 min-h-[100px]"
                                        placeholder="Add a note or paste a link"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-slate-200">Attach files</Label>
                                      <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                                        multiple
                                        onChange={(e) => {
                                          const list = Array.from(e.target.files || [])
                                          setSubmissionFiles(list)
                                        }}
                                        className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                                      />
                                      {submissionFiles.length ? (
                                        <div className="space-y-1">
                                          {submissionFiles.map((file) => (
                                            <div key={file.name} className="text-xs text-slate-300">
                                              {file.name}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-slate-400">No files selected</div>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                      <Button
                                        type="submit"
                                        className="bg-gradient-to-r from-blue-600 to-cyan-600"
                                        disabled={
                                          submittingWork ||
                                          (submissionFiles.length === 0 && submissionForm.workText.trim().length === 0)
                                        }
                                      >
                                        {submittingWork ? "Turning in..." : "Turn in"}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
                                        onClick={() => {
                                          setShowSubmitWork(false)
                                          setSubmissionFiles([])
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>

                                    {submissionError ? (
                                      <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                        {submissionError}
                                      </div>
                                    ) : null}
                                  </form>
                                ) : null}

                                {mySubmission?.feedback ? (
                                  <div className="text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                                    Feedback: {mySubmission.feedback}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-white font-semibold">Submissions</div>
                            {visibleSubmissions.length === 0 ? (
                              <div className="text-slate-400">No submissions yet.</div>
                            ) : (
                              <div className="space-y-3">
                                {visibleSubmissions.map((submission) => {
                                const isEditing = gradeForm.submissionId === submission._id
                                return (
                                  <div key={submission._id} className="rounded-xl border border-slate-700/50 bg-slate-800/20 p-4">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                      <div>
                                        <div className="text-white font-medium">{submission.studentName}</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                          Submitted {formatDateTimeDMY(submission.submittedAt)}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge
                                          className={
                                            submission.status === "graded"
                                              ? "bg-emerald-500/20 text-emerald-300"
                                              : "bg-blue-500/20 text-blue-300"
                                          }
                                        >
                                          {submission.status}
                                        </Badge>
                                        <Badge className="bg-slate-700/60 text-slate-200">
                                          Marks: {submission.marksObtained ?? "—"}
                                        </Badge>
                                      </div>
                                    </div>

                                    {submission.workText ? (
                                      <div className="text-sm text-slate-300 mt-3 whitespace-pre-wrap">{submission.workText}</div>
                                    ) : null}

                                    {Array.isArray(submission.attachments) && submission.attachments.length ? (
                                      <div className="mt-3 space-y-2">
                                        <div className="text-sm text-slate-200 font-medium">Attachments</div>
                                        <div className="space-y-1">
                                          {submission.attachments.map((att) => (
                                            <a
                                              key={att.url}
                                              href={`http://localhost:5000${att.url}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="block text-sm text-blue-200 hover:text-blue-100 underline underline-offset-2"
                                            >
                                              {att.originalName}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null}

                                    {submission.feedback ? (
                                      <div className="mt-3 text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                                        Feedback: {submission.feedback}
                                      </div>
                                    ) : null}

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                      {isFaculty ? (
                                        <>
                                          <Button
                                            variant="outline"
                                            className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
                                            onClick={() =>
                                              setGradeForm({
                                                submissionId: submission._id,
                                                marksObtained: submission.marksObtained ?? "",
                                                feedback: submission.feedback ?? "",
                                              })
                                            }
                                          >
                                            Grade
                                          </Button>
                                          {isEditing ? (
                                            <Button
                                              variant="outline"
                                              className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60"
                                              onClick={() => setGradeForm({ submissionId: "", marksObtained: "", feedback: "" })}
                                            >
                                              Close
                                            </Button>
                                          ) : null}
                                        </>
                                      ) : null}
                                    </div>

                                    {isFaculty && isEditing ? (
                                      <form onSubmit={handleGradeSubmission} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                          <Label className="text-slate-200">Marks</Label>
                                          <Input
                                            type="number"
                                            value={gradeForm.marksObtained}
                                            onChange={(e) => setGradeForm((prev) => ({ ...prev, marksObtained: e.target.value }))}
                                            className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                                          />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                          <Label className="text-slate-200">Feedback</Label>
                                          <Input
                                            value={gradeForm.feedback}
                                            onChange={(e) => setGradeForm((prev) => ({ ...prev, feedback: e.target.value }))}
                                            className="bg-slate-800/40 border-slate-600/40 text-slate-100"
                                            placeholder="Optional feedback"
                                          />
                                        </div>
                                        <div className="md:col-span-3">
                                          <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                                            Save
                                          </Button>
                                        </div>
                                      </form>
                                    ) : null}
                                  </div>
                                )
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
