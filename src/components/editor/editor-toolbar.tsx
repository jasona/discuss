"use client";

import type { Editor } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  ImagePlus,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  MoreHorizontal,
  FileCode,
  Download,
  Upload,
  Code2,
} from "lucide-react";
import { useCallback, useRef } from "react";

interface EditorToolbarProps {
  editor: Editor | null;
  sourceMode: boolean;
  onToggleSourceMode: () => void;
  onImageUpload: (file: File) => void;
  onExportMarkdown: () => void;
  onImportMarkdown: (file: File) => void;
  saveStatus: "saved" | "saving" | "unsaved";
}

export function EditorToolbar({
  editor,
  sourceMode,
  onToggleSourceMode,
  onImageUpload,
  onExportMarkdown,
  onImportMarkdown,
  saveStatus,
}: EditorToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-lg border-b bg-background/95 px-2 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Text style dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs hover:bg-muted">
          <Pilcrow className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Style</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive("paragraph") ? "bg-accent" : ""}
          >
            <Pilcrow className="h-4 w-4" />
            Paragraph
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
          >
            <Heading1 className="h-4 w-4" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
          >
            <Heading2 className="h-4 w-4" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
          >
            <Heading3 className="h-4 w-4" />
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={editor.isActive("heading", { level: 4 }) ? "bg-accent" : ""}
          >
            <Heading4 className="h-4 w-4" />
            Heading 4
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Inline formatting */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        aria-label="Inline code"
      >
        <Code className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("link")}
        onPressedChange={setLink}
        aria-label="Link"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </Toggle>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Lists */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
      >
        <List className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered list"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("taskList")}
        onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
        aria-label="Task list"
      >
        <ListTodo className="h-3.5 w-3.5" />
      </Toggle>

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* Block elements */}
      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Blockquote"
      >
        <Quote className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("codeBlock")}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Code block"
      >
        <FileCode className="h-3.5 w-3.5" />
      </Toggle>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>

      {/* Table insert */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        title="Insert table"
      >
        <TableIcon className="h-3.5 w-3.5" />
      </Button>

      {/* Image upload */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => imageInputRef.current?.click()}
        title="Upload image"
      >
        <ImagePlus className="h-3.5 w-3.5" />
      </Button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(file);
          e.target.value = "";
        }}
      />

      <Separator orientation="vertical" className="mx-0.5 h-6" />

      {/* More dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onToggleSourceMode}>
            <Code2 className="h-4 w-4" />
            {sourceMode ? "Rich text mode" : "Source mode"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportMarkdown}>
            <Download className="h-4 w-4" />
            Export Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => importInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import Markdown
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={importInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportMarkdown(file);
          e.target.value = "";
        }}
      />

      {/* Save status */}
      <div className="ml-auto">
        <span
          className={`text-xs ${
            saveStatus === "saved"
              ? "text-muted-foreground"
              : saveStatus === "saving"
                ? "text-yellow-600"
                : "text-orange-600"
          }`}
        >
          {saveStatus === "saved"
            ? "Saved"
            : saveStatus === "saving"
              ? "Saving..."
              : "Unsaved changes"}
        </span>
      </div>
    </div>
  );
}
