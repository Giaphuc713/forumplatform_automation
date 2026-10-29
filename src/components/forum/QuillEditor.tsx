"use client";

import { useEffect, useRef, useCallback } from "react";

interface QuillEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = "Body text (optional)",
}: QuillEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const isInternalChange = useRef(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const initQuill = useCallback(async () => {
    if (quillInstanceRef.current || !wrapperRef.current) return;

    const Quill = (await import("quill")).default;

    if (!wrapperRef.current) return;

    wrapperRef.current.innerHTML = "";

    const editorDiv = document.createElement("div");
    wrapperRef.current.appendChild(editorDiv);

    const quill = new Quill(editorDiv, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link", "blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
      },
    });

    quillInstanceRef.current = quill;

    if (value) {
      quill.root.innerHTML = value;
    }

    quill.on("text-change", () => {
      isInternalChange.current = true;
      const html = quill.root.innerHTML;
      const normalized = html === "<p><br></p>" ? "" : html;
      onChangeRef.current(normalized);
    });
  }, [placeholder]);

  useEffect(() => {
    initQuill();

    return () => {
      // 4. CLEANUP: Destroy the instance reference AND clear the DOM
      if (quillInstanceRef.current) {
        quillInstanceRef.current = null;
      }
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
      }
    };
  }, [initQuill]);

  useEffect(() => {
    if (!quillInstanceRef.current) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const currentHtml = quillInstanceRef.current.root.innerHTML;
    const normalizedCurrent = currentHtml === "<p><br></p>" ? "" : currentHtml;

    if (value !== normalizedCurrent) {
      quillInstanceRef.current.root.innerHTML = value || "";
    }
  }, [value]);

  return (
    // 5. Apply the wrapper ref to the outermost container
    <div
      ref={wrapperRef}
      className="quill-editor-wrapper border border-gray-200 rounded-md overflow-hidden bg-white min-h-[200px]"
    />
  );
}