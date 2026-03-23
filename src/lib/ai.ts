import type { NoteFormat } from '../types/db';

export async function generateStructuredNote(summary: string, format: NoteFormat) {
  await new Promise((r) => setTimeout(r, 500));
  const chunks = summary.split('.').map((s) => s.trim()).filter(Boolean);
  return {
    subjective: `${format} subjective: ${chunks[0] || 'Client reports ongoing stress with work and sleep disruption.'}`,
    objective: `${format} objective: ${(chunks[1] || 'Affect congruent, oriented x4, engaged in session.').trim()}`,
    assessment: `${format} assessment: ${(chunks[2] || 'Symptoms consistent with anxiety; moderate functional impact.').trim()}`,
    plan: `${format} plan: ${(chunks[3] || 'Continue weekly therapy, homework journaling, and follow-up in 7 days.').trim()}`,
  };
}
