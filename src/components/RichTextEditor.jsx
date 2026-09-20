import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useCallback } from "react";

// ── Toolbar Button ────────────────────────────────────────────────────────────
function ToolBtn({ onClick, active, title, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "5px 8px",
        borderRadius: "6px",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: active ? "#f97316" : "transparent",
        color: active ? "#fff" : "#374151",
        fontSize: "13px",
        fontWeight: active ? 700 : 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "30px",
        height: "30px",
        transition: "all 0.15s ease",
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) e.currentTarget.style.background = "#f3f4f6";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ width: "1px", height: "22px", background: "#e5e7eb", margin: "0 4px", flexShrink: 0 }} />;
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export default function RichTextEditor({ content, onChange, placeholder = "Tell your story…" }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: "min-height: 320px; outline: none; font-family: 'Georgia', serif; font-size: 16px; line-height: 1.8; color: #111827; padding: 20px;",
      },
    },
  });

  // Sync content from outside
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() || 0;
  const charCount = editor.storage.characterCount?.characters() || 0;

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      overflow: "hidden",
      background: "#fff",
      transition: "border-color 0.2s",
    }}
      onFocus={() => {}}
    >
      {/* ── Toolbar ── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "2px",
        padding: "10px 12px",
        borderBottom: "1px solid #f3f4f6",
        background: "#fafafa",
      }}>

        {/* Text style */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
          <span style={{ textDecoration: "underline" }}>U</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <span style={{ textDecoration: "line-through" }}>S</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
          <span style={{ background: "#fde047", padding: "0 2px", borderRadius: "2px", fontSize: "11px" }}>H</span>
        </ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          H1
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          H2
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          H3
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 113.356 1.069 4.001 4.001 0 01-2.391 2.169H5.24" />
          </svg>
        </ToolBtn>

        <Divider />

        {/* Block elements */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider Line">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
          </svg>
        </ToolBtn>

        <Divider />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5m-10.5 5.25h16.5" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M7.5 12h9m-12.75 5.25h16.5" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M10.5 12h9.75m-16.5 5.25h16.5" />
          </svg>
        </ToolBtn>

        <Divider />

        {/* Link & Image */}
        <ToolBtn onClick={addLink} active={editor.isActive("link")} title="Add Link">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={addImage} title="Add Image URL">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </ToolBtn>

        <Divider />

        {/* Undo / Redo */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </ToolBtn>
      </div>

      {/* ── Editor content area ── */}
      <div style={{ background: "#fff" }}>
        <EditorContent editor={editor} />
      </div>

      {/* ── Word count footer ── */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "16px",
        padding: "8px 16px",
        borderTop: "1px solid #f3f4f6",
        background: "#fafafa",
      }}>
        <span style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>
          {wordCount} words
        </span>
        <span style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>
          {charCount} characters
        </span>
      </div>

      {/* ── Editor styles ── */}
      <style>{`
        .ProseMirror p { margin-bottom: 12px; }
        .ProseMirror h1 { font-size: 28px; font-weight: 700; margin: 20px 0 10px; font-family: 'Playfair Display', Georgia, serif; color: #111827; }
        .ProseMirror h2 { font-size: 22px; font-weight: 700; margin: 18px 0 8px; font-family: 'Playfair Display', Georgia, serif; color: #111827; }
        .ProseMirror h3 { font-size: 18px; font-weight: 600; margin: 14px 0 6px; font-family: 'Playfair Display', Georgia, serif; color: #111827; }
        .ProseMirror ul { list-style: disc; padding-left: 24px; margin-bottom: 12px; }
        .ProseMirror ol { list-style: decimal; padding-left: 24px; margin-bottom: 12px; }
        .ProseMirror li { margin-bottom: 4px; }
        .ProseMirror blockquote { border-left: 3px solid #f97316; padding: 10px 16px; margin: 16px 0; background: #fff7ed; border-radius: 0 8px 8px 0; font-style: italic; color: #374151; }
        .ProseMirror code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: monospace; color: #e11d48; }
        .ProseMirror pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 10px; margin: 16px 0; overflow-x: auto; }
        .ProseMirror pre code { background: none; color: inherit; padding: 0; font-size: 13px; }
        .ProseMirror hr { border: none; border-top: 2px solid #f3f4f6; margin: 20px 0; }
        .ProseMirror a { color: #f97316; text-decoration: underline; }
        .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
        .ProseMirror mark { background: #fde047; padding: 1px 3px; border-radius: 3px; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #d1d5db; pointer-events: none; height: 0; font-style: italic; }
        .ProseMirror:focus { outline: none; }
      `}</style>
    </div>
  );
}
