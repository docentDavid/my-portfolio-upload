import { getProject } from "@/app/actions/projects";
import { notFound } from "next/navigation";
import EditProjectForm from "./EditProjectForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <EditProjectForm project={project} />;
}
