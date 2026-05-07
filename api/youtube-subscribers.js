export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
        return res.status(200).json({ count: null });
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
        const response = await fetch(url);
        const json = await response.json();
        const count = json?.items?.[0]?.statistics?.subscriberCount;
        return res.status(200).json({ count: count ? Number(count) : null });
    } catch (e) {
        return res.status(200).json({ count: null });
    }
}
