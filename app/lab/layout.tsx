import SubPageShell from "@/components/site/SubPageShell";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <SubPageShell section="Security lab">{children}</SubPageShell>;
}
