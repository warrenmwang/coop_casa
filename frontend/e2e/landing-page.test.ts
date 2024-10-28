import { test, expect } from "playwright/test";

test.describe("landing page renders like normal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("title exists", async ({ page }) => {
    await expect(page).toHaveTitle(/Coop Casa/);
  });

  test("renders hero section main text", async ({ page }) => {
    const heroTextElement = page.getByText(
      /Connecting Communities, Empowering Ownership/i,
    );
    await expect(heroTextElement).toBeVisible();
  });

  test("renders hero section sub text", async ({ page }) => {
    const ele = page.getByText(
      /Your Pivotal Platform for Shared Land Ownership, Alternative Housing, Legal Guidance, and Collaborative Home Solutions in the Face of the Housing Crisis/i,
    );
    await expect(ele).toBeVisible();
  });

  test("renders hero section main graphic", async ({ page }) => {
    const graphicElement = page.getByAltText(
      /Image of a friendly cartoon neighborhood/i,
    );
    await expect(graphicElement).toBeVisible();
  });

  test("renders hero section stats", async ({ page }) => {
    const stat1_0 = page.getByText(/Individual Ownership/i);
    await expect(stat1_0).toBeVisible();
    const stat1_1 = page.getByText("100%", { exact: true });
    await expect(stat1_1).toBeVisible();

    const stat2_0 = page.getByText(/Dark Patterns and Hidden Fees/i);
    await expect(stat2_0).toBeVisible();
    const stat2_1 = page.getByText("0", { exact: true });
    await expect(stat2_1).toBeVisible();

    const stat3_0 = page.getByText(/Offices Worldwide/i);
    await expect(stat3_0).toBeVisible();
    const stat3_1 = page.getByText("1", { exact: true });
    await expect(stat3_1).toBeVisible();
  });

  test("renders communities hero section title text", async ({ page }) => {
    await expect(
      page.getByText(/It takes a village to raise a child. /i),
    ).toBeVisible();
  });

  test("renders communities hero section graphic", async ({ page }) => {
    await expect(
      page.getByAltText(
        /Cartoon image of a diverse group of people smiling and enjoying each others' company/,
      ),
    ).toBeVisible();
  });

  test("renders communities hero section description", async ({ page }) => {
    await expect(
      page.getByText(
        /Going through any and all stages of life alone can be noble and/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /fulfulling in its own right, but going through life with others, friends/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /and family, can help you to achieve your goals faster and while having/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /fun and building meaninful relationships that will last a lifetime./i,
      ),
    ).toBeVisible();
  });

  test("renders properties hero section title", async ({ page }) => {
    await expect(
      page.getByText(/Find the perfect place to co-own/i),
    ).toBeVisible();
  });

  test("renders properties hero section graphic", async ({ page }) => {
    await expect(
      page.getByAltText(
        /Cartoon image of a street of different colored homes lined up next to one another on a blue sky day/i,
      ),
    ).toBeVisible();
  });

  test("renders properties hero section description", async ({ page }) => {
    await expect(
      page.getByText(/Homes are not about the physical location /i),
    ).toBeVisible();
  });

  test("renders user hero section title", async ({ page }) => {
    // expect(page.getByText(/users/i)).toBeVisible();
    await expect(
      page.getByText(/coop cannot be what it is without you/i),
    ).toBeVisible();
  });

  test("renders user hero section graphic", async ({ page }) => {
    await expect(
      page.getByAltText(
        /Cartoon image of a circle of round stick men of red, blue, green, and yellow colors holding hands/i,
      ),
    ).toBeVisible();
  });

  test("renders user hero section description", async ({ page }) => {
    await expect(
      page.getByText(
        /People come in all different kinds of shapes and sizes. Every person has/i,
      ),
    ).toBeVisible();
    await expect(
      page.getByText(
        /a unique story to tell, with their own sets of strengths and weaknesses. Find your compl/i,
      ),
    ).toBeVisible();
  });
});
