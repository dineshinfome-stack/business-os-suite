// Re-export shadcn primitives under a BusinessOS namespace so future modules
// import from @/components/common instead of reaching into @/components/ui.
export {
  ComingSoon,
  EmptyState,
  NoData,
  NoPermission,
  NoSearchResults,
  UnderDevelopment,
} from "./EmptyState";
export { ErrorBoundary } from "./ErrorBoundary";
export { ButtonLoader, Loader, PageLoader } from "./Loader";
export { CardSkeleton, FormSkeleton, TableLoader } from "./Skeletons";
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
export { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export { Badge } from "@/components/ui/badge";
export { Button } from "@/components/ui/button";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export { Checkbox } from "@/components/ui/checkbox";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
export { Input } from "@/components/ui/input";
export { Label } from "@/components/ui/label";
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
export { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export { Skeleton } from "@/components/ui/skeleton";
export { Switch } from "@/components/ui/switch";
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export { Textarea } from "@/components/ui/textarea";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
