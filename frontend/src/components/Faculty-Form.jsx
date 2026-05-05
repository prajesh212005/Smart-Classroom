import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { DepartmentSelect } from "@/components/DepartmentSelect";

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function FacultyForm({ initialData = {}, onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    specialization: [],
    maxHoursPerWeek: 20,
    availability: daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: [] }), {}),
    preferences: { preferredTimeSlots: [], avoidTimeSlots: [] }
  });

  const [specializationInput, setSpecializationInput] = useState("");
  const [timeSlotInput, setTimeSlotInput] = useState({ day: "", start: "", end: "" });
  const [preferredInput, setPreferredInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");

  // ✅ FIXED: The useEffect now depends on the unique ID of the faculty member.
  // This prevents it from re-running and overwriting state on every render.
  useEffect(() => {
    if (initialData?._id) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        department: initialData.department || "",
        specialization: initialData.specialization || [],
        maxHoursPerWeek: initialData.maxHoursPerWeek || 20,
        // Ensure availability is a complete object even if some days are missing in the DB
        availability: daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: initialData.availability?.[day] || [] }), {}),
        preferences: initialData.preferences || { preferredTimeSlots: [], avoidTimeSlots: [] }
      });
    } else {
      // Reset form for "Add New" case
       setFormData({
        name: "",
        email: "",
        department: "",
        specialization: [],
        maxHoursPerWeek: 20,
        availability: daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: [] }), {}),
        preferences: { preferredTimeSlots: [], avoidTimeSlots: [] }
      });
    }
  }, [initialData?._id]); // <-- THE KEY CHANGE IS HERE

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addSpecialization = () => {
    const spec = specializationInput.trim();
    if (spec && !formData.specialization.includes(spec)) {
      setFormData((prev) => ({ ...prev, specialization: [...prev.specialization, spec] }));
      setSpecializationInput("");
    }
  };

  const removeSpecialization = (spec) => {
    setFormData((prev) => ({ ...prev, specialization: prev.specialization.filter((s) => s !== spec) }));
  };

  const addTimeSlot = () => {
    const { day, start, end } = timeSlotInput;
    if (!day || !start || !end) return;
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: [...prev.availability[day], { start, end }]
      }
    }));
    setTimeSlotInput({ day: "", start: "", end: "" });
  };

  const removeTimeSlot = (day, index) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].filter((_, i) => i !== index)
      }
    }));
  };

  const addPreference = (type, value) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: [...prev.preferences[type], value.trim()]
      }
    }));
    type === "preferredTimeSlots" ? setPreferredInput("") : setAvoidInput("");
  };

  const removePreference = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: prev.preferences[type].filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300 font-medium">Name *</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" required className="mt-1 bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70" />
        </div>
        <div>
          <Label className="text-slate-300 font-medium">Email *</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email address" required className="mt-1 bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70" />
        </div>
      </div>

      <div>
        <Label className="text-slate-300 font-medium">Department *</Label>
        <DepartmentSelect
          value={formData.department}
          onChange={(department) => setFormData({ ...formData, department })}
          placeholder="Select department"
          customPlaceholder="Type department name"
          required
          selectClassName="mt-1 w-full bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70"
          inputClassName="mt-1 w-full bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70"
        />
      </div>

      <div>
        <Label className="text-slate-300 font-medium">Max Hours/Week *</Label>
        <Input type="number" value={formData.maxHoursPerWeek} onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: Number(e.target.value) })} min={1} max={40} required className="mt-1 bg-slate-800/50 border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70" />
      </div>

      {/* Specialization */}
      <div>
        <Label className="text-slate-300 font-medium">Specialization</Label>
        <div className="flex gap-2 mt-1">
          <Input value={specializationInput} onChange={(e) => setSpecializationInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialization())} placeholder="Add specialization" className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70" />
          <Button type="button" onClick={addSpecialization} className="bg-gradient-to-r from-blue-600/50 to-cyan-600/50 hover:from-blue-600 hover:to-cyan-600 text-white border border-blue-500/30 whienospace">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.specialization.map((spec) => (
            <Badge key={spec} className="flex items-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-200 border border-indigo-500/50">
                {spec}
                <button type="button" onClick={() => removeSpecialization(spec)} className="rounded-full hover:bg-white/20 p-0.5 transition-all">
                    <X className="h-3 w-3" />
                </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <Label className="text-slate-300 font-medium">Availability</Label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mt-1">
          <select value={timeSlotInput.day} onChange={(e) => setTimeSlotInput({ ...timeSlotInput, day: e.target.value })} className="border bg-slate-800/50 border-slate-600/50 focus:border-blue-500 text-slate-200 p-2.5 rounded-md h-10 transition-all duration-300 hover:border-slate-500/70">
            <option value="">Select Day</option>
            {daysOfWeek.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>
          <Input type="time" value={timeSlotInput.start} onChange={(e) => setTimeSlotInput({ ...timeSlotInput, start: e.target.value })} className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70" />
          <Input type="time" value={timeSlotInput.end} onChange={(e) => setTimeSlotInput({ ...timeSlotInput, end: e.target.value })} className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500 text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70" />
          <Button type="button" onClick={addTimeSlot} className="bg-gradient-to-r from-emerald-600/50 to-emerald-600/50 hover:from-emerald-600 hover:to-emerald-600 text-white border border-emerald-500/30">Add Slot</Button>
        </div>
         <div className="flex flex-wrap gap-2 mt-3">
            {daysOfWeek.flatMap((day) =>
              formData.availability[day]?.map((slot, idx) => (
                <Badge key={`${day}-${idx}`} className="flex items-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-blue-500/30 to-cyan-600/30 text-blue-200 border border-blue-500/50">
                  {day.charAt(0).toUpperCase() + day.slice(1)}: {slot.start}-{slot.end}
                   <button type="button" className="rounded-full hover:bg-white/20 p-0.5 transition-all" onClick={() => removeTimeSlot(day, idx)}>
                     <X className="h-3 w-3" />
                   </button>
                </Badge>
              ))
            )}
          </div>
      </div>

      {/* Preferences */}
      <div>
        <Label className="text-slate-300 font-medium">Preferred Time Slots (e.g., "Morning", "Afternoon")</Label>
        <div className="flex gap-2 mt-1">
          <Input value={preferredInput} onChange={(e) => setPreferredInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreference("preferredTimeSlots", preferredInput))} placeholder="Morning, Afternoon, etc." className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70" />
          <Button type="button" onClick={() => addPreference("preferredTimeSlots", preferredInput)} className="bg-gradient-to-r from-blue-600/50 to-cyan-600/50 hover:from-blue-600 hover:to-cyan-600 text-white border border-blue-500/30">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.preferences.preferredTimeSlots.map((slot, idx) => (
            <Badge key={idx} className="flex items-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-orange-200 border border-orange-500/50">{slot}
                <button type="button" className="rounded-full hover:bg-white/20 p-0.5 transition-all" onClick={() => removePreference("preferredTimeSlots", idx)}>
                    <X className="h-3 w-3" />
                </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-slate-300 font-medium">Avoid Time Slots (e.g., "Friday Afternoon")</Label>
        <div className="flex gap-2 mt-1">
          <Input value={avoidInput} onChange={(e) => setAvoidInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreference("avoidTimeSlots", avoidInput))} placeholder="Friday Afternoon, etc." className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500 text-slate-200 placeholder-slate-500 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70" />
          <Button type="button" onClick={() => addPreference("avoidTimeSlots", avoidInput)} className="bg-gradient-to-r from-red-600/50 to-rose-600/50 hover:from-red-600 hover:to-rose-600 text-white border border-red-500/30">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.preferences.avoidTimeSlots.map((slot, idx) => (
            <Badge key={idx} className="flex items-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-red-500/30 to-rose-500/30 text-red-200 border border-red-500/50">{slot}
                <button type="button" className="rounded-full hover:bg-white/20 p-0.5 transition-all" onClick={() => removePreference("avoidTimeSlots", idx)}>
                    <X className="h-3 w-3" />
                </button>
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/40 transition-all duration-300 py-2.5 border-0 rounded-lg">{loading ? "Saving..." : "Save Faculty"}</Button>
    </form>
  );
}
