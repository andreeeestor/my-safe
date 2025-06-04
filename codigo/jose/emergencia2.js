let editIndex = -1;

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formCaminhoneiro');
    form.addEventListener('submit', salvarCaminhoneiro);
    carregarCaminhoneiros();
});

function salvarCaminhoneiro(e) {
    e.preventDefault();

    const modelo = document.getElementById('modelo').value.trim();
    const ano = document.getElementById('ano').value.trim();
    const tipoCarga = document.getElementById('tipoCarga').value.trim();
    const rota = document.getElementById('rota').value.trim();
    const infoAdicional = document.getElementById('infoAdicional').value.trim();

    if (!modelo || !ano || !tipoCarga || !rota) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    if (ano < 0 || ano > 100) {
        alert("Ano inválido. Deve estar entre 0 e 100 Trabalhados.");
        return;
    }

    const caminhoneiro = { modelo, ano, tipoCarga, rota, infoAdicional };
    let lista = JSON.parse(localStorage.getItem('caminhoneiros')) || [];

    if (editIndex === -1) {
        lista.push(caminhoneiro);
    } else {
        lista[editIndex] = caminhoneiro;
        editIndex = -1;
        document.querySelector('button[type="submit"]').textContent = "Cadastrar";
    }

    localStorage.setItem('caminhoneiros', JSON.stringify(lista));
    document.getElementById('formCaminhoneiro').reset();
    carregarCaminhoneiros();
    document.getElementById('modelo').focus(); 
}

function carregarCaminhoneiros() {
    const tbody = document.querySelector('#tabelaCaminhoneiros tbody');
    tbody.innerHTML = '';

    const lista = JSON.parse(localStorage.getItem('caminhoneiros')) || [];

    lista.forEach((item, index) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${item.modelo}</td>
            <td>${item.ano}</td>
            <td>${item.tipoCarga}</td>
            <td>${item.rota}</td>
            <td>${item.infoAdicional}</td>
            <td>
                <button type="button" onclick="Ligaremergencia(${index})">Ligar</button>
                <button type="button" onclick="editarCaminhoneiro(${index})">Editar</button>
                <button type="button" onclick="excluirCaminhoneiro(${index})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function editarCaminhoneiro(index) {
    const lista = JSON.parse(localStorage.getItem('caminhoneiros')) || [];
    const item = lista[index];

    document.getElementById('modelo').value = item.modelo;
    document.getElementById('ano').value = item.ano;
    document.getElementById('tipoCarga').value = item.tipoCarga;
    document.getElementById('rota').value = item.rota;
    document.getElementById('infoAdicional').value = item.infoAdicional;

    editIndex = index;
    document.querySelector('button[type="submit"]').textContent = "Atualizar";
    document.getElementById('modelo').focus();
}

function excluirCaminhoneiro(index) {
    if (!confirm("Tem certeza que deseja excluir este contato de emergência?")) return;

    let lista = JSON.parse(localStorage.getItem('caminhoneiros')) || [];
    lista.splice(index, 1);
    localStorage.setItem('caminhoneiros', JSON.stringify(lista));
    carregarCaminhoneiros();
}
function Ligaremergencia(numero){
    const confirmar = confirm(`Você deseja ligar para ${numero}?`);
    if (cofirmar){
        window.location.href = `tel:${numero}`;
    }
}
