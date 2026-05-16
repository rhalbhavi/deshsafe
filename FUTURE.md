# 🚀 DeshSafe — Future Roadmap

This document outlines the planned features, improvements, and long-term vision for DeshSafe. Contributors are welcome to pick up any of these and open a PR!

---

## 📍 Current Status (v0.1 — MVP)

- [x] Landing page with hero, features, and trust bar
- [x] Dashboard with active alerts, weather stats, and safety status
- [x] Personalized action plan page with step-by-step checklist
- [x] User profile page with health tags and alert preferences
- [x] Basic JS animations and progress tracking

---

## 🗓️ Phase 1 — Core Features (v0.2)

> Goal: Make the app functional with real data

- [ ] **User Authentication** — Sign up / Login with Firebase Auth or Supabase
- [ ] **Real Weather API** — Integrate OpenWeatherMap or IMD API for live temperature, AQI, humidity
- [ ] **Location Detection** — Auto-detect user's city using browser Geolocation API
- [ ] **Live Alert Feed** — Pull real disaster alerts from NDMA / GDACS RSS feeds
- [ ] **Incident Report Form** — Let users report a local crisis (flood, fire, accident) with photo upload
- [ ] **Backend Setup** — Node.js + Express REST API to handle reports and user data
- [ ] **Database** — MongoDB to store user profiles and incident reports

---

## 🗓️ Phase 2 — Smart Features (v0.3)

> Goal: Make DeshSafe intelligent and personalized

- [ ] **AI Action Plans** — Use an LLM API (Gemini / OpenAI) to generate personalized safety advice based on user health profile + current alert type
- [ ] **Interactive Crisis Map** — Leaflet.js map showing active incidents, shelters, and hospitals nearby
- [ ] **Push Notifications** — Browser push alerts when a new disaster warning is issued in user's area
- [ ] **Hindi Language Support** — Full UI translation in Hindi using i18n
- [ ] **Severity Scoring** — Algorithm that calculates personal risk score based on location + health profile
- [ ] **Volunteer Connect** — Let users mark themselves as available volunteers during a crisis

---

## 🗓️ Phase 3 — Community & Scale (v0.4)

> Goal: Build a community around crisis response

- [ ] **Community Reports Verification** — Upvote/downvote system to verify citizen-submitted incidents
- [ ] **Shelter & Resource Locator** — Database of cooling centers, flood shelters, blood banks by city
- [ ] **Emergency Contacts** — Save and alert personal emergency contacts during a crisis
- [ ] **Offline Mode** — PWA support so the app works without internet during power outages
- [ ] **SMS Alerts** — Twilio integration to send SMS alerts to users without smartphones
- [ ] **Admin Panel** — Dashboard for NGOs and government bodies to manage and verify reports

---

## 🗓️ Phase 4 — Mobile & Growth (v1.0)

> Goal: Reach every Indian citizen

- [ ] **React Native App** — Mobile app for Android and iOS
- [ ] **Multi-language Support** — Bengali, Tamil, Telugu, Marathi, and more
- [ ] **Government API Integration** — Direct partnership with IMD, NDMA for verified data
- [ ] **School & College Mode** — Safety drills and awareness content for institutions
- [ ] **Dark Mode** — Full dark theme support across all pages
- [ ] **Accessibility (a11y)** — Screen reader support, high contrast mode, keyboard navigation

---

## 💡 Ideas Under Consideration

- WhatsApp bot for disaster alerts (no app needed)
- Gamified safety quiz to educate users on disaster preparedness
- Crowdsourced road condition reporting during floods
- Integration with 112 India emergency number

---

## 🤝 Want to Contribute?

Pick any unchecked item above, open an issue, and start building!  
See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

All contributors will be credited in the README. 🙌

---

*Last updated: May 2026 · Maintained by [@Anushka-045](https://github.com/Anushka-045)*
