import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowRight,
  LayoutDashboard,
  BookOpen,
  Home,
  Bell,
  CheckCircle,
} from "lucide-react"

export default function LandingPage() {
  const quickStats = [
    { title: "Course Management", icon: BookOpen, color: "text-blue-300", bg: "bg-blue-500/15 border-blue-500/30" },
    { title: "Faculty Planning", icon: Users, color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/30" },
    { title: "Room Allocation", icon: Home, color: "text-violet-300", bg: "bg-violet-500/15 border-violet-500/30" },
    { title: "Instant Alerts", icon: Bell, color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/30" },
  ]

  const featureCards = [
    {
      title: "AI-Assisted Generation",
      desc: "Generate timetables from your courses, faculty, rooms, and constraints.",
      icon: Sparkles,
    },
    {
      title: "Conflict-Aware Scheduling",
      desc: "Avoid clashes across faculty availability, room capacity, and timeslots.",
      icon: ShieldCheck,
    },
    {
      title: "Fast Admin Workflow",
      desc: "Manage courses, faculty, rooms, notifications, and timetables in one place.",
      icon: LayoutDashboard,
    },
  ]

  const steps = [
    {
      title: "Add Your Data",
      desc: "Create courses, rooms, and faculty in dashboard modules.",
      icon: Users,
    },
    {
      title: "Choose Constraints",
      desc: "Select department, semester, academic year, and scheduling preferences.",
      icon: Calendar,
    },
    {
      title: "Generate & Publish",
      desc: "Review output, adjust if needed, and publish with notifications.",
      icon: Clock,
    },
  ]

  const sampleRows = [
    { time: "09:00 - 10:00", course: "Data Structures", faculty: "Dr. Sharma", room: "A-201" },
    { time: "10:00 - 11:00", course: "DBMS", faculty: "Prof. Gupta", room: "Lab-3" },
    { time: "11:15 - 12:15", course: "Computer Networks", faculty: "Dr. Rao", room: "B-104" },
  ]

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s" />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s" />
      </div>

      <div className="relative z-10">
        <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold">SC</span>
            </div>
            <div className="text-white font-semibold tracking-tight">Smart Classroom</div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30">
                Sign up
              </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 pb-20 pt-8">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-7">
              <Badge className="bg-slate-800/50 border border-slate-700/60 text-slate-200 hover:bg-slate-800/60 w-fit">
                New scheduling experience
              </Badge>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
                Smart Classroom
                <span className="block gradient-text">Smarter Timetable Workflow</span>
              </h1>

              <p className="text-lg text-slate-300/90 leading-relaxed max-w-xl">
                Plan, generate, and manage timetables with a modern dashboard built for real academic operations.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30 px-6">
                    Get started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 px-6">
                    I already have an account
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                {quickStats.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className={`rounded-xl border p-3 ${item.bg} bg-slate-900/40`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-900/60 border border-slate-700/70 flex items-center justify-center">
                          <Icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div className="text-sm text-slate-200">{item.title}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Card className="bg-slate-900/35 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-sm text-slate-400">Live preview</div>
                      <div className="text-white font-semibold">Monday • Semester 5 • CSE</div>
                    </div>
                    <Badge className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Conflict-free
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {sampleRows.map((row) => (
                      <div key={row.time} className="p-4 rounded-xl bg-slate-800/35 border border-slate-700/50">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="text-sm text-slate-300">{row.time}</div>
                          <Badge className="bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800/70">
                            {row.room}
                          </Badge>
                        </div>
                        <div className="mt-2 text-slate-100 font-medium">{row.course}</div>
                        <div className="text-sm text-slate-400">{row.faculty}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-200 text-sm">
                    Manage data from Courses, Faculty, and Rooms modules, then generate from Timetables.
                  </div>

                  <div>
                    <Link to="/dashboard" className="inline-flex">
                      <Button variant="outline" className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60">
                        View dashboard modules
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mt-16">
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Why Smart Classroom</div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">Consistent workflow across every module</h2>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {featureCards.map((f) => {
                const Icon = f.icon
                return (
                  <Card
                    key={f.title}
                    className="bg-slate-900/25 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-cyan-200" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-white font-semibold">{f.title}</div>
                          <div className="text-sm text-slate-400 leading-relaxed">{f.desc}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <section className="mt-16">
            <div className="space-y-2">
              <div className="text-sm text-slate-400">How it works</div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">From setup to published schedule</h2>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {steps.map((s, idx) => {
                const Icon = s.icon
                return (
                  <Card
                    key={s.title}
                    className="bg-slate-900/25 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">Step {idx + 1}</div>
                        <div className="w-10 h-10 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-200" />
                        </div>
                      </div>
                      <div className="mt-4 text-white font-semibold">{s.title}</div>
                      <div className="mt-1 text-sm text-slate-400 leading-relaxed">{s.desc}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <section className="mt-16">
            <Card className="bg-slate-900/35 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Sparkles className="h-4 w-4" />
                      Built for modern academic teams
                    </div>
                    <div className="text-2xl md:text-3xl font-semibold text-white">Create your timetable flow in minutes</div>
                    <div className="text-slate-300/80 max-w-2xl">
                      Sign up, configure your department data, and generate schedules from a single consistent interface.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link to="/signup">
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30 px-6">
                        Get started
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" className="border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60 px-6">
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <footer className="mt-14 pb-4 text-sm text-slate-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div>© {new Date().getFullYear()} Smart Classroom</div>
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Dashboard requires login
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
