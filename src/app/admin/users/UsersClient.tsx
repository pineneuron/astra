'use client'

import { useEffect, useMemo, useState } from 'react'
import type { User } from '@prisma/client'
import { Search, MoreVertical, Pencil, Trash2, CheckCircle2, Plus, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import * as Toast from '@radix-ui/react-toast'
import UserModal from './UserModal'

type Props = {
  q: string
  users: User[]
  actions: {
    createUser: (fd: FormData) => Promise<void>
    updateUser: (fd: FormData) => Promise<void>
    deleteUser: (fd: FormData) => Promise<void>
  }
}

export default function UsersClient({ q, users, actions }: Props) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [pendingDelete, setPendingDelete] = useState<User | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const sort = params.get('sort') || ''
  const dir = (params.get('dir') === 'desc') ? 'desc' : 'asc'

  function toggleSort(field: 'name' | 'email' | 'role') {
    const currentSort = params.get('sort')
    const currentDir = params.get('dir') === 'desc' ? 'desc' : 'asc'
    const nextDir = currentSort === field && currentDir === 'asc' ? 'desc' : 'asc'
    const sp = new URLSearchParams(params.toString())
    sp.set('sort', field)
    sp.set('dir', nextDir)
    router.replace(`${pathname}?${sp.toString()}`)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const openIfAdd = () => {
      if (window.location.hash === '#add') {
        setEditing(null)
        setOpen(true)
        history.replaceState(null, '', window.location.pathname)
      }
    }
    openIfAdd()
    window.addEventListener('hashchange', openIfAdd)
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const link = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!link) return
      try {
        const url = new URL(link.href, window.location.href)
        if (url.hash === '#add' && url.pathname === window.location.pathname) {
          e.preventDefault()
          setEditing(null)
          setOpen(true)
        }
      } catch {}
    }
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('hashchange', openIfAdd)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  const rows = useMemo(() => users, [users])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-gray-900">Users</h1>
          <p className="text-[12px] text-gray-400">Manage users</p>
        </div>
        <div className="flex items-center gap-2">
          <form className="hidden md:flex items-center relative" method="get">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400" />
            <input name="q" defaultValue={q} placeholder="Search users..." className="h-9 w-64 pl-8 pr-3 border border-[oklch(.922_0_0)] rounded-md text-sm" />
          </form>
          <button onClick={() => { setEditing(null); setOpen(true) }} className="h-9 px-3 rounded-md bg-[#030e55] text-white text-[13px] font-semibold inline-flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[oklch(.922_0_0)] bg-white overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b border-b-[oklch(.922_0_0)] text-left text-xs uppercase text-gray-500">
              <th className="px-3 py-2 w-20">Image</th>
              <th className="px-3 py-2">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('name')}>
                  <span>Name</span>
                  {sort === 'name' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('email')}>
                  <span>Email</span>
                  {sort === 'email' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-32">
                <button type="button" className="inline-flex items-center gap-1 hover:text-gray-900 select-none" onClick={() => toggleSort('role')}>
                  <span>Role</span>
                  {sort === 'role' ? (dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 text-gray-400" />}
                </button>
              </th>
              <th className="px-3 py-2 w-56 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[oklch(.922_0_0)]">
            {rows.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-3 py-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.image || '/images/placeholder.png'} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-3 py-3 text-[13px]">{u.name ?? '-'}</td>
                <td className="px-3 py-3 text-[13px]">{u.email ?? '-'}</td>
                <td className="px-3 py-3 text-[13px]">{u.role}</td>
                <td className="px-3 py-3 text-right">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-50">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content side="bottom" align="end" sideOffset={6} className="z-50 min-w-[180px] rounded-md bg-white p-2 shadow-md">
                        <div className="px-2 pb-2 text-[13px] font-semibold text-gray-900">Actions</div>
                        <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                          <button type="button" onClick={() => { setEditing(u); setOpen(true) }} className="flex items-center gap-2 w-full text-left">
                            <Pencil className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                            <span>Update</span>
                          </button>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                          <button type="button" onClick={() => setPendingDelete(u)} className="flex items-center gap-2 w-full text-left text-red-600">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        isOpen={open}
        onClose={() => setOpen(false)}
        user={editing ?? undefined}
        action={editing ? actions.updateUser : actions.createUser}
        onSuccess={(m) => { setToastMsg(m); setToastOpen(true) }}
      />

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => { if (!o) setPendingDelete(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-[15px] font-semibold">Delete user?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-[13px] text-gray-600">
              This action cannot be undone. This will permanently delete {pendingDelete?.name}.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  className="h-9 px-4 rounded-md bg-red-600 text-white text-[13px] font-semibold"
                  onClick={async () => {
                    if (pendingDelete) {
                      const fd = new FormData()
                      fd.append('id', pendingDelete.id)
                      await actions.deleteUser(fd)
                      setPendingDelete(null)
                      setToastMsg('User deleted')
                      setToastOpen(true)
                    }
                  }}
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Toast.Provider swipeDirection="right">
        <Toast.Root open={toastOpen} onOpenChange={setToastOpen} className="fixed top-6 right-6 z-[60] rounded-md bg-white border border-[oklch(.922_0_0)] shadow px-4 py-3 text-[13px] w-[320px] max-w-[92vw]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <Toast.Title className="font-semibold text-gray-900">Success</Toast.Title>
          </div>
          <Toast.Description className="mt-1 text-gray-700">{toastMsg}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-[320px] max-w-[100vw] m-0 list-none z-[60] outline-none" />
      </Toast.Provider>
    </div>
  )
}
