import type { SkillGroup } from "@/lib/types";
import Masonry from "./Masonry";
import TiltCard from "./TiltCard";
import { Section } from "./ui";

export default function Skills({ groups }: { groups: SkillGroup[] }) {
  if (!groups.length) return null;
  return (
    <Section id="skills" eyebrow="02 / Skills" title="Tools I work with">
      <Masonry>
        {groups.map((g) => (
          <TiltCard key={g.id} max={6} className="p-6">
            <h3 className="font-display text-lg font-semibold text-text [transform:translateZ(24px)]">{g.name}</h3>
            <ul className="mt-4 flex flex-wrap gap-2 [transform:translateZ(16px)]">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[15px] text-text"
                >
                  {item}
                </li>
              ))}
            </ul>
          </TiltCard>
        ))}
      </Masonry>
    </Section>
  );
}
