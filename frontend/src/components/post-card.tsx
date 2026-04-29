import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

interface PostCardProps {
  username: string;
  status: "Lost" | "Found";
  description: string;
  location: string;
  date: string;
}

export default function PostCard({
  username,
  status,
  description,
  location,
  date,
}: PostCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-200 h-52 flex items-center justify-center text-gray-400 text-sm">
        [ Photo ]
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800">{username}</span>
          <Badge
            className={
              status === "Lost"
                ? "bg-[#C8102E] text-white"
                : "bg-green-600 text-white"
            }
          >
            {status === "Lost" ? "Item Lost" : "Found"}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-1">{description}</p>
        <p className="text-xs text-gray-400 mb-3">
          📍 {location} · {date}
        </p>
        <Button className="w-full bg-[#C8102E] hover:bg-[#a00d24] text-white">
          <MessageCircle className="w-4 h-4 mr-2" />
          Make Conversation
        </Button>
      </div>
    </div>
  );
}