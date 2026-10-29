"use client";
import React, { useState } from 'react';
import { ForumHeader } from "./ForumHeader";
import { LeftSideBar } from "./LeftSideBar"
import CreateCommunityModal from "./CreateNewForum";
import { SearchProvider, useSearch } from '@/contexts/SearchContext';

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const { setSearchQuery } = useSearch();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen flex flex-col">
      <ForumHeader onSearch={setSearchQuery} />
      <div className="flex-1 flex overflow-hidden">
        <LeftSideBar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          onOpenCreate={() => setCreateOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
      <CreateCommunityModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SearchProvider>
  );
}
