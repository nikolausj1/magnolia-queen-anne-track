import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about Magnolia CC Youth Track & Field and Queen Anne Quicksters in Seattle: divisions, practice, meets, what to bring.",
  alternates: { canonical: "/faq" },
};

function loadFaqContent(): string {
  const filePath = path.join(process.cwd(), "content", "faq.md");
  const raw = readFileSync(filePath, "utf8");

  // Strip YAML frontmatter and the file's own title + lead paragraph;
  // the page renders its own h1 and lead. Keep everything from the
  // first question (`## 1. ...`) to the end of the file.
  const withoutFrontmatter = raw.replace(/^---\n[\s\S]*?\n---\n/, "");
  const firstQuestion = withoutFrontmatter.indexOf("\n## ");
  return firstQuestion === -1
    ? withoutFrontmatter
    : withoutFrontmatter.slice(firstQuestion + 1);
}

export default function FaqPage() {
  const content = loadFaqContent();

  return (
    <div className="mx-auto max-w-[760px] px-6 py-12 md:py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1>Frequently asked questions</h1>
        <p className="text-base text-muted">
          Everything parents typically ask, in one place.
        </p>
      </header>

      <article className="flex flex-col gap-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            h2: ({ id, children }) => (
              <h2
                id={id}
                className="mt-10 scroll-mt-24 text-ink first:mt-0"
              >
                {children}
              </h2>
            ),
            h3: ({ id, children }) => (
              <h3 id={id} className="mt-6 text-ink">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mt-4 text-ink leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mt-3 ml-6 list-disc text-ink leading-relaxed flex flex-col gap-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mt-3 ml-6 list-decimal text-ink leading-relaxed flex flex-col gap-1">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-magnolia-navy underline underline-offset-4 hover:opacity-80"
              >
                {children}
              </a>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      <footer className="border-t border-divider pt-6">
        <p className="text-sm text-muted">Still have questions?</p>
      </footer>
    </div>
  );
}
