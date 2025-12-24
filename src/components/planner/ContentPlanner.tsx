import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Plus, ImageIcon, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ScheduledPost {
  id: string;
  title: string;
  type: "image" | "carousel" | "video";
  time: string;
}

const mockSchedule: Record<string, ScheduledPost[]> = {
  "2026-01-15": [{ id: "1", title: "Resume tips", type: "image", time: "9:00 AM" }],
  "2026-01-16": [{ id: "2", title: "ATS breakdown", type: "carousel", time: "10:00 AM" }],
  "2026-01-17": [{ id: "3", title: "Interview prep", type: "video", time: "11:00 AM" }],
  "2026-01-20": [
    { id: "4", title: "Skills showcase", type: "image", time: "9:00 AM" },
    { id: "5", title: "Portfolio tips", type: "carousel", time: "2:00 PM" },
  ],
  "2026-01-22": [{ id: "6", title: "Career growth", type: "image", time: "10:00 AM" }],
  "2026-01-25": [{ id: "7", title: "Networking guide", type: "carousel", time: "9:00 AM" }],
};

const typeConfig = {
  image: { icon: ImageIcon, color: "bg-cyan-400/20 text-cyan-400" },
  carousel: { icon: FileText, color: "bg-purple-400/20 text-purple-400" },
  video: { icon: Video, color: "bg-pink-400/20 text-pink-400" },
};

export function ContentPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(day);
      const posts = mockSchedule[dateKey] || [];
      const isToday = day === 15 && currentDate.getMonth() === 0; // Mock "today"

      days.push(
        <motion.div
          key={day}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: day * 0.01 }}
          className={`h-32 p-2 rounded-lg border transition-all hover:border-primary/50 ${
            isToday ? "border-primary bg-primary/5" : "border-border bg-card/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
              {day}
            </span>
            {posts.length === 0 && (
              <button className="w-6 h-6 rounded-md bg-secondary hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Plus className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="space-y-1 overflow-hidden">
            {posts.slice(0, 2).map((post) => {
              const config = typeConfig[post.type];
              const Icon = config.icon;
              return (
                <div
                  key={post.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs truncate ${config.color}`}
                >
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{post.title}</span>
                </div>
              );
            })}
            {posts.length > 2 && (
              <p className="text-xs text-muted-foreground">+{posts.length - 2} more</p>
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Content Planner</h1>
          <p className="text-muted-foreground mt-2">Schedule and manage your LinkedIn posts</p>
        </div>
        <Button variant="gradient">
          <Plus className="w-5 h-5" />
          Schedule Post
        </Button>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-xl font-display font-semibold text-foreground">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center gap-6"
      >
        {Object.entries(typeConfig).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <div key={type} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-muted-foreground capitalize">{type}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
