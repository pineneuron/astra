'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Category, Product, ProductImage } from '@prisma/client'
import ProductModal from './ProductModal'
import { Plus, Search, MoreVertical, Pencil, Trash2, ArrowUpDown, ChevronUp, ChevronDown, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import * as Toast from '@radix-ui/react-toast'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

type UIProduct = Omit<Product, 'basePrice' | 'salePrice'> & { basePrice: number; salePrice: number | null } & { categoryName: string | null } & { images: ProductImage[] } & { selectedCategoryIds: string[] } & { categoryNames: string[] }

type Props = {
  q: string
  showDeleted?: boolean
  categories: Category[]
  products: UIProduct[]
  actions: {
    createProduct: (fd: FormData) => Promise<void>
    updateProduct: (fd: FormData) => Promise<void>
    deleteProduct: (fd: FormData) => Promise<void>
    toggleProductActive: (fd: FormData) => Promise<void>
    reorderProducts: (fd: FormData) => Promise<void>
    permanentlyDeleteProduct: (fd: FormData) => Promise<void>
  }
}

export default function ProductsClient({ q, showDeleted = false, categories, products, actions }: Props) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<UIProduct | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UIProduct | null>(null)
  const [pendingPermanentDelete, setPendingPermanentDelete] = useState<UIProduct | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastError, setToastError] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const toggleShowDeleted = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (showDeleted) {
      params.delete('showDeleted')
    } else {
      params.set('showDeleted', 'true')
    }
    router.push(`/admin/products?${params.toString()}`)
  }
  // Drag-and-drop removed per request
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    const openIfAdd = () => {
      if (window.location.hash === '#add') {
        setEditing(null)
        setOpen(true)
        // clean the hash to avoid re-opening on back/forward
        history.replaceState(null, '', pathname)
      }
    }
    openIfAdd()
    window.addEventListener('hashchange', openIfAdd)
    return () => window.removeEventListener('hashchange', openIfAdd)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const link = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!link) return
      try {
        const url = new URL(link.href, window.location.href)
        if (url.hash === '#add' && url.pathname === pathname) {
          e.preventDefault()
          setEditing(null)
          setOpen(true)
        }
      } catch {
        // ignore
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pathname])
  useEffect(() => {
    const m = searchParams.get('toast')
    if (m) {
      setToastMsg(decodeURIComponent(m))
      setToastError(false)
      setToastOpen(true)
      const url = pathname + '?' + Array.from(searchParams.entries()).filter(([k]) => k !== 'toast').map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      router.replace(url || pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const catLite = useMemo(() => categories.map(c => ({ id: c.id, name: c.name })), [categories])

  const columns = useMemo<ColumnDef<UIProduct>[]>(() => [
    {
      id: 'image',
      header: () => <span className="text-sm">Image</span>,
      cell: ({ row }) => {
        const src = (row.original as UIProduct).imageUrl || '/images/placeholder.png'
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="thumb" className="h-16 w-16 rounded-md object-cover" />
        )
      },
      size: 88,
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: () => <span className="text-sm">Name</span>,
      cell: ({ row }) => {
        const p = row.original as UIProduct
        const isDeleted = !!p.deletedAt
        return (
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-900">{p.name}</span>
            {isDeleted && <span className="text-[11px] text-red-600 font-semibold">(Deleted)</span>}
          </div>
        )
      },
      enableSorting: true,
    },
    {
      id: 'categories',
      header: () => <span className="text-sm">Category</span>,
      cell: ({ row }) => {
        const item = row.original as UIProduct
        const names = item.categoryNames && item.categoryNames.length > 0 ? item.categoryNames : (item.categoryName ? [item.categoryName] : [])
        if (!names || names.length === 0) return <span className="text-[11px] text-gray-500">-</span>
        return (
          <div className="flex flex-wrap gap-1">
            {names.map((n) => (
              <span key={n} className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[11px]">{n}</span>
            ))}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'basePrice',
      header: () => <span className="text-sm">Price</span>,
      cell: ({ getValue }) => <span className="text-[13px]">{Number(getValue() as number)}</span>,
      size: 100,
      enableSorting: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sortingFn: (rowA: any, rowB: any, columnId: string) => {
        const a = Number(rowA.getValue(columnId) ?? 0)
        const b = Number(rowB.getValue(columnId) ?? 0)
        return a === b ? 0 : a > b ? 1 : -1
      },
    },
    {
      id: 'description',
      header: () => <span className="text-sm">Description</span>,
      cell: ({ row }) => (
        <span className="text-[13px] text-gray-600">
          {(row.original as UIProduct).shortDescription || ''}
        </span>
      ),
      enableSorting: false,
    },
  ], [])

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10, pageIndex: 0 } },
  })

  if (!mounted) return null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-gray-900">Products</h1>
          <p className="text-[12px] text-gray-400">Manage products</p>
        </div>
        <div className="flex items-center gap-2">
          <form className="hidden md:flex items-center relative" method="get">
            {showDeleted && <input type="hidden" name="showDeleted" value="true" />}
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              className="h-9 w-64 pl-8 pr-3 border border-[oklch(.922_0_0)] rounded-md text-sm"
            />
          </form>
          <button
            type="button"
            onClick={toggleShowDeleted}
            className={`h-9 px-3 rounded-md border text-[13px] font-semibold inline-flex items-center gap-1.5 ${
              showDeleted ? 'bg-gray-100 border-gray-300' : 'border-[oklch(.922_0_0)]'
            }`}
          >
            {showDeleted ? <XCircle className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </button>
          <button onClick={() => { setEditing(null); setOpen(true) }} className="h-9 px-3 rounded-md bg-[#030e55] text-white text-[13px] font-semibold inline-flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[oklch(.922_0_0)] bg-white overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-b-[oklch(.922_0_0)] text-left text-xs uppercase text-gray-500">
                {hg.headers.map(h => {
                  const canSort = h.column.getCanSort()
                  const sorted = h.column.getIsSorted()
                  return (
                    <th key={h.id} className="px-3 py-2 select-none">
                      {h.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1 ${canSort ? 'hover:text-gray-900' : ''}`}
                          onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {canSort && (
                            sorted === 'asc' ? <ChevronUp className="h-3 w-3" /> :
                            sorted === 'desc' ? <ChevronDown className="h-3 w-3" /> :
                            <ArrowUpDown className="h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      )}
                    </th>
                  )
                })}
                <th className="px-3 py-2 w-24">Active</th>
                <th className="px-3 py-2 w-56 text-right">Actions</th>
              </tr>
            ))}
          </thead>
            <tbody className="divide-y divide-[oklch(.922_0_0)]">
              {table.getRowModel().rows.map(row => {
                const p = row.original as UIProduct
                const isDeleted = !!p.deletedAt
                return (
                  <tr key={p.id} className={`border-b last:border-0 hover:bg-gray-50 ${isDeleted ? 'opacity-60 bg-gray-50' : ''}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-3 text-[13px] align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <form action={actions.toggleProductActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="isActive" value={(!p.isActive).toString()} />
                        <button type="submit" className={`px-2.5 h-7 rounded-md text-[12px] font-semibold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </form>
                    </td>
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
                            {!isDeleted && (
                              <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditing(p)
                                    setOpen(true)
                                  }}
                                  className="flex items-center gap-2 w-full text-left"
                                >
                                  <Pencil className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                                  <span>Update</span>
                                </button>
                              </DropdownMenu.Item>
                            )}
                            {!isDeleted ? (
                              <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                                <button
                                  type="button"
                                  onClick={() => setPendingDelete(p)}
                                  className="flex items-center gap-2 w-full text-left text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
                              </DropdownMenu.Item>
                            ) : (
                              <DropdownMenu.Item asChild className="group flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none hover:bg-gray-100">
                                <button
                                  type="button"
                                  onClick={() => setPendingPermanentDelete(p)}
                                  className="flex items-center gap-2 w-full text-left text-red-600"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                  <span>Permanently Delete</span>
                                </button>
                              </DropdownMenu.Item>
                            )}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                )
              })}
            </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] text-gray-500">{products.length} row(s) total</div>
        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 border border-[oklch(.922_0_0)] rounded-md px-2 text-[13px]"
          >
            {[10, 20, 50].map(size => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <button
              className="h-8 px-3 rounded-md border border-[oklch(.922_0_0)] text-[13px] disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </button>
            <span className="text-[13px] text-gray-600 px-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              className="h-8 px-3 rounded-md border border-[oklch(.922_0_0)] text-[13px] disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={open}
        onClose={() => setOpen(false)}
        categories={catLite}
        product={editing ? {
          id: editing.id,
          name: editing.name,
          slug: editing.slug,
          categoryId: editing.categoryId,
          basePrice: Number(editing.basePrice),
          salePrice: editing.salePrice != null ? Number(editing.salePrice as unknown as number) : undefined,
          unit: editing.unit,
          sortOrder: editing.sortOrder,
          isFeatured: editing.isFeatured,
          isBestseller: editing.isBestseller,
          isActive: editing.isActive,
          description: editing.description,
          shortDescription: editing.shortDescription,
          images: (editing.images || []).map(im => ({ imageUrl: im.imageUrl, publicId: im.publicId, sortOrder: im.sortOrder, isPrimary: im.isPrimary })),
          selectedCategoryIds: editing.selectedCategoryIds,
        } : undefined}
        action={editing ? actions.updateProduct : actions.createProduct}
        onSuccess={(m) => { router.replace(`${pathname}?toast=${encodeURIComponent(m)}`) }}
      />

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => { if (!o) setPendingDelete(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-[15px] font-semibold">Delete product?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-[13px] text-gray-600">
              This will mark {pendingDelete?.name} as deleted. You can restore it later by showing deleted items.
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
                      try {
                        await actions.deleteProduct(fd)
                        setPendingDelete(null)
                        router.replace(`${pathname}?toast=${encodeURIComponent('Product deleted')}`)
                      } catch (error) {
                        setPendingDelete(null)
                        setToastMsg(error instanceof Error ? error.message : 'Failed to delete product')
                        setToastError(true)
                        setToastOpen(true)
                      }
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

      <AlertDialog.Root open={!!pendingPermanentDelete} onOpenChange={(o) => { if (!o) setPendingPermanentDelete(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-[15px] font-semibold">Permanently delete product?</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-[13px] text-gray-600">
              This action cannot be undone. This will permanently delete {pendingPermanentDelete?.name} from the database.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button className="h-9 px-4 rounded-md border text-[13px]">Cancel</button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  className="h-9 px-4 rounded-md bg-red-600 text-white text-[13px] font-semibold"
                  onClick={async () => {
                    if (pendingPermanentDelete) {
                      const fd = new FormData()
                      fd.append('id', pendingPermanentDelete.id)
                      try {
                        await actions.permanentlyDeleteProduct(fd)
                        setPendingPermanentDelete(null)
                        router.replace(`${pathname}?toast=${encodeURIComponent('Product permanently deleted')}`)
                      } catch (error) {
                        setPendingPermanentDelete(null)
                        setToastMsg(error instanceof Error ? error.message : 'Failed to permanently delete product')
                        setToastError(true)
                        setToastOpen(true)
                      }
                    }
                  }}
                >
                  Permanently Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Toast.Provider swipeDirection="right">
        <Toast.Root open={toastOpen} onOpenChange={setToastOpen} className={`fixed top-6 right-6 z-[60] rounded-md bg-white border border-[oklch(.922_0_0)] shadow px-4 py-3 text-[13px] w-[320px] max-w-[92vw] ${toastError ? 'border-red-200 bg-red-50' : ''}`}>
          <div className="flex items-center gap-2">
            {toastError ? <AlertCircle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
            <Toast.Title className={`font-semibold ${toastError ? 'text-red-900' : 'text-gray-900'}`}>{toastError ? 'Error' : 'Success'}</Toast.Title>
          </div>
          <Toast.Description className={`mt-1 ${toastError ? 'text-red-700' : 'text-gray-600'}`}>{toastMsg}</Toast.Description>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-[320px] max-w-[100vw] m-0 list-none z-[60] outline-none" />
      </Toast.Provider>
    </div>
  )
}
