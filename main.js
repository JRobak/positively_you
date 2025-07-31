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
 * Initialize pagination for the quotes page. Fetches a page of quotes from
 * the Quotable API via a CORS proxy and renders both the list and
 * navigation controls. Users can move between pages by clicking the
 * numbered buttons. Each page request returns a limited number of
 * quotes and the total page count so navigation can be built.
 */
function initQuotePagination() {
  const listEl = document.getElementById("quotes-container");
  const navEl = document.getElementById("quotes-pagination");
  if (!listEl || !navEl) return;
  const itemsPerPage = 5;
  async function loadPage(page) {
    listEl.textContent = "Loading quotes...";
    const encoded = encodeURIComponent(
      `https://api.quotable.io/quotes?page=${page}&limit=${itemsPerPage}&tags=inspirational|motivational`
    );
    const url = `https://api.allorigins.win/raw?url=${encoded}`;
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      listEl.innerHTML = "";
      data.results.forEach((item) => {
        const block = document.createElement("blockquote");
        block.textContent = `${item.content} – ${item.author}`;
        listEl.appendChild(block);
      });
      // Build pagination
      const totalPages = data.totalPages || 1;
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
      console.error("Quote API error:", error);
      listEl.textContent =
        "An error occurred while loading quotes. Please try again later.";
    }
  }
  // Load the first page on initialisation
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
  // Render affirmations with pagination if container exists
  if (document.getElementById("all-affirmations")) {
    renderCategoryPagination("all-affirmations", categorizedAffirmations, 5);
  }
  // Initialise quote pagination if container exists
  if (document.getElementById("quotes-container")) {
    initQuotePagination();
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