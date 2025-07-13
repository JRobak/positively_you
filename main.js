// ✅ Affirmations grouped by category
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
    "I am energized, refreshed, and rejuvenated.",
    "My immune system is powerful and protective.",
    "I release stress and invite calm.",
    "I honor my body with rest and movement.",
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

const affirmations = Object.values(categorizedAffirmations).flat();

const quotes = [
  "“Believe you can and you're halfway there.” – Theodore Roosevelt",
  "“The best way to predict the future is to create it.” – Peter Drucker",
  "“Do not wait for the perfect time — make the time perfect.”",
  "“Act as if what you do makes a difference. It does.” – William James",
  "“Small steps in the right direction are still steps forward.”",
  "“Success is not final, failure is not fatal: It is the courage to continue that counts.” – Winston Churchill",
  "“You miss 100% of the shots you don't take.” – Wayne Gretzky",
  "“The only limit to our realization of tomorrow is our doubts of today.” – Franklin D. Roosevelt",
  "“Everything you’ve ever wanted is on the other side of fear.” – George Addair",
  "“Don’t watch the clock; do what it does. Keep going.” – Sam Levenson",
  "“Doubt kills more dreams than failure ever will.” – Suzy Kassem",
  "“Whether you think you can or you think you can’t, you’re right.” – Henry Ford",
  "“It always seems impossible until it’s done.” – Nelson Mandela",
  "“Start where you are. Use what you have. Do what you can.” – Arthur Ashe",
  "“Happiness is not something ready made. It comes from your own actions.” – Dalai Lama",
  "“The mind is everything. What you think you become.” – Buddha",
  "“Your life does not get better by chance, it gets better by change.” – Jim Rohn",
  "“You are never too old to set another goal or to dream a new dream.” – C.S. Lewis",
  "“Opportunities don't happen. You create them.” – Chris Grosser",
  "“Discipline is the bridge between goals and accomplishment.” – Jim Rohn",
];

// ✅ Utility function
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ✅ Render categorized affirmations with teaser and show more/less toggle
function renderCategoryContent(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (const category in data) {
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
        showMoreBtn.textContent = "Show More";
        showMoreBtn.style.margin = "1rem auto";
        showMoreBtn.style.display = "block";

        showMoreBtn.addEventListener("click", () => {
          renderBatch(items.slice(5), true);
        });

        section.appendChild(showMoreBtn);
      } else if (toggleBack) {
        const showLessBtn = document.createElement("button");
        showLessBtn.textContent = "Show Less";
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
  }
}

// ✅ Render uncategorized quotes using the same logic
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

    // Navigation buttons
    if (endIndex < quotesArray.length) {
      const showMoreBtn = document.createElement("button");
      showMoreBtn.textContent = "Show More";
      showMoreBtn.style.margin = "1rem auto";
      showMoreBtn.style.display = "block";
      showMoreBtn.addEventListener("click", () => {
        currentIndex = endIndex;
        renderPage(currentIndex);
      });
      section.appendChild(showMoreBtn);
    }

    if (startIndex > 0) {
      const showLessBtn = document.createElement("button");
      showLessBtn.textContent = "Show Less";
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

// ✅ Run on page load
document.addEventListener("DOMContentLoaded", () => {
  const quoteEl = document.getElementById("daily-quote");
  const affirmationEl = document.getElementById("daily-affirmation");

  if (quoteEl) {
    quoteEl.textContent = getRandomItem(quotes);
  }

  if (affirmationEl) {
    affirmationEl.textContent = getRandomItem(affirmations);
  }

  renderCategoryContent("all-affirmations", categorizedAffirmations);
  renderQuotes("all-quotes", quotes);
});

function handleSubmit(e) {
  e.preventDefault();
  document.getElementById("success-msg").style.display = "block";
}
