import express from "express";
import dotenv from "dotenv";

dotenv.config();

const key = process.env.STEAM_API_KEY;

function validateSteamId(id: string | undefined, res: express.Response) {
    if (!id) {
        res.status(400).json({ error: "steamid required" });
        return false;
    }
    if (!/^\d{17}$/.test(id)) {
        res.status(400).json({ error: "invalid steamid format" });
        return false;
    }
    return true;
}

export async function getProfile(req: express.Request, res: express.Response) {
    const id = req.query.steamid as string;
    if (!validateSteamId(id, res)) return;

    try {
        const resp = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002?key=${key}&steamids=${id}`
        );
        const data = await resp.json();
        const player = data?.response?.players[0];

        if (!player) {
            return res.status(404).json({ error: "profile not found or private" });
        }

        return res.json(player);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "STEAM_API_ERROR" });
    }
}

export async function getLibrary(req: express.Request, res: express.Response) {
    const id = req.query.steamid as string;
    if (!validateSteamId(id, res)) return;

    try {
        const resp = await fetch(
            `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${id}&include_appinfo=1&include_played_free_games=1&format=json`
        );
        const data = await resp.json();

        if (!data.response) {
            return res.status(403).json({ error: "private_profile" });
        }

        return res.json(data.response);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "STEAM_API_ERROR" });
    }
}

export async function getRecents(req: express.Request, res: express.Response) {
    const id = req.query.steamid as string;
    if (!validateSteamId(id, res)) return;

    try {
        const resp = await fetch(
            `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${key}&steamid=${id}`
        );
        const data = await resp.json();
        return res.json(data.response || { games: [] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "STEAM_API_ERROR" });
    }
}

export async function getAchievements(req: express.Request, res: express.Response) {
    const id = req.query.steamid as string;
    const appid = req.query.appid as string;

    if (!validateSteamId(id, res)) return;
    if (!appid) return res.status(400).json({ error: "appid required" });

    try {
        const resp = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${key}&steamid=${id}&appid=${appid}`
        );
        const data = await resp.json();
        return res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "STEAM_API_ERROR" });
    }
}

export async function getStoreData(req: express.Request, res: express.Response) {
    const appid = req.query.appid as string;
    if (!appid) return res.status(400).json({ error: "appid required" });

    try {
        const resp = await fetch(
            `https://store.steampowered.com/api/appdetails?appids=${appid}`
        );
        const data = await resp.json();
        const entry = data?.[appid];

        if (!entry?.success) {
            return res.status(404).json({ error: "store_data_not_found" });
        }

        return res.json(entry.data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "STEAM_STORE_API_ERROR" });
    }
}
