import type { GraphData } from "@/lib/graph";
import { Section } from "../ui";
import GraphLoader from "./GraphLoader";

export default function KnowledgeGraph({ data }: { data: GraphData }) {
  return (
    <Section
      id="graph"
      eyebrow="03 / Knowledge graph"
      title="How it all connects"
      intro="My education, projects, skills, tools and awards as one network. Solid lines show structure; dashed lines show where a project or certificate uses a skill."
    >
      <GraphLoader data={data} />
    </Section>
  );
}
