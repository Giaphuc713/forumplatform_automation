"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Sparkles, TrendingUp, Award, BrainCircuit, Rocket, ArrowRight, Clock, BookOpen } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const { user } = useUser();

  // Mock data for the chart
  const weeklyProgress = [
    { day: "Mon", value: 40 },
    { day: "Tue", value: 65 },
    { day: "Wed", value: 45 },
    { day: "Thu", value: 80 },
    { day: "Fri", value: 55 },
    { day: "Sat", value: 90 },
    { day: "Sun", value: 75 }
  ];

  return (
    <div className="flex flex-col gap-8 w-full mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Overview of a student */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-300 opacity-10 rounded-full blur-2xl translate-y-1/2"></div>

        <div className="flex flex-col gap-3 relative z-10 w-full md:w-2/3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium w-fit backdrop-blur-md border border-white/10 mb-2">
            <Sparkles size={16} className="text-blue-200" />
            <span>AI Learning System</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
          </h1>
          <p className="text-blue-100 max-w-2xl text-lg mt-1 leading-relaxed">
            Your AI learning assistant is ready to help you conquer your goals today. Let's make every study session count!
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto relative z-10">
          <div className="flex-1 md:flex-none bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20 text-center flex flex-col items-center justify-center min-w-[120px]">
            <BookOpen size={24} className="text-blue-200 mb-2" />
            <div className="text-3xl font-bold tracking-tight">12</div>
            <div className="text-sm text-blue-100 font-medium">Courses</div>
          </div>
          <div className="flex-1 md:flex-none bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20 text-center flex flex-col items-center justify-center min-w-[120px]">
            <Target size={24} className="text-blue-200 mb-2" />
            <div className="text-3xl font-bold tracking-tight">85%</div>
            <div className="text-sm text-blue-100 font-medium">Completion</div>
          </div>
        </div>
      </div>

      {/* 2. Middle: Dashboard Stats/Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-zinc-200/60 dark:border-zinc-800 overflow-hidden">
          <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="text-blue-600 dark:text-blue-500" /> Learning Progress
                </CardTitle>
                <CardDescription className="mt-1">Your study hours over the past week</CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500 bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
                <Clock size={16} />
                <span>Total: 24h 30m</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-6 px-6 md:px-8">
            <div className="h-[220px] flex items-end gap-2 md:gap-4">
              {weeklyProgress.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group h-full relative">
                  <div
                    className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-600 dark:hover:bg-blue-500 rounded-t-lg transition-all duration-300 w-full relative"
                    style={{ height: `${item.value}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-800 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium px-2.5 py-1.5 rounded shadow-lg transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {item.value}%
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 dark:bg-white rotate-45"></div>
                    </div>
                  </div>
                  <div className="text-center text-xs font-medium text-zinc-500 mt-4 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    {item.day}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200/60 dark:border-zinc-800 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-zinc-950 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="text-indigo-600 dark:text-indigo-400" /> Current Goal
            </CardTitle>
            <CardDescription className="mt-1">Mastering Machine Learning</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-full w-40 h-40 shadow-[0_0_40px_rgba(79,70,229,0.1)] border-[8px] border-indigo-100 dark:border-indigo-900/50 group">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-indigo-100 dark:text-indigo-950/50" />
                  <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="289" strokeDashoffset="92" className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out" />
                </svg>
                <div className="text-center z-10 flex flex-col items-center">
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">68%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Keep it up! You're almost there.</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">3 modules left to complete.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Bottom: 2 blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Use AI Block */}
        <div className="group relative overflow-hidden rounded-[2rem] p-8 md:p-10 bg-zinc-900 dark:bg-zinc-900 text-white transition-all hover:shadow-2xl border border-zinc-800">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-110 group-hover:-rotate-12 duration-700">
            <BrainCircuit size={160} />
          </div>
          <div className="relative z-10 flex flex-col gap-4 h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-semibold tracking-wide mb-6 backdrop-blur-sm uppercase border border-white/10">
                <Sparkles size={14} className="text-blue-300" /> AI Assistant
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Stuck on a concept?</h2>
              <p className="text-zinc-400 text-base md:text-lg max-w-sm leading-relaxed">
                Chat with your personalized AI tutor to explain complex topics, summarize lectures, or generate practice questions.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/ai-assistant" className="inline-flex items-center gap-2 text-zinc-900 px-6 py-3.5 rounded-full font-semibold hover:bg-zinc-200 transition-colors">
                Ask AI Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Find Course Block */}
        <div className="group relative overflow-hidden rounded-[2rem] p-8 md:p-10 bg-blue-50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-50 transition-all hover:shadow-2xl border border-blue-100 dark:border-blue-900/50">
          <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] dark:opacity-10 dark:group-hover:opacity-20 transition-all transform group-hover:translate-x-4 group-hover:-translate-y-4 duration-700">
            <Rocket size={180} />
          </div>
          <div className="relative z-10 flex flex-col gap-4 h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-200/50 dark:bg-blue-800/50 text-xs font-semibold tracking-wide mb-6 backdrop-blur-sm uppercase border border-blue-300/30 dark:border-blue-700/30">
                <Award size={14} className="text-blue-700 dark:text-blue-300" /> Explore
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Ready for the next challenge?</h2>
              <p className="text-blue-800/80 dark:text-blue-200/80 text-base md:text-lg max-w-sm leading-relaxed">
                Discover new AI-curated courses tailored to your career goals and current skill level. Start your next journey today.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/course" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40">
                Find Courses <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
