import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { renderWithQuery } from "@/test/render";
import UsersPage from "./UsersPage";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, { deep: true });

const mockUsers = [
  {
    id: "1",
    name: "Alice Admin",
    email: "alice@example.com",
    role: "admin" as const,
    createdAt: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Bob Agent",
    email: "bob@example.com",
    role: "agent" as const,
    createdAt: "2025-02-20T00:00:00.000Z",
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe("UsersPage", () => {
  it("should show skeleton rows while loading", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<UsersPage />);

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='skeleton']")).toBeInTheDocument();
  });

  it("should display users in a table after loading", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    });

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("Bob Agent")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    expect(screen.getByText("agent")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='skeleton']")).not.toBeInTheDocument();
  });

  it("should format createdAt as a locale date string", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: [mockUsers[0]] } });
    renderWithQuery(<UsersPage />);

    const expectedDate = new Date("2025-01-15T00:00:00.000Z").toLocaleDateString();
    await waitFor(() => {
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });

  it("should show an error alert when the request fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch users")).toBeInTheDocument();
    });
  });

  it("should render an empty table body when there are no users", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: [] } });
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(document.querySelector("[data-slot='skeleton']")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(1); // header row only
  });

  it("should call axios.get with /api/users", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: [] } });
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/users");
    });
  });
});
