# co2-footprint-web
Webanwendung zur Darstellung und Filterung fiktiver CO₂-Emissionsdaten von Unternehmen –  Projektarbeit

Dieses Projekt wurde im Rahmen der Fallstudie IPWA01-01 (Programmierung von Webanwendungsoberflächen) erstellt.  
Ziel ist die Entwicklung einer responsiven Webseite, welche CO₂-Emissionsdaten fiktiver Unternehmen darstellt und filterbar macht.

## Features
- Übersichtliche **Tabelle** mit CO₂-Emissionen
- **Filter-** und **Sortierfunktionen**:
  - Unternehmen, Land, Branche, Emissionsklasse
  - Emissionen auf-/absteigend, alphabetisch
- Dynamisches **Laden aus XML-Datei**
- **Pagination**: Auswahl zwischen 10, 25 oder 50 Einträgen
- **Responsives Design** für Desktop und Mobile
- Schutz vor **Code Injection** durch sichere Eingabeverarbeitung

## Projektstruktur
├── index.html         # Hauptseite der Anwendung
├── styles.css         # Styling (Flexbox, Media Queries)
├── script.js          # JavaScript-Logik (Datenverarbeitung)
├── daten.xml          # Fiktive CO₂-Daten der Unternehmen
└── README.md          # Projektdokumentation

## Technologien

- **HTML5** – Strukturierung der Inhalte
- **CSS3** – Visuelles Layout, Media Queries
- **JavaScript (Vanilla)** – Filter, Sortierung, Pagination
- **XML** – Datenhaltung für Unternehmensdaten
- **VS Code + Live Server** – Entwicklungsumgebung

## Hinweis

Dieses Projekt dient ausschließlich zu **Demonstrations- und Lernzwecken**.  
Alle Daten sind fiktiv und nicht repräsentativ.