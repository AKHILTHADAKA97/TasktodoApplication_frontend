import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  ListTodo, 
  Plus, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import taskService from '../services/taskService';
import { CATEGORIES } from '../constants';
import { formatDate } from '../utils/date';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('personal');

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', { filter: 'all' }],
    queryFn: () => taskService.getTasks()
  });

  const tasks = tasksData?.tasks || [];

  // Quick Task Creation Mutation
  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setQuickTitle('');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.85 }
      });
    }
  });

  // Task Completion Mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.85 }
      });
    }
  });

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    createTaskMutation.mutate({
      title: quickTitle,
      category: quickCategory,
      priority: 'medium',
      status: 'pending'
    });
  };

  const toggleTaskCompletion = (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskMutation.mutate({ id: task._id, status: nextStatus });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  // Metric calculation variables
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  
  // Tasks due today filter
  const todayStr = new Date().toDateString();
  const todayTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === todayStr).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart 1: Priority Distribution
  const lowCount = tasks.filter(t => t.priority === 'low').length;
  const medCount = tasks.filter(t => t.priority === 'medium').length;
  const highCount = tasks.filter(t => t.priority === 'high').length;

  const priorityData = [
    { name: 'High', value: highCount, color: '#f43f5e' },
    { name: 'Medium', value: medCount, color: '#f59e0b' },
    { name: 'Low', value: lowCount, color: '#14b8a6' }
  ].filter(d => d.value > 0);

  // Chart 2: Status Breakdown
  const statusCounts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    'in progress': tasks.filter(t => t.status === 'in progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: completedTasks
  };
  const statusData = [
    { name: 'Pending', count: statusCounts.pending, color: '#64748b' },
    { name: 'In Progress', count: statusCounts['in progress'], color: '#3b82f6' },
    { name: 'Review', count: statusCounts.review, color: '#f59e0b' },
    { name: 'Completed', count: statusCounts.completed, color: '#10b981' }
  ];

  // Chart 3: Completion History (Last 7 days mock sync)
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const dayDateStr = d.toDateString();
      
      const count = tasks.filter(t => {
        return t.status === 'completed' && t.updatedAt && new Date(t.updatedAt).toDateString() === dayDateStr;
      }).length;

      result.push({
        day: dayName,
        completed: count
      });
    }
    return result;
  };

  const weeklyData = getWeeklyData();

  // Highlight Cards Info mapping
  const statCards = [
    { title: 'Total Tasks', value: totalTasks, icon: ListTodo, color: 'from-blue-500 to-indigo-500' },
    { title: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
    { title: 'In Progress', value: pendingTasks, icon: Clock, color: 'from-amber-500 to-orange-500' },
    { title: 'High Priority', value: highPriorityTasks, icon: AlertCircle, color: 'from-rose-500 to-pink-500' },
    { title: "Today's Tasks", value: todayTasks, icon: Calendar, color: 'from-violet-500 to-fuchsia-500' },
  ];

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner Dashboard Message */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-white shadow-xl dark:from-indigo-950/40 dark:to-violet-950/40">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
        <div className="z-10 max-w-lg space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Workflow Productivity Analytics</span>
          </div>
          <h2 className="font-outfit text-2xl font-bold tracking-tight md:text-3xl text-white">
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return 'Good Morning';
              if (hour < 17) return 'Good Afternoon';
              return 'Good Evening';
            })()}, {user?.name.split(' ')[0] || 'User'}!
          </h2>
          <p className="text-sm text-indigo-100">
            Your workflow health is at {completionRate}%: {completedTasks} of {totalTasks} tasks complete. Keep building momentum!
          </p>
        </div>
        {/* Visual Progress Arc */}
        <div className="absolute right-8 bottom-4 top-4 hidden items-center justify-center lg:flex">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute font-outfit text-sm font-bold text-white">{completionRate}%</div>
            <svg className="absolute -rotate-90" width="96" height="96">
              {/* Background Track Circle */}
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Foreground Animated Progress Circle */}
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="white"
                strokeWidth="6"
                fill="transparent"
                style={{
                  strokeDasharray: '251.2',
                  strokeDashoffset: `${251.2 - (251.2 * completionRate) / 100}`,
                  strokeLinecap: 'round',
                  transition: 'stroke-dashoffset 0.5s ease-in-out'
                }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid of stats metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 md:gap-6">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="glass-card flex flex-col justify-between rounded-2xl border border-white/50 bg-white/35 p-5 shadow-sm hover:scale-102 transition-all duration-300 dark:border-slate-800/30 dark:bg-slate-900/25"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-tr ${card.color} shadow-md shadow-slate-200/10 text-white`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="font-outfit text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl">
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Action Section: Charts, Quick Add, and Recent list */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        {/* Quick Add and Recent Checklist (Span 2) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Quick Task Creation Card */}
          <div className="glass-card rounded-2xl border border-white/50 bg-white/35 p-6 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25">
            <h3 className="font-outfit text-sm font-semibold text-slate-900 dark:text-white">
              Quick Add Task
            </h3>
            <form onSubmit={handleQuickAdd} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="What needs to be done next?..."
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-600 dark:focus:ring-indigo-950/10"
              />
              <div className="flex gap-2">
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!quickTitle.trim() || createTaskMutation.isPending}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white transition-all hover:bg-indigo-700 active:scale-97 disabled:opacity-50"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>

          {/* Recent Tasks List */}
          <div className="glass-card flex-1 flex flex-col justify-between rounded-2xl border border-white/50 bg-white/35 p-6 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-outfit text-sm font-semibold text-slate-900 dark:text-white">
                  Recently Added Tasks
                </h3>
                <p className="text-2xs text-slate-400 dark:text-slate-500">
                  Track your latest checklist workflows
                </p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="group inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="mt-3 flex-1 divide-y divide-slate-100 dark:divide-slate-800/50 flex flex-col justify-start">
              {recentTasks.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No tasks created yet. Use the Quick Add above to get started!
                </div>
              ) : (
                recentTasks.map((task) => {
                  const catInfo = CATEGORIES.find(c => c.value === task.category) || CATEGORIES[5];
                  return (
                    <div
                      key={task._id}
                      className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <button
                          onClick={() => toggleTaskCompletion(task)}
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
                            task.status === 'completed'
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 hover:border-indigo-500 dark:border-slate-700'
                          }`}
                        >
                          {task.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3px]" />}
                        </button>
                        <div className="overflow-hidden text-left">
                          <p className={`truncate text-xs font-semibold tracking-tight text-slate-800 dark:text-white ${
                            task.status === 'completed' ? 'line-through text-slate-450 dark:text-slate-550' : ''
                          }`}>
                            {task.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
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
                            {task.dueDate && (
                              <span className="text-3xs text-slate-400 dark:text-slate-500">
                                Due {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <span className={`hidden rounded-full px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider md:inline-block ${
                        task.priority === 'high' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                        task.priority === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                        'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Charts Side Panel */}
        <div className="space-y-6">
          {/* Priority Distribution Chart */}
          <div className="glass-card rounded-2xl border border-white/50 bg-white/35 p-6 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25">
            <h3 className="font-outfit text-sm font-semibold text-slate-900 dark:text-white">
              Priorities Distribution
            </h3>
            <div className="mt-4 flex h-48 items-center justify-center">
              {priorityData.length === 0 ? (
                <span className="text-xs text-slate-400">No priority data</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: theme === 'dark' ? '1px solid #1c1c24' : '1px solid #eef2f6', 
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        background: theme === 'dark' ? '#0d0d12' : '#ffffff',
                        color: theme === 'dark' ? '#ffffff' : '#0f172a'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Chart Legend indicators */}
            <div className="mt-2 flex justify-center gap-4 text-2xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>High ({highCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>Medium ({medCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                <span>Low ({lowCount})</span>
              </div>
            </div>
          </div>

          {/* Status Distribution Chart */}
          <div className="glass-card rounded-2xl border border-white/50 bg-white/35 p-6 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25">
            <h3 className="font-outfit text-sm font-semibold text-slate-900 dark:text-white">
              Status Breakdown
            </h3>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.05)' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: theme === 'dark' ? '1px solid #1c1c24' : '1px solid #eef2f6', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      background: theme === 'dark' ? '#0d0d12' : '#ffffff',
                      color: theme === 'dark' ? '#ffffff' : '#0f172a'
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Full width historic progression line chart */}
      <div className="glass-card rounded-2xl border border-white/50 bg-white/35 p-6 shadow-sm dark:border-slate-800/30 dark:bg-slate-900/25">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h3 className="font-outfit text-sm font-semibold text-slate-900 dark:text-white">
            Completion Analytics (Last 7 Days)
          </h3>
        </div>
        <div className="mt-6 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a76f" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: theme === 'dark' ? '1px solid #1c1c24' : '1px solid #eef2f6', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  background: theme === 'dark' ? '#0d0d12' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#0f172a'
                }} 
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCompleted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
