import { ChevronLeft, ChevronRight } from "lucide-react";

export function ListingPagination({
  currentPage,
  totalPages,
  total,
  count,
  pageSize,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
  count: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const start = currentPage * pageSize + 1;
  const end = Math.min(start + count - 1, total);

  return (
    <nav className="explore-pagination" aria-label="Listing pages">
      <p>Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> listings</p>
      <div className="explore-pagination__controls">
        <button type="button" className="pagination-button pagination-button--wide" disabled={currentPage === 0} onClick={() => onChange(currentPage - 1)}>
          <ChevronLeft size={17} /> Previous
        </button>
        <div className="explore-pagination__pages">
          {paginationItems(currentPage, totalPages).map((item) => typeof item === "number" ? (
            <button key={item} type="button" className={item === currentPage ? "pagination-button is-active" : "pagination-button"} aria-label={`Page ${item + 1}`} aria-current={item === currentPage ? "page" : undefined} onClick={() => onChange(item)}>{item + 1}</button>
          ) : <span key={item} aria-hidden="true">…</span>)}
        </div>
        <button type="button" className="pagination-button pagination-button--wide" disabled={currentPage >= totalPages - 1} onClick={() => onChange(currentPage + 1)}>
          Next <ChevronRight size={17} />
        </button>
      </div>
    </nav>
  );
}

function paginationItems(currentPage: number, totalPages: number): Array<number | string> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index);

  const items: Array<number | string> = [0];
  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages - 2, currentPage + 1);
  if (currentPage <= 3) end = 4;
  if (currentPage >= totalPages - 4) start = totalPages - 5;
  if (start > 1) items.push("start-ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 2) items.push("end-ellipsis");
  items.push(totalPages - 1);
  return items;
}
