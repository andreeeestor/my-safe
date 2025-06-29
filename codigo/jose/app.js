 let editIndex = -1;

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('formVeiculo').addEventListener('submit', salvarVeiculo);
        carregarVeiculos();
    });

    function salvarVeiculo(e) {
        e.preventDefault();

        const modelo = document.getElementById('modelo').value.trim();
        const ano = parseInt(document.getElementById('ano').value);
        const infoAdicional = document.getElementById('infoAdicional').value.trim();

        if (!modelo || !ano) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        if (ano < 1980 || ano > 2025) {
            alert("Ano inválido. Deve estar entre 1980 e 2025.");
            return;
        }

        const veiculo = { modelo, ano, infoAdicional };
        let lista = JSON.parse(localStorage.getItem('veiculos')) || [];

        if (editIndex === -1) {
            lista.push(veiculo);
        } else {
            lista[editIndex] = veiculo;
            editIndex = -1;
            document.querySelector('button[type="submit"]').textContent = "Cadastrar";
        }

        localStorage.setItem('veiculos', JSON.stringify(lista));
        document.getElementById('formVeiculo').reset();
        carregarVeiculos();
        document.getElementById('modelo').focus();
    }

    function carregarVeiculos() {
        const tbody = document.querySelector('#tabelaVeiculos tbody');
        tbody.innerHTML = '';

        const lista = JSON.parse(localStorage.getItem('veiculos')) || [];

        lista.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.modelo}</td>
                <td>${item.ano}</td>
                <td>${item.infoAdicional}</td>
                <td>
                    <button onclick="editarVeiculo(${index})">Editar</button>
                    <button onclick="excluirVeiculo(${index})">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function editarVeiculo(index) {
        const lista = JSON.parse(localStorage.getItem('veiculos')) || [];
        const item = lista[index];

        document.getElementById('modelo').value = item.modelo;
        document.getElementById('ano').value = item.ano;
        document.getElementById('infoAdicional').value = item.infoAdicional;

        editIndex = index;
        document.querySelector('button[type="submit"]').textContent = "Atualizar";
    }

    function excluirVeiculo(index) {
        if (!confirm("Tem certeza que deseja excluir este veículo?")) return;

        let lista = JSON.parse(localStorage.getItem('veiculos')) || [];
        lista.splice(index, 1);
        localStorage.setItem('veiculos', JSON.stringify(lista));
        carregarVeiculos();
    }
