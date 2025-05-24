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
  const tipi = new Set();

  Object.values(progetti).flat().forEach(p => {
    materie.add(p.materia);
    tipi.add(p.tipo);
  });

  const materiaSelect = document.getElementById("materia-select");
  const tipoSelect = document.getElementById("tipo-select");

  materie.forEach(m => materiaSelect.innerHTML += `<option value="${m}">${m}</option>`);
  tipi.forEach(t => tipoSelect.innerHTML += `<option value="${t}">${t}</option>`);

  materiaSelect.addEventListener("change", aggiornaProgetti);
  tipoSelect.addEventListener("change", aggiornaProgetti);
  document.getElementById("search-input").addEventListener("input", aggiornaProgetti);
}

function aggiornaProgetti() {
  const materia = document.getElementById("materia-select").value;
  const tipo = document.getElementById("tipo-select").value;
  const testo = document.getElementById("search-input").value.toLowerCase();

  const filtrati = {};
  for (const [anno, lista] of Object.entries(tuttiIProgetti)) {
    filtrati[anno] = lista.filter(p =>
      (materia === "tutti" || p.materia === materia) &&
      (tipo === "tutti" || p.tipo === tipo) &&
      p.titolo.toLowerCase().includes(testo)
    );
  }

  mostraProgetti(filtrati);
}

function mostraProgetti(progetti) {
  const container = document.getElementById("progetti-container");
  container.innerHTML = "";

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
        <br><small>${progetto.materia} - ${progetto.tipo}</small>
        <div class="progetto-details" style="display:none;">${progetto.descrizione}</div>
      `;
      pDiv.addEventListener('click', () => apriModal(progetto));
      annoDiv.appendChild(pDiv);
    });

    container.appendChild(annoDiv);
  }
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
