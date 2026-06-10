"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSchema, type IncomeInput } from "@/lib/validations";
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "@/actions/income.actions";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { IIncome, IncomeSource } from "@/types";
import { INCOME_SOURCES } from "@/utils/constants";
import { formatCurrency, formatDate, formatDateForInput } from "@/utils/format";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Loader2,
} from "lucide-react";

function IncomeForm({
  income,
  onSuccess,
}: {
  income?: IIncome;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: income
      ? {
          amount: income.amount,
          source: income.source,
          description: income.description,
          date: formatDateForInput(income.date),
        }
      : {
          date: formatDateForInput(new Date()),
          source: "Salary",
        },
  });

  const onSubmit = async (data: IncomeInput) => {
    setLoading(true);
    setError("");
    const result = income
      ? await updateIncome(income._id!, data)
      : await createIncome(data);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="Enter amount"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-xs text-red-500">{errors.amount.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Select id="source" {...register("source")}>
          {INCOME_SOURCES.map((src) => (
            <option key={src.value} value={src.value}>
              {src.label}
            </option>
          ))}
        </Select>
        {errors.source && (
          <p className="text-xs text-red-500">{errors.source.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Describe your income"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && (
          <p className="text-xs text-red-500">{errors.date.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {income ? "Update Income" : "Add Income"}
      </Button>
    </form>
  );
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IIncome[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IIncome | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    const result = await getIncomes({
      search: debouncedSearch || undefined,
      source: (sourceFilter as IncomeSource) || undefined,
      page,
      pageSize: 10,
    });
    if (result.success && result.data) {
      setIncomes(result.data.data);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
    }
    setLoading(false);
  }, [debouncedSearch, sourceFilter, page]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income?")) return;
    setDeletingId(id);
    await deleteIncome(id);
    setDeletingId(null);
    fetchIncomes();
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingIncome(undefined);
    fetchIncomes();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income"
        description={`${total} total income entries`}
        action={
          <Button
            onClick={() => {
              setEditingIncome(undefined);
              setModalOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Income
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search income..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48"
        >
          <option value="">All Sources</option>
          {INCOME_SOURCES.map((src) => (
            <option key={src.value} value={src.value}>
              {src.label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : incomes.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No income found"
          description={
            search || sourceFilter
              ? "Try adjusting your filters"
              : "Add your first income entry"
          }
          action={
            !search && !sourceFilter ? (
              <Button
                onClick={() => setModalOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Income
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
                    Source
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
                {incomes.map((income) => (
                  <tr
                    key={income._id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(income.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">{income.source}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {income.description}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(income.date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingIncome(income);
                            setModalOpen(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(income._id!)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={deletingId === income._id}
                        >
                          {deletingId === income._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogClose onClose={() => setModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>
            {editingIncome ? "Edit Income" : "Add Income"}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <IncomeForm income={editingIncome} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
