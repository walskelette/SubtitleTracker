import { SubtitleSearch } from "@/components/subtitle-search";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    console.log('Home component mounted');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            YouTube Subtitle Search
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Search through video subtitles and jump to exact moments
          </p>
        </div>
      </header>

      <main className="py-8">
        <SubtitleSearch />
      </main>
    </div>
  );
}