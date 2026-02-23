import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type TicketStatus, statusVariant } from "core/constants/ticket-status.ts";
import { type TicketCategory } from "core/constants/ticket-category.ts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface TicketDetail {
  id: number;
  subject: string;
  body: string;
  bodyHtml: string | null;
  status: TicketStatus;
  category: TicketCategory | null;
  senderName: string;
  senderEmail: string;
  assignedTo: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface Agent {
  id: string;
  name: string;
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const { data } = await axios.get<TicketDetail>(`/api/tickets/${id}`);
      return data;
    },
  });

  const { data: agentsData } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data } = await axios.get<{ agents: Agent[] }>("/api/agents");
      return data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (assignedToId: string | null) => {
      const { data } = await axios.patch<TicketDetail>(`/api/tickets/${id}`, {
        assignedToId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    },
  });

  return (
    <div className="space-y-6">
      <Link
        to="/tickets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </Link>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-96" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {axios.isAxiosError(error) && error.response?.status === 404
              ? "Ticket not found"
              : "Failed to load ticket"}
          </AlertDescription>
        </Alert>
      )}

      {ticket && (
        <>
          <div>
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={statusVariant[ticket.status]}>
                {ticket.status}
              </Badge>
              {ticket.category && (
                <Badge variant="secondary">
                  {ticket.category.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">From: </span>
              {ticket.senderName} ({ticket.senderEmail})
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Assigned to: </span>
              <Select
                value={ticket.assignedTo?.id ?? "unassigned"}
                onValueChange={(value) =>
                  assignMutation.mutate(value === "unassigned" ? null : value)
                }
              >
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {agentsData?.agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-muted-foreground">Created: </span>
              {new Date(ticket.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="text-muted-foreground">Updated: </span>
              {new Date(ticket.updatedAt).toLocaleString()}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
              <CardDescription>
                From {ticket.senderName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticket.bodyHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: ticket.bodyHtml }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{ticket.body}</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
