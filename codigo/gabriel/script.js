// Inicializa o mapa centralizado em Belo Horizonte
let mapa = L.map('mapa').setView([-19.9227, -43.9451], 13);

// Camada base do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(mapa);

let marcador = null;

// Evento de clique no mapa
mapa.on('click', function (e) {
  const tipo = document.getElementById("tipo").value;

  if (!tipo) {
    alert("Selecione o tipo de local antes de marcar no mapa.");
    return;
  }

  // Remove o marcador anterior, se existir
  if (marcador) {
    mapa.removeLayer(marcador);
  }

  // Define a cor do marcador com base no tipo
  const cor = tipo === 'seguro' ? '00cc00' : 'cc0000';

  // Cria um novo marcador
  marcador = L.marker(e.latlng, {
    icon: L.icon({
      iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${cor}`,
      iconSize: [21, 34],
      iconAnchor: [10, 34]
    })
  }).addTo(mapa);

  // Atualiza os campos ocultos do formulário
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

        mapa.setView([lat, lon], 16); // aproxima o mapa

        if (marcador) {
          mapa.removeLayer(marcador);
        }

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

