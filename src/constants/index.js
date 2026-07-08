// Default avatar image served from the backend static uploads folder
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
export const DEFAULT_AVATAR = `${BACKEND_URL}/uploads/profile/defultimg.jpg`;

export const CATEGORIES = [
  { value: 'personal', label: 'Personal', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { value: 'work', label: 'Work', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  { value: 'study', label: 'Study', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'shopping', label: 'Shopping', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'health', label: 'Health', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  { value: 'others', label: 'Others', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' }
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/50' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/50' },
  { value: 'high', label: 'High', color: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/50' }
];

export const STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { value: 'in progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' },
  { value: 'review', label: 'Review', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' }
];
