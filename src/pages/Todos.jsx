import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  SlidersHorizontal,
  Edit2, 
  Trash2, 
  Check, 
  Calendar,
  AlertTriangle,
  X,
  Clock,
  ExternalLink,
  Kanban,
  MoreHorizontal
} from 'lucide-react';
import taskService from '../services/taskService';
import { CATEGORIES, PRIORITIES, STATUSES } from '../constants';
import { taskSchema } from '../schemas';
import { formatDate, getRelativeDueDate } from '../utils/date';
import confetti from 'canvas-confetti';

const Todos = () => {
  const queryClient = useQueryClient();
  
  // State for search, filter, sort and view layout
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('board');
  const [activeDragId, setActiveDragId] = useState(null);

  // Dialog modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // null for create, task object for edit
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch tasks based on filters/sorting
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', { filter, search, sort }],
    queryFn: () => taskService.getTasks({ filter, search, sort })
  });

  const tasks = tasksData?.tasks || [];

  // Form hooks setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      category: 'personal',
      dueDate: ''
    }
  });

  // Task Mutations
  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      closeModal();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      closeModal();
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  });

  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    reset({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      category: 'personal',
      dueDate: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    reset({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      category: task.category,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const onSubmit = (data) => {
    // Format blank date to null
    if (data.dueDate === '') {
      data.dueDate = null;
    }
    
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask._id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const toggleTaskCompletion = (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskMutation.mutate({
      id: task._id,
      data: { status: nextStatus }
    });
    if (nextStatus === 'completed') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.85 } });
    }
  };

  const handleDrop = (e, targetStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskMutation.mutate({
        id: taskId,
        data: { status: targetStatus }
      });
    }
  };

  const triggerDelete = (task) => {
    setTaskToDelete(task);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate(taskToDelete._id);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'high', label: 'High Priority' },
    { value: 'today', label: "Today's Tasks" }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Toolbar area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-outfit text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
            My Todo Workspace
          </h2>
          <p className="text-2xs text-slate-400 dark:text-slate-500">
            Create, search, filter and organize your workflows
          </p>
        </div>
        
        {/* Create Task Action Button */}
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-97"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Control Toolbar: Search, Filters, Sort and Layout switch */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/60 p-4.5 dark:border-slate-800 dark:bg-[#0f1422]/60 md:flex-row md:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute top-3.5 left-4 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task title or category..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600 dark:focus:ring-indigo-950/10"
          />
        </div>

        {/* Sort and View controls */}
        <div className="flex items-center gap-3">
          {/* Sorting options */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-600 outline-none dark:text-slate-400"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Grid/List/Board View switcher */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-955">
            <button
              onClick={() => setView('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                view === 'board'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                view === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                view === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal filter chips */}
      <div className="flex flex-wrap gap-2.5">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-xl px-4.5 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
              filter === opt.value
                ? 'bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 dark:bg-indigo-950/20 dark:text-indigo-400'
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tasks listing area */}
      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-indigo-600"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card rounded-2xl border border-slate-200 py-16 text-center dark:border-slate-800 dark:bg-slate-900/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-outfit text-base font-bold text-slate-900 dark:text-white">
            No tasks found
          </h3>
          <p className="mx-auto mt-1 max-w-xs text-xs text-slate-400 dark:text-slate-500">
            Try adjusting your filters or search strings, or create a brand new task.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 transition-all hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400"
          >
            <Plus className="h-4 w-4" />
            <span>Create a Task</span>
          </button>
        </div>
      ) : view === 'board' ? (
        /* Kanban Column Board (Drag & Drop) */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: 'pending', label: 'To do', dotColor: 'bg-fuchsia-400' },
            { value: 'in progress', label: 'In Progress', dotColor: 'bg-blue-400' },
            { value: 'review', label: 'Review', dotColor: 'bg-amber-400' },
            { value: 'completed', label: 'Done', dotColor: 'bg-emerald-400' }
          ].map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.value);

            return (
              <div
                key={col.value}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData('text/plain') || activeDragId;
                  if (taskId) {
                    updateTaskMutation.mutate({
                      id: taskId,
                      data: { status: col.value }
                    });
                  }
                  setActiveDragId(null);
                }}
                className="flex flex-col rounded-xl bg-slate-50/50 p-3.5 dark:bg-[#09090b]/40 border border-slate-200/50 dark:border-zinc-800/40 min-h-[500px] transition-all"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                    <span className="font-outfit text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {col.label}
                    </span>
                    <span className="rounded-full bg-slate-200/70 px-1.5 py-0.2 text-3xs font-semibold text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {colTasks.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setValue('status', col.value);
                        handleOpenCreateModal();
                      }}
                      className="flex h-5.5 w-5.5 items-center justify-center rounded-md hover:bg-slate-200/50 dark:hover:bg-zinc-800 text-slate-500 transition-colors cursor-pointer"
                      title={`Add task to ${col.label}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex h-5.5 w-5.5 items-center justify-center rounded-md hover:bg-slate-200/50 dark:hover:bg-zinc-800 text-slate-500 transition-colors cursor-pointer">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Body Cards List */}
                <div className="mt-2.5 flex-1 space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800/50 text-3xs text-slate-400 dark:text-zinc-500">
                      Drag tasks here
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const catInfo = CATEGORIES.find((c) => c.value === task.category) || CATEGORIES[5];
                      const prioInfo = PRIORITIES.find((p) => p.value === task.priority) || PRIORITIES[1];
                      const relDate = getRelativeDueDate(task.dueDate);

                      return (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => {
                            setActiveDragId(task._id);
                            e.dataTransfer.setData('text/plain', task._id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragEnd={() => setActiveDragId(null)}
                          className="group relative flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-2xs transition-all duration-200 hover:shadow-xs hover:border-slate-200/80 dark:border-zinc-800 dark:bg-[#0d0d12] cursor-grab active:cursor-grabbing"
                        >
                          <div>
                            {/* Card Header: Priority Pill & Edit Menu */}
                            <div className="flex items-center justify-between">
                              <span className={`rounded-full px-1.5 py-0.2 text-3xs font-semibold uppercase tracking-wider ${prioInfo.color}`}>
                                {prioInfo.label}
                              </span>
                              
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditModal(task)}
                                  className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-slate-50 text-slate-500 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 cursor-pointer"
                                >
                                  <Edit2 className="h-2.5 w-2.5" />
                                </button>
                                <button
                                  onClick={() => triggerDelete(task)}
                                  className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-rose-50 text-slate-550 hover:text-rose-600 dark:hover:bg-rose-950/20 cursor-pointer"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            </div>

                            {/* Task Content: Title & Details */}
                            <div className="mt-2.5">
                              <div className="overflow-hidden text-left">
                                <h4 className={`font-outfit text-xs font-semibold tracking-tight text-slate-800 dark:text-slate-200 ${
                                  task.status === 'completed' ? 'line-through text-slate-450 dark:text-slate-500' : ''
                                }`}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className={`mt-0.5 line-clamp-2 text-3xs text-slate-400 dark:text-slate-500 ${
                                    task.status === 'completed' ? 'line-through opacity-70' : ''
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Card Footer: Category Tag & Calendar Date */}
                          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100/60 pt-2.5 dark:border-zinc-800/40">
                            <div className="flex items-center gap-1">
                              <span className={`rounded-full px-1.5 py-0.2 text-3xs font-medium ${catInfo.color}`}>
                                {catInfo.label}
                              </span>
                              {task.status === 'completed' && (
                                <button
                                  onClick={() => toggleTaskCompletion(task)}
                                  className="rounded-full bg-emerald-100 hover:bg-emerald-250 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-450 px-1.5 py-0.2 text-3xs font-bold border border-emerald-500/20 cursor-pointer transition-colors"
                                  title="Click to toggle status"
                                >
                                  ✓ Completed
                                </button>
                              )}
                            </div>
                            
                            {task.dueDate && (
                              <div className="flex items-center gap-0.5 text-3xs text-slate-400">
                                <Calendar className="h-2.5 w-2.5 text-slate-400" />
                                <span className={relDate?.color}>{relDate?.text}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : view === 'grid' ? (
        /* Grid Layout (Kanban cards) */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const catInfo = CATEGORIES.find((c) => c.value === task.category) || CATEGORIES[5];
            const prioInfo = PRIORITIES.find((p) => p.value === task.priority) || PRIORITIES[1];
            const relDate = getRelativeDueDate(task.dueDate);

            return (
              <div
                key={task._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/50 bg-white/35 p-5.5 shadow-sm transition-all duration-300 hover:scale-102 hover:shadow-md dark:border-slate-800/30 dark:bg-slate-900/25"
              >
                <div>
                  {/* Category and Actions header */}
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-3xs font-semibold ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                    
                    {/* Hover items action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="flex h-7.5 w-7.5 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => triggerDelete(task)}
                        className="flex h-7.5 w-7.5 items-center justify-center rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:hover:bg-rose-950/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Task details title & desc */}
                  <div className="mt-4 flex items-start gap-3">
                    {/* Circle Checkbox */}
                    <button
                      onClick={() => toggleTaskCompletion(task)}
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
                        task.status === 'completed'
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 hover:border-indigo-600 dark:border-slate-700'
                      }`}
                    >
                      {task.status === 'completed' && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                    </button>
                    <div className="overflow-hidden">
                      <h4 className={`font-outfit font-bold tracking-tight text-slate-900 dark:text-white ${
                        task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className={`mt-1.5 line-clamp-2 text-xs text-slate-400 dark:text-slate-500 ${
                          task.status === 'completed' ? 'line-through opacity-70' : ''
                        }`}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer details: Priority & due date */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4.5 dark:border-slate-800/40">
                  <span className={`rounded-full px-2 py-0.5 text-3xs font-bold uppercase tracking-wider ${prioInfo.color}`}>
                    {prioInfo.label}
                  </span>
                  
                  {task.dueDate && (
                    <div className="flex items-center gap-1.5 text-3xs">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className={relDate?.color}>{relDate?.text}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Layout (Table-like rows) */
        <div className="glass-card overflow-hidden rounded-2xl border border-white/50 bg-white/35 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25">
          <div className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task) => {
              const catInfo = CATEGORIES.find((c) => c.value === task.category) || CATEGORIES[5];
              const prioInfo = PRIORITIES.find((p) => p.value === task.priority) || PRIORITIES[1];
              const relDate = getRelativeDueDate(task.dueDate);

              return (
                <div
                  key={task._id}
                  className="flex flex-col justify-between p-4.5 sm:flex-row sm:items-center hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <button
                      onClick={() => toggleTaskCompletion(task)}
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
                        task.status === 'completed'
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 hover:border-indigo-600 dark:border-slate-700'
                      }`}
                    >
                      {task.status === 'completed' && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                    </button>
                    <div>
                      <h4 className={`font-outfit text-sm font-bold text-slate-900 dark:text-white ${
                        task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}>
                        {task.title}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.2 text-3xs font-semibold ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                        {task.dueDate && (
                          <span className="text-3xs text-slate-400 dark:text-slate-500">
                            Due {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions toolbar */}
                  <div className="mt-3 flex items-center justify-between sm:mt-0 sm:justify-start gap-4">
                    <span className={`rounded-full px-2 py-0.5 text-3xs font-bold uppercase tracking-wider ${prioInfo.color}`}>
                      {prioInfo.label}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-905 dark:hover:bg-slate-800 dark:text-slate-400"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => triggerDelete(task)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:hover:bg-rose-950/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Creation & Editing Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop overlay */}
          <div onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          
          {/* Dialog pane */}
          <div className="z-10 w-full max-w-lg rounded-2xl border border-white/60 bg-white p-6 shadow-2xl dark:border-slate-800/40 dark:bg-[#0f1422]">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-white">
                {selectedTask ? 'Edit Task Details' : 'Create New Task'}
              </h3>
              <button 
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4.5 w-4.5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-2xs font-semibold text-slate-500 dark:text-slate-400">Task Title</label>
                <input
                  type="text"
                  placeholder="Task title..."
                  {...register('title')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600"
                />
                {errors.title && <p className="text-3xs text-rose-500">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-2xs font-semibold text-slate-500 dark:text-slate-400">Description</label>
                <textarea
                  rows="3"
                  placeholder="Optional details..."
                  {...register('description')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600"
                />
              </div>

              {/* Categorization & Priorities Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-500 dark:text-slate-400">Category</label>
                  <select
                    {...register('category')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-500 dark:text-slate-400">Priority Level</label>
                  <select
                    {...register('priority')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Status and Calendar Picker */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-500 dark:text-slate-400">Status</label>
                  <select
                    {...register('status')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-500 dark:text-slate-400">Due Date</label>
                  <input
                    type="date"
                    {...register('dueDate')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  />
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 active:scale-98"
              >
                {createTaskMutation.isPending || updateTaskMutation.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <span>Save Task Details</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div onClick={() => setIsDeleteConfirmOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          
          <div className="z-10 w-full max-w-sm rounded-2xl border border-white/60 bg-white p-6 shadow-2xl dark:border-slate-800/40 dark:bg-[#0f1422]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450">
              <AlertTriangle className="h-6 w-6" />
            </div>
            
            <h3 className="mt-4 font-outfit text-base font-bold text-slate-900 dark:text-white">
              Delete Task
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Are you sure you want to permanently delete this task? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3.5">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteTaskMutation.isPending}
                className="rounded-xl bg-rose-600 px-4.5 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Todos;
