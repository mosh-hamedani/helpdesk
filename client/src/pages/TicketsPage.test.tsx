import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { renderWithQuery } from "@/test/render";
import TicketsPage from "./TicketsPage";
import TicketsTable from "./TicketsTable";

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

function mockResponse(tickets = mockTickets, total = tickets.length) {
  return { data: { tickets, total, page: 1, pageSize: 10 } };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("TicketsPage", () => {
  it("should show skeleton rows while loading", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<TicketsPage />);

    expect(screen.getByText("Tickets")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Subject/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sender/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Status/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Category/ })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Created/ })).toBeInTheDocument();
    expect(document.querySelector("[data-slot='skeleton']")).toBeInTheDocument();
  });

  it("should display tickets in a table after loading", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse());
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Cannot login to my account")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Refund for order #123")).toBeInTheDocument();
    expect(
      screen.getByText("How do I reset my password?")
    ).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot='skeleton']")
    ).not.toBeInTheDocument();
  });

  it("should display sender name and email", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse());
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("should display status badges", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse());
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("open")).toBeInTheDocument();
    });

    expect(screen.getByText("resolved")).toBeInTheDocument();
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("should display category with underscores replaced by spaces", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse());
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("technical question")).toBeInTheDocument();
    });

    expect(screen.getByText("refund request")).toBeInTheDocument();
  });

  it("should show dash for null category", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse());
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("How do I reset my password?")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("should format createdAt as a locale date string", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse([mockTickets[0]]));
    renderWithQuery(<TicketsPage />);

    const expectedDate = new Date(
      "2025-03-01T10:00:00.000Z"
    ).toLocaleDateString();
    await waitFor(() => {
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });

  it("should show an error alert when the request fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to fetch tickets")
      ).toBeInTheDocument();
    });
  });

  it("should not show the table when there is an error", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to fetch tickets")
      ).toBeInTheDocument();
    });

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("should render an empty table body when there are no tickets", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse([], 0));
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        document.querySelector("[data-slot='skeleton']")
      ).not.toBeInTheDocument();
    });

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(1); // header row only
    expect(screen.getByText("No tickets")).toBeInTheDocument();
  });

  it("should call axios.get with default sort and pagination params", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse([], 0));
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets", {
        params: {
          sortBy: "createdAt",
          sortOrder: "desc",
          page: 1,
          pageSize: 10,
        },
      });
    });
  });

  it("should sort by column when clicking a column header", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue(mockResponse());
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Cannot login to my account")
      ).toBeInTheDocument();
    });

    mockedAxios.get.mockClear();
    mockedAxios.get.mockResolvedValue(mockResponse());

    await user.click(screen.getByRole("button", { name: /Subject/ }));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets", {
        params: expect.objectContaining({
          sortBy: "subject",
          sortOrder: "asc",
          page: 1,
        }),
      });
    });
  });

  it("should toggle sort order when clicking the same column header twice", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue(mockResponse());
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Cannot login to my account")
      ).toBeInTheDocument();
    });

    mockedAxios.get.mockClear();
    mockedAxios.get.mockResolvedValue(mockResponse());

    await user.click(screen.getByRole("button", { name: /Subject/ }));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets", {
        params: expect.objectContaining({
          sortBy: "subject",
          sortOrder: "asc",
        }),
      });
    });

    mockedAxios.get.mockClear();
    mockedAxios.get.mockResolvedValue(mockResponse());

    await user.click(screen.getByRole("button", { name: /Subject/ }));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets", {
        params: expect.objectContaining({
          sortBy: "subject",
          sortOrder: "desc",
        }),
      });
    });
  });

  it("should render the search input and filter dropdowns", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<TicketsPage />);

    expect(
      screen.getByPlaceholderText("Search tickets...")
    ).toBeInTheDocument();
    expect(screen.getByText("All statuses")).toBeInTheDocument();
    expect(screen.getByText("All categories")).toBeInTheDocument();
  });

  it("should send search param when typing in the search input", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue(mockResponse());
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Cannot login to my account")
      ).toBeInTheDocument();
    });

    mockedAxios.get.mockClear();
    mockedAxios.get.mockResolvedValue(mockResponse([mockTickets[0]]));

    await user.type(
      screen.getByPlaceholderText("Search tickets..."),
      "login"
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets", {
        params: expect.objectContaining({ search: "login" }),
      });
    });
  });

  it("should include status filter in API request", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse([mockTickets[0]]));
    renderWithQuery(<TicketsTable filters={{ status: "open" }} />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets", {
        params: expect.objectContaining({ status: "open" }),
      });
    });
  });

  it("should include category filter in API request", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse([mockTickets[1]]));
    renderWithQuery(<TicketsTable filters={{ category: "refund_request" }} />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets", {
        params: expect.objectContaining({ category: "refund_request" }),
      });
    });
  });

  it("should include search filter in API request", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse([mockTickets[0]]));
    renderWithQuery(<TicketsTable filters={{ search: "login" }} />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets", {
        params: expect.objectContaining({ search: "login" }),
      });
    });
  });

  it("should display pagination info and controls", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse(mockTickets, 50));
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Showing 1–10 of 50 tickets")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Previous page" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Next page" })
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "Last page" })).toBeEnabled();
  });

  it("should fetch page 2 when clicking the next page button", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue(mockResponse(mockTickets, 50));
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Showing 1–10 of 50 tickets")
      ).toBeInTheDocument();
    });

    mockedAxios.get.mockClear();
    mockedAxios.get.mockResolvedValue({
      data: { tickets: mockTickets, total: 50, page: 2, pageSize: 10 },
    });

    await user.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/tickets", {
        params: expect.objectContaining({ page: 2, pageSize: 10 }),
      });
    });
  });

  it("should disable all pagination buttons on the last page", async () => {
    mockedAxios.get.mockResolvedValue(mockResponse(mockTickets, 3));
    renderWithQuery(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("Showing 1–3 of 3 tickets")).toBeInTheDocument();
    });

    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Previous page" })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();
  });
});
