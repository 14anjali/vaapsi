'use client'

import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { AuthUser } from '@/lib/auth/backend'

/**
 * The session, for client components.
 *
 * The header is a client component because it tracks scroll, so it cannot read
 * cookies the way a server component does — and it must not, because the
 * session cookies are httpOnly. It asks `/api/auth/session` instead, which
 * returns the public user projection and never a token.
 *
 * Through TanStack Query rather than an effect, matching how the cart is wired:
 * one cache entry shared by every consumer, so the header and the profile menu
 * cannot disagree about who is signed in.
 */

export const SESSION_QUERY_KEY = ['auth', 'session'] as const

type SessionResponse = { user: AuthUser | null }

export function useSession() {
  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async (): Promise<SessionResponse> => {
      const response = await fetch('/api/auth/session', { cache: 'no-store' })
      if (!response.ok) return { user: null }
      return (await response.json()) as SessionResponse
    },
    // A session changes only when the shopper signs in or out, both of which
    // invalidate this key explicitly. No need to poll.
    staleTime: 5 * 60_000,
  })

  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    /** True once we actually know, so the header can avoid flashing a wrong state. */
    isResolved: query.isSuccess || query.isError,
  }
}

export function useSignOut() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' })
    },
    onSuccess: async () => {
      // Clear the cached session first so the header flips immediately, then
      // refresh the server tree — the account pages are server-rendered and
      // would otherwise keep showing the signed-in shell until a hard reload.
      queryClient.setQueryData(SESSION_QUERY_KEY, { user: null })
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      router.replace('/')
      router.refresh()
    },
  })
}
