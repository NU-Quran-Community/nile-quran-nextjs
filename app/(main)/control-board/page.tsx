import { checkTokenValidity } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import ControlPanelClient from "@/components/Control-Board/ControlPanelClient";

export default async function ControlPanelPage() {
  const User = await checkTokenValidity();
  if (!User.isValid || !User.user.groups.includes("Admin")) {
    redirect("/auth");
  }

  return <ControlPanelClient />;
}
