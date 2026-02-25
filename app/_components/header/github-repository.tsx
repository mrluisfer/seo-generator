import { Loader } from "@/components/ai-elements/loader";
import { GitHub } from "@/components/icons/github";
import { fetcher } from "@/lib/fetcher";
import { GitForkIcon, StarIcon } from "lucide-react";
import useSWR from "swr";

type Repository = {
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
};

export default function GitHubRepository() {
  const { data, error } = useSWR("/api/github-user", fetcher);

  if (error) return <RepositoryLoader />;
  if (!data) return <RepositoryLoader />;

  const repository: Repository = {
    name: data?.name,
    html_url: data?.html_url,
    description: data?.description,
    stargazers_count: data?.stargazers_count,
    forks_count: data?.forks_count,
  };

  return (
    <a
      href={repository.html_url}
      target="_blank"
      rel="noreferrer"
      className="bg-background group block w-full max-w-[320px] rounded-md border p-2 shadow-sm transition-all hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80"
      aria-label={`Open ${repository.name} repository on GitHub`}
    >
      <div className="flex items-center justify-between">
        <h3 className="mb-1 flex items-center gap-1 truncate font-semibold text-[#539BF5] group-hover:underline">
          <GitHub />
          {repository.name}
        </h3>
        <div className="flex gap-2 text-sm text-[#768390]">
          <span className="flex items-center gap-1 text-xs text-yellow-400 transition">
            <StarIcon className="size-4" /> {repository.stargazers_count}
          </span>
          <span className="flex items-center gap-1 text-xs text-purple-400 transition">
            <GitForkIcon className="size-4" /> {repository.forks_count}
          </span>
        </div>
      </div>
      {repository.description && <p className="line-clamp-2 text-xs text-[#8b949e]">{repository.description}</p>}
    </a>
  );
}

function RepositoryLoader() {
  return (
    <div className="bg-background flex w-full max-w-[320px] items-center justify-center rounded-md border px-2 py-4 shadow-sm transition-all hover:bg-neutral-900">
      <Loader />
    </div>
  );
}
