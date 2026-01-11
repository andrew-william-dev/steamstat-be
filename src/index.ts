import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
    getAchievements,
    getLibrary,
    getProfile,
    getRecents,
    getStoreData
// @ts-ignore
} from "./getFromId/getData.ts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health-check", (req, res) => {
    if(!process.env.STEAM_API_KEY){
        res.send("SteamStat is facing issues, Apologies Gamers!!")
    }
    console.log(process.env.STEAM_API_KEY);
    res.send("SteamStat backend running");
});

app.get('/user/profile', getProfile);
app.get('/user/library', getLibrary)
app.get('/user/recent', getRecents)
app.get('/user/achievements', getAchievements)
app.get('/store', getStoreData)

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
