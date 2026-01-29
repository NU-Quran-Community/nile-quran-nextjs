"use client";

import { useState, useEffect } from "react";
import {
  getPoints,
  getUserActivities,
  addUserActivity,
  deleteUserActivity,
} from "@/actions/ControlBoard";

import { Tajawal } from "next/font/google";
import { hijriToGregorian } from "@tabby_ai/hijri-converter";

const tajawal = Tajawal({ subsets: ["latin"], weight: "700" });

type Category = { id: number; name_ar: string };
type Props = {
  userId: number;
  username: string;
  supervisor: string;
  categories: Category[];
  setLoading: (arg0: boolean) => void;
  weekIndex: number;
  fetchWeekData: (arg0: number) => void;
  loading: boolean;
  currentYear: number;
  currentMonth: number;
  currentWeek: number;
};
type Activity = {
  id: number;
  category: number;
  date: string;
};
type UserPoints = {
  user: number;
  points: number;
};

type PointsResponse = {
  points: UserPoints[];
};

export default function UserRow({
  userId,
  username,
  supervisor,
  categories,
  setLoading,
  weekIndex,
  fetchWeekData,
  loading,
  currentMonth,
  currentYear,
  currentWeek,
}: Props) {
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [isRowLoading, setIsRowLoading] = useState(true);

  // Fetch data using useEffect with date range
  useEffect(() => {
    const fetchData = async () => {
      setIsRowLoading(true);
      try {
        // Fetch activities for the specific date range
        const [activitiesData, pointsData] = await Promise.all([
          getUserActivities(userId, currentYear, currentMonth, weekIndex),
          getPoints(currentYear, currentMonth, weekIndex),
        ]);

        // Handle Activities
        const list = activitiesData.activities || activitiesData || [];
        setActivitiesList(list);

        // Handle Points
        const pointsRes = pointsData as PointsResponse;
        const userPointData = pointsRes.points.find((p) => p.user === userId);
        setPoints(userPointData ? userPointData.points : 0);
      } catch (error) {
        console.error("Error fetching row data", error);
      } finally {
        setIsRowLoading(false);
      }
    };

    // Only fetch if we have valid dates
    if (currentYear && currentMonth && currentWeek) {
      fetchData();
    }
  }, [userId, currentYear, currentMonth, weekIndex, currentWeek]);

  // Handle checkbox input
  const handleInput = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    activityId: number | undefined,
    categoryId: number,
    uid: number,
    count?: number | string,
  ) => {
    if (loading) return;
    let date = "";

    if (weekIndex === currentWeek) {
      date = new Date().toISOString();
    } else {
      const day = weekIndex === 1 ? 1 : (weekIndex - 1) * 7 + 1;
      const currentDate = hijriToGregorian({
        year: currentYear,
        month: currentMonth,
        day,
      });
      date = `${currentDate.year}-${currentDate.month}-${currentDate.day}T17:55:09.157Z`;
    }

    setLoading(true);

    try {
      /* =========================
       CATEGORY 5 (COUNTER)
    ========================== */
      if (categoryId === 5) {
        const newCount = Number(count);

        const existingActivities = activitiesList.filter(
          (a) => a.category === 5,
        );

        const currentCount = existingActivities.length;

        if (newCount > currentCount) {
          // ADD missing activities
          const diff = newCount - currentCount;
          for (let i = 0; i < diff; i++) {
            await addUserActivity(uid, 5, date, 1);
          }
        } else if (newCount < currentCount) {
          // DELETE extra activities
          const toDelete = existingActivities.slice(0, currentCount - newCount);
          for (const act of toDelete) {
            await deleteUserActivity(uid, act.id);
          }
        }
      } else {
        /* =========================
       OTHER CATEGORIES (CHECKBOX)
    ========================== */
        const checked = (e.target as HTMLInputElement).checked;

        if (checked) {
          await addUserActivity(uid, categoryId, date, 1);
        } else if (activityId !== undefined) {
          await deleteUserActivity(uid, activityId);
        }
      }

      /* =========================
       REFRESH DATA
    ========================== */
      const [newActivities, pointsData] = await Promise.all([
        getUserActivities(userId, currentYear, currentMonth, weekIndex),
        getPoints(currentYear, currentMonth, weekIndex),
      ]);

      setActivitiesList(newActivities.activities || newActivities || []);

      const pointsRes = pointsData as PointsResponse;
      const userPointData = pointsRes.points.find((p) => p.user === userId);
      setPoints(userPointData ? userPointData.points : 0);

      await fetchWeekData(weekIndex);
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching initial data
  if (isRowLoading) {
    return (
      <div className="w-full h-8 bg-gray-100 animate-pulse border-b border-black"></div>
    );
  }

  return (
    <div
      key={userId}
      className="relative w-full h-8 flex hover:bg-black/5 transition-colors"
    >
      <div className="relative w-[200px] pr-3 border-b border-r border-black flex justify-end items-center gap-2">
        <div className={`${tajawal.className} font-bold`}>{points}</div>
      </div>

      <div className="flex-1 flex justify-center items-center h-full border-b border-r border-black">
        {categories?.map((category: Category) => {
          // Find the specific activity for this category within the date range
          const categoryActivities = activitiesList.filter(
            (act: { category: number }) => act.category === category.id,
          );

          const currentActivity =
            category.id === 5 ? categoryActivities : categoryActivities[0];

          return category.id === 5 ? (
            <div
              key={category.id}
              className="flex-1 flex h-full justify-center items-center border-r border-black"
            >
              <select
                // Set the value based on your current state logic
                value={
                  Array.isArray(currentActivity) ? currentActivity.length : 0
                }
                disabled={loading}
                onChange={(e) =>
                  handleInput(
                    e,
                    Array.isArray(currentActivity) ? currentActivity[0]?.id : undefined,
                    category.id,
                    userId,
                    e.target.value,
                  )
                }
                className="w-16 h-5 bg-[#F3F3F3] border border-[#B6BFBC] rounded-sm cursor-pointer disabled:opacity-50 text-sm flex items-center focus:border-[#043F2E]"
              >
                {/* Generate options from 0 to 20 */}
                {Array.from({ length: 21 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              key={category.id}
              className={`flex-1 flex h-full justify-center items-center border-r border-black`}
            >
              <input
                type="checkbox"
                checked={!!currentActivity}
                onChange={(e) =>
                  handleInput(e, Array.isArray(currentActivity) ? currentActivity[0]?.id : currentActivity?.id, category.id, userId)
                }
                disabled={loading}
                className="w-5 h-5 appearance-none flex justify-center items-center bg-[#F3F3F3] border border-[#B6BFBC] rounded-sm checked:bg-[#8EE000] checked:border-[#043F2E] checked:before:content-['✔'] checked:before:text-[#043F2E] checked:before:text-[12px] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          );
        })}
      </div>

      <div className="relative w-[400px] h-full border-b border-black flex">
        <div
          className={`w-[150px] h-full border-r border-black ${tajawal.className} font-bold text-[15px] text-[#043F2E] flex justify-center items-center`}
        >
          {supervisor}
        </div>
        <div
          className={`w-[250px] ${tajawal.className} font-bold text-[15px] text-[#043F2E] flex justify-center items-center`}
        >
          {username}
        </div>
      </div>
    </div>
  );
}
