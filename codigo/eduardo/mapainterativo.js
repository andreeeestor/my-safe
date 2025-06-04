// === Inicialização do mapa ===
const map = L.map('map').setView([-23.5505, -46.6333], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let routeLayer = null;
let currentPositionMarker = null;
let watchId = null;
let originMarker = null;
let destinationMarker = null;

// Referências DOM
const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const btnTracking = document.getElementById('btnTracking');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');
const trackingStatus = document.getElementById('trackingStatus');
const routeInfo = document.getElementById('routeInfo');

// Contêiner para mensagens amigáveis (alertas)
function showMessage(text, type = 'danger', timeout = 4000) {
    // type pode ser: 'danger', 'success', 'warning', 'info'
    trackingStatus.style.display = 'inline';
    trackingStatus.textContent = text;
    trackingStatus.className = `text-${type} fw-semibold`;
    if (timeout > 0) {
        setTimeout(() => {
            trackingStatus.style.display = 'none';
        }, timeout);
    }
}

// === Função debounce para limitar chamadas da API ===
function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// === Função de autocomplete com Photon ===
function setupAutocomplete(input) {
    const container = document.createElement('div');
    container.classList.add('autocomplete-items');
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(container);

    // Loading spinner element
    const loading = document.createElement('div');
    loading.textContent = 'Carregando...';
    loading.style.padding = '8px 10px';
    loading.style.fontStyle = 'italic';

    async function fetchSuggestions(val) {
        if (!val) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = '';
        container.appendChild(loading);

        try {
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erro na busca');
            const data = await response.json();

            container.innerHTML = '';
            if (!data.features || data.features.length === 0) {
                const noResult = document.createElement('div');
                noResult.textContent = 'Nenhum resultado';
                noResult.style.fontStyle = 'italic';
                container.appendChild(noResult);
                return;
            }

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
        } catch (err) {
            container.innerHTML = '';
            const errorDiv = document.createElement('div');
            errorDiv.textContent = 'Erro ao buscar sugestões';
            errorDiv.style.color = 'red';
            container.appendChild(errorDiv);
        }
    }

    // Aplica debounce de 300ms
    input.addEventListener('input', debounce((e) => {
        fetchSuggestions(e.target.value);
    }, 300));

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
    try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na geocodificação');
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            const coord = data.features[0].geometry.coordinates;
            return { lat: coord[1], lon: coord[0] };
        }
        return null;
    } catch {
        return null;
    }
}

// === Calcular Rota ===
async function calculateRoute() {
    const origin = originInput.value.trim();
    const destination = destinationInput.value.trim();
    const transportMode = document.getElementById('transportMode').value;

    if (!origin || !destination) {
        showMessage("Preencha origem e destino.", "warning");
        return;
    }

    const origemCoords = getCoordinatesFromInput(originInput) || await geocode(origin);
    const destinoCoords = getCoordinatesFromInput(destinationInput) || await geocode(destination);

    if (!origemCoords || !destinoCoords) {
        showMessage("Não foi possível encontrar os endereços.", "danger");
        return;
    }

    const apiKey = "5b3ce3597851110001cf6248dfab5e635474467b8043c2a84f9bc4a4";

    const url = `https://api.openrouteservice.org/v2/directions/${transportMode}?api_key=${apiKey}&start=${origemCoords.lon},${origemCoords.lat}&end=${destinoCoords.lon},${destinoCoords.lat}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            showMessage("Erro ao buscar rota.", "danger");
            return;
        }

        const json = await response.json();
        const coords = json.features[0].geometry.coordinates.map(c => [c[1], c[0]]);

        // Remove rota anterior
        if (routeLayer) {
            map.removeLayer(routeLayer);
        }

        routeLayer = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
        map.fitBounds(routeLayer.getBounds());

        // Remove marcadores anteriores, se houver
        if (originMarker) {
            map.removeLayer(originMarker);
        }
        if (destinationMarker) {
            map.removeLayer(destinationMarker);
        }

        // Adiciona marcadores para origem e destino
        originMarker = L.marker([origemCoords.lat, origemCoords.lon], {title: "Origem"}).addTo(map).bindPopup("Origem");
        destinationMarker = L.marker([destinoCoords.lat, destinoCoords.lon], {title: "Destino"}).addTo(map).bindPopup("Destino");

        const distance = (json.features[0].properties.summary.distance / 1000).toFixed(2);
        const duration = (json.features[0].properties.summary.duration / 60).toFixed(1);

        routeInfo.textContent = `Distância: ${distance} km | Tempo estimado: ${duration} minutos`;

    } catch (err) {
        showMessage("Erro ao buscar rota.", "danger");
    }
}

// === Ativar/desativar rastreamento ===
function startTracking() {
    if (!navigator.geolocation) {
        showMessage("Geolocalização não suportada", "danger");
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

        btnTracking.classList.remove('btn-success');
        btnTracking.classList.add('btn-outline-success');

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
        showMessage("Erro ao obter localização", "danger");
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
    });

    btnIcon.className = "bi bi-geo-alt-fill text-success";
    btnText.textContent = "Parar Localização";

    btnTracking.classList.remove('btn-outline-success');
    btnTracking.classList.add('btn-success');
}

// === Eventos ===
document.getElementById('btnCalculate').addEventListener('click', calculateRoute);
btnTracking.addEventListener('click', startTracking);
