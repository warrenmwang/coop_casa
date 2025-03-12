import { expect, test } from "playwright/test";

test.describe("properties page tests -- mocked no network", () => {
  test.beforeEach(async ({ page }) => {
    // Mock failed API response
    await page.route(
      "**/api/v1/properties**",
      async (route, request) => {
        if (request.method() === "GET") {
          return route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ error: "Internal Server Error" }),
          });
        }
        return route.continue();
      },
      { times: 4 }, // initial + 3 retries
    );
    await page.goto("/properties");
  });

  test("handles network errors gracefully", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Verify fetch error text is shown
    await expect(
      page.getByText(/Sorry, there are no properties on Coop right now!/),
    ).toBeVisible({
      timeout: 15000, // need time for initial and exponentially backed off retries from react query
    });
  });
});

test.describe("properties page tests -- mocked with delays", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/properties**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });
    await page.goto("/properties");
  });

  test("displays loading skeleton while fetching properties", async ({
    page,
  }) => {
    await expect(page.locator("id=card-grid-skeleton")).toBeVisible();
  });
});

test.describe("properties page tests -- no delays", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/properties");
  });

  test("renders page header and search components", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    // Check title and description
    await expect(page.getByText("Search Properties")).toBeVisible();
    await expect(
      page.getByText(
        "You can use optional filters to narrow down your search here.",
      ),
    ).toBeVisible();

    // Check search form elements
    await expect(page.getByLabel("Address")).toBeVisible();
    await expect(page.getByPlaceholder("Search by address.")).toBeVisible();
    await expect(page.getByRole("button", { name: /submit/i })).toBeVisible();
  });

  test("handles address search and updates URL", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    const searchAddress = "123 Main St";

    // Type in search and submit
    await page.getByPlaceholder("Search by address.").fill(searchAddress);
    await page.getByRole("button", { name: /submit/i }).click();

    // Verify URL updates with search params
    await expect(page).toHaveURL(/filterAddress=123\+Main\+St/);
  });

  test("shows empty state message when no properties exist", async ({
    page,
  }) => {
    // Mock empty response
    await page.route("**/api/v1/properties**", async (route) => {
      await route.fulfill({ json: [] });
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify empty state message
    await expect(
      page.getByText(/Sorry, there are no properties on Coop right now!/),
    ).toBeVisible({
      timeout: 15000, // need time for initial and exponentially backed off retries from react query
    });
  });

  test("pagination controls work correctly", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    // Verify first page button is visible and disabled
    await page
      .getByRole("button", {
        name: "1",
        exact: true,
      })
      .waitFor({ state: "visible" });
    await expect(
      page.getByRole("button", {
        name: "1",
        exact: true,
      }),
    ).toBeDisabled(); // expect start on first page, so disabled

    // Verify next page button works
    await page
      .getByRole("button", { name: "Next", exact: true })
      .waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Next", exact: true }).isEnabled();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    // Verify URL updates with page param
    await expect(page).toHaveURL(/page=1/);

    // Verify going back to first page
    await page
      .getByRole("button", {
        name: "1",
        exact: true,
      })
      .waitFor({ state: "visible" });
    await expect(
      page.getByRole("button", { name: "1", exact: true }),
    ).toBeEnabled();

    await page
      .getByRole("button", {
        name: "1",
        exact: true,
      })
      .click();

    // Verify URL is updated
    await expect(page).toHaveURL(/page=0/);
  });

  test("preserves search filters and pagination in URL", async ({ page }) => {
    // Set up initial search with filters
    await page.goto("/properties?page=0&filterAddress=Main");
    await page.waitForLoadState("networkidle");

    // Verify filter values are preserved
    const searchInput = page.getByPlaceholder("Search by address.");
    await expect(searchInput).toHaveValue("Main");

    // Verify pagination is preserved
    await expect(page).toHaveURL(/page=0/);
  });

  test("updates results when changing search filters", async ({ page }) => {
    // Initial search
    await page.getByPlaceholder("Search by address.").fill("Main");
    await page
      .getByRole("button", { name: /submit/i })
      .waitFor({ state: "visible" });
    await page.getByRole("button", { name: /submit/i }).isEnabled();
    await page.getByRole("button", { name: /submit/i }).click();

    // Wait for results to load
    await page.waitForLoadState("networkidle");

    // Change search term
    await page.getByPlaceholder("Search by address.").fill("Oak");
    await page
      .getByRole("button", { name: /submit/i })
      .waitFor({ state: "visible" });
    await page.getByRole("button", { name: /submit/i }).isEnabled();
    await page.getByRole("button", { name: /submit/i }).click();

    // Verify page resets to 0 and URL updates
    await expect(page).toHaveURL(/page=0/);
    await expect(page).toHaveURL(/filterAddress=Oak/);
  });
});
