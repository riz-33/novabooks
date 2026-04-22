import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-6xl font-black text-nova-navy tracking-tighter mb-4">
        NOVABOOKS
      </h1>
      <p className="text-gray-500 max-w-md mb-8 font-medium">
        The modern financial ledger for businesses that demand clarity and precision.
      </p>
      
      <Link 
        href="/login"
        className="group bg-nova-navy text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20"
      >
        Enter Dashboard
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </main>
  );
}