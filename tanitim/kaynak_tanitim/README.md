# Tanıtım videosu (NSCS) — üretim kaynağı (17.11.2026)
Portalın kendisi yerel sunucuda (demo veri) çalıştırılıp Playwright ile sahne sahne kaydedilir; altyazı (TR+AR) ve imleç sayfaya bindirilir; ses `tanitim/audio2/` (EN, edge-tts, GitHub Actions `tanitim-ses.yml`).
- `record.js [sahne,sahne]` = sahneleri kaydeder (`python3 -m http.server 8791` repo kökünde açık olmalı); `CFG` her sahnenin açacağı ekranı ve cümle numarasına bağlı eylemleri tanımlar; demo veri `pre` alanlarında.
- `assemble_tv.py` = klipleri birleştirir (xfade), sesi ve müziği (`music.py 560`) karıştırır → `tanitim_nscs.mp4` → `tanitim/EMS_Tanitim_video.mp4` (dosya adı site bağlantıları bozulmasın diye aynı).
- `NN.json` = sahne süre/cümle zamanları. Ham `.webm` ve klipler boyut nedeniyle konmadı; `node record.js N` ile yalnız ilgili sahne yeniden çekilir.
- Kapanış kartı adresleri (OFFICE/MILL) eski: kullanıcı yeni adresi onaylayınca `record.js` içindeki `closeHtml` değişir ve 23. sahne yeniden çekilir.
