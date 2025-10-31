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
    <div className="w-full h-screen bg-[#EBF0EB]">
      <div className="relative w-full h-full flex flex-col pl-96 justify-center ">
        <div className="absolute z-10 right-0 w-[660px] h-full top-0">
          <Image src={Abstract} alt="" fill />
        </div>
        <Auth mode={formMode} />
      </div>
    </div>
  );
}
