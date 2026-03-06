import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders primary messaging and CTA", () => {
    render(<EmptyState title="No plan" description="Choose one" ctaHref="/plans" ctaLabel="Browse plans" />);

    expect(screen.getByText("No plan")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse plans" })).toHaveAttribute("href", "/plans");
  });
});
