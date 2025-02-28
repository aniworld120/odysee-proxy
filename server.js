const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

app.get("/odysee", async (req, res) => {
    try {
        const odyseeUrl = req.query.url;
        if (!odyseeUrl) return res.status(400).json({ error: "Missing Odysee URL" });

        console.log(`Fetching Odysee page: ${odyseeUrl}`);
        const response = await axios.get(odyseeUrl);
        
        // Extract MP4/M3U8 Stream URL
        const $ = cheerio.load(response.data);
        const scriptTag = $("script[type='application/json']").html();
        const videoMatch = scriptTag ? scriptTag.match(/"source":\s*"([^"]+\.(mp4|m3u8))"/) : null;
        
        if (!videoMatch) {
            return res.status(404).json({ error: "No direct video link found" });
        }

        res.json({ success: true, streamUrl: videoMatch[1] });
    } catch (error) {
        console.error("Error fetching Odysee video:", error);
        res.status(500).json({ error: "Failed to retrieve video" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy Server running on port ${PORT}`));
