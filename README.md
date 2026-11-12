# KassimNL site

1. Upload alles (incl. de map `.github`) naar een GitHub-repo.
2. Settings → Actions → General → Workflow permissions → **Read and write permissions**.
3. Tabblad Actions → "Update stats" → **Run workflow**. Daarna staat `stats.json` gevuld.
4. Settings → Pages → deploy vanaf branch `main`.

Optioneel voor een nauwkeuriger YouTube-aantal: maak een gratis YouTube Data API-sleutel en voeg die toe als
repository secret `YT_API_KEY` (Settings → Secrets and variables → Actions).
Wil je YouTube ook live in de browser? Zet de sleutel (beperkt tot jouw domein) in `CONFIG.ytApiKey` in `index.html`.
