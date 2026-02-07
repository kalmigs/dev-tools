import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  FileJson,
  Home,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { convertPages, generatePages, inspectPages, stringPages, validatePages } from '@/lib/pages';

// Main component
export function AppSidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { setOpenMobile } = useSidebar();

  // Default all to open
  const [convertOpen, setConvertOpen] = useState(true);
  const [generateOpen, setGenerateOpen] = useState(true);
  const [inspectOpen, setInspectOpen] = useState(true);
  const [stringsOpen, setStringsOpen] = useState(true);
  const [validateOpen, setValidateOpen] = useState(true);

  const allOpen = convertOpen && generateOpen && inspectOpen && stringsOpen && validateOpen;

  const toggleAll = () => {
    const newState = !allOpen;
    setConvertOpen(newState);
    setGenerateOpen(newState);
    setInspectOpen(newState);
    setStringsOpen(newState);
    setValidateOpen(newState);
  };

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
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="px-0">Tools</SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleAll}
              title={allOpen ? 'Collapse all' : 'Expand all'}
            >
              {allOpen ? (
                <ChevronsDownUp className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
            </Button>
          </div>
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

              <Collapsible open={convertOpen} onOpenChange={setConvertOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ArrowLeftRight />
                      <span>Convert</span>
                      <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {convertPages.map(page => (
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
