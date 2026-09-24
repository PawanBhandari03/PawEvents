import { SpringBootPagination } from "@/domain/domain";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SimplePaginationProps<T> {
  pagination: SpringBootPagination<T>;
  onPageChange: (page: number) => void;
}

export function SimplePagination<T>({
  pagination,
  onPageChange,
}: SimplePaginationProps<T>) {
  const currentPage = pagination.number;
  const totalPages = pagination.totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-3" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={pagination.first}
      >
        <ChevronLeft />
        Previous
      </Button>
      <span className="text-sm text-muted-foreground tabular-nums">
        {currentPage + 1} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={pagination.last}
      >
        Next
        <ChevronRight />
      </Button>
    </nav>
  );
}
