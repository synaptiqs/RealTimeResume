import { prisma } from "@/lib/db";

// Plain journal: dated notes the user writes to capture achievements. No
// assistant / AI in this version.

export async function addJournalEntry(userId: string, content: string) {
  const text = content.trim();
  if (!text) throw new Error("Entry cannot be empty");
  return prisma.journalEntry.create({ data: { userId, content: text } });
}

export async function listJournalEntries(userId: string) {
  return prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteJournalEntry(userId: string, id: string) {
  const result = await prisma.journalEntry.deleteMany({
    where: { id, userId },
  });
  return result.count > 0;
}
