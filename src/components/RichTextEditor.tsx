import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeRichTextContent } from "@/lib/rich-text";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your post...",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: normalizeRichTextContent(value),
    editorProps: {
      attributes: {
        class:
          "min-h-[22rem] px-4 py-4 focus:outline-none rich-editor-content",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = normalizeRichTextContent(value);
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter link URL", previousUrl || "https://");

    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const actions = [
    {
      label: "Bold",
      icon: Bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      icon: Italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "Heading 1",
      icon: Heading1,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "Heading 2",
      icon: Heading2,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "Bullet List",
      icon: List,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "Numbered List",
      icon: ListOrdered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "Quote",
      icon: Quote,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "Link",
      icon: Link2,
      onClick: setLink,
      active: editor.isActive("link"),
    },
  ];

  return (
    <div className="glass-input overflow-hidden rounded-xl">
      <div className="flex flex-wrap gap-2 border-b border-white/70 bg-white/50 px-3 py-3">
        {actions.map(({ label, icon: Icon, onClick, active }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
              "rounded-lg border border-transparent bg-transparent text-slate-600 hover:bg-white/80 hover:text-slate-900",
              active && "border-blue-100 bg-white text-slate-900 shadow-sm",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </Button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="rounded-lg text-slate-600 hover:bg-white/80 hover:text-slate-900"
          >
            <RemoveFormatting className="h-4 w-4" />
            <span className="sr-only">Clear formatting</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            className="rounded-lg text-slate-600 hover:bg-white/80 hover:text-slate-900"
          >
            <Undo2 className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            className="rounded-lg text-slate-600 hover:bg-white/80 hover:text-slate-900"
          >
            <Redo2 className="h-4 w-4" />
            <span className="sr-only">Redo</span>
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
