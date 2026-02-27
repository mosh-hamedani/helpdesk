import DOMPurify from "dompurify";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Ticket } from "core/constants/ticket.ts";
import { type SenderType, senderTypeLabel } from "core/constants/sender-type.ts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorAlert from "@/components/ErrorAlert";

interface Reply {
  id: number;
  body: string;
  bodyHtml: string | null;
  senderType: SenderType;
  user: { id: string; name: string } | null;
  createdAt: string;
}

interface ReplyThreadProps {
  ticket: Ticket;
}

export default function ReplyThread({ ticket }: ReplyThreadProps) {
  const { id: ticketId, senderName } = ticket;
  const { data, isLoading, error } = useQuery({
    queryKey: ["replies", ticketId],
    queryFn: async () => {
      const { data } = await axios.get<{ replies: Reply[] }>(
        `/api/tickets/${ticketId}/replies`
      );
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message="Failed to load replies" />;
  }

  if (!data?.replies.length) {
    return <p className="text-sm text-muted-foreground">No replies yet</p>;
  }

  return (
    <div className="space-y-3">
      {data.replies.map((reply) => {
        const isAgent = reply.senderType === "agent";
        const displayName = isAgent
          ? reply.user?.name ?? "Agent"
          : senderName;

        return (
          <Card key={reply.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {displayName}
              </CardTitle>
              <CardDescription className="text-xs">
                {senderTypeLabel[reply.senderType]} &middot;{" "}
                {new Date(reply.createdAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reply.bodyHtml ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(reply.bodyHtml),
                  }}
                />
              ) : (
                <p className="whitespace-pre-line">{reply.body}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
