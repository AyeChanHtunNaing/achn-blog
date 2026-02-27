import { useEffect, useState } from "react";
import { auth as authClient } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPosts, createPost, updatePost, deletePost, generateSlug, type Post } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, LogOut, ArrowLeft, Loader2 } from "lucide-react";

type EditorState = {
  mode: "list" | "create" | "edit";
  post?: Post;
};

export default function Admin() {
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [checkingSlow, setCheckingSlow] = useState(false);
  const [editor, setEditor] = useState<EditorState>({ mode: "list" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    const slowTimer = setTimeout(() => {
      if (active) setCheckingSlow(true);
    }, 1200);

    const { data: { subscription } } = authClient.onAuthStateChange((_, session) => {
      if (!active) return;
      setAuthStatus(!!session);
      setCheckingSlow(false);
      if (!session) navigate("/login");
    });
    authClient.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setAuthStatus(!!session);
      setCheckingSlow(false);
      if (!session) navigate("/login");
    });
    return () => {
      active = false;
      clearTimeout(slowTimer);
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => getPosts(false),
    enabled: authStatus === true,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast({ title: "Post deleted" });
    },
  });

  const handleLogout = async () => {
    await authClient.signOut();
  };

  if (authStatus === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-panel-strong rounded-2xl px-6 py-5 text-center">
          <div className="mx-auto flex h-8 w-8 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-700">Checking admin session...</p>
          {checkingSlow && (
            <p className="mt-1 text-xs text-slate-500">If this takes too long, you will be redirected to login.</p>
          )}
        </div>
      </div>
    );
  }

  if (editor.mode !== "list") {
    return (
      <PostEditor
        post={editor.post}
        onBack={() => setEditor({ mode: "list" })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/30 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
            <h1 className="font-display text-3xl font-semibold text-foreground leading-none">Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditor({ mode: "create" })}
              className="glass-accent-soft rounded-full border-white/70"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Post
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="glass-panel rounded-full border-white/60 bg-white/40">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="glass-panel flex items-center justify-between gap-3 p-4 rounded-2xl hover:bg-white/70 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-semibold text-card-foreground truncate">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-mono-ui">
                    {post.published ? (
                      <span className="text-primary font-medium">Published</span>
                    ) : (
                      <span>Draft</span>
                    )}
                    {" · "}
                    {new Date(post.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditor({ mode: "edit", post })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this post?")) deleteMutation.mutate(post.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground font-display italic">
            No posts yet. Create your first one!
          </p>
        )}
      </main>
    </div>
  );
}

function PostEditor({ post, onBack }: { post?: Post; onBack: () => void }) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [coverImage, setCoverImage] = useState(post?.cover_image || "");
  const [published, setPublished] = useState(post?.published || false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post) setSlug(generateSlug(val));
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        cover_image: coverImage || null,
        published,
        published_at: published ? (post?.published_at || new Date().toISOString()) : null,
      };
      if (post) {
        await updatePost(post.id, payload);
        toast({ title: "Post updated" });
      } else {
        await createPost(payload);
        toast({ title: "Post created" });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onBack();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/30 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="pastel-chip inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={published} onCheckedChange={setPublished} id="published" />
              <Label htmlFor="published" className="text-sm text-foreground">
                {published ? "Published" : "Draft"}
              </Label>
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm" className="glass-accent border-blue-100 text-slate-900">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="glass-panel-strong space-y-6 rounded-2xl p-5 md:p-6">
          <div>
            <Label className="text-sm font-medium text-foreground">Title</Label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title"
              className="glass-input mt-1 font-display text-lg"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground">Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-slug"
              className="glass-input mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground">Excerpt</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="glass-input mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground">Cover Image URL</Label>
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="glass-input mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground">Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post..."
              rows={16}
              className="glass-input mt-1 leading-relaxed"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
