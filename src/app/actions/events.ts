'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { getOrCreateBabyId } from './baby'
import type { DiaperPooConsistency, DiaperSubType, MealSubType, SleepSubType } from '@/types'

export type AddBottleInput = {
  time: string
  quantity_ml: number
}

export type AddDiaperInput = {
  time: string
  type: DiaperSubType
  poo_consistency?: DiaperPooConsistency
}

export type AddMealInput = {
  time: string
  meal_type: MealSubType
  quantity_gr: number
  components: string[]
}

export type AddSleepInput = {
  start_time: string
  end_time?: string
  type: SleepSubType
}

export async function addBottleEvent(input: AddBottleInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const babyId = await getOrCreateBabyId()

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({ user_id: user.id, baby_id: babyId, type: 'bottle' })
    .select('id')
    .single()

  if (eventError || !event) throw new Error('Failed to create event')

  const { error: detailError } = await supabase
    .from('bottle_events')
    .insert({ event_id: event.id as string, time: input.time, quantity_ml: input.quantity_ml })

  if (detailError) {
    await supabase.from('events').delete().eq('id', event.id)
    throw new Error('Failed to save bottle details')
  }

  revalidatePath('/')
}

export async function addDiaperEvent(input: AddDiaperInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const babyId = await getOrCreateBabyId()

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({ user_id: user.id, baby_id: babyId, type: 'diaper' })
    .select('id')
    .single()

  if (eventError || !event) throw new Error('Failed to create event')

  const { error: detailError } = await supabase.from('diaper_events').insert({
    event_id: event.id as string,
    time: input.time,
    type: input.type,
    poo_consistency: input.type === 'poo' ? (input.poo_consistency ?? 'normal') : null,
  })

  if (detailError) {
    await supabase.from('events').delete().eq('id', event.id)
    throw new Error('Failed to save diaper details')
  }

  revalidatePath('/')
}

export async function addMealEvent(input: AddMealInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const babyId = await getOrCreateBabyId()

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({ user_id: user.id, baby_id: babyId, type: input.meal_type })
    .select('id')
    .single()

  if (eventError || !event) throw new Error('Failed to create event')

  const { error: detailError } = await supabase.from('meal_events').insert({
    event_id: event.id as string,
    time: input.time,
    meal_type: input.meal_type,
    quantity_gr: input.quantity_gr,
    components: input.components.filter((c) => c.trim() !== ''),
  })

  if (detailError) {
    await supabase.from('events').delete().eq('id', event.id)
    throw new Error('Failed to save meal details')
  }

  revalidatePath('/')
}

export async function addSleepEvent(input: AddSleepInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const babyId = await getOrCreateBabyId()

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({ user_id: user.id, baby_id: babyId, type: 'sleep' })
    .select('id')
    .single()

  if (eventError || !event) throw new Error('Failed to create event')

  const { error: detailError } = await supabase.from('sleep_events').insert({
    event_id: event.id as string,
    start_time: input.start_time,
    end_time: input.end_time ?? null,
    type: input.type,
  })

  if (detailError) {
    await supabase.from('events').delete().eq('id', event.id)
    throw new Error('Failed to save sleep details')
  }

  revalidatePath('/')
}
