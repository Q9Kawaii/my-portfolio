"use client";
import { useEffect, useState } from "react";
import { getCollection } from "@/lib/firestoreHelpers";

export default function Awards() {
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getCollection("awards");
      setAwards(data);
      setLoading(false);
    })();
  }, []);

  return (
    <section
      id="awards"
      className="py-24 px-6 sm:px-10 bg-[--color-section-dark] text-white"
    >
      <h2 className="text-4xl font-bold mb-12 text-center text-[--color-accent]">
        Awards & Achievements
      </h2>

      {/* --- GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        
        {/* ---------- SKELETON LOADING ---------- */}
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="w-full h-[240px] bg-white/10" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-white/10 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-full" />
                  <div className="h-4 bg-white/10 rounded w-5/6" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
                <div className="h-4 bg-white/10 rounded w-32 mt-3" />
              </div>
            </div>
          ))
        ) : awards.length > 0 ? (
          awards.map((a) => (
            <div
              key={a.id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 hover:shadow-[0_0_25px_-5px_var(--color-accent)]"
            >
              {/* --- IMAGE --- */}
              {a.imageFile ? (
                <img
                  src={`/images/awards/${a.imageFile}`}
                  alt={a.title}
                  className="w-full h-[240px] object-cover"
                />
              ) : (
                <div className="w-full h-[200px] bg-white/5 flex items-center justify-center text-gray-500">
                  No image available
                </div>
              )}

              {/* --- CONTENT --- */}
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-white">
                  {a.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {a.description}
                </p>

                {/* Optional link */}
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-[--color-accent-light] hover:text-[--color-accent] transition"
                  >
                    🔗 View Details
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center col-span-full">
            No awards added yet.
          </p>
        )}
      </div>
    </section>
  );
}
