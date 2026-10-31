import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Generate pagination array with smart ellipses
 * Example outputs:
 *  - [1, 2, 3, 4, 5]
 *  - [1, 2, 3, 4, "...", 10]
 *  - [1, "...", 4, 5, 6, "...", 10]
 *  - [1, "...", 7, 8, 9, 10]
 */
function getPaginationRange(currentPage, totalPages, siblingCount = 1) {
  const totalPageNumbers = siblingCount * 2 + 5; // 1 + siblings + current + siblings + last + 2 ellipses

  // Case 1: total pages less than the page numbers we want to show
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  // Case 2: No left dots, but right dots
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", totalPages];
  }

  // Case 3: Left dots, but no right dots
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + 1 + i
    );
    return [firstPageIndex, "...", ...rightRange];
  }

  // Case 4: Both left and right dots
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
  }

  return [];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null;

  const paginationRange = getPaginationRange(currentPage, totalPages);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5 py-4", className)}
    >
      {/* Previous button */}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Trang trước"
        className="h-10 px-3 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs sm:text-sm font-semibold cursor-pointer shadow-2xs"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === "...") {
            return (
              <span
                key={`dots-${idx}`}
                className="w-8 h-10 flex items-center justify-center text-slate-400 font-bold select-none text-xs"
              >
                ...
              </span>
            );
          }

          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "min-w-10 h-10 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center",
                isActive
                  ? "bg-[#1549B8] text-white shadow-sm hover:bg-[#1240A0]"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-2xs"
              )}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
        className="h-10 px-3 rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-xs sm:text-sm font-semibold cursor-pointer shadow-2xs"
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

