const map = L.map('map').setView([-23.55052, -46.633308], 13); // São Paulo inicial

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let routeLayer;
let userMarker;
let watchId;

const apiKey = "5b3ce3597851110001cf6248dfab5e635474467b8043c2a84f9bc4a4";


async function geocode(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length === 0) {
        alert('Endereço não encontrado: ' + address);
        return null;
    }
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

async function calculateRoute() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const mode = document.getElementById('transportMode').value;

    const originCoords = await geocode(origin);
    const destinationCoords = await geocode(destination);

    if (!originCoords || !destinationCoords) return;

    const url = `https://api.openrouteservice.org/v2/directions/${mode}?api_key=${apiKey}&start=${originCoords[1]},${originCoords[0]}&end=${destinationCoords[1]},${destinationCoords[0]}`;

    const response = await fetch(url);
    const json = await response.json();

    const coords = json.features[0].geometry.coordinates;
    const latlngs = coords.map(coord => [coord[1], coord[0]]);

    if (routeLayer) {
        map.removeLayer(routeLayer);
    }

    routeLayer = L.polyline(latlngs, {color: 'blue', weight: 5}).addTo(map);
    map.fitBounds(routeLayer.getBounds());

    // Mostrar distância e duração
    const summary = json.features[0].properties.summary;
    const distance = (summary.distance / 1000).toFixed(2);
    const duration = (summary.duration / 60).toFixed(1);

    document.getElementById('routeInfo').innerHTML = `🛣️ Distância: <b>${distance} km</b> | ⏱️ Duração: <b>${duration} min</b>`;
}

function startTracking() {
    if (!navigator.geolocation) {
        alert('Geolocalização não suportada no seu navegador.');
        return;
    }

    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }

    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const {latitude, longitude} = position.coords;

            if (userMarker) {
                userMarker.setLatLng([latitude, longitude]);
            } else {
                userMarker = L.marker([latitude, longitude], {
                    title: 'Sua localização',
                    icon: L.icon({
                        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32]
                    })
                }).addTo(map);
            }
        },
        (error) => {
            alert('Erro ao obter localização: ' + error.message);
        },
        {
            enableHighAccuracy: true
        }
    );
}

function saveRoute() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const mode = document.getElementById('transportMode').value;

    if (origin && destination) {
        const savedRoutes = JSON.parse(localStorage.getItem('routes') || '[]');
        savedRoutes.push({origin, destination, mode});
        localStorage.setItem('routes', JSON.stringify(savedRoutes));
        alert('Rota salva com sucesso!');
    } else {
        alert('Preencha origem e destino antes de salvar.');
    }
}

// Autocomplete básico (sugestão simplificada)
['origin', 'destination'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('input', async () => {
        const value = input.value;
        if (value.length < 3) return;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`;
        const response = await fetch(url);
        const data = await response.json();

        const datalistId = id + 'List';
        let datalist = document.getElementById(datalistId);
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = datalistId;
            document.body.appendChild(datalist);
            input.setAttribute('list', datalistId);
        }
        datalist.innerHTML = '';
        data.slice(0, 5).forEach(item => {
            const option = document.createElement('option');
            option.value = item.display_name;
            datalist.appendChild(option);
        });
    });
});
