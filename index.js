
import "./database/config.js"
import "dotenv/config"
import express from "express";
const app = express();
app.get('/', (req, res) =>
{
    res.json({ ok: true })
});
const PORT= process.env.PORT || 5000 ;
app.listen(PORT, () => console.log("xd http://localhost:" + PORT));