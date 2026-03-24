"use client";

interface SourceModeProps {
  value: string;
  onChange: (value: string) => void;
}

export function SourceMode({ value, onChange }: SourceModeProps) {
  return (
    <textarea
      className="min-h-[60vh] w-full resize-none rounded-b-lg border-x border-b bg-muted/30 p-4 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write Markdown here..."
      spellCheck={false}
    />
  );
}
