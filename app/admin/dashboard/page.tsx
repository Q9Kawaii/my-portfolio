"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
  getCollection,
  updateDocument,
  createDocument,
  deleteDocument,
} from "@/lib/firestoreHelpers";
import { useRouter } from "next/navigation";


export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  
// add or update this interface above the component
interface AboutData {
  bio: string;
  skills: Record<string, string[]>;
  experience: {
    title: string;
    description: string;
    timespan: string;
    link?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    duration: string;
    description?: string;
  }[]; // <-- now an array of objects
}

const [about, setAbout] = useState<AboutData>({
  bio: "",
  skills: {},
  experience: [],
  education: [], // <-- initialize as empty array
});



  // Fetch About Data
  useEffect(() => {
  (async () => {
    const snap = await getDoc(doc(db, "about", "main"));
    if (snap.exists()) {
      const data = snap.data() as Partial<AboutData>;
      setAbout({
        bio: data.bio || "",
        skills: data.skills || {},
        experience: data.experience || [],
        education: data.education || [],
      });
    }
  })();
}, []);


  const saveAbout = async () => {
    await setDoc(doc(db, "about", "main"), about);
    alert("✅ About section updated!");
  };

  // Fetch Projects & Awards
  useEffect(() => {
    (async () => {
      setProjects(await getCollection("projects"));
      setAwards(await getCollection("awards"));
    })();
  }, []);

  // Sign Out
  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  // -------- PROJECTS CRUD ----------
  const addProject = async () => {
    await createDocument("projects", {
      title: "New Project",
      description: "Describe your project",
      link: "#",
      imageFile: "",
    });
    location.reload();
  };

  const updateProject = async (p: any) => {
    await updateDocument("projects", p.id, p);
    alert("✅ Project updated");
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete project?")) return;
    await deleteDocument("projects", id);
    alert("🗑️ Deleted");
    location.reload();
  };

  // -------- AWARDS CRUD ----------
  const addAward = async () => {
    await createDocument("awards", {
      title: "New Award",
      description: "Describe your award or achievement",
      imageFile: "",
      link: "",
    });
    location.reload();
  };

  const updateAward = async (a: any) => {
    await updateDocument("awards", a.id, a);
    alert("🏆 Award updated");
  };

  const deleteAward = async (id: string) => {
    if (!confirm("Delete award?")) return;
    await deleteDocument("awards", id);
    alert("🗑️ Deleted");
    location.reload();
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleSignOut}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition"
        >
          Sign out
        </button>
      </div>

      {/* ---------------- ABOUT SECTION ---------------- */}
<section className="mb-16">
  <h2 className="text-2xl font-semibold mb-6">About Section</h2>
  <div className="p-4 bg-white/5 rounded-xl space-y-6">
    {/* Bio */}
    <div>
      <label className="block font-medium">Bio</label>
      <textarea
        value={about.bio}
        onChange={(e) => setAbout({ ...about, bio: e.target.value })}
        className="w-full p-2 bg-transparent border-b h-24 resize-none focus:outline-none"
      />
    </div>

    {/* ---------------- Skills Section ---------------- */}
    <div>
      <label className="block font-medium mb-3">Skills</label>

      {Object.keys(about.skills || {}).length === 0 && (
        <p className="text-gray-400 mb-3">No categories added yet.</p>
      )}

      {/* Render all categories — always expanded */}
      <div className="space-y-6">
        {Object.entries(about.skills || {}).map(([category, skills]) => (
          <div
            key={category}
            className="border border-white/10 rounded-lg p-4 bg-white/5 shadow-sm"
          >
            {/* Category Name and Delete */}
            <div className="flex justify-between items-center mb-3">
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  const newName = e.target.value.trim();
                  if (!newName) return;
                  const updatedSkills = { ...about.skills };
                  delete updatedSkills[category];
                  updatedSkills[newName] = skills;
                  setAbout({ ...about, skills: updatedSkills });
                }}
                className="bg-transparent text-lg font-semibold border-b w-3/4 focus:outline-none"
              />
              <button
                onClick={() => {
                  const updated = { ...about.skills };
                  delete updated[category];
                  setAbout({ ...about, skills: updated });
                }}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Delete
              </button>
            </div>

            {/* Skills List */}
            <ul className="space-y-2">
              {skills.map((skill, i) => (
                <li key={i} className="flex justify-between items-center">
                  <input
                    value={skill}
                    onChange={(e) => {
                      const newSkills = { ...about.skills };
                      newSkills[category][i] = e.target.value;
                      setAbout({ ...about, skills: newSkills });
                    }}
                    className="bg-transparent border-b w-4/5 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const newSkills = { ...about.skills };
                      newSkills[category] = newSkills[category].filter(
                        (_, idx) => idx !== i
                      );
                      setAbout({ ...about, skills: newSkills });
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            {/* Add new skill */}
            <button
              onClick={() => {
                const newSkills = { ...about.skills };
                newSkills[category].push("New Skill");
                setAbout({ ...about, skills: newSkills });
              }}
              className="mt-3 px-2 py-1 text-sm bg-white/10 rounded hover:bg-white/20 transition"
            >
              + Add Skill
            </button>
          </div>
        ))}
      </div>

      {/* Add Category */}
      <button
        onClick={() => {
          const name = prompt("Enter new category name:");
          if (!name) return;
          if (about.skills[name]) return alert("Category already exists!");
          const updated = { ...about.skills, [name]: [] };
          setAbout({ ...about, skills: updated });
        }}
        className="mt-4 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition"
      >
        + Add Category
      </button>
    </div>

    {/* Experience */}
    {/* ---------------- EXPERIENCE SECTION ---------------- */}
<section className="mt-8">
  <h2 className="text-xl font-semibold mb-4">Experience</h2>

  <div className="p-4 bg-white/5 rounded space-y-4">
    {/* Add new experience */}
    <div className="flex items-center gap-3 mb-2">
      <button
        onClick={() => {
          const newExp = {
            title: "New Experience",
            description: "Describe your experience",
            timespan: "",
            link: "",
          };
          setAbout({ ...about, experience: [...(about.experience || []), newExp] });
        }}
        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
      >
        + Add Experience
      </button>

      <span className="text-sm text-gray-400">Add as many entries as you want. Save when done.</span>
    </div>

    {/* Render experiences */}
    {(about.experience || []).map((exp, idx) => (
      <div key={idx} className="border border-white/10 bg-white/5 p-4 rounded-lg space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-medium text-lg">Experience #{idx + 1}</label>
          <button
            onClick={() => {
              if (!confirm("Delete this experience?")) return;
              const updated = about.experience.filter((_, i) => i !== idx);
              setAbout({ ...about, experience: updated });
            }}
            className="text-red-500 hover:text-red-400 text-sm"
          >
            Delete
          </button>
        </div>

        <label className="block font-medium">Title</label>
        <input
          value={exp.title}
          onChange={(e) => {
            const updated = [...about.experience];
            updated[idx].title = e.target.value;
            setAbout({ ...about, experience: updated });
          }}
          className="w-full p-2 bg-transparent border-b focus:outline-none"
        />

        <label className="block font-medium mt-2">Description</label>
        <textarea
          value={exp.description}
          onChange={(e) => {
            const updated = [...about.experience];
            updated[idx].description = e.target.value;
            setAbout({ ...about, experience: updated });
          }}
          className="w-full p-2 bg-transparent border-b h-20 resize-none focus:outline-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mt-2">Time span (e.g. 2024 – 2025 · SRM KTR)</label>
            <input
              value={exp.timespan}
              onChange={(e) => {
                const updated = [...about.experience];
                updated[idx].timespan = e.target.value;
                setAbout({ ...about, experience: updated });
              }}
              className="w-full p-2 bg-transparent border-b focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mt-2">Link (optional)</label>
            <input
              value={exp.link || ""}
              onChange={(e) => {
                const updated = [...about.experience];
                updated[idx].link = e.target.value;
                setAbout({ ...about, experience: updated });
              }}
              className="w-full p-2 bg-transparent border-b focus:outline-none"
            />
          </div>
        </div>
      </div>
    ))}

    <div className="pt-2">
      <button
        onClick={saveAbout}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition"
      >
        Save Experience
      </button>
    </div>
  </div>
</section>


    {/* ---------------- EDUCATION SECTION ---------------- */}
<section className="mt-16">
  <h2 className="text-xl font-semibold mb-4">Education</h2>

  <div className="p-4 bg-white/5 rounded space-y-4">
    {/* Add Education */}
    <button
      onClick={() => {
        const newEdu = {
          degree: "New Degree / Course",
          institution: "",
          duration: "",
          description: "",
        };
        const updated = [...(about.education || []), newEdu];
        setAbout({ ...about, education: updated });
      }}
      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
    >
      + Add Education
    </button>

    {/* Render Education entries */}
    {(about.education || []).map((edu, idx) => (
      <div
        key={idx}
        className="border border-white/10 bg-white/5 p-4 rounded-lg space-y-3"
      >
        <div className="flex justify-between items-center">
          <label className="font-medium text-lg">Education #{idx + 1}</label>
          <button
            onClick={() => {
              const updated = about.education.filter((_, i) => i !== idx);
              setAbout({ ...about, education: updated });
            }}
            className="text-red-500 hover:text-red-400 text-sm"
          >
            Delete
          </button>
        </div>

        <label className="block font-medium">Degree / Course</label>
        <input
          value={edu.degree}
          onChange={(e) => {
            const updated = [...about.education];
            updated[idx].degree = e.target.value;
            setAbout({ ...about, education: updated });
          }}
          className="w-full p-2 bg-transparent border-b focus:outline-none"
        />

        <label className="block font-medium mt-2">Institution</label>
        <input
          value={edu.institution}
          onChange={(e) => {
            const updated = [...about.education];
            updated[idx].institution = e.target.value;
            setAbout({ ...about, education: updated });
          }}
          className="w-full p-2 bg-transparent border-b focus:outline-none"
        />

        <label className="block font-medium mt-2">Duration</label>
        <input
          value={edu.duration}
          onChange={(e) => {
            const updated = [...about.education];
            updated[idx].duration = e.target.value;
            setAbout({ ...about, education: updated });
          }}
          className="w-full p-2 bg-transparent border-b focus:outline-none"
        />

        <label className="block font-medium mt-2">Description (optional)</label>
        <textarea
          value={edu.description}
          onChange={(e) => {
            const updated = [...about.education];
            updated[idx].description = e.target.value;
            setAbout({ ...about, education: updated });
          }}
          className="w-full p-2 bg-transparent border-b h-20 resize-none focus:outline-none"
        />
      </div>
    ))}

    <div className="pt-2">
      <button
        onClick={saveAbout}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition"
      >
        Save Education
      </button>
    </div>
  </div>
</section>


    {/* Save Button */}
    <button
      onClick={saveAbout}
      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition"
    >
      Save About
    </button>
  </div>
</section>



      {/* ---------------- PROJECTS ---------------- */}
<section className="mb-12">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">Projects</h2>
    <button
      onClick={addProject}
      className="px-3 py-1 bg-green-600 rounded"
    >
      Add Project
    </button>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {projects.map((p) => (
      <div key={p.id} className="p-4 bg-white/5 rounded">
        <label className="block font-medium">Title</label>
        <input
          value={p.title}
          onChange={(e) =>
            setProjects(
              projects.map((x) =>
                x.id === p.id ? { ...x, title: e.target.value } : x
              )
            )
          }
          className="w-full p-2 bg-transparent border-b mt-2"
        />

        <label className="block font-medium mt-3">Description</label>
        <textarea
          value={p.description}
          onChange={(e) =>
            setProjects(
              projects.map((x) =>
                x.id === p.id
                  ? { ...x, description: e.target.value }
                  : x
              )
            )
          }
          className="w-full p-2 bg-transparent border-b mt-2 h-20"
        />

        <label className="block font-medium mt-3">Link</label>
        <input
          value={p.link}
          onChange={(e) =>
            setProjects(
              projects.map((x) =>
                x.id === p.id ? { ...x, link: e.target.value } : x
              )
            )
          }
          className="w-full p-2 bg-transparent border-b mt-2"
        />

        <label className="block font-medium mt-3">
          Image Filename (in <code>/public/images/projects/</code>)
        </label>
        <input
          value={p.imageFile}
          onChange={(e) =>
            setProjects(
              projects.map((x) =>
                x.id === p.id
                  ? { ...x, imageFile: e.target.value }
                  : x
              )
            )
          }
          className="w-full p-2 bg-transparent border-b mt-2"
          placeholder="example.jpg"
        />

        <label className="block font-medium mt-3">Awards (optional)</label>
<div className="space-y-2 mt-2">
  {(p.awards ?? []).map((award: string, idx: number) => (
    <div key={idx} className="flex items-center gap-2">
      <input
        value={award}
        onChange={(e) => {
          const newAwards: string[] = [...(p.awards ?? [])];
          newAwards[idx] = e.target.value;

          setProjects(
            projects.map((x) =>
              x.id === p.id ? { ...x, awards: newAwards } : x
            )
          );
        }}
        className="w-full p-2 bg-transparent border-b"
      />
      <button
        type="button"
        onClick={() => {
          const newAwards = (p.awards ?? []).filter((_award: string, i: number) => i !==idx);

          setProjects(
            projects.map((x) =>
              x.id === p.id ? { ...x, awards: newAwards } : x
            )
          );
        }}
        className="text-red-500 hover:text-red-400 text-xs"
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={() => {
      const newAwards = [...(p.awards ?? []), "New Award"];
      setProjects(
        projects.map((x) =>
          x.id === p.id ? { ...x, awards: newAwards } : x
        )
      );
    }}
    className="mt-2 px-2 py-1 bg-white/10 rounded text-sm hover:bg-white/20"
  >
    + Add Award
  </button>
</div>


        {/* Preview */}
        <div className="mt-3">
          <p className="text-sm text-gray-400">Preview</p>
          <div className="mt-2 w-full h-36 bg-white/6 rounded flex items-center justify-center overflow-hidden">
            {p.imageFile ? (
              <img
                src={`/images/projects/${p.imageFile}`}
                alt={p.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-500">No image</div>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => updateProject(p)}
            className="px-3 py-1 bg-blue-600 rounded"
          >
            Save
          </button>
          <button
            onClick={() => deleteProject(p.id)}
            className="px-3 py-1 bg-red-600 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
</section>


      {/* ---------------- AWARDS ---------------- */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Awards & Achievements</h2>
          <button
            onClick={addAward}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition"
          >
            + Add Award
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {awards.map((a) => (
            <div key={a.id} className="p-4 bg-white/5 rounded-xl space-y-3">
              <label className="block font-medium">Title</label>
              <input
                value={a.title}
                onChange={(e) =>
                  setAwards(
                    awards.map((x) =>
                      x.id === a.id ? { ...x, title: e.target.value } : x
                    )
                  )
                }
                className="w-full p-2 bg-transparent border-b focus:outline-none"
              />

              <label className="block font-medium">Description</label>
              <textarea
                value={a.description}
                onChange={(e) =>
                  setAwards(
                    awards.map((x) =>
                      x.id === a.id
                        ? { ...x, description: e.target.value }
                        : x
                    )
                  )
                }
                className="w-full p-2 bg-transparent border-b h-20 resize-none focus:outline-none"
              />

              <label className="block font-medium">Link (optional)</label>
<input
  value={a.link || ""}
  onChange={(e) =>
    setAwards(
      awards.map((x) =>
        x.id === a.id ? { ...x, link: e.target.value } : x
      )
    )
  }
  className="w-full p-2 bg-transparent border-b focus:outline-none"
  placeholder="https://certificate-link.com"
/>


              <label className="block font-medium">
                Image Filename (in <code>/public/images/awards/</code>)
              </label>
              <input
                value={a.imageFile}
                onChange={(e) =>
                  setAwards(
                    awards.map((x) =>
                      x.id === a.id
                        ? { ...x, imageFile: e.target.value }
                        : x
                    )
                  )
                }
                className="w-full p-2 bg-transparent border-b focus:outline-none"
                placeholder="example.jpg"
              />

              {/* Preview */}
              <div className="mt-3">
                <p className="text-sm text-gray-400">Preview</p>
                <div className="mt-2 w-full h-36 bg-white/10 rounded flex items-center justify-center overflow-hidden">
                  {a.imageFile ? (
                    <img
                      src={`/images/awards/${a.imageFile}`}
                      alt={a.title}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.src = "/images/placeholder.png")
                      }
                    />
                  ) : (
                    <div className="text-gray-500">No image</div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => updateAward(a)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteAward(a.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
