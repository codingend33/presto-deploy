import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { vi } from "vitest";
import PresentationCard from "../components/PresentationCard";

// Mock useNavigate function
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("PresentationCard component", () => {
  const presentationMock = {
    title: "Presentation Title",
    description: "Presentation description",
    slides: [{ id: 1 }, { id: 2 }, { id: 3 }],
    createdAt: "2024-11-11T10:00:00Z",
    thumbnail: "test-thumbnail.jpg",
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders all props", () => {
    render(
      <BrowserRouter>
        <PresentationCard presentation={presentationMock} presentationId="1" />
      </BrowserRouter>
    );

    expect(screen.getByText("Presentation Title")).toBeInTheDocument();
    expect(
      screen.getByText("Description: Presentation description")
    ).toBeInTheDocument();
    expect(screen.getByText("Slides: 3")).toBeInTheDocument();
    expect(
      screen.getByText("Created At: November 11, 2024")
    ).toBeInTheDocument();
    expect(screen.getByAltText("Presentation Thumbnail")).toBeInTheDocument();
  });

  it("title is missing", () => {
    const noTitle = { ...presentationMock, title: null };

    render(
      <BrowserRouter>
        <PresentationCard presentation={noTitle} presentationId="1" />
      </BrowserRouter>
    );

    expect(screen.getByText("Untitled")).toBeInTheDocument();
  });

  it("correct URL on card click", () => {
    render(
      <BrowserRouter>
        <PresentationCard presentation={presentationMock} presentationId="1" />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button"));

    expect(mockNavigate).toHaveBeenCalledWith("/presentations/1");
  });
});
