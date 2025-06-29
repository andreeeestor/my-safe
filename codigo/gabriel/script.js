const mapa = L.map('mapa').setView([-19.9227, -43.9451], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(mapa);

let marcador = null;
let editandoIndex = null;
let locais = [];

function adicionarMarcador(local) {
  const icone = L.divIcon({
    html: local.tipo === 'seguro' ? '✅' : '⚠️',
    className: 'map-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const marker = L.marker([local.lat, local.lng], { icon: icone }).addTo(mapa);
  marker.bindPopup(`<strong>${local.tipo.toUpperCase()}</strong><br>${local.descricao}`);
}

function carregarLocais() {
  locais = JSON.parse(localStorage.getItem("locais")) || [];

  // Se for a primeira vez, cria 10 locais iniciais
  if (locais.length === 0) {
    locais = [
      { tipo: "perigoso", nome: "Avenida Central", descricao: "Muitos acidentes com ciclistas", lat: -19.926, lng: -43.945 },
      { tipo: "seguro", nome: "Escola Estadual", descricao: "Local seguro para pedestres", lat: -19.924, lng: -43.935 },
      { tipo: "seguro", nome: "Praça da Liberdade", descricao: "Boa sinalização", lat: -19.933, lng: -43.939 },
      { tipo: "perigoso", nome: "Túnel Norte", descricao: "Pouca visibilidade", lat: -19.928, lng: -43.948 },
      { tipo: "seguro", nome: "Ciclovia Sul", descricao: "Segura para ciclistas", lat: -19.918, lng: -43.941 },
      { tipo: "perigoso", nome: "Rua sem calçada", descricao: "Perigo para pedestres", lat: -19.917, lng: -43.944 },
      { tipo: "seguro", nome: "Parque Municipal", descricao: "Espaço tranquilo para andar", lat: -19.921, lng: -43.951 },
      { tipo: "perigoso", nome: "Rodoviária", descricao: "Trânsito intenso e perigoso", lat: -19.915, lng: -43.938 },
      { tipo: "seguro", nome: "Shopping Center", descricao: "Boa iluminação", lat: -19.927, lng: -43.936 },
      { tipo: "perigoso", nome: "Esquina escura", descricao: "Falta de iluminação pública", lat: -19.916, lng: -43.949 }
    ];
    localStorage.setItem("locais", JSON.stringify(locais));
  }

  document.getElementById("locaisContainer").innerHTML = "";
  mapa.eachLayer(layer => {
    if (layer instanceof L.Marker && layer !== marcador) mapa.removeLayer(layer);
  });

  locais.forEach((local, index) => {
    adicionarMarcador(local);
    const li = document.createElement("li");
 li.innerHTML = `
  <strong>${local.tipo.toUpperCase()} - ${local.nome}</strong><br>
  ${local.descricao}<br>
  Localização: ${local.lat.toFixed(4)}, ${local.lng.toFixed(4)}<br>
  <button class="btn-editar" onclick="editarLocal(${index})">Editar</button>
  <button class="btn-remover" onclick="removerLocal(${index})">Remover</button>
`;

    document.getElementById("locaisContainer").appendChild(li);
  });
}

function filtrarLocais() {
  const filtro = document.getElementById("filtroTipo").value;
  mapa.eachLayer(layer => {
    if (layer instanceof L.Marker && layer !== marcador) mapa.removeLayer(layer);
  });

  locais.forEach(local => {
    if (filtro === "todos" || local.tipo === filtro) adicionarMarcador(local);
  });
}

document.getElementById("marcar").addEventListener("click", () => {
  mapa.once('click', function (e) {
    const tipo = document.getElementById("tipo").value;
    if (!tipo) {
      alert("Selecione o tipo de local antes de marcar.");
      return;
    }

    if (marcador) mapa.removeLayer(marcador);

    const icone = L.divIcon({
      html: tipo === 'seguro' ? '✅' : '⚠️',
      className: 'map-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    marcador = L.marker(e.latlng, { icon: icone }).addTo(mapa);

    document.getElementById("lat").value = e.latlng.lat;
    document.getElementById("lng").value = e.latlng.lng;
  });
});

document.getElementById("formRegistro").addEventListener("submit", function (e) {
  e.preventDefault();
  const tipo = document.getElementById("tipo").value;
  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao").value;
  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);

  if (!tipo || !nome || !descricao || isNaN(lat) || isNaN(lng)) {
    alert("Preencha todos os campos e marque a localização no mapa.");
    return;
  }

  const novoLocal = { tipo, nome, descricao, lat, lng };

  if (editandoIndex !== null) {
    locais[editandoIndex] = novoLocal;
    editandoIndex = null;
  } else {
    locais.push(novoLocal);
  }

  localStorage.setItem("locais", JSON.stringify(locais));
  e.target.reset();
  if (marcador) {
    mapa.removeLayer(marcador);
    marcador = null;
  }
  carregarLocais();
});

function removerLocal(index) {
  locais.splice(index, 1);
  localStorage.setItem("locais", JSON.stringify(locais));
  carregarLocais();
}

function editarLocal(index) {
  const local = locais[index];
  document.getElementById("tipo").value = local.tipo;
  document.getElementById("nome").value = local.nome;
  document.getElementById("descricao").value = local.descricao;
  document.getElementById("lat").value = local.lat;
  document.getElementById("lng").value = local.lng;
  editandoIndex = index;
  mapa.setView([local.lat, local.lng], 16);

  if (marcador) mapa.removeLayer(marcador);
  marcador = L.marker([local.lat, local.lng], {
    icon: L.divIcon({
      html: local.tipo === 'seguro' ? '✅' : '⚠️',
      className: 'map-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  }).addTo(mapa);
}

function buscarEndereco() {
  const endereco = document.getElementById("endereco").value;
  if (!endereco) return alert("Digite um endereço.");

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        mapa.setView([lat, lng], 16);
      } else {
        alert("Endereço não encontrado.");
      }
    })
    .catch(() => alert("Erro ao buscar o endereço."));
}

carregarLocais();

