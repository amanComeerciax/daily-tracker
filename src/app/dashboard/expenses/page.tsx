"use client";

import { useState, useEffect, useCallback } from "react";
import { getExpenses, deleteExpense } from "@/actions/expense.actions";
import { ExpenseForm } from "@/components/expenses/expense-form";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { IExpense, ExpenseCategory } from "@/types";
import { EXPENSE_CATEGORIES } from "@/utils/constants";
import { formatCurrency, formatDate } from "@/utils/format";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Loader2,
} from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<IExpense | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const result = await getExpenses({
      search: debouncedSearch || undefined,
      category: (categoryFilter as ExpenseCategory) || undefined,
      page,
      pageSize: 10,
    });
    if (result.success && result.data) {
      setExpenses(result.data.data);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
    }
    setLoading(false);
  }, [debouncedSearch, categoryFilter, page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    setDeletingId(id);
    await deleteExpense(id);
    setDeletingId(null);
    fetchExpenses();
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingExpense(undefined);
    fetchExpenses();
  };

  const openEdit = (expense: IExpense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingExpense(undefined);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description={`${total} total expenses`}
        action={
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found"
          description={
            search || categoryFilter
              ? "Try adjusting your filters"
              : "Add your first expense to get started"
          }
          action={
            !search && !categoryFilter ? (
              <Button onClick={openAdd} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Expense
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const cat = EXPENSE_CATEGORIES.find(
                    (c) => c.value === expense.category
                  );
                  return (
                    <tr
                      key={expense._id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-semibold">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="gap-1">
                          <span>{cat?.icon}</span>
                          {expense.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                          {expense.description}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(expense.date)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(expense)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense._id!)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={deletingId === expense._id}
                          >
                            {deletingId === expense._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogClose onClose={() => setModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>
            {editingExpense ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <ExpenseForm
            expense={editingExpense}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
