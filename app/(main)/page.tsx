import { checkTokenValidity } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import DashboardContainer from "@/components/Home/DashboardContainer";

export default async function Home() {
  const isValid = await checkTokenValidity();

  if (!isValid.isValid) {
    redirect("/auth");
  }

  return (
    <div className="w-full  bg-[#EBF0EB] min-h-screen py-8">
      <DashboardContainer />
    </div>
  );
}
