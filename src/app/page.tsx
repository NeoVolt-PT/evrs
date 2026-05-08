"use client";

import SearchBar from "@/components/SearchBar";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="flex flex-col items-center justify-center p-8 bg-background text-foreground mt-12 mb-24">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {t("title_main")} <span className="text-primary">{t("title_sub")}</span>
        </h1>
        <p className="text-xl text-gray-400">
          {t("description")}
        </p>
        
        <SearchBar />
      </div>
    </main>
  );
}
