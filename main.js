const affirmations = [
  "I am growing and becoming stronger every day.",
  "I radiate positivity and attract great things.",
  "I am capable, confident, and kind.",
  "I choose to speak words of healing and hope.",
  "I am aligned with my purpose and my power.",
  "I am worthy of love, success, and happiness.",
  "I trust myself to make the best decision for me.",
  "My potential is limitless when I believe in myself.",
  "I release fear and embrace faith in every step.",
  "I deserve to take up space and use my voice.",
  "My journey is unfolding with purpose and power.",
  "I welcome abundance and prosperity into my life.",
  "I give myself permission to grow and evolve.",
  "I am grounded, focused, and fully present.",
  "I choose progress over perfection.",
  "Every challenge I face is an opportunity to grow.",
  "I am resilient, resourceful, and relentless.",
  "Peace begins with me and flows from me.",
  "I am proud of how far I’ve come and excited for what’s next.",
  "I attract opportunities that align with my goals.",
  "I am not defined by my past — I am creating my future.",
  "I carry myself with confidence, grace, and courage.",
  "I am constantly becoming a better version of myself.",
  "I honor my values and live with integrity.",
  "I am a magnet for joy, creativity, and strength.",
];

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
  "“What lies behind us and what lies before us are tiny matters compared to what lies within us.” – Ralph Waldo Emerson",
  "“It always seems impossible until it’s done.” – Nelson Mandela",
  "“Start where you are. Use what you have. Do what you can.” – Arthur Ashe",
  "“Happiness is not something ready made. It comes from your own actions.” – Dalai Lama",
  "“The mind is everything. What you think you become.” – Buddha",
  "“Your life does not get better by chance, it gets better by change.” – Jim Rohn",
  "“You are never too old to set another goal or to dream a new dream.” – C.S. Lewis",
  "“Opportunities don't happen. You create them.” – Chris Grosser",
  "“Believe in yourself and all that you are.” – Christian D. Larson",
  "“Discipline is the bridge between goals and accomplishment.” – Jim Rohn",
  "“Success usually comes to those who are too busy to be looking for it.” – Henry David Thoreau",
  "“The best revenge is massive success.” – Frank Sinatra",
  "“What you get by achieving your goals is not as important as what you become by achieving your goals.” – Zig Ziglar",
];

function generateAffirmation() {
  const affirmation =
    affirmations[Math.floor(Math.random() * affirmations.length)];
  document.getElementById("affirmation").textContent = affirmation;
}

function generateQuote() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote").textContent = quote;
}

// Show one of each on load
generateAffirmation();
generateQuote();
