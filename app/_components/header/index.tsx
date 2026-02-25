import { FaviconExample } from "@/components/favicon";
import TextType from "@/components/TextType";
import GitHubRepository from "./github-repository";

export default function Header() {
  return (
    <header className="z-10 flex w-full flex-col items-start justify-between gap-4 pt-8 sm:flex-row sm:items-center sm:pt-10">
      <div className="flex items-center gap-3">
        <FaviconExample color="#2a81fb" className="size-12" />
        <TextType
          id="container"
          text={"SEO Generator"}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="_"
          as={"h1"}
          loop={false}
          className="max-w-[10.5rem] text-2xl font-bold sm:text-3xl"
        />
      </div>
      <nav aria-label="Repository">
        <ul>
          <li>
            <GitHubRepository />
          </li>
        </ul>
      </nav>
    </header>
  );
}
