const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Backend API endpoint for Word Data + Image
app.get('/api/define/:word', async (req, res) => {
  const { word } = req.params;

  try {
    // 1. Fetch Definition (With Fallback mechanism)
    let dictionaryData = null;
    let definitions = [];
    let audioUrl = "";

    // Try Primary Dictionary API
    try {
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (dictRes.ok) {
        const data = await dictRes.json();
        dictionaryData = data[0];

        if (dictionaryData.phonetics) {
          const audioObj = dictionaryData.phonetics.find(p => p.audio && p.audio.trim() !== '');
          if (audioObj) audioUrl = audioObj.audio;
        }

        dictionaryData.meanings.forEach(m => {
          m.definitions.forEach(d => {
            definitions.push({
              partOfSpeech: m.partOfSpeech,
              definition: d.definition,
              example: d.example || null
            });
          });
        });
      }
    } catch (e) {
      console.warn("Primary dictionary API failed, using fallback...");
    }

    // Fallback: Wikipedia Summary API if Primary fails
    if (definitions.length === 0) {
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (wikiData.extract) {
          definitions.push({
            partOfSpeech: "noun/general",
            definition: wikiData.extract,
            example: null
          });
        }
      }
    }

    if (definitions.length === 0) {
      return res.status(404).json({ error: `No definition or images found for "${word}".` });
    }

    // 2. Fetch Relevant Image (from Wikimedia Free API)
    let imageUrl = null;
    try {
      const wikiMediaRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
      if (wikiMediaRes.ok) {
        const wikiData = await wikiMediaRes.json();
        if (wikiData.thumbnail && wikiData.thumbnail.source) {
          imageUrl = wikiData.thumbnail.source;
        }
      }
    } catch (imgErr) {
      console.warn("Could not fetch image:", imgErr);
    }

    // Response object containing Word, Phonetic, Audio, Image, and Meanings
    res.json({
      word: word,
      phonetic: dictionaryData ? (dictionaryData.phonetic || "") : "",
      audio: audioUrl,
      image: imageUrl,
      definitions: definitions
    });

  } catch (err) {
    console.error("Backend Error:", err);
    res.status(500).json({ error: "Server error while processing word query." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});