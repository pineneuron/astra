'use client'

import { useMemo, useState, useEffect } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import * as Toast from '@radix-ui/react-toast'
import { MoreVertical, Pencil, Trash2, Search, Plus, CheckCircle2, Eye, Rocket } from 'lucide-react'
import PageModal from './PageModal'
import PageEditorDialog, { PageRecord } from './PageEditorDialog'
import { PAGE_TEMPLATES } from '@/config/pageTemplates'

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Draft' },
  PUBLISHED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Published' },
}

type Props = {
  q: string
  pages: PageRecord[]
  actions: {
    createPage: (formData: FormData) => Promise<void>
    updatePage: (formData: FormData) => Promise<void>
    deletePage: (formData: FormData) => Promise<void>
    updatePageStatus: (formData: FormData) => Promise<void>
  }
}

function formatDate(date: string | null) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function PagesClient({ q, pages, actions }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingPage, setEditingPage] = useState<PageRecord | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PageRecord | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [sortByUpdated, setSortByUpdated] = useState<'asc' | 'desc'>('desc')
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sortedPages = useMemo(() => {
    return [...pages].sort((a, b) => {
      if (sortByUpdated === 'asc') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [pages, sortByUpdated])

  const templateLabel = (templateKey: string) => PAGE_TEMPLATES[templateKey]?.label ?? templateKey

  // Open add modal on #add, and intercept in-page clicks to avoid scroll
  useEffect(() => {
    if (typeof window === 'undefined') return
    const openIfAdd = () => {
      if (window.location.hash === '#add') {
        setEditingPage(null)
        setShowCreate(true)
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
          setEditingPage(null)
          setShowCreate(true)
        }
      } catch {}
    }
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('hashchange', openIfAdd)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  const handleStatusChange = async (page: PageRecord, targetStatus: 'DRAFT' | 'PUBLISHED') => {
    const fd = new FormData()
    fd.append('id', page.id)
    fd.append('status', targetStatus)
    setStatusLoading(page.id)
    try {
      await actions.updatePageStatus(fd)
      setToastMsg(targetStatus === 'PUBLISHED' ? 'Page published' : 'Page moved to draft')
      setToastOpen(true)
    } finally {
      setStatusLoading(null)
    }
  }

  const handleDelete = async (page: PageRecord) => {
    const fd = new FormData()
    fd.append('id', page.id)
    setDeletingId(page.id)
    try {
      await actions.deletePage(fd)
      setToastMsg('Page deleted')
      setToastOpen(true)
    } finally {
      setDeletingId(null)
      setPendingDelete(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-gray-900">Pages</h1>
          <p className="text-[12px] text-gray-400">Manage CMS pages and content</p>
        </div>
        <div className="flex items-center gap-2">
          <form className="hidden md:flex items-center relative" method="get">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search pages..."
              className="h-9 w-64 pl-8 pr-3 border border-[oklch(.922_0_0)] rounded-md text-sm"
            />
          </form>
          <button
            onClick={() => setShowCreate(true)}
            className="h-9 px-3 rounded-md bg-[#030e55] text-white text-[13px] font-semibold inline-flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> New Page
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[oklch(.922_0_0)] bg-white overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b border-b-[oklch(.922_0_0)] text-left text-xs uppercase text-gray-500">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Template</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 w-40">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-gray-900"
                  onClick={() => setSortByUpdated((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                >
                  Updated
                </button>
              </th>
              <th className="px-3 py-2 w-56 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[oklch(.922_0_0)]">
            {sortedPages.map((page) => {
              const statusStyling = STATUS_COLORS[page.status] ?? STATUS_COLORS.DRAFT
              return (
                <tr key={page.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-3 text-[13px]">
                    <div className="font-semibold text-gray-900">{page.title}</div>
                    <div className="text-[12px] text-gray-500">Created {formatDate(page.createdAt)}</div>
                  </td>
                  <td className="px-3 py-3 text-[13px] font-mono text-gray-600">/{page.slug}</td>
                  <td className="px-3 py-3 text-[13px]">{templateLabel(page.template)}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex h-6 items-center rounded-full px-2 text-[12px] font-semibold ${statusStyling.bg} ${statusStyling.text}`}>
                      {statusStyling.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[13px] text-gray-600">{formatDate(page.updatedAt)}</td>
                  <td className="px-3 py-3 text-right">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-50">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content side="bottom" align="end" sideOffset={6} className="z-50 min-w-[200px] rounded-md bg-white p-2 shadow-md">
                          <div className="px-2 pb-2 text-[13px] font-semibold text-gray-900">Actions</div>
                          <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                            <button type="button" onClick={() => setEditingPage(page)} className="flex items-center gap-2 w-full text-left">
                              <Pencil className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                              <span>Edit Content</span>
                            </button>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full text-left">
                              <Eye className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                              <span>Preview</span>
                            </a>
                          </DropdownMenu.Item>
                          <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(page, page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                              disabled={statusLoading === page.id}
                              className="flex items-center gap-2 w-full text-left"
                            >
                              <Rocket className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                              <span>{page.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</span>
                            </button>
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                          <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                            <button type="button" onClick={() => setPendingDelete(page)} className="flex items-center gap-2 w-full text-left text-red-600">
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              )
            })}
            {sortedPages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-gray-500">
                  No pages found. Create your first page to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PageModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        action={actions.createPage}
        onSuccess={(message) => {
          setToastMsg(message)
          setToastOpen(true)
        }}
      />

      <PageEditorDialog
        isOpen={!!editingPage}
        onClose={() => setEditingPage(null)}
        page={editingPage}
        action={actions.updatePage}
        onSuccess={(message) => {
          setToastMsg(message)
          setToastOpen(true)
        }}
      />

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-[15px] font-semibold">Delete page?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-[13px] text-gray-600">
              This action cannot be undone. It will permanently delete <strong>{pendingDelete?.title}</strong>.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
              </AlertDialog.Cancel>
              <button
                className="h-9 px-4 rounded-md bg-red-600 text-white text-[13px] font-semibold disabled:opacity-60"
                onClick={() => pendingDelete && void handleDelete(pendingDelete)}
                disabled={deletingId === pendingDelete?.id}
              >
                {deletingId === pendingDelete?.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className="fixed top-6 right-6 z-[60] rounded-md bg-white border border-[oklch(.922_0_0)] shadow px-4 py-3 text-[13px] w-[320px] max-w-[92vw]"
        >
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
