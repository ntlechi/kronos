"use client";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { getPrivacyDoc } from "@/lib/legal/documents";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function PrivacyPage() {
  const { locale, t } = useLocale();
  return (
    <LegalDocument
      doc={getPrivacyDoc(locale)}
      otherHref="/terms"
      otherLabel={t("legal.terms")}
    />
  );
}
