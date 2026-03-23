import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Invoice } from '../types/db';

export function useBilling(practitionerId?: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['invoices', practitionerId],
    enabled: !!practitionerId,
    queryFn: async () => {
      const { data, error } = await supabase.from('invoices').select('*, clients(name)').eq('practitioner_id', practitionerId).order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Invoice & { clients?: { name: string } })[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: Partial<Invoice>) => {
      const { error } = await supabase.from('invoices').upsert({ ...payload, practitioner_id: practitionerId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const stripe_payment_id = `pi_mock_${crypto.randomUUID().slice(0, 8)}`;
      const { error } = await supabase.from('invoices').update({ status: 'paid', stripe_payment_id }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });

  return { ...query, save, markPaid };
}
