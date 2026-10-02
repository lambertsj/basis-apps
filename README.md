# BasisApps.nl

*Sommige apps horen gewoon gratis te zijn.*

BasisApps is een nuchtere gids met Nederlandse apps die **gratis, reclamevrij en privacy-vriendelijk** zijn, plus het open keurmerk **Basis Certified**. De site is volledig statisch: pure HTML, Tailwind via CDN en vanilla JavaScript.

## Structuur

```text
basisapps/
├── index.html            # Landing page, manifest, showcase, keurmerk, aanmelden
├── apps.json             # "Database" met goedgekeurde apps
├── ideas.json            # Ideeën voor developers die nog niet weten wat ze bouwen
├── waarom/index.html     # Verhaal: waarom BasisApps bestaat
├── 404.html              # Pagina niet gevonden
├── badge.svg             # De Basis Certified badge
├── assets/
│   ├── js/app.js         # Laadt apps.json, zoekt en filtert
│   ├── js/ideas.js       # Laadt ideas.json en toont de ideeëntegels
│   ├── css/style.css     # Kleine aanvullingen op Tailwind
│   ├── fonts/            # Geist, zelf gehost
│   └── icons/            # App-iconen voor de kaarten
├── .github/ISSUE_TEMPLATE/
│   └── app_submission.md # Template voor nieuwe aanmeldingen
└── README.md
```

## Lokaal draaien

`apps.json` wordt met `fetch` geladen, dus openen via `file://` werkt niet. Start een lokale server:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Het manifest

Een app krijgt het keurmerk alleen als hij aan alle vijf voldoet:

1. Echt gratis: geen abonnement, geen in-app aankopen, geen betaalmuur.
2. Reclamevrij.
3. Geen trackers van derden en geen dataverkoop.
4. Gegevens blijven zoveel mogelijk op het toestel; wat wel verwerkt wordt, is duidelijk beschreven.
5. Transparant: aanmeldingen en beoordelingen zijn openbaar.

## Een app aanmelden

1. Open een issue met het template **App aanmelden**.
2. Een beheerder beoordeelt de aanmelding in het issue.
3. Bij goedkeuring wordt de app toegevoegd aan `apps.json` (via pull request) en mag de ontwikkelaar de badge gebruiken.

### Formaat van `apps.json`

Voeg een object toe aan `apps`:

```json
{
  "id": "mijn-app",
  "name": "Mijn App",
  "tagline": "Eén korte zin.",
  "description": "Een of twee zinnen over wat de app doet.",
  "category": "administratie",
  "platforms": ["iOS", "Android"],
  "icon": "assets/icons/mijn-app.jpg",
  "url": "https://apps.apple.com/... of https://play.google.com/...",
  "source": "https://github.com/...",
  "website": "https://...",
  "added": "2026-09-30"
}
```

- `platforms` toont de platformen op de kaart en maakt ze doorzoekbaar. De knop heet "Bekijk in App Store" of "Bekijk in Play Store", afhankelijk van de link in `url`.
- `category` moet een `id` zijn uit `categories` bovenaan het bestand.
- `url`, `source` en `website` mogen `null` of weggelaten zijn. Alleen `http(s)`-links worden getoond.
- `icon` is optioneel: een bestand in `assets/icons/` (vierkant, minimaal 512 px, zonder afgeronde hoeken). Zonder icoon toont de site een tegel met de beginletter. Icoon niet van een externe site inladen, dat zou bezoekers volgen.
- Alle tekst wordt als platte tekst weergegeven. HTML wordt niet uitgevoerd.

### Een idee toevoegen

Voeg een object toe aan `ideas` in `ideas.json`:

```json
{
  "id": "mijn-idee",
  "name": "Naam van het idee",
  "pitch": "Eén of twee zinnen over wat de app zou doen.",
  "effort": "weekend"
}
```

- `effort` is `weekend` of `paar-weekenden`.
- Een idee hoort bij een basisfunctie die past bij het manifest. Het mag geen app zijn die inkomsten uit gegevens of advertenties nodig heeft.

## De badge gebruiken

Alleen voor apps die in `apps.json` staan:

```html
<a href="https://basisapps.nl">
  <img src="https://basisapps.nl/badge.svg" alt="Basis Certified" width="200" height="48">
</a>
```

```md
[![Basis Certified](https://basisapps.nl/badge.svg)](https://basisapps.nl)
```

## Het groene stipje

Het groene stipje (`#166534`) is het herkenningsteken van BasisApps. Deelnemende apps mogen het op hun eigen app-icoon of in hun materiaal gebruiken, zolang de app aan de vijf afspraken voldoet. Ze mogen ook de term "Basis-app" gebruiken in titel, subtitel en beschrijving.

## Deployen op Cloudflare Pages

1. Zet de repository op GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** en kies de repository.
3. Instellingen:
   - Framework preset: **None**
   - Build command: *leeg laten*
   - Build output directory: `/`
4. Na de eerste deploy: **Custom domains** → voeg `basisapps.nl` toe en volg de DNS-stappen.
5. Elke push naar `main` deployt automatisch.

## Nog in te vullen

- De apps in `apps.json` hebben nog `url: null`. Vul de definitieve links in zodra ze bestaan.
