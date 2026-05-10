import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle } from "lucide-react";

interface PostCardProps {
  id: number;
  user_id: number;
  title: string;
  description: string;
  location: string;
  report_type: "lost" | "found";
  image_url: string | null;
  given_back: boolean;
  created_at: string;
  onMessageAboutItem?: (ownerUserId: number, itemId: number) => void;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function PostCard({
  id,
  user_id,
  title,
  description,
  location,
  report_type,
  image_url,
  given_back,
  created_at,
  onMessageAboutItem,
}: PostCardProps) {
  const isLost = report_type === "lost";

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-52 items-center justify-center bg-gray-100 text-sm text-gray-400 dark:bg-gray-700 dark:text-gray-500">
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image_url}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          "[ Photo will appear here ]"
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h2>

            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={14} />
              {location} · {formatDate(created_at)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge className="bg-[#C8102E] text-white">
              {isLost ? "Lost" : "Found"}
            </Badge>

            {given_back && (
              <Badge className="bg-gray-800 text-white">Returned</Badge>
            )}
          </div>
        </div>

        <p className="mb-5 text-sm leading-6 text-gray-700 dark:text-gray-300">{description}</p>

        <Button
          type="button"
          onClick={() => onMessageAboutItem?.(user_id, id)}
          className="w-full bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24]"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Message About Item
        </Button>
      </div>
    </article>
  );
}