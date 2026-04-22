import { ArrowUpRight, ArrowDownLeft, Filter, Search } from "lucide-react";

const transactions = [
  {
    id: 1,
    date: "2026-04-01",
    desc: "Office Rent",
    amount: -1200,
    category: "Fixed Cost",
  },
  {
    id: 2,
    date: "2026-04-02",
    desc: "Client Payment - NovaProject",
    amount: 4500,
    category: "Revenue",
  },
];

export default function LedgerPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black text-nova-navy">General Ledger</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-nova-gold/20"
            />
          </div>
          <button className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-nova-navy">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-nova border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Date
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Description
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Category
              </th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors"
              >
                <td className="p-4 text-sm font-medium text-gray-500">
                  {t.date}
                </td>
                <td className="p-4 text-sm font-bold text-nova-navy">
                  {t.desc}
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                    {t.category}
                  </span>
                </td>
                <td
                  className={`p-4 text-sm font-black text-right ${t.amount > 0 ? "text-emerald-600" : "text-red-500"}`}
                >
                  <div className="flex items-center justify-end gap-1">
                    {t.amount > 0 ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownLeft size={14} />
                    )}
                    ${Math.abs(t.amount).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
