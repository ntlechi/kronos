"use client";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { getTermsDoc } from "@/lib/legal/documents";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function TermsPage() {
  const { locale, t } = useLocale();
  return (
    <LegalDocument
      doc={getTermsDoc(locale)}
      otherHref="/privacy"
      otherLabel={t("legal.privacy")}
    />
  );
}
