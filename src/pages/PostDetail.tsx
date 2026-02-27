import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "@/lib/supabase";
import BlogHeader from "@/components/BlogHeader";
import BlogFooter from "@/components/BlogFooter";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPost(slug!),
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      <main className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !post ? (
          <div className="text-center py-20">
            <p className="font-display text-xl text-muted-foreground">Post not found.</p>
            <Link to="/" className="mt-4 inline-block text-primary hover:underline text-sm">
              ← Back to blog
            </Link>
          </div>
        ) : (
          <article className="glass-panel-strong rounded-2xl p-6 md:p-10">
            <Link
              to="/"
              className="pastel-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Link>
            <time className="block font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
              {format(new Date(post.published_at || post.created_at), "MMMM d, yyyy")}
            </time>
            <h1 className="mt-3 font-display text-4xl md:text-6xl font-extrabold leading-[0.95] text-slate-900 text-balance">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-6 text-base md:text-lg text-slate-600 leading-8 italic max-w-3xl">
                {post.excerpt}
              </p>
            )}
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt={post.title}
                className="mt-8 w-full rounded-xl border border-white/70 object-cover max-h-[32rem]"
                loading="lazy"
              />
            )}
            <div className="mt-10 whitespace-pre-wrap text-[15px] md:text-base leading-8 text-slate-800">
              {post.content}
            </div>
          </article>
        )}
      </main>
      <BlogFooter />
    </div>
  );
}
