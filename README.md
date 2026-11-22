# Filmvisarna 🎬

Filmvisarna är en responsiv biografwebbplats där besökare kan se filmer och visningstider, välja platser och boka biljetter online.

## Funktioner

- Visa filmer, trailers, skådespelare och visningstider
- Välja lediga stolar i en grafisk salongskarta
- Boka biljetter och få ett unikt bokningsnummer
- Välja biljettpris: vuxen 140 kr, pensionär 120 kr, barn 80 kr
- Se uppdateringar av stolarnas status i realtid
- Registrera konto, logga in och hantera egna bokningar

## Tekniker

**Frontend:** React, Vite och Tailwind CSS  
**Backend:** Node.js och Express  
**Databas:** MySQL  
**Övrigt:** Socket.IO

## Installation och start

För att köra projektet behövs Node.js, npm och tillgång till en konfigurerad MySQL-databas med projektets tabeller och data.

### 1. Klona projektet

```bash
git clone https://github.com/Maizer89/Grupp-E-Filmvisarna.git
cd Grupp-E-Filmvisarna
```

### 2. Konfigurera miljövariabler

Skapa filen `backend/.env` och fyll i de tillhandahållna anslutningsuppgifterna:

```env
DB_HOST=<databasens värd>
DB_PORT=<port>
DB_NAME=<databasnamn>
DB_USER=<användarnamn>
DB_PASSWORD=<lösenord>
SESSION_SECRET=<egen hemlig sträng>
```

Projektet är konfigurerat för att ansluta till en extern MySQL-databas. Ingen lokal MySQL-installation krävs när den befintliga databasen används.

**Viktigt:** `.env` innehåller känsliga uppgifter och ska inte versionshanteras eller laddas upp till GitHub.

### 3. Starta backend

Öppna en terminal i projektets rotmapp och kör:

```bash
cd backend
npm install
npm run dev
```

Backend körs på `http://localhost:3000`.

### 4. Starta frontend

Öppna en ny terminal i projektets rotmapp och kör:

```bash
cd frontend
npm install
npm run dev
```

Öppna adressen som visas i terminalen, vanligtvis `http://localhost:5173`.

Både frontend och backend behöver vara igång för att applikationen ska fungera.

## Bokningsflöde

Besökaren väljer film, visning, stolar och biljettyper. De valda stolarna reserveras tillfälligt i **10 minuter** medan bokningen slutförs. Efter bekräftelse får besökaren ett unikt bokningsnummer.

Betalning sker på biografen och hanteras inte på webbplatsen.

## Målgrupp

Filmvisarna riktar sig till **animeintresserade i alla åldrar**, från yngre besökare och familjer till vuxna som uppskattar japansk animation. Målet är att göra det enkelt för både nya och erfarna animefans att upptäcka filmer, läsa om handling och skådespelare, se trailers och hitta passande visningstider.

Webbplatsen är utformad för att vara lätt att använda oavsett tidigare erfarenhet av digital biljettbokning. Tydlig information om åldersgränser, biljettpriser och lediga sittplatser hjälper besökare att planera sitt biobesök. Den responsiva designen gör att bokningen fungerar på mobil, surfplatta och dator.

## Projektlänkar

- **GitHub:** https://github.com/Maizer89/Grupp-E-Filmvisarna
- **Figma-prototyp:** https://www.figma.com/design/DbX2ente8p7FDiqGTfDqG5/Untitled?node-id=0-1&p=f&t=LB208sZADYKpekxP-0

## Projektgrupp

Grupp E – Filmvisarna

Rasmus Billgren
Samira
Hosein Moustafa
