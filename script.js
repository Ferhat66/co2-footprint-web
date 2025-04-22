let anzahlProSeite = 10;
let aktuelleSeite = 1;
let gespeichertesXML = null;

async function ladeXMLDaten() {
    try {
      const response = await fetch("daten.xml");
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");
      return xml;
    } catch (error) {
      console.error("Fehler beim Laden der XML-Datei:", error);
      return null;
    }
}
function zeigeTabelle(xml) {
  const eintraege = Array.from(xml.getElementsByTagName("eintrag"));
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  const start = (aktuelleSeite - 1) * anzahlProSeite;
  const end = start + anzahlProSeite;
  const aktuelleEintraege = eintraege.slice(start, end);

  aktuelleEintraege.forEach(eintrag => {
    const name = eintrag.getElementsByTagName("name")[0].textContent;
    const land = eintrag.getElementsByTagName("land")[0].textContent;
    const branche = eintrag.getElementsByTagName("branche")[0].textContent;
    const emissionen = eintrag.getElementsByTagName("emissionen")[0].textContent;
    const klasse = eintrag.getElementsByTagName("klasse")[0].textContent;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${name}</td>
      <td>${land}</td>
      <td>${branche}</td>
      <td>${emissionen}</td>
      <td>${klasse}</td>
    `;
    tbody.appendChild(row);
  });

  const gesamtSeiten = Math.ceil(eintraege.length / anzahlProSeite);
  document.getElementById("pageInfo").textContent = `Seite ${aktuelleSeite} von ${gesamtSeiten}`;
  document.getElementById("prevPage").disabled = aktuelleSeite === 1;
  document.getElementById("nextPage").disabled = aktuelleSeite === gesamtSeiten;
}
      function fuelleDropdown(xml, tagName, selectId) {
        const eintraege = xml.getElementsByTagName("eintrag");
        const werteSet = new Set();
      
        Array.from(eintraege).forEach(eintrag => {
          const wert = eintrag.getElementsByTagName(tagName)[0].textContent;
          werteSet.add(wert);
        });
      
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Alle</option>';
        werteSet.forEach(wert => {
          const option = document.createElement("option");
          option.value = wert;
          option.textContent = wert;
          select.appendChild(option);
        });
      }
      function filtereTabelle(xml) {
        const companyFilter = document.getElementById("company").value.toLowerCase();
        const countryFilter = document.getElementById("country").value;
        const industryFilter = document.getElementById("industry").value;
        const searchInput = document.getElementById("search").value.toUpperCase();
        const sortOption = document.getElementById("sort").value;
      
        const eintraege = Array.from(xml.getElementsByTagName("eintrag"));
      
        // 1. Filtern
        let gefiltert = eintraege.filter(eintrag => {
          const name = eintrag.getElementsByTagName("name")[0].textContent;
          const land = eintrag.getElementsByTagName("land")[0].textContent;
          const branche = eintrag.getElementsByTagName("branche")[0].textContent;
          const klasse = eintrag.getElementsByTagName("klasse")[0].textContent;
      
          return (
            (companyFilter === "" || name.toLowerCase().includes(companyFilter)) &&
            (countryFilter === "" || land === countryFilter) &&
            (industryFilter === "" || branche === industryFilter) &&
            (searchInput === "" || klasse.toUpperCase().includes(searchInput))
          );
        });
      
        // 2. Sortieren
        if (sortOption === "emission-asc" || sortOption === "emission-desc") {
          gefiltert.sort((a, b) => {
            const emA = parseInt(a.getElementsByTagName("emissionen")[0].textContent);
            const emB = parseInt(b.getElementsByTagName("emissionen")[0].textContent);
            return sortOption === "emission-asc" ? emA - emB : emB - emA;
          });
        }
      
        if (sortOption === "name") {
          gefiltert.sort((a, b) => {
            const nameA = a.getElementsByTagName("name")[0].textContent.toLowerCase();
            const nameB = b.getElementsByTagName("name")[0].textContent.toLowerCase();
            return nameA.localeCompare(nameB);
          });
        }
      
        // 3. Tabelle anzeigen
        aktuelleSeite = 1;
        zeigeGefilterteTabelle(gefiltert);
      }
      function zeigeGefilterteTabelle(gefiltert) {
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
      
        const start = (aktuelleSeite - 1) * anzahlProSeite;
        const end = start + anzahlProSeite;
        const aktuelleEintraege = gefiltert.slice(start, end);
      
        aktuelleEintraege.forEach(eintrag => {
          const name = eintrag.getElementsByTagName("name")[0].textContent;
          const land = eintrag.getElementsByTagName("land")[0].textContent;
          const branche = eintrag.getElementsByTagName("branche")[0].textContent;
          const emissionen = eintrag.getElementsByTagName("emissionen")[0].textContent;
          const klasse = eintrag.getElementsByTagName("klasse")[0].textContent;
      
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${name}</td>
            <td>${land}</td>
            <td>${branche}</td>
            <td>${emissionen}</td>
            <td>${klasse}</td>
          `;
          tbody.appendChild(row);
        });
      
        const gesamtSeiten = Math.ceil(gefiltert.length / anzahlProSeite);
        document.getElementById("pageInfo").textContent = `Seite ${aktuelleSeite} von ${gesamtSeiten}`;
        document.getElementById("prevPage").disabled = aktuelleSeite === 1;
        document.getElementById("nextPage").disabled = aktuelleSeite === gesamtSeiten;
      
        // Speicher die aktuellen Filterdaten für Pagination-Buttons
        window._aktuelleGefilterteDaten = gefiltert;
      }
      async function initialisiere() {
        const xml = await ladeXMLDaten();
        if (!xml) return;
      
        gespeichertesXML = xml;
      
        zeigeTabelle(xml);
        fuelleDropdown(xml, "name", "company");
        fuelleDropdown(xml, "land", "country");
        fuelleDropdown(xml, "branche", "industry");
      
        document.getElementById("company").addEventListener("input", () => filtereTabelle(xml));
        document.getElementById("country").addEventListener("change", () => filtereTabelle(xml));
        document.getElementById("industry").addEventListener("change", () => filtereTabelle(xml));
        document.getElementById("search").addEventListener("input", () => filtereTabelle(xml));
      
        // ➕ Neue Zeilen für Einträge-Dropdown
        document.getElementById("prevPage").addEventListener("click", () => {
          if (aktuelleSeite > 1) {
            aktuelleSeite--;
            zeigeGefilterteTabelle(window._aktuelleGefilterteDaten);
          }
        });
        document.getElementById("sort").addEventListener("change", () => filtereTabelle(xml));
        document.getElementById("nextPage").addEventListener("click", () => {
          const eintraege = window._aktuelleGefilterteDaten;
          const gesamtSeiten = Math.ceil(eintraege.length / anzahlProSeite);
          if (aktuelleSeite < gesamtSeiten) {
            aktuelleSeite++;
            zeigeGefilterteTabelle(eintraege);
          }
        });
        document.getElementById("entriesPerPage").addEventListener("change", (e) => {
          anzahlProSeite = parseInt(e.target.value);
          aktuelleSeite = 1;
          filtereTabelle(xml);
        });
      }
      
      window.onload = initialisiere;
      function resetFilters() {
        document.getElementById("company").value = "";
        document.getElementById("country").value = "";
        document.getElementById("industry").value = "";
        document.getElementById("search").value = "";
        document.getElementById("sort").value = "emission-asc";
        document.getElementById("entriesPerPage").value = "10";
        anzahlProSeite = 10;
        aktuelleSeite = 1;
      
        if (gespeichertesXML) {
          filtereTabelle(gespeichertesXML);
        }
      }
      
      document.addEventListener("DOMContentLoaded", () => {
        const burger = document.querySelector(".burger");
        const mobileMenu = document.getElementById("mobileMenu");
        const closeBtn = mobileMenu.querySelector(".close-btn");
      
        // Burger-Öffnen
        burger.addEventListener("click", () => {
          mobileMenu.classList.add("active");
          document.body.classList.add("offcanvas-open");
        });
      
        // Burger-Schließen
        closeBtn.addEventListener("click", () => {
          mobileMenu.classList.remove("active");
          document.body.classList.remove("offcanvas-open");
        });
      
        // Alle "Startseite"-Elemente & Logo verlinken
        const resetTrigger = [
          document.getElementById("startseite-link"),
          document.getElementById("startseite-link-mobile"),
          document.getElementById("logo-title")
        ];
      
        resetTrigger.forEach((el) => {
          if (el) {
            el.addEventListener("click", (e) => {
              e.preventDefault();
              resetFilters();
      
              // Offcanvas-Menü ggf. schließen
              if (mobileMenu.classList.contains("active")) {
                mobileMenu.classList.remove("active");
                document.body.classList.remove("offcanvas-open");
              }
            });
          }
        });
      });