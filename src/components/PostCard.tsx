import { Link } from "react-router-dom";
import type { Post } from "@/lib/supabase";
import { format } from "date-fns";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group glass-panel relative rounded-2xl px-5 py-6 transition-all duration-200 hover:border-white/90 hover:bg-white/70 hover:shadow-[0_16px_36px_-24px_rgba(59,130,246,0.18)] md:px-6">
      <Link to={`/post/${post.slug}`} className="block">
        <time className="pastel-chip inline-flex rounded-full px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.08em]">
          {format(new Date(post.published_at || post.created_at), "MMMM d, yyyy")}
        </time>
        <h2 className="mt-4 font-display text-[1.75rem] md:text-[1.95rem] font-extrabold text-slate-900 group-hover:text-primary transition-colors leading-[1.05] text-balance">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-3 max-w-2xl text-[15px] text-slate-600 leading-7 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
          Read note
          <span aria-hidden="true">↗</span>
        </span>
      </Link>
    </article>
  );
}
