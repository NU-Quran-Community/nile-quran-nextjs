import { checkTokenValidity } from "@/actions/auth-actions";
import { getGoalOfTheMonth } from "@/actions/goal";
import Image from "next/image";
import { redirect } from "next/navigation";
import Arrow from "@/public/goalArrow.png";
import { Lalezar, Tajawal } from "next/font/google";
import { Progress } from "../ui/progress";
const lalezar = Lalezar({
  subsets: ["latin"],
  weight: "400", 
});
const tajawal = Tajawal({
  subsets: ["latin"],
  weight: "700", 
});

export default async function MonthGoal() {
  const isValid = await checkTokenValidity();

  if (!isValid) {
    redirect("/auth");
  }

  // Fetch goal of the month
  const result = await getGoalOfTheMonth();


  return (
    <div className="relative mt-[120px] w-[327px] max-h-fit rounded-[17px] bg-[#043F2E] flex flex-col text-white p-4 gap-5 overflow-hidden" dir="rtl">
      <div className="absolute w-[283px] h-[120px] -z-10 -left-10">
        <div className="w-full h-full  relative">
            <Image src={Arrow} alt="" fill />
        </div>
      </div>

      <p className={` text-[40px]  ${lalezar.className} text-white`}>هدف الشهر</p>
      <p className={` font-medium ${tajawal.className} text-white`}>
        {result.success && result.data.description ? result.data.description : "لا يوجد هدف لهذا الشهر"}
      </p>
      
      {result.success && result.data.target !== undefined && result.data.current !== undefined ? (
        <Progress value={((result.data.target)-(result.data.current))*100} className=" h-10 bg-[#DEFF90]" className2="bg-[#9ADD00]"/>
      ) : null}
      
    </div>
  );
}
