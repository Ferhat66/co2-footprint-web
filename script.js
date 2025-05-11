let anzahlProSeite = 10;
let aktuelleSeite = 1;
let gespeichertesXML = null;
let aktuelleSprache = "de";

function getUnternehmen(xml) {
  return xml.documentElement.getElementsByTagName("unternehmen")[0];
}
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

let gespeicherteTranslations = {};

async function ladeUndVerarbeiteTranslations() {
  const xml = await ladeXMLDaten();
  if (!xml) return;

  gespeichertesXML = xml;

  const translationsNode = xml.getElementsByTagName("translations")[0];
  if (!translationsNode) {
    console.error("Kein <translations>-Element gefunden!");
    return;
  }

  const sprachen = translationsNode.getElementsByTagName("language");
  Array.from(sprachen).forEach(languageNode => {
    const code = languageNode.getAttribute("code");
    gespeicherteTranslations[code] = {};

    Array.from(languageNode.children).forEach(item => {
      if (item.tagName === "sortOptions" || item.tagName === "footer") {
        gespeicherteTranslations[code][item.tagName] = {};
        Array.from(item.children).forEach(subitem => {
          gespeicherteTranslations[code][item.tagName][subitem.tagName] = subitem.textContent;
        });
      } else if (item.tagName === "about") {
        gespeicherteTranslations[code].about = {};
        Array.from(item.children).forEach(subitem => {
          gespeicherteTranslations[code].about[subitem.tagName] = subitem.textContent;
        });
      } else {
        gespeicherteTranslations[code][item.tagName] = item.textContent;
      }
    });
  });
}

function zeigeTabelle(xml) {
  const unternehmen = getUnternehmen(xml);
  const eintraege = Array.from(unternehmen.getElementsByTagName("eintrag")); 
  const gesamtSeiten = Math.ceil(eintraege.length / anzahlProSeite); 
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  const start = (aktuelleSeite - 1) * anzahlProSeite;
  const end = start + anzahlProSeite;
  const aktuelleEintraege = eintraege.slice(start, end);

  aktuelleEintraege.forEach(eintrag => {
    const name = eintrag.getElementsByTagName("name")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
    const land = eintrag.getElementsByTagName("land")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
    const branche = eintrag.getElementsByTagName("branche")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
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

  document.getElementById("pageInfo").textContent =
  `${gespeicherteTranslations[aktuelleSprache].pageText} ${aktuelleSeite} ${gespeicherteTranslations[aktuelleSprache].of} ${gesamtSeiten}`;
  document.getElementById("prevPage").disabled = aktuelleSeite === 1;
  document.getElementById("nextPage").disabled = aktuelleSeite === gesamtSeiten;

  window._aktuelleGefilterteDaten = Array.from(unternehmen.getElementsByTagName("eintrag"));
}
function aktualisiereSortDropdown(sprache) {
  const sortSelect = document.getElementById("sort");
  if (!sortSelect) return;

  const t = gespeicherteTranslations[sprache];
  if (!t || !t.sortOptions) return;

  const currentValue = sortSelect.value; 
  sortSelect.innerHTML = `
    <option value="emission-asc">${t.sortOptions.emissionAsc}</option>
    <option value="emission-desc">${t.sortOptions.emissionDesc}</option>
    <option value="name">${t.sortOptions.name}</option>
  `;
  sortSelect.value = currentValue;
}

function fuelleDropdown(xml, tagName, selectId) {
  const unternehmen = getUnternehmen(xml);
  const eintraege = Array.from(unternehmen.getElementsByTagName("eintrag"));
  const werteMap = new Map();

  eintraege.forEach(eintrag => {
    const el = eintrag.getElementsByTagName(tagName)[0];
    if (!el) return;

    const de = el.getElementsByTagName("de")[0]?.textContent || "";
    const en = el.getElementsByTagName("en")[0]?.textContent || "";
    const ar = el.getElementsByTagName("ar")[0]?.textContent || "";

    if (de) werteMap.set(de, { de, en, ar });
  });

  const select = document.getElementById(selectId);
  const vorherigerWert = select.value;

  const alleTexte = { de: "Alle", en: "All", ar: "الكل" };
  select.innerHTML = `<option value="">${alleTexte[aktuelleSprache]}</option>`;

  Array.from(werteMap.values())
    .sort((a, b) => (a[aktuelleSprache] || "").localeCompare(b[aktuelleSprache] || ""))
    .forEach(obj => {
      const opt = document.createElement("option");
      opt.value = obj[aktuelleSprache];
      opt.textContent = obj[aktuelleSprache]; 
      select.appendChild(opt);
    });

    if (vorherigerWert) {
      const selectedOption = Array.from(select.options).find(opt =>
        opt.value === vorherigerWert || opt.textContent === vorherigerWert
      );
      if (selectedOption) {
        select.value = selectedOption.value;
      }
    }
}
  function filtereTabelle(xml) {
    if (!xml) return;
    aktualisiereSprache(aktuelleSprache);
    const companyFilter = document.getElementById("company").value.toLowerCase();
    const countryFilter = document.getElementById("country").value;
    const industryFilter = document.getElementById("industry").value;
    const searchInput = document.getElementById("search").value.toUpperCase();
    const sortOption = document.getElementById("sort").value;

    const unternehmen = getUnternehmen(xml);
    const eintraege = Array.from(unternehmen.getElementsByTagName("eintrag"));
  
    let gefiltert = eintraege.filter(eintrag => {
      const name = eintrag.getElementsByTagName("name")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
      const land = eintrag.getElementsByTagName("land")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
      const branche = eintrag.getElementsByTagName("branche")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
      const klasse = eintrag.getElementsByTagName("klasse")[0].textContent;
      
      const landKey = eintrag.getElementsByTagName("land")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
      const brancheKey = eintrag.getElementsByTagName("branche")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";

      return (
        (companyFilter === "" || name.toLowerCase().includes(companyFilter)) &&
        (countryFilter === "" || landKey === countryFilter) &&
        (industryFilter === "" || brancheKey === industryFilter) &&
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
        const nameA = a.getElementsByTagName("name")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent.toLowerCase() || "";
        const nameB = b.getElementsByTagName("name")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });
    }
  
    aktuelleSeite = 1;
    zeigeGefilterteTabelle(gefiltert);
  }
      
    // 3. Tabelle anzeigen
  function zeigeGefilterteTabelle(gefiltert) {
    aktualisiereSprache(aktuelleSprache);
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
  
    const start = (aktuelleSeite - 1) * anzahlProSeite;
    const end = start + anzahlProSeite;
    const aktuelleEintraege = gefiltert.slice(start, end);
  
    aktuelleEintraege.forEach(eintrag => {
      const name = eintrag.getElementsByTagName("name")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
      const land = eintrag.getElementsByTagName("land")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
      const branche = eintrag.getElementsByTagName("branche")[0].getElementsByTagName(aktuelleSprache)[0]?.textContent || "";
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
    document.getElementById("pageInfo").textContent =
    `${gespeicherteTranslations[aktuelleSprache].pageText} ${aktuelleSeite} ${gespeicherteTranslations[aktuelleSprache].of} ${gesamtSeiten}`;
    document.getElementById("prevPage").disabled = aktuelleSeite === 1;
    document.getElementById("nextPage").disabled = aktuelleSeite === gesamtSeiten;
  
    // Für Paginierung merken
    window._aktuelleGefilterteDaten = gefiltert;
  }

  async function initialisiere() {
    if (!gespeichertesXML) return;
  
    fuelleDropdown(gespeichertesXML, "name", "company");
    fuelleDropdown(gespeichertesXML, "land", "country");
    fuelleDropdown(gespeichertesXML, "branche", "industry");

    zeigeTabelle(gespeichertesXML);
  
    document.getElementById("company").addEventListener("input", () => filtereTabelle(gespeichertesXML));
    document.getElementById("country").addEventListener("change", () => filtereTabelle(gespeichertesXML));
    document.getElementById("industry").addEventListener("change", () => filtereTabelle(gespeichertesXML));
    document.getElementById("search").addEventListener("input", () => filtereTabelle(gespeichertesXML));
    document.getElementById("sort").addEventListener("change", () => filtereTabelle(gespeichertesXML));
    document.getElementById("prevPage").addEventListener("click", () => {
      if (aktuelleSeite > 1) {
        aktuelleSeite--;
        zeigeGefilterteTabelle(window._aktuelleGefilterteDaten);
      }
    });
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
      filtereTabelle(gespeichertesXML);
    });
  }

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

  function aktualisiereSprache(sprache) {
    const t = gespeicherteTranslations[sprache];
    if (!t) {
      console.warn("Übersetzung nicht gefunden für Sprache:", sprache);
      return;
    }
  
    // Prüffunktion, die prüft ob Element da ist
    const setText = (selector, text) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = text;
    };
  
    // Navigation
    setText("#startseite-link", t.startseite);
    setText("#startseite-link-mobile", t.startseite);
    setText('a[href="ueber-uns.html"]', t.ueberuns);
    setText("#kontakt-link", t.kontakt);
  
    // Intro-Bereich (nur Startseite)
    setText("#intro h2", t.introTitle);
    setText("#intro p", t.introText);
  
    // Tabelle + Filter
    setText(".table-controls span", t.entriesUnit);
    setText('label[for="company"]', t.companyLabel);
    setText('label[for="country"]', t.countryLabel);
    setText('label[for="industry"]', t.industryLabel);
    setText('label[for="sort"]', t.sortLabel);
    setText('label[for="search"]', t.searchLabel);
    setText('label[for="entriesPerPage"]', t.entriesLabel);
  
    setText("#prevPage", t.prevButton);
    setText("#nextPage", t.nextButton);
  
    setText("#th-name", t.thName);
    setText("#th-land", t.thLand);
    setText("#th-branche", t.thBranche);
    setText("#th-emissionen", t.thEmissionen);
    setText("#th-klasse", t.thKlasse);
  
    // Footer (optional vorhanden)
    if (t.footer) {
      setText("#footer-impressum", t.footer.impressum);
      setText("#footer-datenschutz", t.footer.datenschutz);
      setText("#footer-kontakt", t.footer.kontakt);
      setText("#footer-hinweis", t.footer.hinweis);
    }
  }

  function aktualisiereSortDropdown(sprache) {
    const sortSelect = document.getElementById("sort");
    const currentValue = sortSelect.value;
    if (!sortSelect) return;
  
    const t = gespeicherteTranslations[sprache];
    if (!t || !t.sortOptions) return;


    sortSelect.innerHTML = `
      <option value="emission-asc">${t.sortOptions.emissionAsc}</option>
      <option value="emission-desc">${t.sortOptions.emissionDesc}</option>
      <option value="name">${t.sortOptions.name}</option>
    `;
    sortSelect.value = currentValue;
  }

  function aktualisiereUeberUnsTexte(sprache) {
    const t = gespeicherteTranslations[sprache];
  
    console.log("About:", t?.about);
    
    if (!t || !t.about) {
      console.warn("Keine Übersetzungen für 'Über uns' gefunden!");
      return;
    }
  
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
  
    setText("about-mission-title", t.about.missionTitle);
    setText("about-mission-text", t.about.missionText);
    setText("about-team-title", t.about.teamTitle);
    setText("about-team-text", t.about.teamText);
    setText("about-why-title", t.about.whyTitle);
    setText("about-why-text", t.about.whyText);
    setText("about-design-title", t.about.designTitle);
    setText("about-design-text", t.about.designText);
  }
  
  document.addEventListener("DOMContentLoaded", async () => {
    await ladeUndVerarbeiteTranslations();
    const select = document.getElementById("languageSwitcher");
    const gespeicherteSprache = localStorage.getItem("sprache");

    if (gespeicherteSprache) {
      aktuelleSprache = gespeicherteSprache;
      if (select) select.value = gespeicherteSprache;
    } else {
      aktuelleSprache = select?.value || "de";
      localStorage.setItem("sprache", aktuelleSprache);
    }
    document.documentElement.setAttribute("lang", aktuelleSprache);
    document.documentElement.setAttribute("dir", aktuelleSprache === "ar" ? "rtl" : "ltr");

    if (window.location.pathname.includes("ueber-uns.html")) {
      aktualisiereUeberUnsTexte(aktuelleSprache);
    } else {
    await initialisiere();
    }

  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeBtn = mobileMenu.querySelector(".close-btn");

  // Burger-Menü öffnen
  burger.addEventListener("click", () => {
    mobileMenu.classList.add("active");
    document.body.classList.add("offcanvas-open");
  });

  // Burger-Menü schließen
  closeBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    document.body.classList.remove("offcanvas-open");
  });

  // "Startseite"-Reset
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

        if (mobileMenu.classList.contains("active")) {
          mobileMenu.classList.remove("active");
          document.body.classList.remove("offcanvas-open");
        }
      });
    }
  });

  // Pop-up nach dem Absenden des Kontaktformulars
  const kontaktFormular = document.getElementById("kontaktformular");
  const popup = document.getElementById("success-popup");

  if (kontaktFormular && popup) {
    kontaktFormular.addEventListener("submit", (e) => {
      e.preventDefault();
      popup.classList.remove("popup-hidden");

      const popupClose = document.getElementById("popup-close");
      if (popupClose) {
        popupClose.onclick = () => {
          popup.classList.add("popup-hidden");
          kontaktFormular.reset();
        };
      }
    });
  }

  // Sprachumschalter
const languageSwitcher = document.getElementById("languageSwitcher");
if (languageSwitcher) {
  languageSwitcher.addEventListener("change", (e) => {
    // 1. Sprache setzen (ganz oben)
    aktuelleSprache = e.target.value;
    localStorage.setItem("sprache", aktuelleSprache);
    // 2. HTML-Attribute anpassen
    document.documentElement.setAttribute("lang", aktuelleSprache);
    document.documentElement.setAttribute("dir", aktuelleSprache === "ar" ? "rtl" : "ltr");

    // 3. Alle Texte aktualisieren
    aktualisiereSprache(aktuelleSprache);

    if (window.location.pathname.includes("ueber-uns.html")) {
      aktualisiereUeberUnsTexte(aktuelleSprache);
    } else {
      // 4. Dropdowns nach Sprache neu füllen
      fuelleDropdown(gespeichertesXML, "name", "company");
      fuelleDropdown(gespeichertesXML, "land", "country");
      fuelleDropdown(gespeichertesXML, "branche", "industry");
      
      // 5. Sort-Dropdown aktualisieren
      aktualisiereSortDropdown(aktuelleSprache);

      // 6. Tabelle neu laden oder filtern
      aktuelleSeite = 1;
      const company = document.getElementById("company").value;
      const country = document.getElementById("country").value;
      const industry = document.getElementById("industry").value;
      const search = document.getElementById("search").value;

      if (company || country || industry || search) {
        filtereTabelle(gespeichertesXML);
      } else {
        zeigeTabelle(gespeichertesXML);
      }
    }
  });
}
});