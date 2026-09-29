import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-4">
        Welcome, {session.user.name ?? session.user.email}
      </p>

      <form
        action={async () => {
          "use server";

          await signOut({
            redirectTo: "/login",
          });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}