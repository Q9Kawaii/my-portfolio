import About from "@/components/site/About";
import Awards from "@/components/site/Awards";
import Contact from "@/components/site/Contact";
import Experience from "@/components/site/Experience";
import Footer from "@/components/site/Footer";
import Hero from "@/components/site/Hero";
import Intro, { introBootScript } from "@/components/site/Intro";
import Navbar from "@/components/site/Navbar";
import Projects from "@/components/site/Projects";
import { getContent } from "@/lib/content";

// Rebuilt at most every 10 minutes, and immediately when the admin saves (see /api/revalidate).
export const revalidate = 600;

export default async function HomePage() {
  const content = await getContent();
  const { projects, skills, experience, education, awards } = content;
  // Never let a hidden phone number reach the HTML or RSC payload.
  const settings = content.settings.showPhone ? content.settings : { ...content.settings, phone: "" };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.name,
    jobTitle: settings.role,
    url: "https://www.yashdingar.in",
    sameAs: Object.values(settings.socials).filter(Boolean),
  };

  return (
    <>
      {/* Must come before the overlay so it runs before the overlay is painted. */}
      <script dangerouslySetInnerHTML={{ __html: introBootScript }} />
      <Intro name={settings.name} />
      <Navbar name={settings.name} />
      <main id="main">
        <Hero s={settings} />
        <About s={settings} skills={skills} />
        <Projects projects={projects} />
        <Experience experience={experience} education={education} />
        <Awards awards={awards} />
        <Contact s={settings} />
      </main>
      <Footer s={settings} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
