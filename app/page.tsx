"use client";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Fragment } from "react";
import OfficialDebuggers from "./_components/debugger";
import GenerateTags from "./_components/generate-tags";
import Header from "./_components/header";
import { previews } from "./_components/preview/previews";
import Rating from "./_components/rating";
import SeoForm from "./_components/seo-form";
import { Settings } from "./_components/settings";

export default function Home() {
  return (
    <main aria-labelledby="container" className={cn("mx-auto max-w-6xl px-8 pb-12 xl:px-4")}>
      <Header />
      <section className="mt-10 items-start justify-center gap-20 md:grid md:grid-cols-2">
        <div className={cn("h-fit overflow-y-auto md:sticky md:-top-6 lg:pr-10 xl:pr-20")}>
          <p className={"containerTitle"}>Metadata + LLM Signals</p>
          <SeoForm />
          <OfficialDebuggers />
          <div className="mt-10">
            <Label className="mb-6">Extras</Label>
            <Settings />
            <Rating />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className={"containerTitle"}>Preview + Output Pack</p>
            <GenerateTags />
          </div>
          <div className="mt-6 space-y-10">
            {previews.map(({ name, component: Component }) => (
              <Fragment key={name}>
                <Component />
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
