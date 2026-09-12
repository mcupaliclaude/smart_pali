"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink,
  Quote,
  RemoveFormatting,
  Undo,
  Redo,
  Code,
  Eye,
} from "lucide-react";

export interface TinyEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  className?: string;
}

export function TinyEditor({
  value,
  onChange,
  placeholder = "พิมพ์เนื้อหาข่าว...",
  minHeight = "180px",
  disabled = false,
  className = "",
}: TinyEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value);
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
    orderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    h2: false,
    h3: false,
    blockquote: false,
  });

  // Sync value into editor when value changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
    setHtmlSource(value || "");
  }, [value]);

  const updateActiveStates = useCallback(() => {
    if (!document || isSourceMode) return;
    try {
      setActiveStates({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        h2: document.queryCommandValue("formatBlock") === "h2",
        h3: document.queryCommandValue("formatBlock") === "h3",
        blockquote: document.queryCommandValue("formatBlock") === "blockquote",
      });
    } catch {
      // ignore
    }
  }, [isSourceMode]);

  function execCmd(command: string, val: string | undefined = undefined) {
    if (isSourceMode || disabled) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
    updateActiveStates();
  }

  function handleInput() {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    // Normalize empty editor content
    const cleanContent = content === "<p><br></p>" || content === "<br>" ? "" : content;
    setHtmlSource(cleanContent);
    onChange(cleanContent);
  }

  function handleSourceChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newHtml = e.target.value;
    setHtmlSource(newHtml);
    onChange(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
  }

  function toggleSourceMode() {
    if (isSourceMode) {
      // Switching from source to visual
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlSource;
      }
      setIsSourceMode(false);
    } else {
      // Switching from visual to source
      if (editorRef.current) {
        setHtmlSource(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  }

  function handleInsertLink() {
    if (isSourceMode || disabled) return;
    const currentSelection = window.getSelection()?.toString() || "";
    const url = window.prompt("ระบุ URL ของลิงก์ (เช่น https://example.com):", "https://");
    if (!url || url.trim() === "" || url === "https://") return;

    if (!currentSelection && editorRef.current) {
      execCmd("insertHTML", `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    } else {
      execCmd("createLink", url);
    }
  }

  function handleFormatBlock(tag: string) {
    if (isSourceMode || disabled) return;
    const currentTag = document.queryCommandValue("formatBlock");
    if (currentTag === tag) {
      execCmd("formatBlock", "<p>");
    } else {
      execCmd("formatBlock", `<${tag}>`);
    }
  }

  // Count words and characters
  const rawText = htmlSource.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const charCount = rawText.length;
  const wordCount = rawText ? rawText.split(" ").length : 0;

  return (
    <div
      className={`border border-border rounded-lg overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-primary transition-all flex flex-col shadow-xs ${className}`}
    >
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-muted/40 border-b border-border text-foreground select-none">
        {/* Paragraph & Headings */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-border/80 mr-1">
          <button
            type="button"
            title="หัวข้อขนาดใหญ่ (Heading 2)"
            disabled={isSourceMode || disabled}
            onClick={() => handleFormatBlock("h2")}
            className={`p-1.5 rounded-md text-xs font-semibold hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.h2 ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="หัวข้อย่อย (Heading 3)"
            disabled={isSourceMode || disabled}
            onClick={() => handleFormatBlock("h3")}
            className={`p-1.5 rounded-md text-xs font-semibold hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.h3 ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Text Styles: Bold, Italic, Underline, Strikethrough */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-border/80 mr-1">
          <button
            type="button"
            title="ตัวหนา (Ctrl+B)"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("bold")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.bold ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="ตัวเอียง (Ctrl+I)"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("italic")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.italic ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="ขีดเส้นใต้ (Ctrl+U)"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("underline")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.underline ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="ขีดฆ่า"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("strikeThrough")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.strikeThrough ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-border/80 mr-1">
          <button
            type="button"
            title="จัดชิดซ้าย"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("justifyLeft")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.justifyLeft ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="จัดกึ่งกลาง"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("justifyCenter")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.justifyCenter ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="จัดชิดขวา"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("justifyRight")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.justifyRight ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-border/80 mr-1">
          <button
            type="button"
            title="รายการสัญลักษณ์ (Bullet List)"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("insertUnorderedList")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.unorderedList ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="รายการตัวเลข (Numbered List)"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("insertOrderedList")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.orderedList ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="กล่องข้อความอ้างอิง (Blockquote)"
            disabled={isSourceMode || disabled}
            onClick={() => handleFormatBlock("blockquote")}
            className={`p-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors ${
              activeStates.blockquote ? "bg-primary/15 text-primary font-bold" : "text-muted-foreground"
            } disabled:opacity-40`}
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Link & Clear Format */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-border/80 mr-1">
          <button
            type="button"
            title="แทรกลิงก์ (Link)"
            disabled={isSourceMode || disabled}
            onClick={handleInsertLink}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="ลบลิงก์ออก"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("unlink")}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="ล้างการจัดรูปแบบ"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("removeFormat")}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-border/80 mr-1">
          <button
            type="button"
            title="เลิกทำ (Ctrl+Z)"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("undo")}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="ทำซ้ำ (Ctrl+Y)"
            disabled={isSourceMode || disabled}
            onClick={() => execCmd("redo")}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Source Mode Toggle (<>) */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            title={isSourceMode ? "สลับกลับสู่โหมดวิชวล (Visual WYSIWYG)" : "สลับไปดูรหัสโค้ด HTML (Source Code)"}
            onClick={toggleSourceMode}
            className={`px-2 py-1 rounded-md text-xs font-mono inline-flex items-center gap-1 transition-colors ${
              isSourceMode
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {isSourceMode ? (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Visual</span>
              </>
            ) : (
              <>
                <Code className="w-3.5 h-3.5" />
                <span>HTML</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1">
        {isSourceMode ? (
          <textarea
            value={htmlSource}
            onChange={handleSourceChange}
            disabled={disabled}
            style={{ minHeight }}
            className="w-full p-3 font-mono text-xs leading-relaxed bg-muted/20 text-foreground resize-y focus:outline-hidden border-none"
            placeholder="<html> โค้ด HTML... </html>"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onKeyUp={updateActiveStates}
            onMouseUp={updateActiveStates}
            style={{ minHeight }}
            className="p-3 text-sm leading-relaxed text-foreground focus:outline-hidden overflow-y-auto max-h-[380px] prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:my-1.5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_a]:text-primary [&_a]:underline"
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-muted/20 border-t border-border/60 text-[11px] text-muted-foreground select-none">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{isSourceMode ? "โหมดแก้ไขรหัส HTML" : "Tiny Editor (Rich Text)"}</span>
        </span>
        <span className="flex items-center gap-3">
          <span>{charCount} ตัวอักษร</span>
          <span>{wordCount} คำ</span>
        </span>
      </div>
    </div>
  );
}
