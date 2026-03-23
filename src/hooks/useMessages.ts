import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Message } from '../types/db';

export function useMessages(practitionerId?: string, clientId?: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', practitionerId, clientId],
    enabled: !!practitionerId,
    queryFn: async () => {
      let q = supabase.from('messages').select('*').eq('practitioner_id', practitionerId).order('created_at', { ascending: true });
      if (clientId) q = q.eq('client_id', clientId);
      const { data, error } = await q;
      if (error) throw error;
      return data as Message[];
    },
  });

  const send = useMutation({
    mutationFn: async (payload: Partial<Message>) => {
      const { error } = await supabase.from('messages').insert({ ...payload, practitioner_id: practitionerId, read: false });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  });

  return { ...query, send };
}
