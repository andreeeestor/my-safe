// === Inicialização do mapa ===
const map = L.map('map').setView([-23.5505, -46.6333], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let routeLayer = null;
let currentPositionMarker = null;
let watchId = null;

// Referências DOM
const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const btnTracking = document.getElementById('btnTracking');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');
const trackingStatus = document.getElementById('trackingStatus');
const routeInfo = document.getElementById('routeInfo');
const btnClear = document.getElementById('btnClear');

// === função de autocomplete com photon ===
function setupAutocomplete(input) {
    const container = document.createElement('div');
    container.classList.add('autocomplete-items');
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(container);

    input.addEventListener('input', async () => {
        const val = input.value;
        if (!val) {
            container.innerHTML = '';
            return;
        }

        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5`;
        const response = await fetch(url);
        const data = await response.json();

        container.innerHTML = '';
        data.features.forEach(item => {
            const label = item.properties.name + 
                (item.properties.city ? ', ' + item.properties.city : '') + 
                (item.properties.country ? ', ' + item.properties.country : '');
            
            const div = document.createElement('div');
            div.textContent = label;
            div.addEventListener('click', () => {
                input.value = label;
                input.dataset.lat = item.geometry.coordinates[1];
                input.dataset.lon = item.geometry.coordinates[0];
                container.innerHTML = '';
            });
            container.appendChild(div);
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target !== input) {
            container.innerHTML = '';
        }
    });
}

setupAutocomplete(originInput);
setupAutocomplete(destinationInput);

// === Obter coordenadas do input (se selecionado do autocomplete) ===
function getCoordinatesFromInput(input) {
    const lat = input.dataset.lat;
    const lon = input.dataset.lon;
    if (lat && lon) {
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
    return null;
}

// === Função fallback para geocodificar ===
async function geocode(query) {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
        const coord = data.features[0].geometry.coordinates;
        return { lat: coord[1], lon: coord[0] };
    }
    return null;
}

// === Calcular Rota ===
async function calculateRoute() {
    const origin = originInput.value.trim();
    const destination = destinationInput.value.trim();
    const transportMode = document.getElementById('transportMode').value;

    if (!origin || !destination) {
        alert("Preencha origem e destino.");
        return;
    }

    const origemCoords = getCoordinatesFromInput(originInput) || await geocode(origin);
    const destinoCoords = getCoordinatesFromInput(destinationInput) || await geocode(destination);

    if (!origemCoords || !destinoCoords) {
        alert("Não foi possível encontrar os endereços.");
        return;
    }

    const apiKey = "5b3ce3597851110001cf6248dfab5e635474467b8043c2a84f9bc4a4";

    const url = `https://api.openrouteservice.org/v2/directions/${transportMode}?api_key=${apiKey}&start=${origemCoords.lon},${origemCoords.lat}&end=${destinoCoords.lon},${destinoCoords.lat}`;

    const response = await fetch(url);
    if (!response.ok) {
        alert("Erro ao buscar rota.");
        return;
    }

    const json = await response.json();
    const coords = json.features[0].geometry.coordinates.map(c => [c[1], c[0]]);

    if (routeLayer) {
        map.removeLayer(routeLayer);
    }

    routeLayer = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
    map.fitBounds(routeLayer.getBounds());

    const distance = (json.features[0].properties.summary.distance / 1000).toFixed(2);
    const duration = (json.features[0].properties.summary.duration / 60).toFixed(1);

    routeInfo.textContent = `Distância: ${distance} km | Tempo estimado: ${duration} minutos`;
}

// ===limpar rota ===
function clearRoute() {
    if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
    }
    routeInfo.textContent = '';
}

// === Ativar/desativar rastreamento ===
function startTracking() {
    if (!navigator.geolocation) {
        trackingStatus.style.display = 'inline';
        trackingStatus.textContent = "Geolocalização não suportada";
        trackingStatus.className = "text-danger fw-semibold";
        return;
    }

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        if (currentPositionMarker) {
            map.removeLayer(currentPositionMarker);
            currentPositionMarker = null;
        }

        btnIcon.className = "bi bi-geo-alt";
        btnText.textContent = "Ativar Localização";
        trackingStatus.style.display = 'none';
        return;
    }

    watchId = navigator.geolocation.watchPosition(position => {
        const { latitude, longitude } = position.coords;

        if (currentPositionMarker) {
            currentPositionMarker.setLatLng([latitude, longitude]);
        } else {
            currentPositionMarker = L.marker([latitude, longitude]).addTo(map)
                .bindPopup('Você está aqui').openPopup();
        }

        map.setView([latitude, longitude], 15);

        trackingStatus.style.display = 'inline';
        trackingStatus.textContent = "Localização ativa";
        trackingStatus.className = "text-success fw-semibold";

    }, error => {
        trackingStatus.style.display = 'inline';
        trackingStatus.textContent = "Erro ao obter localização";
        trackingStatus.className = "text-danger fw-semibold";
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    });

    btnIcon.className = "bi bi-geo-alt-fill text-success";
    btnText.textContent = "Parar Localização";
}

// === Eventos ===
document.getElementById('btnCalculate').addEventListener('click', calculateRoute);
btnTracking.addEventListener('click', startTracking);
btnClear.addEventListener('click', clearRoute);
