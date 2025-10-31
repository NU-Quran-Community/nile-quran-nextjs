import { Lalezar, Tajawal } from "next/font/google";
import Link from "next/link";
const lalezar = Lalezar({
  subsets: ["latin"],
  weight: "400", 
});
const tajawal = Tajawal({
  subsets: ["latin"],
  weight: "700", 
});
export default function NavBar() {
  return (
    <div className="w-full text-[#BEE663] h-[68px] bg-[#043F2E] flex justify-between items-center px-28">
      <div className={`flex gap-10 ${tajawal.className}`}>
        <Link href={"/"} className="" >الصفحة الرئيسية</Link>
        <Link href={"/control-board"} className="" >لوحة التحكم</Link>
      </div>
      <p className={`${lalezar.className} text-[30px]`}>مقرأة النيل</p>
    </div>
  )
}
