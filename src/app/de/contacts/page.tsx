import { redirect } from "next/navigation";

export default function ContactsRedirect() {
  redirect("/de/?brief=1");
}
