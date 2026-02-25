"use client";

import { CopyButton } from "@/components/copy-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAstroMetadataCode } from "@/lib/get-astro-metadata";
import { getRobotsTxtCode, getSitemapXmlCode } from "@/lib/get-crawlability-files";
import { getJsonLdCode } from "@/lib/get-json-ld";
import { getLlmContentBlocksCode } from "@/lib/get-llm-content-blocks";
import { getMetaTagsCode } from "@/lib/get-meta-tags";
import { getNextJsMetadataCode } from "@/lib/get-nextjs-metadata";
import { getSeoChecklist, getSeoChecklistMarkdown } from "@/lib/get-seo-checklist";
import { cn } from "@/lib/utils";
import { useSeoFormStore } from "@/store/use-seo-form-store";
import {
  AlertCircleIcon,
  AlertOctagonIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { ComponentSource } from "../meta-tags-source";

const outputTabs = [
  { value: "html", label: "HTML", language: "html" },
  { value: "jsonld", label: "JSON-LD", language: "html" },
  { value: "llm", label: "LLM Blocks", language: "html" },
  { value: "robots", label: "robots.txt", language: "bash" },
  { value: "sitemap", label: "sitemap.xml", language: "xml" },
  { value: "next", label: "Next.js", language: "tsx" },
  { value: "astro", label: "Astro", language: "astro" },
  { value: "checklist", label: "Checklist", language: "md" },
] as const;

type OutputTab = (typeof outputTabs)[number]["value"];

export default function GenerateTagsModal({ children }: { children: React.ReactNode }) {
  const {
    title,
    description,
    url,
    imageFile,
    siteName,
    authorName,
    publishedDate,
    modifiedDate,
    tldr,
    keyFacts,
    faq,
    howToSteps,
    references,
  } = useSeoFormStore();

  const formData = {
    title,
    description,
    url,
    imageFile,
    siteName,
    authorName,
    publishedDate,
    modifiedDate,
    tldr,
    keyFacts,
    faq,
    howToSteps,
    references,
  };

  const htmlCode = getMetaTagsCode(formData);
  const jsonLdCode = getJsonLdCode(formData);
  const llmBlocksCode = getLlmContentBlocksCode(formData);
  const robotsTxtCode = getRobotsTxtCode(formData);
  const sitemapXmlCode = getSitemapXmlCode(formData);
  const nextCode = getNextJsMetadataCode(formData);
  const astroCode = getAstroMetadataCode(formData);
  const checklistItems = getSeoChecklist(formData);
  const checklistCode = getSeoChecklistMarkdown(formData);

  const [activeTab, setActiveTab] = React.useState<OutputTab>("html");
  const [showReviewNotice, setShowReviewNotice] = React.useState(false);
  const [showComplianceChecks, setShowComplianceChecks] = React.useState(false);

  const outputByTab: Record<OutputTab, string> = {
    html: htmlCode,
    jsonld: jsonLdCode,
    llm: llmBlocksCode,
    robots: robotsTxtCode,
    sitemap: sitemapXmlCode,
    next: nextCode,
    astro: astroCode,
    checklist: checklistCode,
  };

  const completeChecks = checklistItems.filter((item) => item.pass).length;
  const activeTabIndex = outputTabs.findIndex((tab) => tab.value === activeTab);
  const tabPanelClassName = "mt-3 min-h-[26rem] md:min-h-[30rem]";
  const reviewNoticeId = "review-notice-section";
  const complianceChecksId = "compliance-checks-section";

  const handlePreviousTab = () => {
    if (activeTabIndex <= 0) {
      return;
    }

    setActiveTab(outputTabs[activeTabIndex - 1].value);
  };

  const handleNextTab = () => {
    if (activeTabIndex >= outputTabs.length - 1) {
      return;
    }

    setActiveTab(outputTabs[activeTabIndex + 1].value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-auto p-0 sm:max-h-[min(92vh,900px)] sm:min-h-[min(78vh,760px)] sm:max-w-lg md:max-w-4xl lg:max-w-6xl [&>button:last-child]:hidden">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="flex items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-2">
              <TagIcon className="text-blue-500" />
              <p>Generated SEO + LLM Pack</p>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close generated output modal">
                <XIcon />
              </Button>
            </DialogClose>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setShowReviewNotice((previous) => !previous)}
                  aria-expanded={showReviewNotice}
                  aria-controls={reviewNoticeId}
                >
                  <ChevronDownIcon
                    size={14}
                    className={cn("transition-transform", !showReviewNotice && "-rotate-90")}
                  />
                  {showReviewNotice ? "Hide review notice" : "Show review notice"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setShowComplianceChecks((previous) => !previous)}
                  aria-expanded={showComplianceChecks}
                  aria-controls={complianceChecksId}
                >
                  <ChevronDownIcon
                    size={14}
                    className={cn("transition-transform", !showComplianceChecks && "-rotate-90")}
                  />
                  {showComplianceChecks
                    ? "Hide compliance checks"
                    : `Show compliance checks (${completeChecks}/${checklistItems.length})`}
                </Button>
              </div>

              {showReviewNotice && (
                <Alert id={reviewNoticeId} variant="warning" className="mb-2 items-baseline">
                  <AlertOctagonIcon />
                  <AlertDescription>
                    <p>Review generated metadata, URLs and schema values before using in production.</p>
                  </AlertDescription>
                </Alert>
              )}

              {showComplianceChecks && (
                <div id={complianceChecksId} className="rounded-xl border border-white/10 bg-neutral-900/70 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Compliance snapshot</p>
                    <span className="text-xs text-neutral-300">
                      {completeChecks}/{checklistItems.length} checks passed
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {checklistItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left",
                          item.pass ? "border-emerald-400/40 bg-emerald-500/10" : "border-amber-400/40 bg-amber-500/10",
                        )}
                      >
                        <div className="flex items-center gap-2 text-xs font-medium">
                          {item.pass ? (
                            <CheckCircle2Icon size={14} className="text-emerald-300" />
                          ) : (
                            <AlertCircleIcon size={14} className="text-amber-300" />
                          )}
                          {item.title}
                        </div>
                        <p className="mt-1 text-xs text-neutral-300">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OutputTab)} defaultValue="html">
                <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={activeTab} onValueChange={(value) => setActiveTab(value as OutputTab)}>
                      <SelectTrigger className="w-full sm:w-[220px]" aria-label="Select generated output view">
                        <SelectValue placeholder="Select output" />
                      </SelectTrigger>
                      <SelectContent>
                        {outputTabs.map((tab) => (
                          <SelectItem key={tab.value} value={tab.value}>
                            {tab.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={handlePreviousTab}
                      disabled={activeTabIndex <= 0}
                    >
                      <ChevronLeftIcon size={14} />
                      Previous
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={handleNextTab}
                      disabled={activeTabIndex >= outputTabs.length - 1}
                    >
                      Next
                      <ChevronRightIcon size={14} />
                    </Button>

                    <span className="text-muted-foreground text-xs">
                      {activeTabIndex + 1}/{outputTabs.length}
                    </span>

                    <div className="ml-auto flex justify-end text-sm">
                      <CopyButton value={outputByTab[activeTab]} />
                    </div>
                  </div>

                  <div className="mt-3 overflow-x-auto pb-1">
                    <TabsList className="h-9 w-max min-w-full justify-start">
                      {outputTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="html" className={tabPanelClassName}>
                  <ComponentSource src={htmlCode} language="html" title="meta-tags.html" />
                  <div className="flex items-center justify-between gap-3 p-2 text-sm">
                    <Label>
                      Insert this code into your{" "}
                      <Link
                        href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/head"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="rounded-sm bg-neutral-900 p-1 font-mono shadow-md transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-95"
                      >
                        <code>&lt;head /&gt;</code>
                      </Link>{" "}
                      element.
                    </Label>
                  </div>
                </TabsContent>

                <TabsContent value="jsonld" className={tabPanelClassName}>
                  <ComponentSource src={jsonLdCode} language="html" title="schema.json-ld.html" />
                  <div className="p-2 text-sm text-neutral-300">
                    Add these schema blocks in the page head or before the closing body tag.
                  </div>
                </TabsContent>

                <TabsContent value="llm" className={tabPanelClassName}>
                  <ComponentSource src={llmBlocksCode} language="html" title="llm-content-blocks.html" />
                  <div className="p-2 text-sm text-neutral-300">
                    Reuse these sections in article templates to improve LLM readability and citation quality.
                  </div>
                </TabsContent>

                <TabsContent value="robots" className={tabPanelClassName}>
                  <ComponentSource src={robotsTxtCode} language="bash" title="robots.txt" />
                </TabsContent>

                <TabsContent value="sitemap" className={tabPanelClassName}>
                  <ComponentSource src={sitemapXmlCode} language="xml" title="sitemap.xml" />
                </TabsContent>

                <TabsContent value="next" className={tabPanelClassName}>
                  <ComponentSource src={nextCode} language="tsx" title="next-metadata.ts" />
                </TabsContent>

                <TabsContent value="astro" className={tabPanelClassName}>
                  <ComponentSource src={astroCode} language="astro" title="astro-metadata.astro" />
                </TabsContent>

                <TabsContent value="checklist" className={tabPanelClassName}>
                  <ComponentSource src={checklistCode} language="md" title="seo-llm-checklist.md" />
                </TabsContent>
              </Tabs>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
