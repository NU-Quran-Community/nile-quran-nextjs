// ControlPanelClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Lalezar, Tajawal } from "next/font/google";
import { Progress } from "@/components/ui/progress";
import {
  addUserActivity,
  deleteUserActivity,
  getWeekData,
} from "@/actions/activities";
import { getWeeksOfMonth } from "@/lib/utils";

// 🟢 Fonts
const lalezar = Lalezar({ subsets: ["latin"], weight: "400" });
const tajawal = Tajawal({ subsets: ["latin"], weight: "700" });

// 🟢 Types
type Category = { id: number; name_ar: string };
type User = { id: number; name: string; group: string; points: number };
type Activity = {
  id?: number;
  user_id?: number;
  category_id: number;
  date?: string;
  // allow other unknown fields but avoid `any`
  [key: string]: unknown;
};

interface ControlPanelClientProps {
  success: boolean;
  users: User[];
  categories: Category[];
  activities: Record<string, Activity[]>;
  error?: string;
}

// 🟢 Assets
import ArrwoLeft from "@/public/ArrowLeft.png";
import ArrwoRight from "@/public/Arrowright.png";
import Mask1 from "@/public/Mask.png";
import Mask2 from "@/public/Mask2.png";

// 🟢 Component
export default function ControlPanelClient({
  Data,
}: {
  Data: ControlPanelClientProps;
}) {
  const [data, setData] = useState<ControlPanelClientProps>(Data);
  const [weekIndex, setWeekIndex] = useState(2);
  const [loading, setLoading] = useState(false);
  const weeks = getWeeksOfMonth(new Date());
const getArabicWeekName = (index: number): string => {
    const names = [
      "الأول",
      "الثاني",
      "الثالث",
      "الرابع",
      "الخامس",
      "السادس",
      "السابع",
      "الثامن",
      "التاسع",
      "العاشر",
    ];
    return names[index] || `${index + 1}`;
  };

  // Helper function to check if user has activity for category
  const hasActivity = (userId: number, categoryId: number): boolean => {
    if (!data.activities) return false;
    const userActivities = data.activities[userId.toString()] || [];
    return userActivities.some((activity) => activity.category_id === categoryId);
  };

  // 🟡 Handle checkbox input
  const handleInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
    categoryId: number,
    uid: number
  ) => {
    const checked = e.target.checked;
    const date = new Date().toISOString();
    setLoading(true);

    try {
      if (checked) {
        const res = await addUserActivity(uid, categoryId, date);
        if (!res.success) {
          alert(res.error || "حدث خطأ أثناء إضافة النشاط");
          e.target.checked = false;
          setLoading(false);
          return;
        }
      } else {
        const res = await deleteUserActivity(uid, categoryId);
        if (!res.success) {
          alert(res.error || "حدث خطأ أثناء حذف النشاط");
          e.target.checked = true;
          setLoading(false);
          return;
        }
      }

      // Refresh data
      const { start, end } = weeks[weekIndex];
      const newData = await getWeekData(start.toISOString(), end.toISOString());
      if (newData.success) {
        setData({
          success: newData.success,
          users: Array.isArray(newData.users) ? newData.users : (newData.users?.users || []),
          categories: newData.categories || [],
          activities: newData.activities || {},
          error: newData.error,
        });
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  // 🟡 Handle week switching
  const handleWeekChange = async (dir: "prev" | "next") => {
    const newIndex = dir === "prev" ? weekIndex - 1 : weekIndex + 1;
    if (newIndex < 0 || newIndex >= weeks.length) return;

    setLoading(true);
    setWeekIndex(newIndex);

    const { start, end } = weeks[newIndex];
    try {
      const newData = await getWeekData(start.toISOString(), end.toISOString());
      if (newData.success) {
        setData({
          success: newData.success,
          users: (Array.isArray(newData.users) ? newData.users : (newData.users?.users || [])) as User[],
          categories: newData.categories || [],
          activities: newData.activities || {},
          error: newData.error,
        });
      }
    } catch (error) {
      console.error("Error loading week:", error);
      alert("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const users = data.users || [];
  const categories = data.categories || [];

  return (
    <div className="relative flex flex-col min-h-screen items-center bg-[#EBF0EB] overflow-hidden">
      {/* 🟢 Header */}
      <div className="absolute top-0 left-0 w-full h-[207px] bg-[#BEE663] py-6 z-10">
        <h2 className="text-4xl font-bold text-end pr-28">لوحة التحكم</h2>
      </div>

      {/* 🟢 Content */}
      <div className="relative z-20 container mt-28 p-6 flex flex-col gap-15">
        {/* Progress Bar */}
        <div className="w-full h-[123px] bg-[#F7FBEA] p-7 gap-5 border border-[#043F2E] rounded-2xl flex">
          <div className="relative flex-1 h-[35px]">
            <Progress
              value={((weekIndex + 1) / weeks.length) * 100}
              className="h-[35px] bg-[#DEFF90]"
              className2="bg-[#9ADD00]"
            />
          </div>
          <div className="flex flex-col text-[#043F2E]">
            <p className={`${lalezar.className} text-[28.5px]`}>جمادى الأول</p>
            <p className={`${lalezar.className} text-[17px] text-end`}>
              الأسبوع {getArabicWeekName(weekIndex)}
            </p>
          </div>
        </div>

        {/* Main Table */}
        <div className="relative w-full bg-[#F7FBEA] p-7 border border-[#043F2E] rounded-2xl flex flex-col overflow-hidden">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col justify-center items-center z-50">
              <div className="w-10 h-10 border-4 border-[#043F2E] border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-[#043F2E] font-bold">
                جارِ تحميل الأسبوع...
              </p>
            </div>
          )}

          {/* Header Row */}
          <div className="relative h-8 w-full flex">
            <div className="w-[200px] pr-3 h-full border-b border-r border-black flex justify-end items-center gap-2">
              <div
                className={`${tajawal.className} font-bold text-[15px] text-[#043F2E]`}
              >
                مجموع الشهر
              </div>
            </div>

            <div className="flex-1 flex gap-3 pr-3 justify-center items-center h-full border-b border-r border-black">
              <button
                onClick={() => handleWeekChange("prev")}
                disabled={loading || weekIndex === 0}
                className="relative w-[18px] h-[18px] flex justify-center items-center rounded-[3px] bg-[#043F2E] disabled:opacity-40"
              >
                <Image src={ArrwoLeft} alt="previous" width={5} height={5} />
              </button>

              <div
                className={`${tajawal.className} font-bold text-[15px] text-[#043F2E]`}
              >
                الأسبوع {getArabicWeekName(weekIndex)}
              </div>

              <button
                onClick={() => handleWeekChange("next")}
                disabled={loading || weekIndex === weeks.length - 1}
                className="relative w-[18px] h-[18px] flex justify-center items-center rounded-[3px] bg-[#043F2E] disabled:opacity-40"
              >
                <Image src={ArrwoRight} alt="next" width={5} height={5} />
              </button>
            </div>

            <div className="w-[400px] h-full border-b border-black flex">
              <div
                className={`w-[150px] py-5 border-r border-black ${tajawal.className} font-bold text-[15px] text-[#043F2E] flex justify-center items-center`}
              >
                المجموعة
              </div>
              <div
                className={`w-[250px] ${tajawal.className} font-bold text-[15px] text-[#043F2E] flex justify-center items-center`}
              >
                الاسم
              </div>
            </div>
          </div>

          {/* Category Header */}
          <div className="relative w-full h-8 flex">
            <div className="relative w-[200px] pr-3 border-b border-r border-black flex justify-end items-center gap-2">
              <Image src={Mask1} alt="" fill />
            </div>
            <div className="flex-1 flex justify-center items-center h-full border-b border-r border-black">
              {categories.map((category: Category) => (
                <div
                  key={category.id}
                  className={`flex-1 flex h-full justify-center items-center border-r border-black ${tajawal.className} text-[12px] font-bold text-[#043F2E]`}
                >
                  {category.name_ar}
                </div>
              ))}
            </div>
            <div className="relative w-[400px] h-full border-b border-black flex">
              <div className="absolute w-[400px] h-8 top-0 left-0 z-10">
                <Image src={Mask2} alt="" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* User Rows */}
          {users.length === 0 ? (
            <div className="relative w-full h-32 flex justify-center items-center">
              <p className={`${tajawal.className} text-2xl font-bold text-[#043F2E]`}>
                لا يوجد أشخاص
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="relative w-full h-8 flex">
                <div className="relative w-[200px] pr-3 border-b border-r border-black flex justify-end items-center gap-2">
                  <div>{user.points}</div>
                </div>

                <div className="flex-1 flex justify-center items-center h-full border-b border-r border-black">
                  {categories.map((category: Category) => (
                    <div
                      key={category.id}
                      className={`flex-1 flex h-full justify-center items-center border-r border-black ${tajawal.className} text-[12px] font-bold text-[#043F2E]`}
                    >
                      <input
                        type="checkbox"
                        checked={hasActivity(user.id, category.id)}
                        onChange={(e) => handleInput(e, category.id, user.id)}
                        disabled={loading}
                        className="w-5 h-5 appearance-none flex justify-center items-center bg-[#F3F3F3] border border-[#B6BFBC] rounded-sm checked:bg-[#8EE000] checked:border-[#043F2E] checked:before:content-['✔'] checked:before:text-[#043F2E] checked:before:text-[12px] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>

                <div className="relative w-[400px] h-full border-b border-black flex">
                  <div
                    className={`w-[150px] h-full border-r border-black ${tajawal.className} font-bold text-[15px] text-[#043F2E] flex justify-center items-center`}
                  >
                    {user.group}
                  </div>
                  <div
                    className={`w-[250px] ${tajawal.className} font-bold text-[15px] text-[#043F2E] flex justify-center items-center`}
                  >
                    {user.name}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}