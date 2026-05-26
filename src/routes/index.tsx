import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Leaderboards } from "@/components/Leaderboards";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Tournament standings</h1>
        <Leaderboards />
      </main>
    </div>
  );
}
