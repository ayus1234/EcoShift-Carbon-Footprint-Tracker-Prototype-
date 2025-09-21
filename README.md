# EcoShift – Carbon Footprint Tracker (Prototype)

A lightweight, privacy-friendly web app to **log sustainable habits** and estimate **CO₂e savings** in real time. Built with **vanilla HTML/CSS/JS** and **Chart.js**, it stores data locally in your browser (no backend required).

> ⚠️ **Prototype**: Emission factors are indicative and editable. This tool supports habit-building and education—not official ESG reporting.

---

## 🔗 Live Demo

- (Add your deployed link here when ready, e.g., **GitHub Pages / Netlify / Vercel**)

---

## 📸 Screenshots

> Place these images in `docs/images/` to render below (use the suggested names).

| Habit logging UI | Activity log table | Dashboard analytics |
|---|---|---|
| ![Habit logging]<img width="1307" height="599" alt="Habit Logging Interface" src="https://github.com/user-attachments/assets/8c618d6b-6f25-4f02-952c-bda73cd5e19f" /> | ![Log table]<img width="1080" height="558" alt="Activity Log Table" src="https://github.com/user-attachments/assets/e20e2a9d-2467-4183-9f3c-20e925da921f" /> | ![Dashboard]<img width="1065" height="451" alt="Dashboard Analytics" src="https://github.com/user-attachments/assets/1bff2d31-8b40-4706-8c46-9968f8ce1459" />
 |

---

## ✨ Features

- **Log actions** by date/member/habit/quantity with dynamic units.
- **Local storage** (no signup, no server) – your data stays in your browser.
- **Charts & KPIs** with Chart.js: per‑habit doughnut and daily savings bar chart.
- **CSV export/import** for portability and collaboration.
- **Customizable factors** via `factors.json` (kg CO₂e per unit).

---

## 🧱 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: [Chart.js CDN](https://cdn.jsdelivr.net/npm/chart.js)
- **Storage**: `localStorage`

---

## 🚀 Getting Started (Local)

Because the app **fetches `factors.json`**, run it from a local web server (opening `index.html` directly as a `file://` URL may block `fetch`).

```bash
# 1) Clone
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2) Start a simple server (pick one)
# Python 3
python -m http.server 5500
# or Node (if installed)
npx serve -l 5500
# or VS Code: use the Live Server extension

# 3) Open in browser
http://localhost:5500/
```

---

## 🧭 Using the App

1. **Pick a habit** and **enter quantity** (units update automatically).
2. Click **Add to log** → your entry appears in the table and updates **KPIs** & **charts**.
3. **Export CSV** to download your log.
4. **Import CSV** to merge entries from a file.
5. **Clear all** to reset local data.

### CSV Format

Exported file: `co2_log.csv`

Columns:
```
"date","member","habit_id","habit_name","qty","unit","saved_kg"
```

Example row:
```
"2025-09-21","Ayush Nathani","cycle_instead_of_car","Cycle instead of driving","3","km","0.50"
```

> The importer expects the same header names. Unknown columns are ignored.

---

## 🔢 Emission Factors (`factors.json`)

- All factors are expressed in **kg CO₂e per unit** (see each `unit`).
- You can localize or tune factors by editing this file.
- Shape of each factor object:

```json
{
  "id": "cycle_instead_of_car",
  "name": "Cycle instead of driving",
  "unit": "km",
  "factor": 0.1669,
  "source": ["<reference ids or URLs>"],
  "calc": "Short note on how the factor was derived"
}
```

> Defaults include global/UK transport averages and an India electricity grid factor (kg/kWh). See `docs/Methodology_and_Sources.md` for details you add later.

---

## 📊 KPIs & Charts

- **Total saved (kg)** and **Avg/day (kg)** computed from your log.
- **Top habit** shows the habit with the highest cumulative savings.
- Charts:
  - **Doughnut**: savings by habit.
  - **Bar**: savings over time (by date).

---

## 🔒 Privacy & Data

- All data is stored in **`localStorage`** on your device.
- Deleting browser data or clicking **Clear all** will remove your entries.

---

## 🌐 Deployment

- **GitHub Pages**: set the Pages source to the root (or `/docs`) and push.
- **Netlify/Vercel**: drag‑and‑drop or connect the repo; no build step needed.

> Ensure `factors.json` is served from the same origin as `index.html`.

---

## 🗺️ Roadmap (Next)

- Factor editor UI (in‑app customization)
- Per‑user profiles & sharing (opt‑in)
- PWA/offline enhancements & backup/restore
- Better accessibility labels and keyboard flows
- Optional backend & authentication for multi‑device sync

---

## 🤝 Contributing

PRs and suggestions are welcome. For issues/ideas, open a **GitHub Issue**.

---

## 📄 License

This project is released under the **MIT License**. See `LICENSE`.

---

## 🙏 Acknowledgements & Disclaimer

- This is an educational prototype. Emission factors are **estimates** and **context‑dependent**. Before using for official reporting, consult authoritative datasets and local grid/transport factors.
- Screenshots in this README are captured from the running prototype.

