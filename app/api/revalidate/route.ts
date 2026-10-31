import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

// Called by the admin dashboard after every save so the live site updates without a redeploy.
export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  revalidatePath("/");
  return NextResponse.json({ revalidated: true, at: Date.now() });
}
