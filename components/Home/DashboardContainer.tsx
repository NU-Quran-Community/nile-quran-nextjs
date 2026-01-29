"use client";

import React from "react";
import MonthGoalClient from "./MonthGoalClient";
import PerformanceBoardClient from "./PerformanceBoardClient";
import { getLeaderboardData } from "@/actions/PerformanceBoard";
import { getGoalOfTheMonth } from "@/actions/goal";
import { gregorianToHijri } from "@tabby_ai/hijri-converter";

interface LeaderboardUser {
  id: number;
  name: string;
  username: string;
  points: number;
  groups: string[];
}

interface GoalData {
  id?: number;
  description?: string;
  target?: number;
  current?: number;
}

export default function DashboardContainer() {
  const date = new Date();
  const hijriDate = gregorianToHijri({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });

  // 1. Move into State
  const [currentMonth] = React.useState(hijriDate.month); // Keep reference for "Next" limit
  const [month, setMonth] = React.useState(hijriDate.month);
  const [year, setYear] = React.useState(hijriDate.year);

  const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardUser[]>([]);
  const [goalData, setGoalData] = React.useState<GoalData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 2. Fetcher depends on state year/month
  const fetchDataForMonth = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [leaderboardResult, goalResult] = await Promise.all([
        getLeaderboardData(year, month),
        getGoalOfTheMonth(year, month),
      ]);
      if (leaderboardResult.success) setLeaderboardData(leaderboardResult.data);
      if (goalResult.success) setGoalData(goalResult.data);
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  React.useEffect(() => {
    fetchDataForMonth();
  }, [fetchDataForMonth]);

  const canGoNext = () => month < currentMonth;

  // 3. Update state to trigger re-renders
  const handlePreviousMonth = () => {
    if (isLoading) return;
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (isLoading || !canGoNext()) return;
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full h-full flex gap-10 justify-center ">
      <MonthGoalClient goalData={goalData} isLoading={isLoading} />
      <PerformanceBoardClient 
        leaderboardData={leaderboardData}
        isLoading={isLoading}
        error={error}
        canGoNext={canGoNext()}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onRetry={fetchDataForMonth}
        month={month}
        year={year}
      />
    </div>
  );
}