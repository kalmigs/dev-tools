import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronDown, FileJson, Home, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { generatePages, inspectPages, stringPages, validatePages } from '@/lib/pages';

// Main component
export function AppSidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { setOpenMobile } = useSidebar();

  const [generateOpen, setGenerateOpen] = useState(currentPath.startsWith('/generate'));
  const [stringsOpen, setStringsOpen] = useState(currentPath.startsWith('/strings'));
  const [validateOpen, setValidateOpen] = useState(currentPath.startsWith('/validate'));
  const [inspectOpen, setInspectOpen] = useState(currentPath.startsWith('/inspect'));

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

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
                      {generatePages.map(page => (
                        <SidebarMenuSubItem key={page.route}>
                          <SidebarMenuSubButton asChild isActive={currentPath === page.route}>
                            <Link to={page.route} onClick={handleLinkClick}>
                              <page.icon />
                              <span>{page.title}</span>
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
                      {stringPages.map(page => (
                        <SidebarMenuSubItem key={page.route}>
                          <SidebarMenuSubButton asChild isActive={currentPath === page.route}>
                            <Link to={page.route} onClick={handleLinkClick}>
                              <page.icon />
                              <span>{page.title}</span>
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
                      {validatePages.map(page => (
                        <SidebarMenuSubItem key={page.route}>
                          <SidebarMenuSubButton asChild isActive={currentPath === page.route}>
                            <Link to={page.route} onClick={handleLinkClick}>
                              <page.icon />
                              <span>{page.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible open={inspectOpen} onOpenChange={setInspectOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Search />
                      <span>Inspect</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {inspectPages.map(page => (
                        <SidebarMenuSubItem key={page.route}>
                          <SidebarMenuSubButton asChild isActive={currentPath === page.route}>
                            <Link to={page.route} onClick={handleLinkClick}>
                              <page.icon />
                              <span>{page.title}</span>
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
  );
}
