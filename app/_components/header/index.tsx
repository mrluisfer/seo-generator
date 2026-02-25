import { FaviconExample } from "@/components/favicon";
import TextType from "@/components/TextType";
import GitHubRepository from "./github-repository";

export default function Header() {
  return (
    <header className="z-10 flex w-full items-center justify-between pt-10">
      <div className="flex items-center gap-3">
        <FaviconExample color="#2a81fb" className="size-12" />
        <TextType
          text={"SEO Generator"}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="_"
          as={"h1"}
          loop={false}
          className="max-w-42.5 text-3xl font-bold"
        />
      </div>
      <nav>
        <ul>
          <li>
            <GitHubRepository />
          </li>
        </ul>
      </nav>
    </header>
  );
}
