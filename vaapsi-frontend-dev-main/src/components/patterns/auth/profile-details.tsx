'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SESSION_QUERY_KEY } from './use-session'

type ProfileDetailsProps = {
  name: string
  email: string
  phone: string
}

export function ProfileDetails({ name, email, phone }: ProfileDetailsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(name)
  const [emailValue, setEmailValue] = useState(email)
  const [phoneValue, setPhoneValue] = useState(phone)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  function cancelEdit() {
    setFullName(name)
    setEmailValue(email)
    setPhoneValue(phone)
    setError('')
    setSuccess('')
    setEditing(false)
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const updates: {
      fullName?: string
      email?: string
      phone?: string | null
    } = {}

    if (fullName.trim() !== name) updates.fullName = fullName.trim()
    if (emailValue.trim().toLowerCase() !== email.toLowerCase()) {
      updates.email = emailValue.trim().toLowerCase()
    }
    if (phoneValue.trim() !== phone) {
      updates.phone = phoneValue.trim() || null
    }

    if (Object.keys(updates).length === 0) {
      setEditing(false)
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const result = (await response.json()) as {
        user?: {
          id: string
          email: string | null
          phone: string | null
          fullName: string | null
          role: 'CUSTOMER' | 'SUPPORT_AGENT' | 'ADMIN'
          status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
          emailVerified: boolean
          phoneVerified: boolean
          marketingOptIn: boolean
        }
        message?: string
      }

      if (!response.ok || !result.user) {
        throw new Error(result.message ?? 'Could not update your profile.')
      }

      const user = result.user

      setFullName(user.fullName ?? '')
      setEmailValue(user.email ?? '')
      setPhoneValue(user.phone ?? '')
      setSuccess('Profile updated successfully.')
      setEditing(false)

      queryClient.setQueryData(SESSION_QUERY_KEY, { user })
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
      router.refresh()
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="border border-line bg-surface p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Profile Details</h2>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setError('')
              setSuccess('')
              setEditing(true)
            }}
            className="text-sm font-medium underline underline-offset-4"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={saveProfile} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="profile-name" className="block text-sm">
            Full name
          </label>
          <input
            id="profile-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            disabled={!editing || saving}
            required
            maxLength={120}
            autoComplete="name"
            className="w-full border border-line bg-background px-3 py-2 text-sm disabled:opacity-75"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="profile-email" className="block text-sm">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            value={emailValue}
            onChange={(event) => setEmailValue(event.target.value)}
            disabled={!editing || saving}
            required
            autoComplete="email"
            className="w-full border border-line bg-background px-3 py-2 text-sm disabled:opacity-75"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="profile-phone" className="block text-sm">
            Phone
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={phoneValue}
            onChange={(event) => setPhoneValue(event.target.value)}
            disabled={!editing || saving}
            autoComplete="tel"
            placeholder="+919876543210"
            className="w-full border border-line bg-background px-3 py-2 text-sm disabled:opacity-75"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {success && <p role="status" className="text-sm">{success}</p>}

        {editing && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="border border-ink bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="border border-line px-4 py-2 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </section>
  )
}