import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Fingerprint, Sparkles, FileJson, GitCompare, ChevronDown, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const generateItems = [
  {
    title: 'IDs',
    url: '/generate/ids',
    description: 'UUIDs, CUIDs, and more',
    icon: Fingerprint,
  },
  {
    title: 'Faker',
    url: '/generate/faker',
    description: 'Generate fake data',
    icon: Sparkles,
  },
]

const validateItems = [
  {
    title: 'IDs',
    url: '/validate/ids',
    description: 'Validate ID formats',
    icon: Fingerprint,
  },
]

const stringItems = [
  {
    title: 'JSON Format',
    url: '/strings/json-format',
    description: 'Format and prettify JSON',
    icon: FileJson,
  },
  {
    title: 'Compare',
    url: '/strings/compare',
    description: 'Compare and diff text',
    icon: GitCompare,
  },
]

export function AppSidebar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const { setOpenMobile } = useSidebar()
  
  const [generateOpen, setGenerateOpen] = useState(
    currentPath.startsWith('/generate')
  )
  const [validateOpen, setValidateOpen] = useState(
    currentPath.startsWith('/validate')
  )
  const [stringsOpen, setStringsOpen] = useState(
    currentPath.startsWith('/strings')
  )

  const handleLinkClick = () => {
    setOpenMobile(false)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            DT
          </div>
          <span className="font-semibold text-lg">Dev Tools</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === '/'}>
                  <Link to="/" onClick={handleLinkClick}>
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={generateOpen} onOpenChange={setGenerateOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Sparkles />
                      <span>Generate</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {generateItems.map((item) => (
                        <SidebarMenuSubItem key={item.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={currentPath === item.url}
                          >
                            <Link to={item.url} onClick={handleLinkClick}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible open={validateOpen} onOpenChange={setValidateOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ShieldCheck />
                      <span>Validate</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {validateItems.map((item) => (
                        <SidebarMenuSubItem key={item.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={currentPath === item.url}
                          >
                            <Link to={item.url} onClick={handleLinkClick}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible open={stringsOpen} onOpenChange={setStringsOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <FileJson />
                      <span>Strings</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {stringItems.map((item) => (
                        <SidebarMenuSubItem key={item.url}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={currentPath === item.url}
                          >
                            <Link to={item.url} onClick={handleLinkClick}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
