import React from "react";
import { render, screen } from "@testing-library/react";
import LandingPage from "../pages/LandingPage";

beforeEach(() => render(<LandingPage />));

test("renders hero section main text", () => {
  const heroTextElement = screen.getByText(
    /Connecting Communities, Empowering Ownership/i,
  );
  expect(heroTextElement).toBeInTheDocument();
});

test("renders hero section main graphic", () => {
  const graphicElement = screen.getByAltText(
    /Image of a friendly cartoon neighborhood/i,
  );
  expect(graphicElement).toBeInTheDocument();
});

test("renders hero section description text", () => {
  const ele = screen.getByText(/Shared Land Ownership/i);
  expect(ele).toBeInTheDocument();
});

test("renders hero section stats", () => {
  const stat1_0 = screen.getByText(/Individual Ownership/i);
  expect(stat1_0).toBeInTheDocument();
  const stat1_1 = screen.getByText("100%");
  expect(stat1_1).toBeInTheDocument();

  const stat2_0 = screen.getByText(/Dark Patterns and Hidden Fees/i);
  expect(stat2_0).toBeInTheDocument();
  const stat2_1 = screen.getByText("0");
  expect(stat2_1).toBeInTheDocument();

  const stat3_0 = screen.getByText(/Offices Worldwide/i);
  expect(stat3_0).toBeInTheDocument();
  const stat3_1 = screen.getByText("1");
  expect(stat3_1).toBeInTheDocument();
});

test("renders communities hero section title text", () => {
  expect(
    screen.getByText(/Join or Create Your Own Group Today/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Together we are stronger than we could ever be alone./i),
  ).toBeInTheDocument();
});

test("renders communities hero section graphic", () => {
  expect(
    screen.getByAltText(
      /Cartoon image of a diverse group of people smiling and enjoying each others' company/,
    ),
  ).toBeInTheDocument();
});

test("renders communities hero section description", () => {
  expect(
    screen.getByText(
      /Going through any and all stages of life alone can be noble and/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /fulfulling in its own right, but going through life with others, friends/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /and family, can help you to achieve your goals faster and while having/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /fun and building meaninful relationships that will last a lifetime./i,
    ),
  ).toBeInTheDocument();
});

test("renders properties hero section title", () => {
  expect(screen.getByText(/Properties on Coop/)).toBeInTheDocument();
  expect(
    screen.getByText(
      /Browse to find your desired property to co-own with your buddies./i,
    ),
  ).toBeInTheDocument();
});

test("renders properties hero section graphic", () => {
  expect(
    screen.getByAltText(
      /Cartoon image of a street of different colored homes lined up next to one another on a blue sky day/i,
    ),
  ).toBeInTheDocument();
});

test("renders properties hero section description", () => {
  expect(
    screen.getByText(/Find your next homes to coop in!/i),
  ).toBeInTheDocument();
});

test("renders user hero section title", () => {
  expect(screen.getByText(/browse who's on coop/i)).toBeInTheDocument();
  expect(
    screen.getByText(
      /find your fellow coopers and create your own communities!/i,
    ),
  ).toBeInTheDocument();
});

test("renders user hero section graphic", () => {
  expect(
    screen.getByAltText(
      /Cartoon image of a circle of round stick men of red, blue, green, and yellow colors holding hands/i,
    ),
  ).toBeInTheDocument();
});

test("renders user hero section description", () => {
  expect(
    screen.getByText(
      /People come in all different kinds of shapes and sizes. Every person has/i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /a unique story to tell, with their own sets of strengths and weaknesses. Find your compl/i,
    ),
  ).toBeInTheDocument();
});
