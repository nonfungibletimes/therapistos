import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { generateStructuredNote } from '../lib/ai';
import type { NoteFormat, SessionNote } from '../types/db';

export function useNotes(practitionerId?: string) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['notes', practitionerId],
    enabled: !!practitionerId,
    queryFn: async () => {
      const { data, error } = await supabase.from('session_notes').select('*, clients(name)').eq('practitioner_id', practitionerId).order('created_at', { ascending: false });
      if (error) throw error;
      return data as (SessionNote & { clients?: { name: string } })[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: Partial<SessionNote>) => {
      const { error } = await supabase.from('session_notes').upsert({ ...payload, practitioner_id: practitionerId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });

  const sign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('session_notes').update({ signed: true, signed_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  });

  const aiGenerate = async (summary: string, format: NoteFormat) => generateStructuredNote(summary, format);

  return { ...query, save, sign, aiGenerate };
}
