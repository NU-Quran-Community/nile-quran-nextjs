import { checkTokenValidity } from "@/actions/auth-actions";
import MonthGoal from "@/components/Home/MonthGoal";
import PerformanceBoard from "@/components/Home/PerformanceBoard";
import { redirect } from "next/navigation";

export default async function Home() {
  const isValid = await checkTokenValidity();
  if (!isValid.isValid) {
    redirect("/auth");
  }
  return (
    <div className="w-full flex justify-center gap-10 bg-[#EBF0EB]">
      <MonthGoal />
      <PerformanceBoard />
    </div>
  );
}
