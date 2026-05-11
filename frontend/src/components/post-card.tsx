import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle } from "lucide-react";

function makePatternBg(bgColor: string, textColor: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='80'><text x='0' y='62' font-family='Arial Black,Arial,sans-serif' font-size='54' font-weight='900' letter-spacing='4' fill='${textColor}'>SAN DIEGO STATE UNIVERSITY</text></svg>`;
  return {
    backgroundColor: bgColor,
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundRepeat: "repeat" as const,
  };
}

const lightPatternBg = makePatternBg("#C8102E", "#a50d24");
const darkPatternBg = makePatternBg("#0a0a0a", "#242424");

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
  onMessageAboutItem?: (
    ownerUserId: number,
    itemId: number,
    itemTitle: string,
) => void;
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
      <div className="relative flex max-h-72 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 dark:hidden" style={lightPatternBg} />
        <div className="absolute inset-0 hidden dark:block" style={darkPatternBg} />
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image_url}
            alt={title}
            className="relative z-10 max-h-72 w-full object-contain"
          />
        ) : (
          <span className="relative z-10 py-16 text-sm text-white/60">
            [ Photo will appear here ]
          </span>
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
          onClick={() =>  onMessageAboutItem?.(user_id, id, title)}
          className="w-full bg-[#C8102E] font-heading font-bold text-white hover:bg-[#a00d24]"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Message About Item
        </Button>
      </div>
    </article>
  );
}