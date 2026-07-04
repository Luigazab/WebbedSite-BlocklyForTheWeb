import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from "@/components/ui/select"
  import React, { useState } from "react"
import { Plus } from "lucide-react"
  
  const xpRanges = [
    { level: 1, min: 0, max: 99 },
    { level: 2, min: 100, max: 282 },
    { level: 3, min: 283, max: 518 },
    { level: 4, min: 519, max: 749 },
    { level: 5, min: 750, max: 1118 },
    { level: 6, min: 1119, max: Infinity },
  ]
  
  function getLevelFromXp(xp) {
    for (const range of xpRanges) {
      if (xp >= range.min && xp <= range.max) return range.level
    }
    return 6
  }
  
  export function AddTopicModal({ course }) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [level, setLevel] = useState(1)
    const [xp, setXp] = useState(0)
  
    const handleLevelChange = (value) => {
      const selected = xpRanges.find((r) => r.level === Number(value))
      setLevel(Number(value))
      setXp(selected.min) // default to min XP for that level
    }
  
    const handleXpChange = (e) => {
      const val = parseInt(e.target.value, 10) || 0
      setXp(val)
      setLevel(getLevelFromXp(val))
    }
  
    return (
      <Dialog>
        {/* Use the Add Topic button as trigger */}
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Topic
          </Button>
        </DialogTrigger>
  
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add topic for {course.title}</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new topic.
            </DialogDescription>
          </DialogHeader>
  
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter topic title"
              />
            </div>
  
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter topic description"
              />
            </div>
  
            {/* Required Level */}
            <div className="space-y-2">
              <Label>Required Level</Label>
              <Select value={String(level)} onValueChange={handleLevelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {xpRanges.map((r) => (
                    <SelectItem key={r.level} value={String(r.level)}>
                      Level {r.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            {/* Required XP */}
            <div className="space-y-2">
              <Label>Required XP</Label>
              <Input
                type="number"
                value={xp}
                onChange={handleXpChange}
                placeholder="Enter XP"
              />
              <p className="text-xs text-muted-foreground">
                Level {level} range: {xpRanges.find((r) => r.level === level).min}–{xpRanges.find((r) => r.level === level).max === Infinity ? "∞" : xpRanges.find((r) => r.level === level).max}
              </p>
            </div>
          </div>
  
          <DialogFooter>
            <Button type="submit">Save Topic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
  