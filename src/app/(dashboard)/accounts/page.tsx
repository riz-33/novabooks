import { Wallet, Plus, MoreVertical } from "lucide-react";

// 1. This would eventually be a database call: await db.accounts.findMany()
const mockAccounts = [
  { id: 1, name: "Main Business Account", balance: 12500, bank: "HBL" },
  { id: 2, name: "Savings", balance: 5400, bank: "Meezan" },
];

export default function AccountsPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-novaNavy">My Accounts</h1>
          <p className="text-novaGold font-medium">
            Manage your linked banks and wallets.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-novaNavy text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg active:scale-95">
          <Plus size={18} />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAccounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white p-6 rounded-nova border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-novaNavy rounded-2xl">
                <Wallet size={24} />
              </div>
              <button className="text-gray-400 hover:text-novaNavy">
                <MoreVertical size={20} />
              </button>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              {acc.bank}
            </p>
            <h3 className="text-lg font-bold text-novaNavy mb-2">{acc.name}</h3>
            <p className="text-2xl font-black text-novaNavy">
              ${acc.balance.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
