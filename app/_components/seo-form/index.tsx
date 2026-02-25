import FileUploader from "@/components/file-uploader";
import KeyCommand from "@/components/key-command";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSeoFormStore } from "@/store/use-seo-form-store";
import { useSettingsStore } from "@/store/use-settings-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { SparklesIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GenerateMetadataButton from "../generate-tags/generate-metadata-button";
import GenerateTagsModal from "../generate-tags/generate-tags-modal";
import FormLabelWithCounter from "./form-label-with-counter";

const faqFormatHint = "Use one pair per line: Question::Answer";

export default function SeoForm() {
  const {
    title,
    setTitle,
    description,
    setDescription,
    imageFile,
    setImageFile,
    url,
    setUrl = () => {},
    siteName,
    setSiteName,
    authorName,
    setAuthorName,
    publishedDate,
    setPublishedDate,
    modifiedDate,
    setModifiedDate,
    tldr,
    setTldr,
    keyFacts,
    setKeyFacts,
    faq,
    setFaq,
    howToSteps,
    setHowToSteps,
    references,
    setReferences,
  } = useSeoFormStore();

  const { titleMaxLength, descriptionMaxLength, isFileImage } = useSettingsStore();

  const seoFormSchema = z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(titleMaxLength, `Title must be less than ${titleMaxLength} characters`),
    description: z
      .string()
      .max(descriptionMaxLength, `Description must be less than ${descriptionMaxLength} characters`)
      .optional(),
    imageFile: z.any().optional(),
    url: z
      .string()
      .trim()
      .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
        message: "Use a valid absolute URL (https://example.com/page)",
      }),
    siteName: z.string().trim().min(1, "Site name is required").max(80, "Site name must be under 80 characters"),
    authorName: z.string().trim().min(1, "Author is required").max(120, "Author must be under 120 characters"),
    publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
    modifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
    tldr: z.string().max(320, "TL;DR should be under 320 characters").optional(),
    keyFacts: z.string().max(4000, "Key facts should be under 4000 characters").optional(),
    faq: z.string().max(6000, "FAQ should be under 6000 characters").optional(),
    howToSteps: z.string().max(4000, "HowTo steps should be under 4000 characters").optional(),
    references: z.string().max(4000, "References should be under 4000 characters").optional(),
  });

  const seoForm = useForm({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title,
      description: description ?? "",
      imageFile,
      url: url ?? "",
      siteName,
      authorName,
      publishedDate,
      modifiedDate,
      tldr: tldr ?? "",
      keyFacts: keyFacts ?? "",
      faq: faq ?? "",
      howToSteps: howToSteps ?? "",
      references: references ?? "",
    },
  });

  const onSubmit = () => {
    // Form is synced with Zustand via controlled inputs.
  };

  return (
    <div className="mt-6">
      <Form {...seoForm}>
        <form onSubmit={seoForm.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-8 rounded-xl border border-white/10 bg-neutral-900/40 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-wide uppercase">Core Metadata</p>
              <Badge variant="secondary">Required</Badge>
            </div>

            <FormField
              control={seoForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabelWithCounter
                    count={title.length}
                    max={titleMaxLength}
                    tooltip={<p>Recommended keep titles under 60 characters for proper display in search results</p>}
                  >
                    Title
                  </FormLabelWithCounter>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={titleMaxLength}
                      value={title}
                      onChange={(event) => {
                        field.onChange(event);
                        setTitle(event.target.value);
                      }}
                      className="text-lg"
                    />
                  </FormControl>
                  <FormDescription>
                    <KeyCommand>&lt;title /&gt;</KeyCommand> is required in every valid HTML page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={seoForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabelWithCounter
                    count={description?.length ?? 0}
                    max={descriptionMaxLength}
                    tooltip={
                      <p>Recommended keep descriptions under 160 characters for proper display in search results</p>
                    }
                  >
                    Description
                  </FormLabelWithCounter>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="max-h-32"
                      value={description ?? ""}
                      onChange={(event) => {
                        field.onChange(event);
                        setDescription(event.target.value);
                      }}
                      maxLength={descriptionMaxLength}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a concise summary. This text is used for search snippets and LLM context windows.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={seoForm.control}
              name="imageFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    {isFileImage ? (
                      <FileUploader {...field} />
                    ) : (
                      <Input
                        placeholder="https://example.com/social-preview.jpg"
                        value={imageFile?.preview ?? ""}
                        onChange={(event) => {
                          field.onChange(event.target.value);
                          const rawUrl = event.target.value.trim();

                          if (!rawUrl) {
                            setImageFile(undefined);
                            return;
                          }

                          setImageFile({
                            id: "remote-image",
                            preview: rawUrl,
                            file: {
                              id: "remote-image",
                              name: "remote-image",
                              size: 0,
                              type: "image/*",
                              url: rawUrl,
                            },
                          });
                        }}
                      />
                    )}
                  </FormControl>
                  <FormDescription>
                    Upload an image or provide a URL for social previews and machine-readable metadata.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={seoForm.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Canonical URL <span className="text-muted-foreground text-sm font-normal">(required)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://example.com/blog/llm-seo-guide"
                      value={url ?? ""}
                      onChange={(event) => {
                        field.onChange(event);
                        setUrl(event.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Use a stable lowercase URL with hyphenated slugs for cleaner indexing and citations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={seoForm.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={siteName}
                      onChange={(event) => {
                        field.onChange(event);
                        setSiteName(event.target.value);
                      }}
                      placeholder="SEO Generator"
                    />
                  </FormControl>
                  <FormDescription>Used for OpenGraph, breadcrumbs and schema context.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Card className="border-blue-500/40 bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent py-0">
            <CardHeader className="px-5 pt-5 pb-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <SparklesIcon size={16} className="text-blue-300" />
                LLM-Ready Content
              </CardTitle>
              <CardDescription>
                Add clear, scannable blocks so LLMs can summarize and cite your content with lower ambiguity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 px-5 pt-5 pb-5">
              <FormField
                control={seoForm.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={authorName}
                        onChange={(event) => {
                          field.onChange(event);
                          setAuthorName(event.target.value);
                        }}
                        placeholder="Jane Doe"
                      />
                    </FormControl>
                    <FormDescription>Visible author attribution strengthens E-E-A-T signals.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={seoForm.control}
                  name="publishedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Published Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          value={publishedDate}
                          onChange={(event) => {
                            field.onChange(event);
                            setPublishedDate(event.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={seoForm.control}
                  name="modifiedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Updated Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          value={modifiedDate}
                          onChange={(event) => {
                            field.onChange(event);
                            setModifiedDate(event.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={seoForm.control}
                name="tldr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TL;DR</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={tldr}
                        onChange={(event) => {
                          field.onChange(event);
                          setTldr(event.target.value);
                        }}
                        maxLength={320}
                        className="field-sizing-fixed min-h-24 max-h-40 resize-y overflow-y-auto"
                        placeholder="Summarize the page in 1-2 sentences."
                      />
                    </FormControl>
                    <FormDescription>Keep it short and explicit. One idea per sentence.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={seoForm.control}
                name="keyFacts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Facts</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={keyFacts}
                        onChange={(event) => {
                          field.onChange(event);
                          setKeyFacts(event.target.value);
                        }}
                        className="field-sizing-fixed min-h-28 max-h-56 resize-y overflow-y-auto"
                        placeholder="One fact per line"
                      />
                    </FormControl>
                    <FormDescription>Use one fact per line. Avoid long paragraphs.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={seoForm.control}
                name="faq"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FAQ</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={faq}
                        onChange={(event) => {
                          field.onChange(event);
                          setFaq(event.target.value);
                        }}
                        className="field-sizing-fixed min-h-32 max-h-64 resize-y overflow-y-auto"
                        placeholder={faqFormatHint}
                      />
                    </FormControl>
                    <FormDescription>{faqFormatHint}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={seoForm.control}
                name="howToSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HowTo Steps (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={howToSteps}
                        onChange={(event) => {
                          field.onChange(event);
                          setHowToSteps(event.target.value);
                        }}
                        className="field-sizing-fixed min-h-28 max-h-56 resize-y overflow-y-auto"
                        placeholder="One step per line"
                      />
                    </FormControl>
                    <FormDescription>
                      Add steps only for instructional content. Generates `HowTo` schema when provided.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={seoForm.control}
                name="references"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>References</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={references}
                        onChange={(event) => {
                          field.onChange(event);
                          setReferences(event.target.value);
                        }}
                        className="field-sizing-fixed min-h-24 max-h-48 resize-y overflow-y-auto"
                        placeholder="One trustworthy source URL per line"
                      />
                    </FormControl>
                    <FormDescription>
                      Link authoritative sources to reinforce trust and improve citation confidence.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <GenerateTagsModal>
            <GenerateMetadataButton className="w-full items-center justify-center text-center" size="lg" />
          </GenerateTagsModal>
        </form>
      </Form>
    </div>
  );
}
