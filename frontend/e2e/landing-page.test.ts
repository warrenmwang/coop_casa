import { test, expect } from "playwright/test";

test.describe("landing page renders like normal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("renders hero section main text", async ({page}) => {
    const heroTextElement = page.getByText(
      /Connecting Communities, Empowering Ownership/i,
    );
    expect(heroTextElement).toBeVisible();
  });
});


// test("renders hero section main graphic", () => {
//   const graphicElement = screen.getByAltText(
//     /Image of a friendly cartoon neighborhood/i,
//   );
//   expect(graphicElement).toBeInTheDocument();
// });
//
// test("renders hero section description text", () => {
//   const ele = screen.getByText(/Shared Land Ownership/i);
//   expect(ele).toBeInTheDocument();
// });
//
// test("renders hero section stats", () => {
//   const stat1_0 = screen.getByText(/Individual Ownership/i);
//   expect(stat1_0).toBeInTheDocument();
//   const stat1_1 = screen.getByText("100%");
//   expect(stat1_1).toBeInTheDocument();
//
//   const stat2_0 = screen.getByText(/Dark Patterns and Hidden Fees/i);
//   expect(stat2_0).toBeInTheDocument();
//   const stat2_1 = screen.getByText("0");
//   expect(stat2_1).toBeInTheDocument();
//
//   const stat3_0 = screen.getByText(/Offices Worldwide/i);
//   expect(stat3_0).toBeInTheDocument();
//   const stat3_1 = screen.getByText("1");
//   expect(stat3_1).toBeInTheDocument();
// });
//
// test("renders communities hero section title text", () => {
//   expect(
//     screen.getByText(/It takes a village to raise a child. /i),
//   ).toBeInTheDocument();
// });
//
// test("renders communities hero section graphic", () => {
//   expect(
//     screen.getByAltText(
//       /Cartoon image of a diverse group of people smiling and enjoying each others' company/,
//     ),
//   ).toBeInTheDocument();
// });
//
// test("renders communities hero section description", () => {
//   expect(
//     screen.getByText(
//       /Going through any and all stages of life alone can be noble and/i,
//     ),
//   ).toBeInTheDocument();
//   expect(
//     screen.getByText(
//       /fulfulling in its own right, but going through life with others, friends/i,
//     ),
//   ).toBeInTheDocument();
//   expect(
//     screen.getByText(
//       /and family, can help you to achieve your goals faster and while having/i,
//     ),
//   ).toBeInTheDocument();
//   expect(
//     screen.getByText(
//       /fun and building meaninful relationships that will last a lifetime./i,
//     ),
//   ).toBeInTheDocument();
// });
//
// test("renders properties hero section title", () => {
//   expect(
//     screen.getByText(/Find the perfect place to co-own/i),
//   ).toBeInTheDocument();
// });
//
// test("renders properties hero section graphic", () => {
//   expect(
//     screen.getByAltText(
//       /Cartoon image of a street of different colored homes lined up next to one another on a blue sky day/i,
//     ),
//   ).toBeInTheDocument();
// });
//
// test("renders properties hero section description", () => {
//   expect(
//     screen.getByText(/Homes are not about the physical location /i),
//   ).toBeInTheDocument();
// });
//
// test("renders user hero section title", () => {
//   // expect(screen.getByText(/users/i)).toBeInTheDocument();
//   expect(
//     screen.getByText(/coop cannot be what it is without you/i),
//   ).toBeInTheDocument();
// });
//
// test("renders user hero section graphic", () => {
//   expect(
//     screen.getByAltText(
//       /Cartoon image of a circle of round stick men of red, blue, green, and yellow colors holding hands/i,
//     ),
//   ).toBeInTheDocument();
// });
//
// test("renders user hero section description", () => {
//   expect(
//     screen.getByText(
//       /People come in all different kinds of shapes and sizes. Every person has/i,
//     ),
//   ).toBeInTheDocument();
//   expect(
//     screen.getByText(
//       /a unique story to tell, with their own sets of strengths and weaknesses. Find your compl/i,
//     ),
//   ).toBeInTheDocument();
// });
