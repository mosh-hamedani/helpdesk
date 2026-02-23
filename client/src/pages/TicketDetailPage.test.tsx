import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router";
import axios from "axios";
import TicketDetailPage from "./TicketDetailPage";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, { deep: true });

// Radix Select relies on pointer capture APIs not available in jsdom
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;
  constructor(type: string, props: PointerEventInit & { pointerType?: string } = {}) {
    super(type, props);
    this.button = props.button ?? 0;
    this.ctrlKey = props.ctrlKey ?? false;
    this.pointerType = props.pointerType ?? "mouse";
  }
}
window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.setPointerCapture = vi.fn();

const mockTicket = {
  id: 1,
  subject: "Cannot login to my account",
  body: "I need help logging in",
  bodyHtml: null,
  status: "open",
  category: "technical_question",
  senderName: "Alice Smith",
  senderEmail: "alice@example.com",
  assignedTo: null,
  createdAt: "2025-03-01T10:00:00.000Z",
  updatedAt: "2025-03-01T10:00:00.000Z",
};

const mockAgents = [
  { id: "agent-1", name: "Jane Doe" },
  { id: "agent-2", name: "John Smith" },
];

function renderPage(ticketId = "1") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[`/tickets/${ticketId}`]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("TicketDetailPage", () => {
  it("should show skeletons while loading", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(document.querySelector("[data-slot='skeleton']")).toBeInTheDocument();
  });

  it("should display ticket details after loading", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/1") return Promise.resolve({ data: mockTicket });
      if (url === "/api/agents")
        return Promise.resolve({ data: { agents: mockAgents } });
      return Promise.reject(new Error("unexpected url"));
    });
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Cannot login to my account")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("open")).toBeInTheDocument();
    expect(screen.getByText("technical question")).toBeInTheDocument();
    expect(
      screen.getByText(/Alice Smith \(alice@example\.com\)/)
    ).toBeInTheDocument();
    expect(screen.getByText("I need help logging in")).toBeInTheDocument();
  });

  it("should show 'Ticket not found' for 404 errors", async () => {
    const error = new Error("Not found");
    Object.assign(error, { response: { status: 404 }, isAxiosError: true });
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.get.mockRejectedValue(error);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });
  });

  it("should show generic error for non-404 failures", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    mockedAxios.isAxiosError.mockReturnValue(false);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Failed to load ticket")).toBeInTheDocument();
    });
  });

  it("should fetch the ticket and agents list", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/1") return Promise.resolve({ data: mockTicket });
      if (url === "/api/agents")
        return Promise.resolve({ data: { agents: mockAgents } });
      return Promise.reject(new Error("unexpected url"));
    });
    renderPage();

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets/1");
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/agents");
    });
  });

  it("should show 'Unassigned' in the dropdown when ticket has no assignee", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/1") return Promise.resolve({ data: mockTicket });
      if (url === "/api/agents")
        return Promise.resolve({ data: { agents: mockAgents } });
      return Promise.reject(new Error("unexpected url"));
    });
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Cannot login to my account")
      ).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Unassigned");
  });

  it("should show the assigned agent name in the dropdown", async () => {
    const assignedTicket = {
      ...mockTicket,
      assignedTo: { id: "agent-1", name: "Jane Doe" },
    };
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/1")
        return Promise.resolve({ data: assignedTicket });
      if (url === "/api/agents")
        return Promise.resolve({ data: { agents: mockAgents } });
      return Promise.reject(new Error("unexpected url"));
    });
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Cannot login to my account")
      ).toBeInTheDocument();
    });

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Jane Doe");
  });

  it("should call PATCH with assignedToId when selecting an agent", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/1") return Promise.resolve({ data: mockTicket });
      if (url === "/api/agents")
        return Promise.resolve({ data: { agents: mockAgents } });
      return Promise.reject(new Error("unexpected url"));
    });
    mockedAxios.patch.mockResolvedValue({
      data: { ...mockTicket, assignedTo: { id: "agent-1", name: "Jane Doe" } },
    });
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Cannot login to my account")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox"));

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Jane Doe" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("option", { name: "Jane Doe" }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/tickets/1", {
        assignedToId: "agent-1",
      });
    });
  });

  it("should call PATCH with null when selecting Unassigned", async () => {
    const user = userEvent.setup();
    const assignedTicket = {
      ...mockTicket,
      assignedTo: { id: "agent-1", name: "Jane Doe" },
    };
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/1")
        return Promise.resolve({ data: assignedTicket });
      if (url === "/api/agents")
        return Promise.resolve({ data: { agents: mockAgents } });
      return Promise.reject(new Error("unexpected url"));
    });
    mockedAxios.patch.mockResolvedValue({
      data: { ...mockTicket, assignedTo: null },
    });
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText("Cannot login to my account")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox"));

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "Unassigned" })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("option", { name: "Unassigned" }));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/tickets/1", {
        assignedToId: null,
      });
    });
  });

  it("should display the ticket body as HTML when bodyHtml is present", async () => {
    const htmlTicket = {
      ...mockTicket,
      bodyHtml: "<p>Hello <strong>world</strong></p>",
    };
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/1")
        return Promise.resolve({ data: htmlTicket });
      if (url === "/api/agents")
        return Promise.resolve({ data: { agents: mockAgents } });
      return Promise.reject(new Error("unexpected url"));
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("world")).toBeInTheDocument();
    });
  });

  it("should render the back to tickets link", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/api/tickets/1") return Promise.resolve({ data: mockTicket });
      if (url === "/api/agents")
        return Promise.resolve({ data: { agents: mockAgents } });
      return Promise.reject(new Error("unexpected url"));
    });
    renderPage();

    expect(
      screen.getByRole("link", { name: /Back to tickets/ })
    ).toHaveAttribute("href", "/tickets");
  });
});
