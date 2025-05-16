let mapa = L.map('mapa').setView([-19.9227, -43.9451], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(mapa);

let marcador = null;
let editandoIndex = null;

mapa.on('click', function (e) {
  const tipo = document.getElementById("tipo").value;
  if (!tipo) {
    alert("Selecione o tipo de local antes de marcar no mapa.");
    return;
  }

  if (marcador) mapa.removeLayer(marcador);

  const cor = tipo === 'seguro' ? '00cc00' : 'cc0000';

  marcador = L.marker(e.latlng, {
    icon: L.icon({
      iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${cor}`,
      iconSize: [21, 34],
      iconAnchor: [10, 34]
    })
  }).addTo(mapa);

  document.getElementById('lat').value = e.latlng.lat;
  document.getElementById('lng').value = e.latlng.lng;
});

function buscarEndereco() {
  const endereco = document.getElementById('endereco').value;
  if (!endereco) {
    alert("Digite um endereço.");
    return;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        mapa.setView([lat, lon], 16);

        if (marcador) mapa.removeLayer(marcador);

        const tipo = document.getElementById("tipo").value || "seguro";
        const cor = tipo === 'perigoso' ? 'cc0000' : '00cc00';

        marcador = L.marker([lat, lon], {
          icon: L.icon({
            iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${cor}`,
            iconSize: [21, 34],
            iconAnchor: [10, 34]
          })
        }).addTo(mapa);

        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lon;
      } else {
        alert("Endereço não encontrado.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao buscar o endereço.");
    });
}

const form = document.querySelector(".registro-form");
const locaisContainer = document.createElement("ul");
locaisContainer.id = "locaisContainer";
document.querySelector("main").appendChild(locaisContainer);

function carregarLocais() {
  const locais = JSON.parse(localStorage.getItem("locais")) || [];
  locaisContainer.innerHTML = "";

  locais.forEach((local, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${local.tipo.toUpperCase()} - ${local.nome}</strong><br>
      ${local.descricao}<br>
      Localização: ${local.lat.toFixed(4)}, ${local.lng.toFixed(4)}<br>
      <button onclick="editarLocal(${index})">Editar</button>
      <button onclick="removerLocal(${index})">Remover</button>
    `;
    locaisContainer.appendChild(li);
  });
}

function removerLocal(index) {
  const locais = JSON.parse(localStorage.getItem("locais")) || [];
  locais.splice(index, 1);
  localStorage.setItem("locais", JSON.stringify(locais));
  carregarLocais();
}

function editarLocal(index) {
  const locais = JSON.parse(localStorage.getItem("locais")) || [];
  const local = locais[index];

  document.getElementById("tipo").value = local.tipo;
  document.getElementById("nome").value = local.nome;
  document.getElementById("descricao").value = local.descricao;
  document.getElementById("lat").value = local.lat;
  document.getElementById("lng").value = local.lng;
  editandoIndex = index;

  const latlng = L.latLng(local.lat, local.lng);
  mapa.setView(latlng, 16);
  if (marcador) mapa.removeLayer(marcador);

  const cor = local.tipo === 'seguro' ? '00cc00' : 'cc0000';
  marcador = L.marker(latlng, {
    icon: L.icon({
      iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${cor}`,
      iconSize: [21, 34],
      iconAnchor: [10, 34]
    })
  }).addTo(mapa);
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao").value;
  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);

  if (!tipo || !nome || !descricao || isNaN(lat) || isNaN(lng)) {
    alert("Preencha todos os campos e clique no mapa para selecionar a localização.");
    return;
  }

  const novoLocal = { tipo, nome, descricao, lat, lng };
  const locais = JSON.parse(localStorage.getItem("locais")) || [];

  if (editandoIndex !== null) {
    locais[editandoIndex] = novoLocal;
    editandoIndex = null;
  } else {
    locais.push(novoLocal);
  }

  localStorage.setItem("locais", JSON.stringify(locais));
  form.reset();
  if (marcador) {
    mapa.removeLayer(marcador);
    marcador = null;
  }
  carregarLocais();
});

// Inicializa
carregarLocais();

