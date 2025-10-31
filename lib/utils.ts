import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";

export interface WeekRange {
  start: string;
  end: string;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentWeek(): WeekRange {
  const today = new Date();
  const friday = new Date(today);
  friday.setDate(today.getDate() - ((today.getDay() + 2) % 7));
  friday.setHours(0, 0, 0, 0);
  
  const thursday = new Date(friday);
  thursday.setDate(friday.getDate() + 6);
  thursday.setHours(23, 59, 59, 999);
  
  return {
    start: friday.toISOString().split('T')[0],
    end: thursday.toISOString().split('T')[0]
  };
}

export function getWeekByOffset(offset: number): WeekRange {
  const today = new Date();
  const friday = new Date(today);
  friday.setDate(today.getDate() - ((today.getDay() + 2) % 7));
  friday.setDate(friday.getDate() + (offset * 7));
  friday.setHours(0, 0, 0, 0);
  
  const thursday = new Date(friday);
  thursday.setDate(friday.getDate() + 6);
  thursday.setHours(23, 59, 59, 999);
  
  return {
    start: friday.toISOString().split('T')[0],
    end: thursday.toISOString().split('T')[0]
  };
}

export function getWeekNumber(date: Date): number {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const friday = new Date(startOfMonth);
  friday.setDate(startOfMonth.getDate() - ((startOfMonth.getDay() + 2) % 7));
  
  const diffTime = date.getTime() - friday.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.floor(diffDays / 7) + 1;
}

export function getTotalWeeksInMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  
  return getWeekNumber(lastDay);
}

export function getHijriMonth(): string {
  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  
  // This is a simplified version - you may want to use a proper Hijri calendar library
  const today = new Date();
  const monthIndex = today.getMonth();
  return hijriMonths[monthIndex % 12];
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Color mapping for categories
export const categoryColors: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-blue-500',
  3: 'bg-purple-500',
  4: 'bg-yellow-500',
  5: 'bg-orange-500',
  6: 'bg-pink-500'
};
export function getWeeksOfMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks = [];
  let start = new Date(firstDay);
  while (start <= lastDay) {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    weeks.push({ start, end });
    start = new Date(end);
    start.setDate(start.getDate() + 1);
  }
  return weeks;
}
