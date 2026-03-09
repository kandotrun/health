import { fetchAllUsers } from "@/lib/fetchAllUsers";
import UserCard from "@/components/UserCard";

export const revalidate = 300; // ISR: 5 minutes

export default async function Home() {
  const users = await fetchAllUsers();

  return (
    <main className="min-h-screen py-12 px-4 sm:px-8">
      <header className="max-w-5xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
        <p className="text-neutral-400 mt-1">
          Team wellness overview &middot; powered by Oura Ring
        </p>
      </header>
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-1 lg:grid-cols-1">
        {users.map((user) => (
          <UserCard key={user.name} user={user} />
        ))}
      </div>
      <footer className="max-w-5xl mx-auto mt-12 text-center text-xs text-neutral-300">
        Data refreshes every 5 minutes
      </footer>
    </main>
  );
}
