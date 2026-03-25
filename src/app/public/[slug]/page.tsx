import { notFound } from "next/navigation";
import { getPublicPage } from "@/lib/actions/sharing";
import { PublicPageViewer } from "@/components/editor/public-page-viewer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicPage(slug);

  if (!page) return { title: "Not Found" };

  return {
    title: `${page.title} — ${page.orgName}`,
    description: `Shared document from ${page.orgName}`,
  };
}

export default async function PublicPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = await getPublicPage(slug);

  if (!page) notFound();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <PublicPageViewer page={page} />
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Powered by{" "}
        <a
          href="https://discusslabs.com"
          className="font-medium text-foreground hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Discuss
        </a>
      </footer>
    </div>
  );
}
