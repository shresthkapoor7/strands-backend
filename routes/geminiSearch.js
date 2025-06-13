import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

dotenv.config();

const router = express.Router();

async function summarizeIntent(originalContents) {
    const summarizationPrompt = {
        role: "user",
        parts: [{ text: "Summarize the user's intent in under 500 characters, no fluff." }]
    };

    const response = await fetch(`${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [...originalContents, summarizationPrompt]
        })
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

async function braveSearch(query) {
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
        headers: {
            'Accept': 'application/json',
            'X-Subscription-Token': process.env.BRAVE_API_KEY
        }
    });

    const data = await res.json();
    return data.web?.results?.map(r => ({ url: r.url, title: r.title })) || [];
}

function fetchWithTimeout(url, timeout = 8000) {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
        )
    ]);
}

async function scrapePage(url) {
    try {
        const res = await fetchWithTimeout(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        let content = '';
        $('p').each((_, el) => {
            content += $(el).text() + '\n';
        });
        return content.trim().slice(0, 2000);
    } catch (err) {
        console.warn(`Failed to scrape ${url}:`, err.message);
        return '';
    }
}

router.post('/gemini-search', async (req, res) => {
    const { contents } = req.body;
    const cleanedContents = contents.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
    }));

    try {
        const intent = await summarizeIntent(cleanedContents);
        const results = await braveSearch(intent);
        const scraped = [];
        for (const { url } of results.slice(0, 5)) {
            const text = await scrapePage(url);
            scraped.push(`URL: ${url}\nCONTENT:\n${text}`);
        }

        const webContent = scraped.join('\n\n');
        const finalPrompt = {
            role: "user",
            parts: [{ text: `Using this web content, answer the user's original question:\n\n${webContent}` }]
        };

        const finalRes = await fetch(`${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [...cleanedContents, finalPrompt] })
        });
        const finalData = await finalRes.json();
        const sourceList = results.map(r => `- [${r.title}](${r.url})`).join('\n');

        const userVisibleMessage = {
            ...finalData,
            sources: sourceList
        };

        res.json(userVisibleMessage);
    } catch (error) {
        console.error('Error in gemini-search agent:', error);
        res.status(500).json({ error: 'Agentic flow failed' });
    }
});

export default router;