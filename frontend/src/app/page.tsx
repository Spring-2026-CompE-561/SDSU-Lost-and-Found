import Navbar from "@/components/navbar";
import PostCard from "@/components/post-card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SAMPLE_POSTS = [
  {
    username: "SDSU_Aztec",
    status: "Lost" as const,
    description: "Lost my red SDSU backpack near the library. Has a laptop inside.",
    location: "Love Library",
    date: "Apr 27",
  },
  {
    username: "Sarah L.",
    status: "Found" as const,
    description: "Found a set of keys near the student union. Has an Aztec lanyard.",
    location: "Student Union",
    date: "Apr 26",
  },
  {
    username: "SDSU_25",
    status: "Lost" as const,
    description: "Missing blue water bottle with stickers. Last seen at GMCS.",
    location: "GMCS Building",
    date: "Apr 25",
  },
];

const ONLINE_USERS = ["John S.", "Sarah L.", "SDSU_25", "SDSU_Aztec"];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto px-4 pt-5 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search lost & found items..."
            className="pl-9 bg-white border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-[200px_1fr_200px] gap-6">

        {/* Left — Filters */}
        <aside className="bg-white rounded-lg border border-gray-200 p-4 h-fit shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
            Filters
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {["Location", "Date", "Status: Lost", "Status: Found", "Color"].map(
              (filter) => (
                <li key={filter}>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-[#C8102E]">
                    <input type="checkbox" className="accent-[#C8102E]" />
                    {filter}
                  </label>
                </li>
              )
            )}
          </ul>
        </aside>

        {/* Center — Feed */}
        <main className="space-y-5">
          {SAMPLE_POSTS.map((post, i) => (
            <PostCard key={i} {...post} />
          ))}
        </main>

        {/* Right — Users + Inbox */}
        <aside className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Online
            </h2>
            <ul className="space-y-2">
              {ONLINE_USERS.map((user, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: ["#C8102E", "#22c55e", "#3b82f6", "#a855f7"][i % 4],
                    }}
                  />
                  {user}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Inbox
            </h2>
            <div className="space-y-2 mb-3">
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-3/5" />
            </div>
            <Input placeholder="Type a message..." className="text-xs mb-2" />
            <button className="w-full bg-[#C8102E] text-white text-sm py-1.5 rounded hover:bg-[#a00d24]">
              Send
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}