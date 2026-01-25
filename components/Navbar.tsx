"use client";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md z-50 border-b border-white/10">
        <div className="flex items-center justify-between px-6 md:px-12 h-16">
          {/* Brand */}
          <h1
            onClick={() => scrollTo("hero")}
            className="text-3xl font-bold cursor-pointer"
          >
            Yash.
          </h1>

          {/* Desktop nav */}
          <ul className="hidden md:flex gap-8 items-center text-lg font-medium">
            {["about", "projects", "contact"].map((section) => (
              <li
                key={section}
                onClick={() => scrollTo(section)}
                className="cursor-pointer text-gray-300 hover:text-[--color-accent] transition"
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </li>
            ))}
            <li>
              <a
                href="/images/stock/cv.pdf"
                download
                className="px-4 py-2 bg-white/30 text-black font-bold rounded-md hover:bg-[var(--color-hehe)] transition"
              >
                Download CV
              </a>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Slide-in menu */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-black z-50 p-6 transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="text-2xl absolute top-4 right-4"
        >
          ✕
        </button>

        <ul className="mt-16 flex flex-col gap-6 text-xl">
          {["about", "projects", "contact"].map((section) => (
            <li
              key={section}
              onClick={() => scrollTo(section)}
              className="cursor-pointer text-gray-300 hover:text-[--color-accent] transition"
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </li>
          ))}

          <a
            href="/images/stock/cv.pdf"
            download
            className="mt-4 inline-block px-4 py-2 bg-white/30 text-black font-bold rounded-md hover:bg-[var(--color-hehe)] transition"
          >
            Download CV
          </a>
        </ul>
      </div>
    </>
  );
}
