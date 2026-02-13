"use client";
import { useEffect, useState } from "react";
import { getCollection } from "@/lib/firestoreHelpers";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getCollection("projects");
      setProjects(data);
      setLoading(false);
    })();
  }, []);

  return (
    <section
      id="projects"
      className="py-24 px-6 sm:px-10 md:px-20 bg-[--color-section-dark] text-white"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-14 text-center">
        My <span className="text-[--color-accent]">Work</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        
        {/* ---------- SKELETON ---------- */}
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[--color-section-card] border border-white/10 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="w-full h-60 bg-white/10" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-white/10 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-full" />
                  <div className="h-4 bg-white/10 rounded w-5/6" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
                <div className="h-9 bg-white/10 rounded w-40 mt-4" />
              </div>
            </div>
          ))
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="group bg-[--color-section-card] border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_-5px_var(--color-accent)] transition-all duration-300"
            >
              {/* Image */}
              {p.imageFile ? (
                <img
                  src={`/images/projects/${p.imageFile}`}
                  alt={p.title}
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-60 flex items-center justify-center bg-white/5 text-gray-400">
                  No image
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-3">
                <h3 className="text-2xl font-semibold text-[var(--color-hehe)] transition-colors">
                  {p.title}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {p.description}
                </p>

                {/* Awards */}
                {p.awards && p.awards.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {p.awards.map((award: string, i: number) => (
                      <li
                        key={i}
                        className="text-[--color-accent-light] text-sm font-medium flex items-center gap-1"
                      >
                        - {award}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Buttons */}
                {p.link && (
                  <div className="pt-4">
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block px-4 py-2 bg-[--color-accent] white font-semibold rounded-md hover:bg-[--color-accent-light] transition"
                    >
                      Visit Project →
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && projects.length === 0 && (
        <p className="text-center text-gray-400 mt-12">
          No projects added yet.
        </p>
      )}
    </section>
  );
}
