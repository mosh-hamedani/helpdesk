import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { Role } from "core/constants/role.ts";
import { renderWithQuery } from "@/test/render";
import UsersPage from "./UsersPage";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, { deep: true });

const mockUsers = [
  {
    id: "1",
    name: "Alice Admin",
    email: "alice@example.com",
    role: Role.admin,
    createdAt: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Bob Agent",
    email: "bob@example.com",
    role: Role.agent,
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
    expect(screen.getByText("Actions")).toBeInTheDocument();
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

  it("should open the create user dialog when clicking New User", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: [] } });
    const user = userEvent.setup();
    renderWithQuery(<UsersPage />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /new user/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create User" })).toBeInTheDocument();
  });

  it("should close the dialog when pressing Escape", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: [] } });
    const user = userEvent.setup();
    renderWithQuery(<UsersPage />);

    await user.click(screen.getByRole("button", { name: /new user/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("should close the dialog when clicking the overlay", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: [] } });
    const user = userEvent.setup();
    renderWithQuery(<UsersPage />);

    await user.click(screen.getByRole("button", { name: /new user/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const overlay = screen.getByRole("dialog").parentElement!.querySelector("[data-slot='dialog-overlay']");
    await user.click(overlay!);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("should show edit buttons for each user row", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Edit Alice Admin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Bob Agent" })).toBeInTheDocument();
  });

  it("should open edit dialog with 'Edit User' title when clicking edit button", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    const user = userEvent.setup();
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Edit Alice Admin" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Edit User" })).toBeInTheDocument();
  });

  it("should pre-populate edit form with user data", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    const user = userEvent.setup();
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Edit Alice Admin" }));

    expect(screen.getByLabelText("Name")).toHaveValue("Alice Admin");
    expect(screen.getByLabelText("Email")).toHaveValue("alice@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("should show delete button for agent rows but not admin rows", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: "Delete Alice Admin" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Bob Agent" })).toBeInTheDocument();
  });

  it("should open confirmation dialog when clicking delete", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    const user = userEvent.setup();
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Bob Agent")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Delete Bob Agent" }));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete Bob Agent/)).toBeInTheDocument();
  });

  it("should close confirmation dialog when clicking Cancel", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    const user = userEvent.setup();
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Bob Agent")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Delete Bob Agent" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    expect(mockedAxios.delete).not.toHaveBeenCalled();
  });

  it("should call axios.delete when clicking Confirm", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    mockedAxios.delete.mockResolvedValue({ data: { message: "User deleted" } });
    const user = userEvent.setup();
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Bob Agent")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Delete Bob Agent" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith("/api/users/2");
    });
  });

  it("should refresh users list after successful deletion", async () => {
    mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    mockedAxios.delete.mockResolvedValue({ data: { message: "User deleted" } });
    const user = userEvent.setup();
    renderWithQuery(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Bob Agent")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Delete Bob Agent" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });
});
