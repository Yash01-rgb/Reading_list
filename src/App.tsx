import { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

type Status = 'Want to Read' | 'Reading' | 'Finished';

interface Book {
  id: string;
  title: string;
  status: Status;
}

const STATUS_ORDER: Status[] = ['Want to Read', 'Reading', 'Finished'];
const STORAGE_KEY = 'reading-list-books';

const FILTERS: ('All' | Status)[] = ['All', ...STATUS_ORDER];

const STATUS_STYLES: Record<Status, { dot: string; badge: string; label: string }> = {
  'Want to Read': {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Want to Read',
  },
  'Reading': {
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    label: 'Reading',
  },
  'Finished': {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Finished',
  },
};

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Book[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((b) => ({
      id: b.id,
      title: b.title,
      status: STATUS_ORDER.includes(b.status) ? b.status : 'Want to Read',
    }));
  } catch {
    return [];
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(() => loadBooks());
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<'All' | Status>('All');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

  const addBook = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    if (trimmed.length > 60) {
      setError('Book title must be 60 characters or fewer.');
      return;
    }
    if (books.some((b) => normalize(b.title) === normalize(trimmed))) {
      setError('This book is already in your reading list.');
      return;
    }
    const book: Book = {
      id: crypto.randomUUID(),
      title: trimmed,
      status: 'Want to Read',
    };
    setBooks((prev) => [book, ...prev]);
    setTitle('');
    setError('');
    setShowForm(false);
  };

  const changeStatus = (id: string, status: Status) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const removeBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const filtered = filter === 'All' ? books : books.filter((b) => b.status === filter);

  const counts: Record<'All' | Status, number> = {
    All: books.length,
    'Want to Read': books.filter((b) => b.status === 'Want to Read').length,
    'Reading': books.filter((b) => b.status === 'Reading').length,
    'Finished': books.filter((b) => b.status === 'Finished').length,
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white">
              <BookOpen size={20} strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-stone-900 leading-tight">Reading List</h1>
              <p className="text-sm text-stone-500">Track your books, one page at a time.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Add button / form */}
        {showForm ? (
          <form
            onSubmit={addBook}
            className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <label className="mb-2 block text-sm font-medium text-stone-700">Book title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="e.g. The Great Gatsby"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
            />
            {error && (
              <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 active:scale-[0.98]"
              >
                Add book
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTitle('');
                  setError('');
                }}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-3.5 text-sm font-medium text-stone-600 transition hover:border-stone-400 hover:bg-stone-50 active:scale-[0.99]"
          >
            <Plus size={18} strokeWidth={2.25} />
            Add a book
          </button>
        )}

        {/* Filters */}
        {books.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {f}
                  <span
                    className={`text-xs tabular-nums ${
                      active ? 'text-stone-300' : 'text-stone-400'
                    }`}
                  >
                    {counts[f]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {books.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <BookOpen size={26} strokeWidth={1.75} />
            </div>
            <p className="text-base font-medium text-stone-700">
              Your reading list is empty. Add your first book.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white py-12 text-center">
            <p className="text-sm text-stone-500">No books in "{filter}" yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((book) => {
              const style = STATUS_STYLES[book.status];
              return (
                <li
                  key={book.id}
                  className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold leading-snug text-stone-900 break-words">
                        {book.title}
                      </h3>
                      <span
                        className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                    </div>
                    <button
                      onClick={() => removeBook(book.id)}
                      aria-label="Remove book"
                      className="shrink-0 rounded-lg p-1.5 text-stone-300 transition hover:bg-stone-100 hover:text-stone-600"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Status switcher */}
                  <div className="mt-3.5 flex gap-1.5">
                    {STATUS_ORDER.map((s) => {
                      const isActive = book.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => changeStatus(book.id, s)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                            isActive
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
