import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { BrowserRouter } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

vi.mock("@/utils/axiosInstance");

describe("AdminDashboard", () => {
  it("shows loading state initially", () => {
    // Return a promise that never resolves for loading state
    axiosInstance.get.mockReturnValue(new Promise(() => {}));

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });
});
