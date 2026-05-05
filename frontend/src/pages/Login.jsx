import { useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ email: "", password: "", role: "student" })

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: form.email,
        password: form.password,
        role: form.role,
      })

      const token = response.data?.token
      if (!token) throw new Error("Missing token")

      const userRole = response.data?.user?.role || form.role
      const userId = response.data?.user?.id
      const userName = response.data?.user?.name
      const userEmail = response.data?.user?.email

      localStorage.setItem("token", token)
      localStorage.setItem("userRole", userRole)
      if (userId) localStorage.setItem("userId", String(userId))
      if (userName) localStorage.setItem("userName", String(userName))
      if (userEmail) localStorage.setItem("userEmail", String(userEmail))
      navigate("/dashboard", { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Login failed"
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s" />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-slate-900/35 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-500/10">
          <CardHeader className="p-6">
            <CardTitle className="text-white text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">Login to continue to smartclassroom</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  placeholder="you@example.com"
                  className="bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={onChange("password")}
                  placeholder="••••••••"
                  className="bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Login as</Label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full h-10 rounded-md bg-slate-800/50 border border-slate-600/50 text-slate-100 px-3"
                  required
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30"
              >
                {submitting ? "Logging in..." : "Login"}
              </Button>

              <div className="text-sm text-slate-400 text-center">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-cyan-300 hover:text-cyan-200">
                  Sign up
                </Link>
              </div>

              <div className="text-xs text-slate-500 text-center">
                <Link to="/" className="hover:text-slate-300">
                  Back to landing
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
