import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/CaseStudy";
import { getNextWork, getWork, works } from "@/data/works";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return { title: "作品未找到 · Oiiii" };
  return {
    title: `${work.client} · Oiiii`,
    description: work.summary,
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();
  const next = getNextWork(slug);

  return <CaseStudy work={work} next={next} />;
}
