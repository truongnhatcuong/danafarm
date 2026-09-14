"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Link2Off,
  ImagePlus,
  Minus,
  Undo2,
  Redo2,
  Pilcrow,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-9 shrink-0 place-items-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "bg-admin-accent text-white"
          : "text-admin-muted hover:bg-admin-bg hover:text-admin-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Soạn nội dung bài viết...",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "article-image" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-80 px-5 py-4 text-sm leading-7 text-admin-ink outline-none [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-admin-muted/60 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_a]:text-admin-accent [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-admin-accent/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-admin-bg [&_code]:px-1.5 [&_code]:py-0.5 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_hr]:my-6 [&_hr]:border-admin-border [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-80 animate-pulse rounded-xl border border-admin-border bg-admin-bg/40" />
    );
  }

  function setLink() {
    const previousUrl = editor?.getAttributes("link").href as
      | string
      | undefined;
    const url = window.prompt(
      "Nhập đường dẫn liên kết:",
      previousUrl ?? "https://",
    );
    if (url === null || !editor) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }

  function addImage() {
    const url = window.prompt("Nhập URL hình ảnh:", "https://");
    if (!url?.trim() || !editor) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-admin-border bg-admin-surface focus-within:border-admin-accent">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-admin-border bg-admin-bg/50 p-2">
        <ToolbarButton
          label="Đoạn văn"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow size={17} />
        </ToolbarButton>
        <ToolbarButton
          label="Tiêu đề cấp 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Tiêu đề cấp 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 size={18} />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-admin-border" />
        <ToolbarButton
          label="In đậm"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={17} />
        </ToolbarButton>
        <ToolbarButton
          label="In nghiêng"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={17} />
        </ToolbarButton>
        <ToolbarButton
          label="Gạch chân"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={17} />
        </ToolbarButton>
        <ToolbarButton
          label="Gạch ngang"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={17} />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-admin-border" />
        <ToolbarButton
          label="Danh sách dấu chấm"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Danh sách đánh số"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Trích dẫn"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={17} />
        </ToolbarButton>
        <ToolbarButton
          label="Khối mã"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 size={17} />
        </ToolbarButton>
        <ToolbarButton
          label="Đường phân cách"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={18} />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-admin-border" />
        <ToolbarButton
          label="Thêm hoặc sửa liên kết"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <Link2 size={17} />
        </ToolbarButton>
        <ToolbarButton
          label="Gỡ liên kết"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off size={17} />
        </ToolbarButton>
        <ToolbarButton label="Chèn ảnh bằng URL" onClick={addImage}>
          <ImagePlus size={17} />
        </ToolbarButton>
        <span className="mx-1 h-6 w-px bg-admin-border" />
        <ToolbarButton
          label="Hoàn tác"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={17} />
        </ToolbarButton>
        <ToolbarButton
          label="Làm lại"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={17} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t border-admin-border bg-admin-bg/30 px-4 py-2 text-[11px] text-admin-muted">
        <span>Nội dung được lưu dưới dạng HTML</span>
        <span>{editor.getText().length} ký tự</span>
      </div>
    </div>
  );
}
