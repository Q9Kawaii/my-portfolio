// components/Projects.tsx
"use client";
import { useEffect, useState } from "react";
import { getCollection } from "@/lib/firestoreHelpers";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setProjects(await getCollection("projects"));
    })();
  }, []);

  return (
    <section id="projects" className="py-20">
      <h2 className="text-3xl font-bold mb-10 text-center">My Work</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((p) => (
          <div key={p.id} className="bg-white/5 rounded-xl overflow-hidden">
            {p.imageFile ? (
              <img
                src={`/images/projects/${p.imageFile}`}
                alt={p.title}
                className="w-full h-[240px] object-cover"
              />
            ) : (
              <div className="w-full h-44 bg-white/6 flex items-center justify-center">
                No image
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="text-gray-300 mt-2">{p.description}</p>
              {p.awards && p.awards.length > 0 && (
  <ul className="mt-3 space-y-1">
    {p.awards.map((award: string, i: number) => (
      <li
        key={i}
        className="text-yellow-400 text-sm font-medium flex items-center gap-1"
      >
        🏆 {award}
      </li>
    ))}
  </ul>
)}


              <div className="mt-4 flex gap-3">
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-sky-600 rounded text-white"
                  >
                    Visit
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
