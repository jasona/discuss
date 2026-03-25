"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { updatePage, type Page } from "@/lib/actions/pages";
import { TiptapEditor } from "./tiptap-editor";
import { EditorToolbar } from "./editor-toolbar";
import { SourceMode } from "./source-mode";
import { uploadImage } from "./image-upload";
import { htmlToMarkdown, markdownToHtml } from "@/lib/editor/markdown";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { EditorContent } from "@tiptap/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const lowlight = createLowlight(common);

interface PageEditorProps {
  page: Page;
  orgId?: string;
  updatedByName?: string | null;
}

export function PageEditor({ page, orgId, updatedByName }: PageEditorProps) {
  const [title, setTitle] = useState(page.title);
  const [sourceMode, setSourceMode] = useState(false);
  const [markdown, setMarkdown] = useState(page.contentMarkdown || "");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageIdRef = useRef(page.id);
  const titleRef = useRef(title);
  titleRef.current = title;

  const initialHtml = page.contentMarkdown
    ? markdownToHtml(page.contentMarkdown)
    : "";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
      }),
      ImageExt.configure({
        HTMLAttributes: { class: "rounded-md max-w-full" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: "Start writing..." }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[60vh] outline-none focus:outline-none p-4",
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const files = event.clipboardData?.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const md = htmlToMarkdown(html);
      setMarkdown(md);
      debouncedSave(titleRef.current, md, editor.getJSON());
    },
    immediatelyRender: false,
  });

  // Reset state when page changes
  useEffect(() => {
    if (page.id !== pageIdRef.current) {
      pageIdRef.current = page.id;
      setTitle(page.title);
      const html = page.contentMarkdown
        ? markdownToHtml(page.contentMarkdown)
        : "";
      setMarkdown(page.contentMarkdown || "");
      editor?.commands.setContent(html);
      setSaveStatus("saved");
      setSourceMode(false);
    }
  }, [page, editor]);

  const save = useCallback(
    async (
      newTitle: string,
      newMarkdown: string,
      contentJson?: Record<string, unknown>
    ) => {
      setSaveStatus("saving");
      const result = await updatePage(page.id, {
        title: newTitle,
        contentMarkdown: newMarkdown,
        contentJson: contentJson || { type: "markdown", content: newMarkdown },
      });

      if (result.success) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("unsaved");
        toast.error(result.error || "Failed to save");
      }
    },
    [page.id]
  );

  const debouncedSave = useCallback(
    (
      newTitle: string,
      newMarkdown: string,
      contentJson?: Record<string, unknown>
    ) => {
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        save(newTitle, newMarkdown, contentJson);
      }, 5000);
    },
    [save]
  );

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    debouncedSave(newTitle, markdown, editor?.getJSON() as Record<string, unknown>);
  }

  function handleSourceModeToggle() {
    if (sourceMode) {
      // Switching from source to WYSIWYG
      const html = markdownToHtml(markdown);
      editor?.commands.setContent(html);
    } else {
      // Switching from WYSIWYG to source
      if (editor) {
        const md = htmlToMarkdown(editor.getHTML());
        setMarkdown(md);
      }
    }
    setSourceMode(!sourceMode);
  }

  function handleSourceChange(newMarkdown: string) {
    setMarkdown(newMarkdown);
    debouncedSave(title, newMarkdown);
  }

  async function handleImageUpload(file: File) {
    if (!orgId) {
      toast.error("Cannot upload images without org context");
      return;
    }
    const url = await uploadImage(file, orgId);
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    } else {
      toast.error("Failed to upload image");
    }
  }

  function handleExportMarkdown() {
    const md = sourceMode ? markdown : htmlToMarkdown(editor?.getHTML() || "");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportMarkdown(file: File) {
    if (!confirm("Replace current content with imported Markdown?")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const md = e.target?.result as string;
      setMarkdown(md);
      if (!sourceMode) {
        const html = markdownToHtml(md);
        editor?.commands.setContent(html);
      }
      debouncedSave(title, md);
      toast.success("Markdown imported");
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <input
        className="w-full border-none bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/50"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Untitled"
      />

      {/* Last edited by */}
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {updatedByName && (
          <>
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">
                {updatedByName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{updatedByName}</span>
            <span>·</span>
          </>
        )}
        <span>
          {new Date(page.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="mt-5">
        <EditorToolbar
          editor={editor}
          sourceMode={sourceMode}
          onToggleSourceMode={handleSourceModeToggle}
          onImageUpload={handleImageUpload}
          onExportMarkdown={handleExportMarkdown}
          onImportMarkdown={handleImportMarkdown}
          saveStatus={saveStatus}
        />

        {sourceMode ? (
          <SourceMode value={markdown} onChange={handleSourceChange} />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}
