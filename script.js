let tuttiIProgetti = {};

fetch('progetti.json')
  .then(response => response.json())
  .then(progetti => {
    tuttiIProgetti = progetti;
    generaFiltri(progetti);
    mostraProgetti(progetti);
  });

function generaFiltri(progetti) {
  const materie = new Set();
  Object.values(progetti).flat().forEach(p => {
    materie.add(p.materia);
  });

  const materiaSelect = document.getElementById("materia-select");
  materie.forEach(m => materiaSelect.innerHTML += `<option value="${m}">${m}</option>`);

  materiaSelect.addEventListener("change", aggiornaProgetti);
  document.getElementById("search-input").addEventListener("input", aggiornaProgetti);
}

function aggiornaProgetti() {
  const materia = document.getElementById("materia-select").value;
  const testo = document.getElementById("search-input").value.toLowerCase();

  const filtrati = {};
  for (const [anno, lista] of Object.entries(tuttiIProgetti)) {
    filtrati[anno] = lista.filter(p =>
      (materia === "tutti" || p.materia === materia) &&
      p.titolo.toLowerCase().includes(testo)
    );
  }

  mostraProgetti(filtrati);
}

function mostraProgetti(progetti) {
  const container = document.getElementById("progetti-container");
  container.innerHTML = "";

  // Nascondi contenitore progetto teatro se presente
  const teatroContainer = document.getElementById("progetto-teatro");
  if (teatroContainer) {
    teatroContainer.style.display = "none";
    teatroContainer.innerHTML = "";
  }

  for (const [anno, lista] of Object.entries(progetti)) {
    if (lista.length === 0) continue;

    const annoDiv = document.createElement("div");
    annoDiv.classList.add("anno");
    annoDiv.innerHTML = `<h2>${anno}</h2>`;

    lista.forEach(progetto => {
      const pDiv = document.createElement("div");
      pDiv.classList.add("progetto");
      pDiv.innerHTML = `
        <strong>${progetto.titolo}</strong>
        <br><small>${progetto.materia}</small>
        <div class="progetto-details" style="display:none;">${progetto.descrizione}</div>
      `;

      pDiv.addEventListener('click', () => {
        if (progetto.titolo === "Gestione Teatro") {
          mostraPaginaTeatro();
        } else {
          apriModal(progetto);
        }
      });

      annoDiv.appendChild(pDiv);
    });

    container.appendChild(annoDiv);
  }
}

function mostraPaginaTeatro() {
  const teatroContainer = document.getElementById("progetto-teatro");
  if (!teatroContainer) return;

  teatroContainer.style.display = "block";
  teatroContainer.innerHTML = ""; // pulizia

  const style = `
    <style>
      #progetto-teatro table {
        border-collapse: collapse;
        width: 100%;
        margin-top: 10px;
        font-size: 14px;
      }
      #progetto-teatro th, #progetto-teatro td {
        border: 1px solid #999;
        padding: 6px 10px;
        text-align: left;
      }
      #progetto-teatro thead {
        background-color: #ddd;
      }
      #progetto-teatro tbody tr:nth-child(even) {
        background-color: #eee;
      }
      #progetto-teatro pre {
        background: #eaeaea;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 14px;
        white-space: pre-wrap;
      }
      #progetto-teatro h3 {
        margin-top: 25px;
        margin-bottom: 5px;
      }
    </style>
  `;
  teatroContainer.insertAdjacentHTML("beforeend", style);

  const queries = [
    {
      titolo: "Direttori degli spettacoli senza ripetizioni",
      sql: `SELECT DISTINCT Direttore FROM spettacoli;`,
      risultati: [
        { Direttore: "Galli" },
        { Direttore: "Rossi" },
        { Direttore: "Bianchi" }
      ]
    },
    {
      titolo: "Titolo opere con autore musica Viola o Stella",
      sql: `SELECT Titolo AS Titolo_Opera FROM Opere WHERE Autore_musica = "Viola" OR Autore_musica = "Stella";`,
      risultati: [
        { Titolo_Opera: "L'arcobaleno" },
        { Titolo_Opera: "La nuova alba" }
      ]
    },
    {
      titolo: "Autore musica e titolo opere prodotte prima del 2010 a Milano o Roma",
      sql: `SELECT Autore_musica, titolo FROM Opere WHERE Anno < 2010 AND Luogo_prima IN ("Milano", "Roma");`,
      risultati: [
        { Autore_musica: "Viola", titolo: "Opera A" },
        { Autore_musica: "Stella", titolo: "Opera B" }
      ]
    },
    {
      titolo: "Tutti gli spettacoli con relative opere",
      sql: `SELECT S.Titolo AS Spettacolo, O.Titolo AS Opera
FROM Spettacoli S
JOIN Opere O ON S.ID_Opera = O.ID;`,
      risultati: [
        { Spettacolo: "Spettacolo 1", Opera: "Opera A" },
        { Spettacolo: "Spettacolo 2", Opera: "Opera B" }
      ]
    },
    {
      titolo: "Numero spettacoli per ciascun direttore",
      sql: `SELECT Direttore, COUNT(*) AS Numero_Spettacoli
FROM Spettacoli
GROUP BY Direttore;`,
      risultati: [
        { Direttore: "Rossi", Numero_Spettacoli: 4 },
        { Direttore: "Bianchi", Numero_Spettacoli: 3 }
      ]
    },
    {
      titolo: "Media durata spettacoli per autore musica",
      sql: `SELECT O.Autore_musica, AVG(S.Durata) AS Media_Durata
FROM Spettacoli S
JOIN Opere O ON S.ID_Opera = O.ID
GROUP BY O.Autore_musica;`,
      risultati: [
        { Autore_musica: "Viola", Media_Durata: "110" },
        { Autore_musica: "Stella", Media_Durata: "95" }
      ]
    },
    {
      titolo: "Opere che non sono mai state rappresentate",
      sql: `SELECT Titolo FROM Opere
WHERE ID NOT IN (SELECT ID_Opera FROM Spettacoli);`,
      risultati: [
        { Titolo: "Opera C" }
      ]
    },
    {
      titolo: "Titoli opere con spettacoli superiori a 2 ore",
      sql: `SELECT O.Titolo
FROM Opere O
JOIN Spettacoli S ON O.ID = S.ID_Opera
WHERE S.Durata > 120;`,
      risultati: [
        { Titolo: "Opera Lunga" }
      ]
    },
    {
      titolo: "Ultimo spettacolo per ogni opera",
      sql: `SELECT O.Titolo, MAX(S.Data) AS Ultima_Data
FROM Opere O
JOIN Spettacoli S ON O.ID = S.ID_Opera
GROUP BY O.Titolo;`,
      risultati: [
        { Titolo: "L'arcobaleno", Ultima_Data: "2024-05-01" },
        { Titolo: "La nuova alba", Ultima_Data: "2023-12-20" }
      ]
    }
  ];

  let html = "";
  queries.forEach(q => {
    html += `
      <section>
        <h3>${q.titolo}</h3>
        <pre>${q.sql}</pre>
        ${generaTabella(q.risultati)}
      </section>
    `;
  });

  teatroContainer.insertAdjacentHTML("beforeend", html);
}


function generaTabella(dati) {
  if (!dati || dati.length === 0) return "<p>Nessun risultato.</p>";
  const colonne = Object.keys(dati[0]);
  let html = "<table><thead><tr>";
  colonne.forEach(col => {
    html += `<th>${col}</th>`;
  });
  html += "</tr></thead><tbody>";
  dati.forEach(row => {
    html += "<tr>";
    colonne.forEach(col => {
      html += `<td>${row[col]}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  return html;
}

function apriModal(progetto) {
  document.getElementById("modal-titolo").textContent = progetto.titolo;
  document.getElementById("modal-descrizione").textContent = progetto.descrizione;
  const link = document.getElementById("modal-github");
  if (progetto.github) {
    link.href = progetto.github;
    link.style.display = "inline";
    link.textContent = "Vedi su GitHub";
  } else {
    link.style.display = "none";
  }

  document.getElementById("modal").style.display = "flex";
}

document.getElementById("chiudi-modal").onclick = () => {
  document.getElementById("modal").style.display = "none";
};

window.onclick = (e) => {
  if (e.target.id === "modal") {
    document.getElementById("modal").style.display = "none";
  }
};
