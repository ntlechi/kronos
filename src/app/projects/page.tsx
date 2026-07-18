import { redirect } from "next/navigation";

/** Legacy route — Activities is the user-facing name. */
export default function ProjectsRedirectPage() {
  redirect("/activities");
}
