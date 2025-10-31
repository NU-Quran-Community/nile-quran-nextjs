"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LeaderboardUser {
  id: number;
  name: string;
  username: string;
  points: number;
  groups: string[];
}

interface Props {
  initialData: LeaderboardUser[];
}

export default function PerformanceBoardClient({ initialData }: Props) {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const leaderboardData = initialData;
  const isLoading = false;

  // Sort in ascending order (lowest points first)
  const sortedData = [...leaderboardData].sort((a, b) => a.points - b.points);

  const maxPoints = Math.max(...sortedData.map((u) => u.points));
  const minPoints = Math.min(...sortedData.map((u) => u.points));

  const getBarColors = (points: number) => {
    if (points === maxPoints) {
      return "bg-[#9ADD00] border-2 border-[#043F2E]";
    } else if (points === minPoints) {
      return "bg-[#B4C197] border-2 border-[#043F2E]";
    } else {
      return "bg-[#B5CF7C] border-2 border-[#043F2E]";
    }
  };

  const getHijriDate = (date: Date) => {
    try {
      const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
        month: "long",
      });
      return hijriFormatter.format(date);
    } catch {
      return date.toLocaleDateString("ar-EG", { month: "long" });
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);

    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);

    if (nextMonth > currentMonth) {
      return;
    }

    setSelectedDate(newDate);
  };

  const currentMonthHijri = getHijriDate(selectedDate);

  const canGoNext = () => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      1
    );

    return nextMonthStart <= currentMonth;
  };

  if (sortedData.length === 0 && !isLoading) {
    return (
      <div className="w-[800px] max-w-6xl mx-auto p-6 h-[460px]" dir="rtl">
        <h2 className="text-2xl font-bold text-center mb-8 text-[#2C5234]">
          لوحة الإنجازات - {currentMonthHijri}
        </h2>

        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 shadow-sm transition-colors"
            aria-label="الشهر السابق"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <p className="text-gray-600">لا توجد بيانات لعرضها في هذا الشهر</p>
          </div>

          <button
            onClick={handleNextMonth}
            disabled={!canGoNext()}
            className="p-2 rounded-lg bg-white hover:bg-gray-100 shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="الشهر التالي"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[800px] h-[460px] mx-auto p-6" dir="rtl">
      <h2 className="text-2xl font-bold text-center mb-8 text-[#2C5234]">
        لوحة الإنجازات - {currentMonthHijri}
      </h2>

      <div className="bg-[#F7FBEA]  rounded-xl p-8 shadow-sm relative border border-[#043F2E]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#9ACD32] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">جاري التحميل...</p>
            </div>
          </div>
        )}

        {/* Scrollable container */}
        <div className="relative h-[350px]  flex items-end justify-evenly gap-4 border-b-2 border-b-[#043F2E] w-full px-4 overflow-x-auto overflow-y-hidden">
          {sortedData.map((user) => {
            const maxBarHeight = 210; // max bar height in pixels
            const normalized = user.points / maxPoints;
            const heightPx =
              Math.pow(normalized, 1.5) * maxBarHeight * 0.9 + 40;

            return (
              <div
                key={user.id}
                className="flex flex-col items-center justify-end gap-2 w-28 relative"
              >
                <div className="flex flex-col items-center justify-end">
                  <div className="relative flex flex-col items-center">
                    {/* Bar (bottom) */}
                    <div className="flex items-end justify-center h-[400px]">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPx}px` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`w-20 ${getBarColors(
                          user.points
                        )} rounded-t-lg flex items-center justify-center relative`}
                      >
                        <div className="absolute -top-24 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-300 border-2 border-[#9ADD00] flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <p className="text-sm text-[#043F2E] font-bold mt-2 text-center">
                            {user.name}
                          </p>
                        </div>

                        <span className="text-[#043F2E] font-bold text-base mb-2">
                          {user.points} نقاط
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between w-full mt-4">
          <button
            onClick={handlePreviousMonth}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#E6EECD] hover:opacity-70 cursor-pointer shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="الشهر السابق"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleNextMonth}
            disabled={isLoading || !canGoNext()}
            className="p-2 rounded-lg bg-[#E6EECD] hover:opacity-70 cursor-pointer shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="الشهر التالي"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
