import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const DEFAULT_DEPARTMENT_OPTIONS = [
  "Computer Science",
  "Computer Science and Engineering",
  "Information Technology",
  "IT",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence and Data Science",
  "Data Science",
  "Business Administration",
  "Mathematics",
  "Physics",
  "Chemistry",
]

const CUSTOM_VALUE = "__custom__"

export function DepartmentSelect({
  value,
  onChange,
  options = DEFAULT_DEPARTMENT_OPTIONS,
  placeholder = "Select department",
  customPlaceholder = "Enter department",
  selectClassName = "",
  inputClassName = "",
  required = false,
}) {
  const normalizedOptions = useMemo(
    () => [...new Set((Array.isArray(options) ? options : DEFAULT_DEPARTMENT_OPTIONS).map((option) => String(option).trim()).filter(Boolean))],
    [options],
  )

  const isKnownValue = normalizedOptions.includes(value)
  const [mode, setMode] = useState(isKnownValue ? value : value ? CUSTOM_VALUE : "")
  const [customValue, setCustomValue] = useState(isKnownValue ? "" : value || "")

  useEffect(() => {
    if (normalizedOptions.includes(value)) {
      setMode(value)
      setCustomValue("")
      return
    }

    setMode(value ? CUSTOM_VALUE : "")
    setCustomValue(value || "")
  }, [value, normalizedOptions])

  const handleSelectChange = (nextValue) => {
    setMode(nextValue)

    if (nextValue === CUSTOM_VALUE) {
      onChange(customValue)
      return
    }

    setCustomValue("")
    onChange(nextValue)
  }

  const showCustomInput = mode === CUSTOM_VALUE

  return (
    <div className="space-y-2">
      <Select value={mode || undefined} onValueChange={handleSelectChange} required={required}>
        <SelectTrigger className={selectClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {normalizedOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_VALUE}>Other</SelectItem>
        </SelectContent>
      </Select>

      {showCustomInput && (
        <Input
          value={customValue}
          onChange={(event) => {
            const nextValue = event.target.value
            setCustomValue(nextValue)
            onChange(nextValue)
          }}
          placeholder={customPlaceholder}
          required={required}
          className={inputClassName}
        />
      )}
    </div>
  )
}