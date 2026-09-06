const wordInput = document.getElementById('word-input');
const searchBtn = document.getElementById('search-btn');
const micBtn = document.getElementById('mic-btn');
const resultContainer = document.getElementById('result-container');
const errorMessage = document.getElementById('error-message');
const wordTitle = document.getElementById('word-title');
const phonetic = document.getElementById('phonetic');
const audioBtn = document.getElementById('audio-btn');
const bookmarkBtn = document.getElementById('bookmark-btn');
const copyBtn = document.getElementById('copy-btn');
const meaningsList = document.getElementById('meanings-list');
const imageWrapper = document.getElementById('image-wrapper');
const wordImage = document.getElementById('word-image');
const wotdLink = document.getElementById('wotd-link');
const favoritesList = document.getElementById('favorites-list');
const themeToggleBtn = document.getElementById('theme-toggle');
const suggestionsList = document.getElementById('suggestions-list');

let audioUrl = '';
let currentWord = '';
let currentDefinitionText = '';
let favorites = JSON.parse(localStorage.getItem('dict_favorites')) || [];



const techDictionary = {
  python: "High-level programming language known for readable code, data science, AI/ML, and web development.",
  java: "Class-based, object-oriented programming language designed to run anywhere via the JVM.",
  javascript: "High-level scripting language used alongside HTML & CSS to create dynamic web applications.",
  js: "Short for JavaScript, a primary programming language for client-side and server-side web development.",
  html: "HyperText Markup Language, the standard markup language for creating web page structures.",
  css: "Cascading Style Sheets, used for styling and designing the visual presentation of web pages.",
  c: "General-purpose, low-level procedural programming language used for OS development and embedded systems.",
  cpp: "C++, an extension of C that adds object-oriented features, widely used for system software and game development.",
  ruby: "Dynamic, open-source programming language focusing on simplicity and productivity.",
  php: "Server-side scripting language primarily designed for dynamic web development.",
  git: "Distributed version control system for tracking code changes during software development.",
  sql: "Structured Query Language used to manage and manipulate relational databases.",
  react: "Popular open-source JavaScript library developed by Meta for building user interfaces.",
  node: "Node.js, a cross-platform JavaScript runtime environment for executing JS code server-side.",
  array: "Data structure consisting of a collection of elements identified by index or key.",
  string: "Sequence of characters used to store and manipulate text data in programming.",
  function: "Block of reusable code organized to perform a single, related action.",
  class: "Blue-print or template for creating objects in Object-Oriented Programming (OOP).",
  object: "Instance of a class containing attributes (data) and methods (code/functions).",
  loop: "Control structure that repeats a block of code until a specified condition is met.",
  variable: "Named storage space in memory used to hold data that can change during execution.",
  api: "Application Programming Interface, allowing different software applications to communicate.",
  database: "Organized collection of structured data stored electronically for rapid retrieval.",
  algorithm: "Step-by-step procedure or set of rules designed to solve a specific computational problem.",
  stack: "Linear data structure following the Last-In, First-Out (LIFO) principle.",
  queue: "Linear data structure following the First-In, First-Out (FIFO) principle.",
  pointer: "Variable that stores the memory address of another variable."
};

const translationFallback = {
  hindi: { kn: 'ಹಿಂದಿ (Hindi)', hi: 'हिंदी (Hindi)', te: 'హిందీ (Hindi)' },
  kannada: { kn: 'ಕನ್ನಡ (Kannada)', hi: 'कन्नड़ (Kannada)', te: 'కన్నడ (Kannada)' },
  telugu: { kn: 'ತೆಲುಗು (Telugu)', hi: 'तेलुगु (Telugu)', te: 'తెలుగు (Telugu)' },
  english: { kn: 'ಇಂಗ್ಲಿಷ್ (Ingliṣ)', hi: 'अंग्रेज़ी (Angrezī)', te: 'ఆంగ్లం (Āṅglaṁ)' },
  banana: { kn: 'ಬಾಳೆಹಣ್ಣು (Bāḷehaṇṇu)', hi: 'केला', te: 'అరటి' },
  apple: { kn: 'ಸೇಬು (Sēbu)', hi: 'सेब', te: 'యాపిల్' },
  python: { kn: 'ಪೈಥಾನ್ (Python)', hi: 'पायथन', te: 'పైథాన్' }
};

// Word bank for Autocomplete suggestions
const wordBank = [
  ...Object.keys(techDictionary),
  'apple', 'banana', 'serendipity', 'ethereal', 'luminous', 
  'resilience', 'eloquent', 'pragmatic'
];

// 2. Initial Setup & Theme Management
const currentTheme = localStorage.getItem('dict_theme') || 'light';
if (currentTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggleBtn.querySelector('i').className = 'fa-solid fa-sun';
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('dict_theme', newTheme);
  themeToggleBtn.querySelector('i').className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
});

// Word of the day setup
const wotdList = ['Serendipity', 'Ethereal', 'Luminous', 'Resilience', 'Eloquent', 'Pragmatic'];
const todayWord = wotdList[new Date().getDate() % wotdList.length];
wotdLink.textContent = todayWord;
wotdLink.addEventListener('click', (e) => {
  e.preventDefault();
  wordInput.value = todayWord;
  fetchWordData();
});

renderFavorites();

// 3. Search & Voice Listeners
searchBtn.addEventListener('click', () => {
  suggestionsList.classList.add('hidden');
  fetchWordData();
});

wordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    suggestionsList.classList.add('hidden');
    fetchWordData();
  }
});

// Autocomplete Input Handler
wordInput.addEventListener('input', () => {
  const query = wordInput.value.toLowerCase().trim();
  suggestionsList.innerHTML = '';

  if (!query) {
    suggestionsList.classList.add('hidden');
    return;
  }

  const matches = wordBank.filter(word => word.startsWith(query)).slice(0, 5);
  if (matches.length === 0) {
    suggestionsList.classList.add('hidden');
    return;
  }

  matches.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    li.addEventListener('click', () => {
      wordInput.value = word;
      suggestionsList.classList.add('hidden');
      fetchWordData();
    });
    suggestionsList.appendChild(li);
  });

  suggestionsList.classList.remove('hidden');
});

document.addEventListener('click', (e) => {
  if (!wordInput.contains(e.target) && !suggestionsList.contains(e.target)) {
    suggestionsList.classList.add('hidden');
  }
});

// Voice Assistant
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';

  micBtn.addEventListener('click', () => recognition.start());
  recognition.onstart = () => micBtn.classList.add('listening');
  recognition.onresult = (e) => {
    wordInput.value = e.results[0][0].transcript.replace(/\./g, '');
    micBtn.classList.remove('listening');
    fetchWordData();
  };
  recognition.onend = () => micBtn.classList.remove('listening');
} else {
  micBtn.style.display = 'none';
}

async function fetchTranslations(word) {
  const languages = [
    { code: 'kn', name: 'Kannada' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' }
  ];

  const wordKey = word.toLowerCase().trim();

  // If word is in our fallback dictionary (like language names), return clean fallbacks directly
  if (translationFallback[wordKey]) {
    return languages.map(lang => ({
      name: lang.name,
      text: translationFallback[wordKey][lang.code]
    }));
  }

  const results = await Promise.all(
    languages.map(async (lang) => {
      try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${lang.code}`);
        const data = await res.json();
        const translatedText = data.responseData?.translatedText;

        const isShortPhrase = translatedText && translatedText.split(' ').length <= 3;

        if (isShortPhrase && translatedText !== 'N/A' && !translatedText.includes('MYMEMORY WARNING')) {
          return { name: lang.name, text: translatedText };
        }
        throw new Error("Invalid API text");
      } catch {
        const fallbackText = translationFallback[wordKey]?.[lang.code] || 'N/A';
        return { name: lang.name, text: fallbackText };
      }
    })
  );

  return results;
}

// Helper: Speech Synthesis
function speakWord(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Speech synthesis is not supported in this browser.");
  }
}

// 5. Core Word Fetcher
async function fetchWordData() {
  const word = wordInput.value.trim();
  if (!word) return;

  resultContainer.classList.add('hidden');
  errorMessage.classList.add('hidden');
  imageWrapper.classList.add('hidden');
  meaningsList.innerHTML = '';

  try {
    const wordKey = word.toLowerCase();
    let entry = null;

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (response.ok) {
        const rawData = await response.json();
        entry = rawData[0];
      }
    } catch (e) {
      console.warn("Dictionary API search failed, checking tech dictionary...");
    }

    if (!entry && !techDictionary[wordKey]) {
      throw new Error("Word not found. Please try another word.");
    }

    const translations = await fetchTranslations(word);

    // Wikipedia Image Fetching Logic
    let imageUrl = '';
    const wikiQuery = techDictionary[wordKey] ? `${word} (programming language)` : word;
    
    try {
      let wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery)}`);
      if (!wikiRes.ok && techDictionary[wordKey]) {
        wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
      }
      
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        imageUrl = wikiData.thumbnail?.source || '';
      }
    } catch (imgErr) {
      console.warn("Image fetch failed:", imgErr);
    }

    // Audio Audio Extraction
    let foundAudio = '';
    if (entry && entry.phonetics) {
      const audioObj = entry.phonetics.find(p => p.audio && p.audio.trim().length > 0);
      if (audioObj) foundAudio = audioObj.audio;
    }

    const formattedData = {
      word: entry ? entry.word : word,
      phonetic: entry ? (entry.phonetic || (entry.phonetics?.find(p => p.text)?.text) || '') : '',
      audio: foundAudio,
      image: imageUrl,
      translations: translations,
      codingMeaning: techDictionary[wordKey] || null,
      definitions: entry ? entry.meanings.flatMap(meaning => 
        meaning.definitions.slice(0, 2).map(def => ({
          partOfSpeech: meaning.partOfSpeech,
          definition: def.definition,
          example: def.example
        }))
      ) : []
    };

    displayResults(formattedData);
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.classList.remove('hidden');
  }
}

// ... existing fetchWordData() code above ...

// 6. UI Rendering (PASTE / REPLACE HERE)
function displayResults(data) {
  currentWord = data.word;
  wordTitle.textContent = data.word;
  phonetic.textContent = data.phonetic || '';
  audioUrl = data.audio || '';

  // Clear previous meanings and translations completely before rendering
  meaningsList.innerHTML = '';

  if (data.image) {
    wordImage.src = data.image;
    imageWrapper.classList.remove('hidden');
  } else {
    imageWrapper.classList.add('hidden');
  }

  updateBookmarkState();

  // Render Programming Definition
  if (data.codingMeaning) {
    const codeBox = document.createElement('div');
    codeBox.style.cssText = 'background: var(--accent-bg); border-left: 4px solid var(--primary-color); padding: 12px 16px; border-radius: 6px; margin: 12px 0; font-size: 0.95rem;';
    codeBox.innerHTML = `<h4 style="color: var(--primary-color); margin-bottom: 4px;"><i class="fa-solid fa-code"></i> Computer Programming Meaning</h4><p style="color: var(--text-color);">${data.codingMeaning}</p>`;
    meaningsList.appendChild(codeBox);
  }

  // Render Clean Translations ONCE
  if (data.translations && data.translations.length > 0) {
    const transBox = document.createElement('div');
    transBox.style.cssText = 'background: var(--trans-bg); padding: 12px; border-radius: 8px; margin: 12px 0; font-size: 0.95rem;';
    
    let transHtml = '<strong>Translations:</strong><br>';
    data.translations.forEach(t => {
      transHtml += `<span style="margin-right: 15px;"><b>${t.name}:</b> ${t.text}</span>`;
    });
    transBox.innerHTML = transHtml;
    meaningsList.appendChild(transBox);
  }

  // Render Definitions
  if (data.definitions && data.definitions.length > 0) {
    const grouped = {};
    data.definitions.forEach(def => {
      const pos = def.partOfSpeech ? def.partOfSpeech.toLowerCase() : 'general';
      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push(def);
    });

    for (const [pos, defs] of Object.entries(grouped)) {
      const posHeader = document.createElement('h3');
      posHeader.className = 'part-of-speech';
      posHeader.textContent = pos.charAt(0).toUpperCase() + pos.slice(1);
      meaningsList.appendChild(posHeader);

      const ul = document.createElement('ul');
      ul.className = 'definitions-list';

      defs.forEach((def, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${index + 1}.</strong> ${def.definition}`;

        if (def.example) {
          const exampleSpan = document.createElement('span');
          exampleSpan.className = 'example';
          exampleSpan.textContent = `Example: "${def.example}"`;
          li.appendChild(exampleSpan);
        }
        ul.appendChild(li);
      });
      meaningsList.appendChild(ul);
    }
  }

  resultContainer.classList.remove('hidden');
}

// ... action button handlers below ...

// 7. Action Button Handlers
audioBtn.addEventListener('click', () => {
  if (!currentWord) return;
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(() => speakWord(currentWord));
  } else {
    speakWord(currentWord);
  }
});

copyBtn.addEventListener('click', () => {
  if (currentDefinitionText) {
    navigator.clipboard.writeText(`${currentWord.toUpperCase()}:\n${currentDefinitionText}`);
    alert('Definition copied to clipboard!');
  }
});

bookmarkBtn.addEventListener('click', () => {
  if (!currentWord) return;
  const index = favorites.indexOf(currentWord.toLowerCase());

  if (index === -1) {
    favorites.push(currentWord.toLowerCase());
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem('dict_favorites', JSON.stringify(favorites));
  updateBookmarkState();
  renderFavorites();
});

function updateBookmarkState() {
  const isFav = favorites.includes(currentWord.toLowerCase());
  const icon = bookmarkBtn.querySelector('i');
  if (isFav) {
    icon.className = 'fa-solid fa-bookmark';
    bookmarkBtn.classList.add('active');
  } else {
    icon.className = 'fa-regular fa-bookmark';
    bookmarkBtn.classList.remove('active');
  }
}

function renderFavorites() {
  favoritesList.innerHTML = '';
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<p class="empty-msg">No saved words yet.</p>';
    return;
  }

  favorites.forEach(word => {
    const chip = document.createElement('span');
    chip.className = 'fav-chip';
    chip.textContent = word;
    chip.addEventListener('click', () => {
      wordInput.value = word;
      fetchWordData();
    });
    favoritesList.appendChild(chip);
  });
}