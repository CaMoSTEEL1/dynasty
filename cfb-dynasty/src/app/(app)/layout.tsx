import Navbar from "../components/Navbar";
import DynastyProvider from "../components/DynastyProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DynastyProvider>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </DynastyProvider>
  );
}
