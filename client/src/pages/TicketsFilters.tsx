import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { agentTicketStatuses, statusLabel } from "core/constants/ticket-status.ts";
import type { TicketFilters } from "./TicketsPage";

const ALL = "__all__";

interface TicketsFiltersProps {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
}

export default function TicketsFilters({
  filters,
  onChange,
}: TicketsFiltersProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          className="pl-8"
        />
      </div>

      <Select
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          onChange({ ...filters, status: value === ALL ? undefined : (value as TicketFilters["status"]) })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {agentTicketStatuses.map((s) => (
            <SelectItem key={s} value={s}>
              {statusLabel[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category ?? ALL}
        onValueChange={(value) =>
          onChange({ ...filters, category: value === ALL ? undefined : (value as TicketFilters["category"]) })
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All categories</SelectItem>
          <SelectItem value="general_question">General question</SelectItem>
          <SelectItem value="technical_question">Technical question</SelectItem>
          <SelectItem value="refund_request">Refund request</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
