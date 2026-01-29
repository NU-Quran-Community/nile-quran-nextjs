import Auth from "@/components/Auth/Auth";
import Image from "next/image";
import Abstract from "@/public/abstract.png";
import { redirect } from "next/navigation";
import { checkTokenValidity } from "@/actions/auth-actions";

export default async function Page({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const User = await checkTokenValidity();
if (User.isValid) {
  redirect("/");
}
  const formMode = searchParams.mode || "login";
  return (
    <div className="w-full py-10 min-h-screen bg-[#EBF0EB] flex items-center">
      <div className="relative w-full h-full flex flex-col pl-96 justify-center  ">
        <div className="fixed z-10 right-0 w-[660px] h-full top-0">
          <Image src={Abstract} alt="" fill />
        </div>
        <Auth mode={formMode} />
      </div>
    </div>
  );
}
