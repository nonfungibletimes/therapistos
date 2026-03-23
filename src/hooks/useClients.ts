import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Client } from '../types/db';

export function useClients(practitionerId?: string, search = '') {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['clients', practitionerId, search],
    enabled: !!practitionerId,
    queryFn: async () => {
      const q = supabase.from('clients').select('*').eq('practitioner_id', practitionerId).order('created_at', { ascending: false });
      if (search) q.ilike('name', `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as Client[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: Partial<Client>) => {
      const { error } = await supabase.from('clients').upsert({ ...payload, practitioner_id: practitionerId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  return { ...query, save };
}
