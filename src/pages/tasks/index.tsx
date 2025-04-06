// import TaskDetail from "@/components/TaskDetail";
// import { authOptions } from "@/lib/auth";
// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";

// export default async function TaskPage({ params }: { params: { id: string } }) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     redirect("/login");
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <TaskDetail taskId={params.id} />
//     </div>
//   );
// }
