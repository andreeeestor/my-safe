document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/avaliacoes';
    const listaAvaliacoes = document.getElementById('lista-avaliacoes');
   
    
    carregarAvaliacoes();


 // adiciona nova avaliação
    document.getElementById('adicionar').addEventListener('click', function() {
        const avaliacao = {
            nome: document.getElementById('nome').value,
            tipo: document.getElementById('tipo').value,
            nota: parseInt(document.getElementById('nota').value),
            comentario: document.getElementById('comentario').value,
            data: new Date().toISOString()
        };


        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(avaliacao)
        })
        .then(() => {
            limparFormulario();
            carregarAvaliacoes();
        });
    });


    //  carrega avaliações
    function carregarAvaliacoes() {
        fetch(API_URL)
            .then(response => response.json())
            .then(avaliacoes => {
                listaAvaliacoes.innerHTML = '';
                avaliacoes.forEach(avaliacao => {
                    const div = document.createElement('div');
                    div.className = 'avaliacao';
                    div.innerHTML = `
                    <p><strong>${avaliacao.nome}</strong> (${avaliacao.tipo})</p>
                    <p>Nota: ${'★'.repeat(avaliacao.nota)}${'☆'.repeat(5 - avaliacao.nota)}</p>
                    <p>${avaliacao.comentario}</p>
                    <p><small>${new Date(avaliacao.data).toLocaleString()}</small></p>
                    <button onclick="editarAvaliacao('${avaliacao.id}')">Editar</button>
                    <button onclick="excluirAvaliacao('${avaliacao.id}')">Excluir</button>
`;
                    listaAvaliacoes.appendChild(div);
                });
            });
    }


    // função para limpar formulário
    function limparFormulario() {
        document.getElementById('nome').value = '';
        document.getElementById('nota').value = '';
        document.getElementById('comentario').value = '';
    }
});


// funções para editar e excluir
function editarAvaliacao(id) {
    const novoNome = prompt('Novo nome:');
    if (novoNome) {
        fetch(`http://localhost:3000/avaliacoes/${id}`)
            .then(response => response.json())
            .then(avaliacao => {
                avaliacao.nome = novoNome;
                return fetch(`http://localhost:3000/avaliacoes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(avaliacao)
                });
            })
            .then(() => location.reload());
    }
}


// função para excluir avaliação
async function excluirAvaliacao(id) {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
        await fetch(`http://localhost:3000/avaliacoes/${id}`, {
            method: 'DELETE'
        });
        location.reload(); 
    }
}
