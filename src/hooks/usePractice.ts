import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { NoteTemplate, Practitioner } from '../types/db';

export function usePractice(practitionerId?: string, userId?: string) {
  const qc = useQueryClient();

  const practitioner = useQuery({
    queryKey: ['practice', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('practitioners').select('*').eq('user_id', userId).single();
      if (error) throw error;
      return data as Practitioner;
    },
  });

  const templates = useQuery({
    queryKey: ['templates', practitionerId],
    enabled: !!practitionerId,
    queryFn: async () => {
      const { data, error } = await supabase.from('note_templates').select('*').eq('practitioner_id', practitionerId).order('name');
      if (error) throw error;
      return data as NoteTemplate[];
    },
  });

  const updatePractice = useMutation({
    mutationFn: async (payload: Partial<Practitioner>) => {
      const { error } = await supabase.from('practitioners').update(payload).eq('id', practitionerId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['practice'] }),
  });

  const saveTemplate = useMutation({
    mutationFn: async (payload: Partial<NoteTemplate>) => {
      const { error } = await supabase.from('note_templates').upsert({ ...payload, practitioner_id: practitionerId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });

  return { practitioner, templates, updatePractice, saveTemplate };
}
