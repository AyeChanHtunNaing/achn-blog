import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getPosts } from "@/lib/supabase";
import BlogHeader from "@/components/BlogHeader";
import BlogFooter from "@/components/BlogFooter";
import PostCard from "@/components/PostCard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(true),
  });

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      <main className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        <section className="relative overflow-hidden mb-10 pt-2 pb-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(186,230,253,0.35),transparent_36%),radial-gradient(circle_at_90%_10%,rgba(221,214,254,0.3),transparent_36%),radial-gradient(circle_at_80%_85%,rgba(209,250,229,0.22),transparent_30%)]" />
          <div className="ambient-blob ambient-blob-a h-24 w-24 bg-sky-200/60 left-[4%] top-[10%]" />
          <div className="ambient-blob ambient-blob-b h-28 w-28 bg-indigo-200/50 right-[4%] top-[12%]" />
          <div className="relative">
            <div className="glass-panel-strong rounded-2xl p-6 md:p-8">
              <div className="pastel-chip mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Writing Journal
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold leading-[0.95] text-slate-900">
                Quiet notes on building, learning, and life.
              </h2>
              <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-slate-600">
                A personal archive of writing, experiments, and production lessons.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {posts && posts.length > 0 ? (
                  <Link
                    to={`/post/${posts[0].slug}`}
                    className="glass-accent glass-sheen float-soft inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition hover:brightness-[1.02]"
                  >
                    Read Latest Post
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="glass-accent glass-sheen float-soft inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition hover:brightness-[1.02]"
                  >
                    Create First Post
                  </Link>
                )}
                <a
                  href="#posts"
                  className="glass-accent-soft float-soft-delayed inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition hover:text-slate-900"
                >
                  Browse Posts
                </a>
              </div>
            </div>
          </div>
        </section>
        <div id="posts">
          {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-display text-xl text-muted-foreground italic">
              No posts yet. Check back soon.
            </p>
          </div>
        )}
        </div>
      </main>
      <BlogFooter />
    </div>
  );
};

export default Index;
