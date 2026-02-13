"use client";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function About() {
  const [activeTab, setActiveTab] = useState("skills");
  const [aboutData, setAboutData] = useState<any>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      const docRef = doc(db, "about", "main");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setAboutData(docSnap.data());
    };
    fetchAbout();
  }, []);

  if (!aboutData) {
  return (
    <section
      id="about"
      className="w-full py-28 px-6 sm:px-10 bg-[--color-section-dark] text-white flex justify-center items-center"
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full max-w-7xl animate-pulse">

        {/* IMAGE SKELETON */}
        <div className="w-full md:w-[45%] flex justify-center">
          <div className="w-[85%] md:w-[90%] max-w-[480px] h-[420px] rounded-2xl bg-white/10" />
        </div>

        {/* TEXT SKELETON */}
        <div className="w-full md:w-[55%] space-y-6">
          
          {/* title */}
          <div className="h-10 w-48 bg-white/10 rounded" />

          {/* bio lines */}
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded w-full" />
            <div className="h-4 bg-white/10 rounded w-11/12" />
            <div className="h-4 bg-white/10 rounded w-10/12" />
            <div className="h-4 bg-white/10 rounded w-9/12" />
          </div>

          {/* tabs */}
          <div className="flex gap-4 pt-4">
            <div className="h-6 w-20 bg-white/10 rounded" />
            <div className="h-6 w-24 bg-white/10 rounded" />
            <div className="h-6 w-20 bg-white/10 rounded" />
          </div>

          {/* skills pills */}
          <div className="flex flex-wrap gap-3 pt-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-white/10 rounded-full" />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

  return (
    <section
      id="about"
      className="w-full py-28 px-6 sm:px-10 bg-[--color-section-dark] text-white flex justify-center items-center"
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full max-w-7xl ">
        {/* ---------- LEFT SIDE: IMAGE ---------- */}
        <div className="w-full md:w-[45%] flex justify-center">
          <img
            src="/images/stock/profilepic.jpg"
            alt="Profile"
            className="w-[85%] md:w-[90%] max-w-[480px] rounded-2xl object-cover grayscale shadow-lg"
          />
        </div>

        {/* ---------- RIGHT SIDE: TEXT + FIREBASE DATA ---------- */}
        <div className="w-full md:w-[55%] space-y-6 text-center md:text-left">
          <h2 className="text-4xl font-bold ">About Me</h2>
          <p className="text-gray-300 leading-relaxed">{aboutData.bio}</p>

          {/* ---------- TABS ---------- */}
          <div className="flex justify-center md:justify-start gap-6 border-b border-white/10 mb-4">
            {["skills", "experience", "education"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[var(--color-hehe)] text-[--color-accent]"
                    : "border-transparent text-gray-400 hover:text-[--color-accent-light]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ---------- TAB CONTENT ---------- */}

          {/* --- SKILLS --- */}
          {activeTab === "skills" && (
            <div className="text-gray-300 max-h-[320px] overflow-y-auto pr-2 space-y-8">
              {aboutData.skills &&
                Object.entries(aboutData.skills).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-[var(--color-hehe)] font-semibold mb-3">
                      {category}
                    </h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      {(items as string[]).map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm hover:bg-[--color-accent]/20 transition"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* --- EXPERIENCE --- */}
          {activeTab === "experience" && (
            <div className="space-y-6 max-h-[320px] overflow-y-auto pr-2">
              {aboutData.experience && aboutData.experience.length > 0 ? (
                aboutData.experience.map((exp: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
                  >
                    <div className="flex justify-between items-start gap-4 flex-col md:flex-row">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--color-hehe)]">
                          {exp.title}
                        </h3>
                        {exp.timespan && (
                          <p className="text-sm text-gray-400 mb-2">
                            {exp.timespan}
                          </p>
                        )}
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                      {exp.link && (
                        <a
                          href={exp.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 md:mt-0 px-3 py-2 bg-[--color-accent] text-black rounded text-sm font-medium hover:bg-[--color-accent-light] transition"
                        >
                          View
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No experiences added yet.</p>
              )}
            </div>
          )}

          {/* --- EDUCATION --- */}
          {activeTab === "education" && (
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {aboutData.education && aboutData.education.length > 0 ? (
                aboutData.education.map((edu: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
                  >
                    <h3 className="text-lg font-semibold text-[var(--color-hehe)]">
                      {edu.degree}
                    </h3>
                    {(edu.duration || edu.institution) && (
                      <p className="text-sm text-gray-400 mb-2">
                        {edu.duration}
                        {edu.duration && edu.institution ? " · " : ""}
                        {edu.institution}
                      </p>
                    )}
                    {edu.description && (
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No education entries added yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
