import { Label } from "@/components/ui/label";
import Link from "next/link";
import { officialDebuggers } from "./official-debuggers";

export default function OfficialDebuggers() {
  return (
    <div className="mt-10">
      <Label className="mb-6">Official Debuggers</Label>
      <ul>
        {officialDebuggers.map(({ label, url }) => (
          <li key={label} className="mt-2">
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="list-item w-fit text-blue-400 transition hover:text-blue-500 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
