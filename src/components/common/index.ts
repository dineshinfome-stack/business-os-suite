// Re-export shadcn primitives under a BusinessOS namespace so future modules
// import from @/components/common instead of reaching into @/components/ui.
export { Button } from "@/components/ui/button";
export { Input } from "@/components/ui/input";
export { Textarea } from "@/components/ui/textarea";
export { Checkbox } from "@/components/ui/checkbox";
export { Switch } from "@/components/ui/switch";
export { Label } from "@/components/ui/label";
export { Badge } from "@/components/ui/badge";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
export { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
export { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export { Skeleton } from "@/components/ui/skeleton";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
export { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

export { Loader, PageLoader, ButtonLoader } from "./Loader";
export { TableLoader, CardSkeleton, FormSkeleton } from "./Skeletons";
export {
  EmptyState,
  NoData,
  NoSearchResults,
  NoPermission,
  ComingSoon,
  UnderDevelopment,
} from "./EmptyState";
export { ErrorBoundary } from "./ErrorBoundary";
