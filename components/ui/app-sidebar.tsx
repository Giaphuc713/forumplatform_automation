import * as React from "react"
import { ChevronRight, MessageSquare, Plus } from "lucide-react"

import { SearchForm } from "@/components/ui/search-form"
import { VersionSwitcher } from "@/components/ui/version-switcher"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  sessions?: any[];
  activeSessionId?: string | null;
  onSelectSession?: (sessionId: string) => void;
  onNewChat?: () => void;
}

const data = {
  navMain: [
    {
      title: "Tài liệu tham khảo",
      items: [
        { title: "Hướng dẫn sử dụng", url: "/guide", isActive: false },
        { title: "API Reference", url: "/api", isActive: false },
        { title: "Changelog", url: "/changelog", isActive: false },
      ],
    },
    {
      title: "Cài đặt",
      items: [
        { title: "Tài khoản", url: "/account", isActive: false },
        { title: "Bảo mật", url: "/security", isActive: false },
        { title: "Thông báo", url: "/notifications", isActive: false },
      ],
    },
  ],
}

export function AppSidebar({ 
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat, 
  ...props 
}: AppSidebarProps) {
  return (
    <Sidebar 
      className="border-r border-white/20 dark:border-zinc-800/40 [&_[data-sidebar=sidebar]]:bg-white/35 [&_[data-sidebar=sidebar]]:dark:bg-zinc-950/45 [&_[data-sidebar=sidebar]]:backdrop-blur-lg" 
      {...props}
    >
      {/* Nút Tạo Hội Thoại Mới */}
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={onNewChat}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white hover:text-white rounded-xl shadow-md shadow-indigo-100/50 dark:shadow-none border-0 transition-all duration-300 transform active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-semibold text-xs tracking-wide">Đoạn chat mới</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2">

        {/* --- KHU VỰC 1: LỊCH SỬ HỘI THOẠI (DYNAMIC DỮ LIỆU TỪ BACKEND) --- */}
        <Collapsible title="Lịch sử hội thoại" defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className="group/label text-slate-400 dark:text-zinc-500 text-xs font-bold tracking-wider uppercase px-3 py-2 cursor-pointer"
            >
              <CollapsibleTrigger>
                Lịch sử hội thoại
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90 text-slate-400" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            <CollapsibleContent className="mt-1">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {/* Kiểm tra nếu chưa có lịch sử chat */}
                  {sessions.length === 0 ? (
                    <div className="text-xs text-slate-400 dark:text-zinc-500 px-4 py-3 italic bg-white/20 dark:bg-zinc-900/20 rounded-xl border border-white/10">
                      Chưa có hội thoại nào.
                    </div>
                  ) : (
                    /* Render danh sách session ra các nút bấm */
                    sessions.map((session) => {
                      const isActive = session.session_id === activeSessionId;
                      return (
                        <SidebarMenuItem key={session.session_id}>
                          <SidebarMenuButton
                            onClick={() => onSelectSession && onSelectSession(session.session_id)}
                            className={`transition-all duration-200 rounded-xl truncate text-xs py-2 h-9 flex items-center ${
                              isActive 
                                ? "bg-white/70 dark:bg-zinc-900/80 border border-white/30 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                                : "hover:bg-white/40 dark:hover:bg-zinc-900/40 text-slate-600 dark:text-slate-300 border border-transparent"
                            }`}
                            tooltip={session.title}
                          >
                            <MessageSquare className={`w-4 h-4 mr-2 ${isActive ? "text-indigo-500" : "opacity-60 text-slate-400"}`} />
                            <span className="truncate">{session.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* --- KHU VỰC 2: MENU MẪU TĨNH (GIỮ NGUYÊN CODE CỦA BẠN) ---
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
              >
                <CollapsibleTrigger>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton asChild isActive={subItem.isActive}>
                          <a href={subItem.url}>{subItem.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))} */}

      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}