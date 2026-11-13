import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";

type Props = { language: string; label: string; children: ReactNode };

/** A block of code with its language and „Kopieren“. The key shows its own result: it says „Kopiert“ for 2 s. */
export function CodeBlock({ language, label, children }: Props) {
  const { t } = useTranslation();
  const code = useRef<HTMLElement>(null);
  const [copiedAt, setCopiedAt] = useState(0);

  useEffect(() => {
    if (!copiedAt) return;
    const timer = window.setTimeout(() => setCopiedAt(0), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedAt]);

  const copy = () => {
    navigator.clipboard.writeText(code.current?.textContent ?? "").then(
      () => setCopiedAt(Date.now()),
      () => undefined, // no clipboard here: the label stays as it is
    );
  };

  return (
    <div className="sb-code">
      <div className="sb-code__bar">
        <span className="sb-code__lang">{language}</span>
        <button className="sb-code__copy" type="button" onClick={copy}>
          <Icon name="copy--16" size={16} />
          <span className="sb-code__copy-label">{copiedAt ? t("common.copied") : t("common.copy")}</span>
        </button>
      </div>
      <pre tabIndex={0} role="region" aria-label={label}>
        <code ref={code}>{children}</code>
      </pre>
      <span className="sb-visually-hidden" role="status">
        {copiedAt ? t("common.copied") : ""}
      </span>
    </div>
  );
}
