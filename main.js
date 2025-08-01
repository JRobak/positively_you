/*
 * JavaScript for the Positively You website.
 *
 * This file defines the data used by the site (affirmations and quotes) and
 * provides functions to select random items, render expandable lists and
 * validate the contact form. Functions are deliberately split into small
 * pieces to aid readability and future maintenance.
 */

// Categorised affirmations grouped by theme. Feel free to expand these lists
// with more phrases that resonate with you.
const categorizedAffirmations = {
  Confidence: [
    "I believe in myself and my abilities.",
    "I radiate self-respect and inner strength.",
    "I am worthy of success and happiness.",
    "I trust myself to make the right decisions.",
    "I handle challenges with grace and confidence.",
    "I am proud of who I am becoming.",
    "My confidence grows stronger every day.",
    "I speak with clarity and conviction.",
    "I release doubt and welcome courage.",
    "I am enough just as I am.",
  ],
  Health: [
    "My body is strong, capable, and healing every day.",
    "I make healthy choices with ease and joy.",
    "I am grateful for my healthy body, mind, and spirit.",
    "I listen to my body and give it what it needs.",
    "Every cell in my body vibrates with health.",
    "I nourish my body with love and respect.",
    "I am energised, refreshed, and rejuvenated.",
    "My immune system is powerful and protective.",
    "I release stress and invite calm.",
    "I honour my body with rest and movement.",
  ],
  Wealth: [
    "I attract wealth and abundance effortlessly.",
    "Money flows to me from many sources.",
    "I am financially free and secure.",
    "My income is constantly increasing.",
    "I deserve to be well-compensated for my skills.",
    "Abundance surrounds me at all times.",
    "I welcome new opportunities for financial growth.",
    "I manage my money wisely and with gratitude.",
    "My wealth creates a positive impact.",
    "I release scarcity and embrace prosperity.",
  ],
  Spirituality: [
    "I trust the universe is guiding me perfectly.",
    "I am aligned with my highest purpose.",
    "My spirit is grounded, peaceful, and full of love.",
    "I am connected to a source greater than myself.",
    "I trust the timing of my life.",
    "I listen to my inner voice with clarity.",
    "Peace flows through me like a gentle river.",
    "I am a divine being having a human experience.",
    "Gratitude is my spiritual practice.",
    "I radiate love, compassion, and understanding.",
  ],
};

// Flatten all affirmations into a single array for random selection.
const affirmations = Object.values(categorizedAffirmations).flat();

// A selection of inspiring quotes. Feel free to add more favourites.
const quotes = [
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "The best way to predict the future is to create it. – Peter Drucker",
  "Do not wait for the perfect time — make the time perfect.",
  "Act as if what you do makes a difference. It does. – William James",
  "Small steps in the right direction are still steps forward.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
  "You miss 100% of the shots you don't take. – Wayne Gretzky",
  "The only limit to our realisation of tomorrow is our doubts of today. – Franklin D. Roosevelt",
  "Everything you’ve ever wanted is on the other side of fear. – George Addair",
  "Don’t watch the clock; do what it does. Keep going. – Sam Levenson",
  "Doubt kills more dreams than failure ever will. – Suzy Kassem",
  "Whether you think you can or you think you can’t, you’re right. – Henry Ford",
  "It always seems impossible until it’s done. – Nelson Mandela",
  "Start where you are. Use what you have. Do what you can. – Arthur Ashe",
  "Happiness is not something ready made. It comes from your own actions. – Dalai Lama",
  "The mind is everything. What you think you become. – Buddha",
  "Your life does not get better by chance, it gets better by change. – Jim Rohn",
  "You are never too old to set another goal or to dream a new dream. – C.S. Lewis",
  "Opportunities don't happen. You create them. – Chris Grosser",
  "Discipline is the bridge between goals and accomplishment. – Jim Rohn",
];

// Mapping of affirmation categories to tags used by the Quotable API.
// These tags serve as loose proxies for the themes on the site. To minimise
// the risk of a 400 error from the API, only common tags are used. See
// https://github.com/lukePeavey/quotable for the list of supported tags
// (tags such as “inspirational”, “life”, “success” and “wisdom” are known
// to exist)【815411132378546†L350-L406】. Feel free to adjust this mapping to
// better match the desired tone; if a mapping is not found, the API call
// defaults to no tag filter.
const affirmationTags = {
  Confidence: "inspirational|courage|success",
  Health: "happiness|life",
  Wealth: "success|money|business",
  Spirituality: "wisdom|spirituality|life",
};

/**
 * Search the Google Books API for books matching a query. Uses a CORS
 * proxy (AllOrigins) to avoid browser cross‑origin restrictions. The
 * results are rendered into the #book-results container.
 *
 * @param {string} query – the search term entered by the user
 */
async function searchBooks(query) {
  const resultsEl = document.getElementById("book-results");
  if (!resultsEl) return;
  // Clear previous results and show a loading state
  resultsEl.textContent = "Searching...";
  const encoded = encodeURIComponent(
    `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10&printType=books`
  );
  const url = `https://api.allorigins.win/raw?url=${encoded}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    resultsEl.innerHTML = "";
    if (!data.items || data.items.length === 0) {
      resultsEl.textContent = "No books found for your search.";
      return;
    }
    data.items.forEach((item) => {
      const info = item.volumeInfo;
      const card = document.createElement("article");
      card.className = "book-result";
      const title = document.createElement("h3");
      title.textContent = info.title || "Untitled";
      card.appendChild(title);
      if (info.authors) {
        const authors = document.createElement("p");
        authors.textContent = `by ${info.authors.join(", ")}`;
        card.appendChild(authors);
      }
      if (info.description) {
        const desc = document.createElement("p");
        desc.textContent = info.description;
        card.appendChild(desc);
      }
      const link = document.createElement("a");
      link.href = info.infoLink || info.previewLink || "#";
      link.textContent = "View book »";
      link.target = "_blank";
      link.rel = "noopener";
      card.appendChild(link);
      resultsEl.appendChild(card);
    });
  } catch (error) {
    console.error("Book search error:", error);
    resultsEl.textContent =
      "An error occurred while searching for books. Please try again later.";
  }
}

/**
 * Render affirmations with pagination. Each category is displayed with
 * numbered buttons to navigate between pages. Showing more items does
 * not require re‑fetching; lists are sliced on the client.
 *
 * @param {string} containerId – the id of the container where categories will be added
 * @param {Object<string,string[]>} data – mapping of category names to arrays
 * @param {number} itemsPerPage – number of affirmations per page (default 5)
 */
function renderCategoryPagination(containerId, data, itemsPerPage = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  Object.keys(data).forEach((category) => {
    const items = data[category];
    const wrapper = document.createElement("div");
    wrapper.className = "pagination-category";
    const heading = document.createElement("h3");
    heading.textContent = category;
    wrapper.appendChild(heading);
    const listEl = document.createElement("div");
    wrapper.appendChild(listEl);
    const nav = document.createElement("div");
    nav.className = "pagination-nav";
    wrapper.appendChild(nav);
    let currentPage = 1;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    function renderPage(page) {
      currentPage = page;
      listEl.innerHTML = "";
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      items.slice(start, end).forEach((text) => {
        const block = document.createElement("blockquote");
        block.textContent = text;
        listEl.appendChild(block);
      });
      // Build pagination buttons
      nav.innerHTML = "";
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "page-btn";
        if (i === currentPage) {
          btn.disabled = true;
        }
        btn.addEventListener("click", () => renderPage(i));
        nav.appendChild(btn);
      }
    }
    renderPage(1);
    container.appendChild(wrapper);
  });
}

/**
 * Fetch a single affirmation from the affirmations.dev API via the CORS
 * proxy. Returns the text of the affirmation or a fallback if an error
 * occurs. This helper is used to build dynamic lists of affirmations.
 *
 * @returns {Promise<string>} affirmation text
 */
async function fetchAffirmation() {
  const encoded = encodeURIComponent("https://www.affirmations.dev/");
  const url = `https://api.allorigins.win/raw?url=${encoded}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    return data.affirmation;
  } catch (error) {
    console.error("fetchAffirmation error:", error);
    return "You are worthy and capable of great things.";
  }
}

/**
 * Render dynamic affirmations by fetching fresh statements from the
 * affirmations.dev API for each page and category. Categories are
 * defined by an array of names; each page load triggers a new batch of
 * affirmations for that category. Pagination controls re‑fetch the
 * necessary number of items when changed.
 *
 * @param {string} containerId – id of the container where categories appear
 * @param {string[]} categoryNames – list of categories to render
 * @param {number} itemsPerPage – number of affirmations per page
 */
function renderDynamicAffirmations(
  containerId,
  categoryNames,
  itemsPerPage = 5
) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  categoryNames.forEach((cat) => {
    const wrapper = document.createElement("div");
    wrapper.className = "pagination-category";
    const heading = document.createElement("h3");
    heading.textContent = cat;
    wrapper.appendChild(heading);
    const listEl = document.createElement("div");
    wrapper.appendChild(listEl);
    const nav = document.createElement("div");
    nav.className = "pagination-nav";
    wrapper.appendChild(nav);
    let currentPage = 1;
    const totalPages = 2; // Provide two pages for demonstration. More pages can be added.
    async function loadPage(page) {
      currentPage = page;
      listEl.innerHTML = "Loading…";
      // Fetch a batch of affirmations concurrently
      try {
        const affirmations = await Promise.all(
          Array.from({ length: itemsPerPage }, () => fetchAffirmation())
        );
        listEl.innerHTML = "";
        affirmations.forEach((text) => {
          const block = document.createElement("blockquote");
          block.textContent = text;
          listEl.appendChild(block);
        });
      } catch (error) {
        listEl.textContent = "Could not load affirmations.";
      }
      // Render page controls
      nav.innerHTML = "";
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "page-btn";
        if (i === currentPage) btn.disabled = true;
        btn.addEventListener("click", () => loadPage(i));
        nav.appendChild(btn);
      }
    }
    loadPage(1);
    container.appendChild(wrapper);
  });
}

/**
 * Fetch a number of random inspirational quotes from the ZenQuotes API. To
 * avoid CORS issues, each request is proxied through api.allorigins.win.
 * The ZenQuotes `random` endpoint returns a single quote in an array, so
 * multiple calls are needed to construct a batch. If any request fails,
 * a fallback message is used.
 *
 * @param {number} count – how many quotes to fetch
 * @returns {Promise<string[]>} an array of formatted quote strings
 */
async function fetchZenQuotes(count) {
  /*
   * Fetch a batch of quotes from the ZenQuotes API. The API supports a
   * `count` query parameter which returns an array of that length. Using a
   * single request instead of multiple individual calls reduces the chance of
   * encountering rate limits or 400 errors. A CORS proxy is used to
   * circumvent browser cross‑origin restrictions.
   * See https://docs.zenquotes.io/zenquotes-documentation/#how-to-fetch-quotes
   */
  try {
    const endpoint = `https://zenquotes.io/api/random?count=${count}`;
    const encoded = encodeURIComponent(endpoint);
    const url = `https://api.allorigins.win/raw?url=${encoded}`;
    const resp = await fetch(url);
    const data = await resp.json();
    // The response is an array of objects with properties q (quote) and a (author)
    if (Array.isArray(data)) {
      return data.map((entry) => `${entry.q} – ${entry.a}`);
    }
    // Fallback: if data is not an array, attempt to construct a single quote
    if (data && data.q && data.a) {
      return [`${data.q} – ${data.a}`];
    }
    return ["Stay positive and keep believing in yourself."];
  } catch (error) {
    console.error("fetchZenQuotes error:", error);
    // Return a fallback array of motivational phrases
    return Array.from({ length: count }, () =>
      "Stay positive and keep believing in yourself."
    );
  }
}

/**
 * Initialize pagination for the quotes page using the ZenQuotes API. Each
 * page fetches a fresh batch of random quotes. Because ZenQuotes imposes
 * a rate limit of 5 requests per 30 seconds, the number of pages is kept
 * low and the calls are staggered when possible. Navigation controls
 * allow the user to switch pages without reloading the entire document.
 */
function initZenQuotePagination() {
  const listEl = document.getElementById("quotes-container");
  const navEl = document.getElementById("quotes-pagination");
  if (!listEl || !navEl) return;
  const itemsPerPage = 5;
  const totalPages = 2; // Provide two pages of quotes to stay within rate limits
  async function loadPage(page) {
    listEl.textContent = "Loading quotes...";
    try {
      const quotesBatch = await fetchZenQuotes(itemsPerPage);
      listEl.innerHTML = "";
      quotesBatch.forEach((text) => {
        const block = document.createElement("blockquote");
        block.textContent = text;
        listEl.appendChild(block);
      });
      // Build pagination
      navEl.innerHTML = "";
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "page-btn";
        if (i === page) btn.disabled = true;
        btn.addEventListener("click", () => loadPage(i));
        navEl.appendChild(btn);
      }
    } catch (error) {
      console.error("ZenQuotes pagination error:", error);
      listEl.textContent =
        "An error occurred while loading quotes. Please try again later.";
    }
  }
  // Fetch the first page on initialisation
  loadPage(1);
}

/**
 * Fetch a random affirmation from the public affirmations API via a
 * CORS proxy. The returned affirmation is displayed in the
 * #random-affirmation-display element. Any errors are reported to the user.
 */
async function fetchRandomAffirmation() {
  const displayEl = document.getElementById("random-affirmation-display");
  if (!displayEl) return;
  displayEl.textContent = "Loading...";
  const encoded = encodeURIComponent(
    "https://www.affirmations.dev/"
  );
  const url = `https://api.allorigins.win/raw?url=${encoded}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    displayEl.textContent = data.affirmation || "Stay positive and keep going!";
  } catch (error) {
    console.error("Affirmation API error:", error);
    displayEl.textContent =
      "Could not load an affirmation at this time. Please try again later.";
  }
}

/**
 * Render affirmations for each category by fetching data from the Quotable
 * API using the tags defined in affirmationTags. The function builds
 * pagination controls to let users browse multiple pages. If the API
 * request fails, it falls back to the locally defined categorised
 * affirmations.
 *
 * @param {string} containerId – id of the parent element where lists
 *                              should be rendered
 * @param {Object<string,string>} tagsMapping – mapping of category to API tags
 * @param {number} itemsPerPage – number of items to display per page
 */
function renderAffirmationsFromAPI(containerId, tagsMapping, itemsPerPage = 5) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  Object.keys(tagsMapping).forEach((category) => {
    const tags = tagsMapping[category] || "";
    const wrapper = document.createElement("div");
    wrapper.className = "pagination-category";
    const heading = document.createElement("h3");
    heading.textContent = category;
    wrapper.appendChild(heading);
    const listEl = document.createElement("div");
    wrapper.appendChild(listEl);
    const nav = document.createElement("div");
    nav.className = "pagination-nav";
    wrapper.appendChild(nav);
    // Local fallback items
    const fallback = categorizedAffirmations[category] || [];

    async function loadPage(page) {
      listEl.textContent = "Loading...";
      // Build API URL. Use tags only if defined. The Quotable API uses
      // pipe-separated tags to include multiple categories. Encoded via
      // api.allorigins.win to bypass CORS restrictions.
      let apiUrl = `https://api.quotable.io/quotes?page=${page}&limit=${itemsPerPage}`;
      if (tags) apiUrl += `&tags=${encodeURIComponent(tags)}`;
      const encoded = encodeURIComponent(apiUrl);
      const url = `https://api.allorigins.win/raw?url=${encoded}`;
      try {
        const resp = await fetch(url);
        const data = await resp.json();
        const quotesList = data.results || [];
        const totalPages = data.totalPages || 1;
        // Render list
        listEl.innerHTML = "";
        if (quotesList.length === 0) {
          listEl.textContent = "No affirmations found.";
        } else {
          quotesList.forEach((item) => {
            const block = document.createElement("blockquote");
            block.textContent = `${item.content} – ${item.author}`;
            listEl.appendChild(block);
          });
        }
        // Render navigation
        nav.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement("button");
          btn.textContent = i;
          btn.className = "page-btn";
          if (i === page) btn.disabled = true;
          btn.addEventListener("click", () => loadPage(i));
          nav.appendChild(btn);
        }
      } catch (error) {
        console.error(`Affirmations API error for ${category}:`, error);
        // Fall back to local data if available
        listEl.innerHTML = "";
        if (fallback.length > 0) {
          fallback.slice(0, itemsPerPage).forEach((text) => {
            const block = document.createElement("blockquote");
            block.textContent = text;
            listEl.appendChild(block);
          });
          nav.innerHTML = "";
        } else {
          listEl.textContent =
            "Sorry, no affirmations are available for this category.";
          nav.innerHTML = "";
        }
      }
    }
    // Load the first page initially
    loadPage(1);
    container.appendChild(wrapper);
  });
}

/**
 * Return a random element from an array. This helper is used to populate the
 * daily affirmation and quote on page load.
 * @param {any[]} array
 * @returns {any}
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Render categorised affirmations into collapsible sections. Each category is
 * displayed using a <details> element with a summary. Only the first five
 * affirmations are shown initially. A “Show More” button reveals the rest,
 * while a “Show Less” button collapses the list back to the teaser.
 *
 * @param {string} containerId – the id of the container where the lists will be appended
 * @param {Object<string,string[]>} data – an object mapping category names to arrays of affirmations
 */
function renderCategoryContent(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  Object.keys(data).forEach((category) => {
    const items = data[category];
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = `${category} – “${items[0]}”`;
    details.appendChild(summary);

    const section = document.createElement("section");
    const firstFive = items.slice(0, 5);

    function renderBatch(batch, toggleBack = false) {
      section.innerHTML = "";
      batch.forEach((item) => {
        const block = document.createElement("blockquote");
        block.textContent = item;
        section.appendChild(block);
      });
      if (!toggleBack && items.length > 5) {
        const showMoreBtn = document.createElement("button");
        showMoreBtn.textContent = "Show more";
        showMoreBtn.className = "button";
        showMoreBtn.style.margin = "1rem auto";
        showMoreBtn.style.display = "block";
        showMoreBtn.addEventListener("click", () => {
          renderBatch(items.slice(5), true);
        });
        section.appendChild(showMoreBtn);
      } else if (toggleBack) {
        const showLessBtn = document.createElement("button");
        showLessBtn.textContent = "Show less";
        showLessBtn.className = "button";
        showLessBtn.style.margin = "1rem auto";
        showLessBtn.style.display = "block";
        showLessBtn.addEventListener("click", () => {
          renderBatch(firstFive);
        });
        section.appendChild(showLessBtn);
      }
    }
    renderBatch(firstFive);
    details.appendChild(section);
    container.appendChild(details);
  });
}

/**
 * Render a paginated list of quotes. Quotes are presented inside a single
 * <details> element. Pagination buttons allow the user to view more or
 * fewer quotes at once.
 *
 * @param {string} containerId – id of the container where the quotes will be rendered
 * @param {string[]} quotesArray – list of quotes
 */
function renderQuotes(containerId, quotesArray) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = `Quotes – “${quotesArray[0]}”`;
  details.appendChild(summary);
  const section = document.createElement("section");
  let currentIndex = 0;
  const itemsPerPage = 5;
  function renderPage(startIndex) {
    section.innerHTML = "";
    const endIndex = startIndex + itemsPerPage;
    const batch = quotesArray.slice(startIndex, endIndex);
    batch.forEach((quote) => {
      const block = document.createElement("blockquote");
      block.textContent = quote;
      section.appendChild(block);
    });
    // Show more button if there are more quotes ahead
    if (endIndex < quotesArray.length) {
      const showMoreBtn = document.createElement("button");
      showMoreBtn.textContent = "Show more";
      showMoreBtn.className = "button";
      showMoreBtn.style.margin = "1rem auto";
      showMoreBtn.style.display = "block";
      showMoreBtn.addEventListener("click", () => {
        currentIndex = endIndex;
        renderPage(currentIndex);
      });
      section.appendChild(showMoreBtn);
    }
    // Show less button if we are beyond the first page
    if (startIndex > 0) {
      const showLessBtn = document.createElement("button");
      showLessBtn.textContent = "Show less";
      showLessBtn.className = "button";
      showLessBtn.style.margin = "1rem auto";
      showLessBtn.style.display = "block";
      showLessBtn.addEventListener("click", () => {
        currentIndex = 0;
        renderPage(currentIndex);
      });
      section.appendChild(showLessBtn);
    }
  }
  renderPage(currentIndex);
  details.appendChild(section);
  container.appendChild(details);
}

/**
 * Validate the contact form. Displays error messages if fields are empty and
 * shows a success message when submission is successful. ARIA attributes
 * communicate validity states to assistive technologies.
 *
 * @param {Event} e – submit event
 */
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const nameInput = form.querySelector("#name");
  const messageInput = form.querySelector("#message");
  let valid = true;
  // Reset previous errors
  form.querySelectorAll(".error-message").forEach((span) => {
    span.style.display = "none";
  });
  nameInput.removeAttribute("aria-invalid");
  messageInput.removeAttribute("aria-invalid");
  // Validate name
  if (!nameInput.value.trim()) {
    const errorSpan = document.getElementById("name-error");
    errorSpan.textContent = "Please enter your name.";
    errorSpan.style.display = "block";
    nameInput.setAttribute("aria-invalid", "true");
    valid = false;
  }
  // Validate message
  if (!messageInput.value.trim()) {
    const errorSpan = document.getElementById("message-error");
    errorSpan.textContent = "Please enter a message.";
    errorSpan.style.display = "block";
    messageInput.setAttribute("aria-invalid", "true");
    valid = false;
  }
  if (valid) {
    document.getElementById("success-msg").style.display = "block";
    form.reset();
  }
}

// When the page has fully loaded, populate the daily quote and affirmation
// areas and render any expandable content sections.
document.addEventListener("DOMContentLoaded", () => {
  // Populate random daily quote and affirmation on pages that include them
  const quoteEl = document.getElementById("daily-quote");
  const affirmationEl = document.getElementById("daily-affirmation");
  if (quoteEl) {
    quoteEl.textContent = getRandomItem(quotes);
  }
  if (affirmationEl) {
    affirmationEl.textContent = getRandomItem(affirmations);
  }
  // Attach book search handler if the form exists
  const bookForm = document.getElementById("book-search-form");
  if (bookForm) {
    bookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = document.getElementById("book-query").value.trim();
      if (query) {
        searchBooks(query);
      }
    });
  }
  // Render affirmations from the Quotable API if the container is present.
  // This replaces the previous static or random content with live data
  // retrieved based on category tags. If the API fails or no container
  // exists, the local fallback arrays defined earlier are used.
  const affContainer = document.getElementById("all-affirmations");
  if (affContainer) {
    renderAffirmationsFromAPI(
      "all-affirmations",
      affirmationTags,
      5
    );
  }
  // Initialise quote pagination using ZenQuotes if the container exists.
  // Each page fetches a fresh batch of quotes via the CORS proxy.
  if (document.getElementById("quotes-container")) {
    initZenQuotePagination();
  }
  // Attach random affirmation button handler
  const randomBtn = document.getElementById("fetch-affirmation-btn");
  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      fetchRandomAffirmation();
    });
  }
  // Form validation for contact page continues to work for the existing form
});