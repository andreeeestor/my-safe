document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/avaliacoes';
    const listaAvaliacoes = document.getElementById('lista-avaliacoes');
    
    carregarAvaliacoes();

    // adiciona nova avaliação 
    document.getElementById('adicionar').addEventListener('click', function() {
        const nome = document.getElementById('nome').value;
        const nota = document.getElementById('nota').value;
        const comentario = document.getElementById('comentario').value;
        
        // validação dos campos
        if (!validarFormulario(nome, nota, comentario)) {
            return; 
        }

        const avaliacao = {
            nome: nome,
            tipo: document.getElementById('tipo').value,
            nota: parseInt(nota),
            comentario: comentario,
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
        })
        .catch(error => {
            console.error('Erro ao adicionar avaliação:', error);
            alert('Erro ao adicionar avaliação. Tente novamente.');
        });
    });

    // função de validação do formulário
    function validarFormulario(nome, nota, comentario) {
        let valido = true;
        
        document.querySelectorAll('.erro-validacao').forEach(el => el.remove());
        
        // validação do nome
        if (!nome || nome.trim() === '') {
            mostrarErro('nome', 'Por favor, informe seu nome');
            valido = false;
        }
        
        // validação da nota
        if (!nota || isNaN(nota) || nota < 1 || nota > 5) {
            mostrarErro('nota', 'Por favor, informe uma nota entre 1 e 5');
            valido = false;
        }
        
        return valido;
    }
    
    // Mostra mensagem de erro 
    function mostrarErro(campoId, mensagem) {
        const campo = document.getElementById(campoId);
        const erro = document.createElement('div');
        erro.className = 'erro-validacao';
        erro.style.color = 'red';
        erro.style.fontSize = '0.8em';
        erro.style.marginTop = '5px';
        erro.textContent = mensagem;
        campo.insertAdjacentElement('afterend', erro);
        
        // Destaca o campo inválido
        campo.style.border = '1px solid red';
        setTimeout(() => {
            campo.style.border = '';
        }, 3000);
    } // <-- Esta chave estava faltando no seu código original

    // carrega avaliações
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
