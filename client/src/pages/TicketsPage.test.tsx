import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { renderWithQuery } from "@/test/render";
import TicketsPage from "./TicketsPage";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, { deep: true });

const mockTickets = [
  {
    id: 1,
    subject: "Cannot login to my account",
    status: "open",
    category: "technical_question",
    senderName: "Alice Smith",
    senderEmail: "alice@example.com",
    createdAt: "2025-03-01T10:00:00.000Z",
  },
  {
    id: 2,
    subject: "Refund for order #123",
    status: "resolved",
    category: "refund_request",
    senderName: "Bob Jones",
    senderEmail: "bob@example.com",
    createdAt: "2025-02-28T08:00:00.000Z",
  },
  {
    id: 3,
    subject: "How do I reset my password?",
    status: "closed",
    category: null,
    senderName: "Charlie Brown",
    senderEmail: "charlie@example.com",
    createdAt: "2025-02-27T14:00:00.000Z",
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe("TicketsPage", () => {
  it("should show skeleton rows while loading", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<TicketsPage />);

    expect(screen.getByText("Tickets")).toBeInTheDocument();
    expect(screen.getByText("Subject")).toBeInTheDocument();
    expect(screen.getByText("Sender")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='skeleton']")).toBeInTheDocument();
  });

  it("should display tickets in a table after loading", async () => {
    mockedAxios.get.mockResolvedValue({ data: { tickets: mockTickets } });
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("Cannot login to my account")).toBeInTheDocument();
    });

    expect(screen.getByText("Refund for order #123")).toBeInTheDocument();
    expect(screen.getByText("How do I reset my password?")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='skeleton']")).not.toBeInTheDocument();
  });

  it("should display sender name and email", async () => {
    mockedAxios.get.mockResolvedValue({ data: { tickets: mockTickets } });
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("should display status badges", async () => {
    mockedAxios.get.mockResolvedValue({ data: { tickets: mockTickets } });
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("open")).toBeInTheDocument();
    });

    expect(screen.getByText("resolved")).toBeInTheDocument();
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("should display category with underscores replaced by spaces", async () => {
    mockedAxios.get.mockResolvedValue({ data: { tickets: mockTickets } });
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("technical question")).toBeInTheDocument();
    });

    expect(screen.getByText("refund request")).toBeInTheDocument();
  });

  it("should show dash for null category", async () => {
    mockedAxios.get.mockResolvedValue({ data: { tickets: mockTickets } });
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("How do I reset my password?")).toBeInTheDocument();
    });

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("should format createdAt as a locale date string", async () => {
    mockedAxios.get.mockResolvedValue({ data: { tickets: [mockTickets[0]] } });
    renderWithQuery(<TicketsPage />);

    const expectedDate = new Date("2025-03-01T10:00:00.000Z").toLocaleDateString();
    await waitFor(() => {
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });

  it("should show an error alert when the request fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch tickets")).toBeInTheDocument();
    });
  });

  it("should not show the table when there is an error", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch tickets")).toBeInTheDocument();
    });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("should render an empty table body when there are no tickets", async () => {
    mockedAxios.get.mockResolvedValue({ data: { tickets: [] } });
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(document.querySelector("[data-slot='skeleton']")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(1); // header row only
  });

  it("should call axios.get with /api/tickets", async () => {
    mockedAxios.get.mockResolvedValue({ data: { tickets: [] } });
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets");
    });
  });
});
