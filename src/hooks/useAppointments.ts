import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, startOfWeek } from 'date-fns';
import { supabase } from '../lib/supabase';
import type { Appointment } from '../types/db';

export function useAppointments(practitionerId?: string, weekStart = new Date()) {
  const qc = useQueryClient();
  const from = startOfWeek(weekStart, { weekStartsOn: 1 }).toISOString();
  const to = addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), 7).toISOString();

  const query = useQuery({
    queryKey: ['appointments', practitionerId, from],
    enabled: !!practitionerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, clients(name)')
        .eq('practitioner_id', practitionerId)
        .gte('start_time', from)
        .lt('start_time', to)
        .order('start_time');
      if (error) throw error;
      return data as (Appointment & { clients?: { name: string } })[];
    },
  });

  const save = useMutation({
    mutationFn: async (payload: Partial<Appointment>) => {
      const { error } = await supabase.from('appointments').upsert({ ...payload, practitioner_id: practitionerId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });

  return { ...query, save };
}
