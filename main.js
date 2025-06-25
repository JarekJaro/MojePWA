const tableBody = document.querySelector("#countryTable tbody");
const searchInput = document.querySelector("#search");

let currentSort = { key: null, asc: true };
let allData = [];

// Format liczbowy z separatorem tysięcy
const formatNumber = (n, decimals = 0) => {
  return n.toLocaleString("pl-PL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Oblicz gęstość zaludnienia
const calculateDensity = (pop, land) => {
  return land ? (pop / land) : 0;
};

// Wygeneruj wiersze tabeli
function renderTable(filter = "", sortKey = null, asc = true) {
  tableBody.innerHTML = "";

  let filterL = filter.toLowerCase();

  let entries = allData
    .map(e => {
      const pop = e.population?.value ?? 0;
      const areaTotal = e.area?.total ?? 0;
      const areaLand = e.area?.land ?? 0;
      const density = calculateDensity(pop, areaLand);

      return {
        iso2: e.iso2,
        name: e.name,
        capital: e.capital ?? "",
        population: pop,
        area: areaTotal,
        land: areaLand,
        density,
        flag: e.flag ?? "",
        map: e.map ?? ""
      };
    })
    .filter(e => e.name.toLowerCase().includes(filterL) || e.capital.toLowerCase().includes(filterL));

  if (sortKey) {
    entries.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === "number" && typeof valB === "number") {
        return asc ? valA - valB : valB - valA;
      } else {
        return asc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      }
    });
  }

  for (const e of entries) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${e.flag}" alt="flaga"></td>
      <td>${e.name}<br><span class="small">${e.iso2}</span></td>
      <td>${e.capital}</td>
      <td>${formatNumber(e.population)}</td>
      <td>${formatNumber(e.area, e.area % 1 !== 0 ? 1 : 0)}</td>
      <td>${formatNumber(e.land, e.land % 1 !== 0 ? 1 : 0)}</td>
      <td>${formatNumber(e.density, 1)}</td>
      <td><a href="${e.map}" target="_blank">mapa</a></td>
    `;
    tableBody.appendChild(row);
  }
}

// Obsługa sortowania po kliknięciu nagłówka
document.querySelectorAll("th[data-sort]").forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    const isSame = currentSort.key === key;
    currentSort = {
      key,
      asc: isSame ? !currentSort.asc : true
    };
    renderTable(searchInput.value, currentSort.key, currentSort.asc);
  });
});

// Obsługa filtrowania
searchInput.addEventListener("input", () => {
  renderTable(searchInput.value, currentSort.key, currentSort.asc);
});

// Załaduj dane JSON i zainicjuj tabelę
fetch("all_countries.json")
  .then(response => response.json())
  .then(data => {
    allData = data;
    renderTable();
  })
  .catch(err => {
    console.error("Błąd ładowania danych:", err);
    tableBody.innerHTML = "<tr><td colspan='8'>Błąd ładowania danych</td></tr>";
  });
