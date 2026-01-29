"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Lalezar, Tajawal } from "next/font/google";
import { Progress } from "@/components/ui/progress";
import { getUsers, getCategories } from "@/actions/ControlBoard";
import UserRow from "./userRow";
import { gregorianToHijri } from "@tabby_ai/hijri-converter";

// 🟢 Fonts
const lalezar = Lalezar({ subsets: ["latin"], weight: "400" });
const tajawal = Tajawal({ subsets: ["latin"], weight: "700" });

// 🟢 Types
type Category = { id: number; name_ar: string };
type User = {
  id: number;
  username: string;
  groups: string[];
  points: number;
  supervisor: string;
};
type Activity = {
  id?: number;
  user_id?: number;
  category_id: number;
  date?: string;
  [key: string]: unknown;
};

// Response structure expected from getUsers
export interface ControlPanelData {
  users: User[];
  categories: Category[];
  activities?: Record<string, Activity[]>;
  error?: string | unknown;
}

// 🟢 Assets
import ArrwoLeft from "@/public/ArrowLeft.png";
import ArrwoRight from "@/public/Arrowright.png";
import Mask1 from "@/public/Mask.png";
import Mask2 from "@/public/Mask2.png";
import { getHijriMonth, toArabicDigits } from "@/lib/utils";

// 🟢 Component
export default function ControlPanelClient() {
  const date = new Date();
  const hijriDate = gregorianToHijri({
    year: date.getFullYear(),
    month: date.getMonth() + 1, // Month number in Javascript Date API is zero-based.
    day: date.getDate(),
  });
  const [data, setData] = useState<ControlPanelData>({
    users: [],
    categories: [],
    activities: {},
  });
  const weekArabicNames = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس"];
  const [loading, setLoading] = useState(false);

  const getInitialWeekIndex = () => {
    if (hijriDate.day <= 28) {
      return Math.ceil(hijriDate.day / 7);
    }
    return 5;
  };
  const currentWeek = getInitialWeekIndex();
  const [month, setMonth] = useState(hijriDate.month);
  const [year,setYear]= useState(hijriDate.year);
  const [weekIndex, setWeekIndex] = useState<number>(getInitialWeekIndex);

  const fetchWeekData = useCallback(
    async (week: number) => {
      try {
        const [usersRes, categoriesRes] = await Promise.all([
          getUsers(year, month, week),
          getCategories(),
        ]);

        setData((prev) => {
          const newData = { ...prev };

          if (usersRes && usersRes.success) {
            const rawUsers = (usersRes).users;
            newData.users = Array.isArray(rawUsers)
              ? rawUsers
              : rawUsers?.results || [];
          } else {
            newData.error = usersRes?.error || "Error loading users";
          }

          if (categoriesRes && categoriesRes.success) {
            const rawCategories = (categoriesRes).categories;
            newData.categories = Array.isArray(rawCategories)
              ? rawCategories
              : rawCategories?.results || [];
          } else if (!newData.error) {
            newData.error = categoriesRes?.error || "Error loading categories";
          }

          return newData;
        });
      } catch (error) {
        console.error("Fetch error:", error);
        setData((prev) => ({ ...prev, error: "System error loading data" }));
      }
    },
    [year, month]
  );

  useEffect(() => {
    setLoading(true);
    fetchWeekData(weekIndex).finally(() => setLoading(false));
  }, [weekIndex, fetchWeekData]);

  const handleWeekChange = (dir: "prev" | "next") => {
    if (loading) return;

    if (dir === "next") {
      // If not at the last week, just go to next week
      if (weekIndex < 5) {
        setWeekIndex((prev) => prev + 1);
      } else {
        // We are at Week 5, so move to Week 1 of the NEXT Month
        setWeekIndex(1);
        if (month === 12) {
          // If Month 12, go to Month 1 and Next Year
          setMonth(1);
          setYear((prev) => prev + 1);
        } else {
          // Otherwise just next month
          setMonth((prev) => prev + 1);
        }
      }
    } else {
      // dir === "prev"
      // If not at the first week, just go to previous week
      if (weekIndex > 1) {
        setWeekIndex((prev) => prev - 1);
      } else {
        // We are at Week 1, so move to Week 5 of the PREVIOUS Month
        setWeekIndex(5);
        if (month === 1) {
          // If Month 1, go to Month 12 and Previous Year
          setMonth(12);
          setYear((prev) => prev - 1);
        } else {
          // Otherwise just previous month
          setMonth((prev) => prev - 1);
        }
      }
    }
  };
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
              value={(weekIndex / 5) * 100}
              className="h-[35px] bg-[#DEFF90]"
              className2="bg-[#9ADD00]  "
            />
          </div>
          <div className="flex flex-col text-[#043F2E]">
            {/* Dynamic Month Name */}
            <p className={`${lalezar.className} text-[28.5px]`}>
              {getHijriMonth(month-1)} -{toArabicDigits(year)}
            </p>
            <p className={`${lalezar.className} text-[17px] text-end`}>
              الأسبوع {weekArabicNames[weekIndex - 1]}
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
                جارِ تحميل البيانات...
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
                disabled={loading}
                className="relative w-[18px] h-[18px] flex justify-center items-center rounded-[3px] bg-[#043F2E] disabled:opacity-40 hover:bg-[#065f46] transition-colors"
              >
                <Image src={ArrwoLeft} alt="previous" width={5} height={5} />
              </button>

              <div
                className={`${tajawal.className} font-bold text-[15px] text-[#043F2E] min-w-[100px] text-center`}
              >
                الأسبوع {weekArabicNames[weekIndex - 1]}
              </div>

              <button
                onClick={() => handleWeekChange("next")}
                disabled={loading}
                className="relative w-[18px] h-[18px] flex justify-center items-center rounded-[3px] bg-[#043F2E] disabled:opacity-40 hover:bg-[#065f46] transition-colors"
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

          {/* Category Header with Week Navigation (Updated Masks) */}
          <div className="relative w-full h-8 flex">
            {/* Mask 1: Previous Week (Was Month) */}
            <div
              onClick={() => !loading && handleWeekChange("prev")}
              className={`relative w-[200px] pr-3 border-b border-r border-black flex justify-end items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${
                loading ? "pointer-events-none opacity-60" : ""
              }`}
              title="الأسبوع السابق"
            >
              <Image
                src={Mask1}
                alt="Previous Week"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 flex justify-center items-center h-full border-b border-r border-black">
              {/* Optional Chaining here prevents the specific error you saw */}
              {data?.categories?.map((category: Category) => (
                <div
                  key={category.id}
                  className={`flex-1 flex h-full justify-center items-center border-r border-black ${tajawal.className} text-[12px] font-bold text-[#043F2E]`}
                >
                  {category.name_ar}
                </div>
              ))}
            </div>

            <div className="relative w-[400px] h-full border-b border-black flex">
              {/* Mask 2: Next Week (Was Month) */}
              <div
                onClick={() => !loading && handleWeekChange("next")}
                className={`absolute w-[400px] h-8 top-0 left-0 z-10 cursor-pointer hover:opacity-80 transition-opacity ${
                  loading ? "pointer-events-none opacity-60" : ""
                }`}
                title="الأسبوع التالي"
              >
                <Image
                  src={Mask2}
                  alt="Next Week"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* User Rows */}
          {!data?.users || data.users.length === 0 ? (
            <div className="relative w-full h-32 flex justify-center items-center">
              <p
                className={`${tajawal.className} text-2xl font-bold text-[#043F2E]`}
              >
                لا يوجد أشخاص
              </p>
            </div>
          ) : (
            data.users.map((user) => {
              if (user?.groups?.includes("Student")) {
                return (
                  <UserRow
                    key={user.id}
                    userId={user.id}
                    username={user.username}
                    supervisor={user.supervisor}
                    categories={data.categories}
                    setLoading={setLoading}
                    weekIndex={weekIndex}
                    fetchWeekData={fetchWeekData}
                    loading={loading}
                    currentYear={year}
                    currentMonth={month}
                    currentWeek={currentWeek}
                  />
                );
              }
            })
          )}
        </div>
      </div>
    </div>
  );
}
