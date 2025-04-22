#co2-footprint-web

Webanwendung zur Darstellung und Filterung fiktiver CO₂-Emissionsdaten von Unternehmen – Projektarbeit

Dieses Projekt wurde im Rahmen der Fallstudie IPWA01-01 (Programmierung von Webanwendungsoberflächen) erstellt.
Ziel ist die Entwicklung einer responsiven Webseite, welche CO₂-Emissionsdaten fiktiver Unternehmen darstellt und filterbar macht.

#Features

    Übersichtliche Tabelle mit CO₂-Emissionen
    Filter- und Sortierfunktionen:
        Unternehmen, Land, Branche, Emissionsklasse
        Emissionen auf-/absteigend, alphabetisch
    Dynamisches Laden aus XML-Datei
    Pagination: Auswahl zwischen 10, 25 oder 50 Einträgen

##Stand (April 20, 2025)

    • Responsive Design für mobile Geräte umgesetzt (Media Query für max-width 450px)
    • Tabelle horizontal scrollbar auf kleinen Screens
    • Header in mobiler Ansicht optimiert (Logo und Navigation übereinander)
    • Footer bleibt fix unter der Seite, scrollt nicht mit Tabelle
    • Cleanes Layout für Desktop-Ansicht beibehalten
    • Header muss noch gefixt werden sieht noch nicht schön aus

##Stand (21.04.2025)

  • Offcanvas-Menü für die Navigation eingebaut (öffnet sich von rechts bei Klick auf das Burger-Menü)
  • Burger-Button nur in mobiler Ansicht sichtbar
  • Close-Button (✕) zum Schließen des Offcanvas-Menüs
  • Navigationslinks (Startseite, Über uns, Kontakt) werden im Menü vertikal und gut lesbar angezeigt
  • Desktop-Navigation bleibt wie gehabt sichtbar (Burger-Button + Menü werden dort automatisch ausgeblendet)


#Projektstruktur

├── index.html # Hauptseite der Anwendung ├── styles.css # Styling (Flexbox, Media Queries) ├── script.js # JavaScript-Logik (Datenverarbeitung) ├── daten.xml # Fiktive CO₂-Daten der Unternehmen └── README.md # Projektdokumentation
Technologien

    HTML5 – Strukturierung der Inhalte
    CSS3 – Visuelles Layout, Media Queries
    JavaScript (Vanilla) – Filter, Sortierung, Pagination
    XML – Datenhaltung für Unternehmensdaten
    VS Code + Live Server – Entwicklungsumgebung

#Hinweis

Dieses Projekt dient ausschließlich zu Demonstrations- und Lernzwecken.
Alle Daten sind fiktiv und nicht repräsentativ.

Ein Großteil der Grundstruktur (HTML-Layout, erstes CSS-Styling und grundlegende JavaScript-Funktionen) wurde bereits vorab lokal entwickelt. Die weiteren Funktionen wie das dynamische Einbinden von XML-Daten, die erweiterte Filterlogik, die Sortierung sowie die Pagination wurden darauf aufbauend Schritt für Schritt in diesem Repository ergänzt und dokumentiert.