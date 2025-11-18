import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import {
  speakingQuestions,
  writingQuestions,
  readingQuestions,
  listeningQuestions,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const BookmarkSchema = z.object({
  questionId: z.string(),
  questionType: z.string(),
  bookmarked: z.boolean(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const parsed = BookmarkSchema.safeParse(body);

  if (!parsed.success) {
    return new Response("Invalid request body", { status: 400 });
  }

  const { questionId, questionType, bookmarked } = parsed.data;

  let table;
  switch (questionType) {
    case "speaking":
      table = speakingQuestions;
      break;
    case "writing":
      table = writingQuestions;
      break;
    case "reading":
      table = readingQuestions;
      break;
    case "listening":
      table = listeningQuestions;
      break;
    default:
      return new Response("Invalid question type", { status: 400 });
  }

  try {
    await db
      .update(table)
      .set({ bookmarked })
      .where(eq(table.id, questionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
