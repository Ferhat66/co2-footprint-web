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
    window.onload = async () => {
        const xml = await ladeXMLDaten();
        console.log(xml); // Das siehst du in der Browser-Konsole
      };
      function zeigeTabelle(xml) {
        const eintraege = xml.getElementsByTagName("eintrag");
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
      
        Array.from(eintraege).forEach(eintrag => {
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
      
        const eintraege = xml.getElementsByTagName("eintrag");
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
      
        Array.from(eintraege).forEach(eintrag => {
          const name = eintrag.getElementsByTagName("name")[0].textContent;
          const land = eintrag.getElementsByTagName("land")[0].textContent;
          const branche = eintrag.getElementsByTagName("branche")[0].textContent;
          const emissionen = eintrag.getElementsByTagName("emissionen")[0].textContent;
          const klasse = eintrag.getElementsByTagName("klasse")[0].textContent;
      
          if (
            (companyFilter === "" || name.toLowerCase().includes(companyFilter)) &&
            (countryFilter === "" || land === countryFilter) &&
            (industryFilter === "" || branche === industryFilter) &&
            (searchInput === "" || klasse.toUpperCase().includes(searchInput))
          ) {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${name}</td>
              <td>${land}</td>
              <td>${branche}</td>
              <td>${emissionen}</td>
              <td>${klasse}</td>
            `;
            tbody.appendChild(row);
          }
        });
      }
      async function initialisiere() {
        const xml = await ladeXMLDaten();
        if (!xml) return;
      
        zeigeTabelle(xml);
        fuelleDropdown(xml, "name", "company");
        fuelleDropdown(xml, "land", "country");
        fuelleDropdown(xml, "branche", "industry");
      
        document.getElementById("company").addEventListener("input", () => filtereTabelle(xml));
        document.getElementById("country").addEventListener("change", () => filtereTabelle(xml));
        document.getElementById("industry").addEventListener("change", () => filtereTabelle(xml));
        document.getElementById("search").addEventListener("input", () => filtereTabelle(xml));
      }
      
      window.onload = initialisiere;