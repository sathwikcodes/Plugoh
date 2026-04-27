import { redirect } from "next/navigation";

export default function CompleteProfileRedirect() {
  redirect("/dashboard/influencer/profile");
}
