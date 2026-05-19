'use server'

import { createClient } from '@/utils/supabase/server'

export async function getOrCreateBabyId(): Promise<string> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('babies')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id as string

  const { data: created, error } = await supabase
    .from('babies')
    .insert({ user_id: user.id, name: 'Bibi' })
    .select('id')
    .single()

  if (error || !created) throw new Error('Failed to create baby')
  return created.id as string
}
