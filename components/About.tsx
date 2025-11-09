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
      if (docSnap.exists()) {
        setAboutData(docSnap.data());
      }
    };
    fetchAbout();
  }, []);

  if (!aboutData) {
    return (
      <section id="about" className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">About Me</h2>
        <p className="text-gray-400">Loading...</p>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 px-4 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
        {/* LEFT IMAGE */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="/images/stock/profilepic.jpg"
            alt="Profile"
            className="w-[90%] sm:w-[80%] md:w-full max-w-[420px] rounded-2xl object-cover shadow-lg"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-bold mb-4">About Me</h2>
          <p className="text-gray-300 leading-relaxed mb-6">{aboutData.bio}</p>

          {/* Tabs */}
          <div className="flex justify-center md:justify-start gap-6 border-b border-white/10 mb-4">
            {["skills", "experience", "education"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "skills" && (
  <div className="text-gray-300 space-y-8">
    {aboutData.skills &&
      Object.entries(aboutData.skills).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-blue-400 font-semibold mb-3">{category}</h3>

          {/* Skill pills */}
          <div className="flex flex-wrap gap-2">
            {(items as string[]).map((item: string, i: number) => (
  <span
    key={i}
    className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm hover:bg-white/20 transition"
  >
    {item}
  </span>
))}

          </div>
        </div>
      ))}
  </div>
)}




          {activeTab === "experience" && (
  <div
    className="text-gray-300 space-y-6 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
  >
    {aboutData.experience && aboutData.experience.length > 0 ? (
      aboutData.experience.map((exp: any, i: number) => (
        <div
          key={i}
          className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
        >
          <div className="flex justify-between items-start gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{exp.title}</h3>
              {exp.timespan && (
                <p className="text-sm text-gray-400 mb-2">{exp.timespan}</p>
              )}
              <p className="text-gray-300 text-sm leading-relaxed">
                {exp.description}
              </p>
            </div>

            {exp.link && (
              <div className="mt-4 md:mt-0">
                <a
                  href={exp.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-3 py-2 bg-sky-600 rounded text-sm text-white hover:bg-sky-700"
                >
                  View
                </a>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-400">No experiences added yet.</p>
    )}
  </div>
)}



          {activeTab === "education" && (
  <div className="text-gray-300 space-y-6 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
    {aboutData.education && aboutData.education.length > 0 ? (
      aboutData.education.map((edu: any, i: number) => (
        <div
          key={i}
          className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
        >
          <h3 className="text-lg font-semibold text-white">{edu.degree}</h3>

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
