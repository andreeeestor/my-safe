document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const form = document.getElementById('denunciaForm');
    const tabela = document.querySelector('#tabelaDenuncias tbody');
    const btnCancelar = document.getElementById('cancelar');
    const inputImagem = document.getElementById('imagem');
    const imagemPreview = document.getElementById('imagemPreview');
    const btnBuscarUsuario = document.getElementById('btnBuscarUsuario');
    const resultadoBusca = document.getElementById('resultadoBusca');
    const inputBuscarUsuario = document.getElementById('buscarUsuario');
    const avaliacoesLista = document.getElementById('avaliacoesLista');
    const avaliacaoForm = document.getElementById('avaliacaoForm');
    const avaliacaoDenunciaId = document.getElementById('avaliacaoDenunciaId');
    const btnCancelarAvaliacao = document.getElementById('cancelarAvaliacao');
    const denunciaSelecionadaInfo = document.getElementById('denunciaSelecionadaInfo');
    const infoNome = document.getElementById('infoNome');
    const infoPlaca = document.getElementById('infoPlaca');
    const infoMotivo = document.getElementById('infoMotivo');
    const formAvaliacaoContainer = document.getElementById('formAvaliacaoContainer');

    // Inicializa localStorage se não existir
    if (!localStorage.getItem('denuncias')) {
        localStorage.setItem('denuncias', JSON.stringify([]));
    }
    if (!localStorage.getItem('avaliacoes')) {
        localStorage.setItem('avaliacoes', JSON.stringify([]));
    }

    let denunciaSelecionadaParaAvaliacao = null;

    // Mock de usuários cadastrados
    const usuariosCadastrados = [
        { id: '1', nome: 'João Silva', placa: 'ABC1234' },
        { id: '2', nome: 'Maria Souza', placa: 'XYZ5678' },
        { id: '3', nome: 'Carlos Oliveira', placa: 'DEF9012' },
        { id: '4', nome: 'Ana Santos', placa: 'GHI3456' }
    ];
    function formatarData(dataString) {
    if (!dataString) return '';
    try {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dataString).toLocaleDateString('pt-BR', options);
    } catch (e) {
        return dataString;
    }
}

    // Função para buscar usuário (mock)
    btnBuscarUsuario.addEventListener('click', buscarUsuario);
    
    function buscarUsuario() {
        const termo = inputBuscarUsuario.value.trim().toLowerCase();
        
        if (termo.length < 3) {
            resultadoBusca.innerHTML = '<p>Digite pelo menos 3 caracteres</p>';
            resultadoBusca.style.display = 'block';
            return;
        }
        
        // Simula delay de rede
        setTimeout(() => {
            // Filtra usuários onde o nome contém o termo buscado OU a placa 
            const resultados = usuariosCadastrados.filter(usuario => 
                usuario.nome.toLowerCase().includes(termo) || 
                usuario.placa.toLowerCase().includes(termo)
            );
            
            resultadoBusca.innerHTML = '';
            
            if (resultados.length === 0) {
                resultadoBusca.innerHTML = '<p>Nenhum usuário encontrado</p>';
            } else {
                resultados.forEach(usuario => {
                    const divUsuario = document.createElement('div');
                    divUsuario.className = 'usuario-encontrado';
                    divUsuario.innerHTML = `
                        <strong>${usuario.nome}</strong><br>
                        Placa: ${usuario.placa}
                    `;
                    divUsuario.addEventListener('click', function() {
                        document.getElementById('nome').value = usuario.nome;
                        document.getElementById('placa').value = usuario.placa;
                        resultadoBusca.style.display = 'none';
                        inputBuscarUsuario.value = '';
                    });
                    resultadoBusca.appendChild(divUsuario);
                });
            }
            
            resultadoBusca.style.display = 'block';
        }, 500);
    }

    // Fechar a busca quando clicar fora
    document.addEventListener('click', function(e) {
        if (!resultadoBusca.contains(e.target) && 
            e.target !== inputBuscarUsuario && 
            e.target !== btnBuscarUsuario) {
            resultadoBusca.style.display = 'none';
        }
    });
    
    // Modal para visualização de imagens
    const modal = document.createElement('div');
    modal.className = 'modal-imagem';
    modal.innerHTML = `
        <span class="fechar-modal">&times;</span>
        <img class="modal-conteudo" id="modalImagem">
    `;
    document.body.appendChild(modal);
    
    // Evento para fechar o modal
    modal.querySelector('.fechar-modal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Carrega as denúncias quando a página carrega
    carregarDenuncias();
    
    // Evento de submit do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        salvarDenuncia();
    });
    
    // Evento do botão cancelar
    btnCancelar.addEventListener('click', function() {
        form.reset();
        document.getElementById('id').value = '';
        imagemPreview.style.display = 'none';
        imagemPreview.innerHTML = '';
        resultadoBusca.style.display = 'none';
    });
    
    // Evento para visualização da imagem selecionada
    inputImagem.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                alert('Por favor, selecione um arquivo de imagem!');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                imagemPreview.innerHTML = `<img src="${event.target.result}" alt="Pré-visualização">`;
                imagemPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Função para salvar denúncia 
    function salvarDenuncia() {
        const id = document.getElementById('id').value;
        const denuncia = {
            nome: document.getElementById('nome').value,
            placa: document.getElementById('placa').value,
            motivo: document.getElementById('motivo').value,
            data: document.getElementById('data').value,
            usuarioId: null
        };
        
        // Verifica se é um usuário cadastrado
        const nomeBusca = denuncia.nome.toLowerCase();
        const usuario = usuariosCadastrados.find(u => 
            u.nome.toLowerCase() === nomeBusca || 
            u.placa === denuncia.placa
        );
        
        if (usuario) {
            denuncia.usuarioId = usuario.id;
        }
        
        let denuncias = pegarDenuncias();
        
        // Processar imagem
        const fileInput = document.getElementById('imagem');
        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                denuncia.imagem = e.target.result;
                finalizarSalvamento(id, denuncia, denuncias);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            if (id) {
                const denunciaExistente = denuncias.find(d => d.id == id);
                if (denunciaExistente && denunciaExistente.imagem) {
                    denuncia.imagem = denunciaExistente.imagem;
                }
            }
            finalizarSalvamento(id, denuncia, denuncias);
        }
    }
    
    function finalizarSalvamento(id, denuncia, denuncias) {
        if (id) {
            // Atualiza denúncia existente
            const index = denuncias.findIndex(d => d.id == id);
            if (index !== -1) {
                denuncias[index] = { ...denuncias[index], ...denuncia };
            }
        } else {
            // Adiciona nova denúncia
            denuncia.id = Date.now().toString();
            denuncias.push(denuncia);
        }
        
        localStorage.setItem('denuncias', JSON.stringify(denuncias));
        form.reset();
        document.getElementById('id').value = '';
        imagemPreview.style.display = 'none';
        imagemPreview.innerHTML = '';
        resultadoBusca.style.display = 'none';
        carregarDenuncias();
    }
    
    // Função para carregar denúncias na tabela
    function carregarDenuncias() {
        const denuncias = pegarDenuncias();
        tabela.innerHTML = '';
        
        denuncias.forEach(denuncia => {
            const tr = document.createElement('tr');
            tr.dataset.id = denuncia.id;
            
            // Imagem
            let imagemCell = '<td>Nenhuma imagem</td>';
            if (denuncia.imagem) {
                imagemCell = `
                    <td>
                        <img src="${denuncia.imagem}" class="imagem-miniatura" 
                             onclick="mostrarImagemModal('${denuncia.id}')">
                    </td>
                `;
            }
            
            // Verifica se há avaliações para esta denúncia
            const avaliacoes = pegarAvaliacoes().filter(a => a.denunciaId === denuncia.id);
            const temAvaliacoes = avaliacoes.length > 0;
            
            tr.innerHTML = `
                <td>${denuncia.nome} ${denuncia.usuarioId ? '✓' : ''}</td>
                <td>${denuncia.placa}</td>
                <td>${denuncia.motivo}</td>
                <td>${formatarData(denuncia.data)}</td>
                ${imagemCell}
                <td class="actions">
                    <button onclick="editarDenuncia('${denuncia.id}')">Editar</button>
                    <button onclick="excluirDenuncia('${denuncia.id}')">Excluir</button>
                    <button onclick="selecionarParaAvaliacao('${denuncia.id}')">
                        ${temAvaliacoes ? `Avaliações (${avaliacoes.length})` : 'Avaliar'}
                    </button>
                </td>
            `;
            
            tabela.appendChild(tr);
        });
    }
    
    // Função para selecionar denúncia para avaliação
    window.selecionarParaAvaliacao = function(id) {
        const denuncias = pegarDenuncias();
        denunciaSelecionadaParaAvaliacao = denuncias.find(d => d.id === id);
        
        if (denunciaSelecionadaParaAvaliacao) {
            // Atualiza informações da denúncia selecionada
            infoNome.textContent = denunciaSelecionadaParaAvaliacao.nome;
            infoPlaca.textContent = denunciaSelecionadaParaAvaliacao.placa;
            infoMotivo.textContent = denunciaSelecionadaParaAvaliacao.motivo;
            denunciaSelecionadaInfo.style.display = 'block';
            
            // Preenche o ID da denúncia no formulário de avaliação
            avaliacaoDenunciaId.value = denunciaSelecionadaParaAvaliacao.id;
            
            // Mostra o formulário de avaliação
            formAvaliacaoContainer.style.display = 'block';
            
            // Carrega as avaliações existentes
            carregarAvaliacoes(denunciaSelecionadaParaAvaliacao.id);
            
            // Rola até a seção de avaliações
            document.querySelector('.avaliacoes-container').scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    // Função para carregar avaliações
    function carregarAvaliacoes(denunciaId) {
        const avaliacoes = pegarAvaliacoes().filter(a => a.denunciaId === denunciaId);
        avaliacoesLista.innerHTML = '';
        
        if (avaliacoes.length === 0) {
            avaliacoesLista.innerHTML = '<p>Nenhuma avaliação encontrada para esta denúncia.</p>';
            return;
        }
        
        avaliacoes.forEach(avaliacao => {
            const divAvaliacao = document.createElement('div');
            divAvaliacao.className = 'avaliacao-item';
            
            let tipo = '';
            switch(avaliacao.tipo) {
                case 'vitima': tipo = 'Vítima'; break;
                case 'testemunha': tipo = 'Testemunha'; break;
                case 'autoridade': tipo = 'Autoridade'; break;
            }
            
            // Cria estrelas para a avaliação
            const estrelas = '★'.repeat(avaliacao.nota) + '☆'.repeat(5 - avaliacao.nota);
            
            divAvaliacao.innerHTML = `
                <h4>${avaliacao.nome}</h4>
                <div class="avaliacao-meta">
                    <span class="avaliacao-nota">${estrelas}</span> | 
                    <span>Tipo: ${tipo}</span> | 
                    <span>Data: ${formatarData(avaliacao.data)}</span>
                </div>
                <p>${avaliacao.comentario}</p>
            `;
            
            avaliacoesLista.appendChild(divAvaliacao);
        });
    }
    
    // Função para pegar avaliações do localStorage
    function pegarAvaliacoes() {
        const avaliacoes = localStorage.getItem('avaliacoes');
        return avaliacoes ? JSON.parse(avaliacoes) : [];
    }
    
    // Evento para o formulário de avaliação
    avaliacaoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!denunciaSelecionadaParaAvaliacao) {
            alert('Selecione uma denúncia para avaliar primeiro');
            return;
        }
        
        const avaliacao = {
            denunciaId: denunciaSelecionadaParaAvaliacao.id,
            nome: document.getElementById('avaliadorNome').value,
            tipo: document.getElementById('avaliadorTipo').value,
            nota: document.getElementById('avaliacaoNota').value,
            comentario: document.getElementById('avaliacaoComentario').value,
            data: new Date().toISOString()
        };
        
        // Validação básica
        if (!avaliacao.nome || !avaliacao.tipo || !avaliacao.nota) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }
        
        let avaliacoes = pegarAvaliacoes();
        avaliacoes.push(avaliacao);
        localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
        
        // Recarrega as avaliações
        carregarAvaliacoes(denunciaSelecionadaParaAvaliacao.id);
        
        // Limpa o formulário
        avaliacaoForm.reset();
        
        // Recarrega a tabela para atualizar o contador de avaliações
        carregarDenuncias();
        
        // Feedback ao usuário
        alert('Avaliação registrada com sucesso!');
    });
    
    // Evento para o botão cancelar avaliação
    btnCancelarAvaliacao.addEventListener('click', function() {
        avaliacaoForm.reset();
        avaliacaoDenunciaId.value = '';
    });
    
    // Função para pegar denúncias do localStorage
    function pegarDenuncias() {
        const denuncias = localStorage.getItem('denuncias');
        return denuncias ? JSON.parse(denuncias) : [];
    }
    
    // Função para formatar data 
    window.formatarData = function(dataString) {
        if (!dataString) return '';
        try {
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            return new Date(dataString).toLocaleDateString('pt-BR', options);
        } catch (e) {
            return dataString;
        }
    };
    
    // Função para editar denúncia 
    window.editarDenuncia = function(id) {
        const denuncias = pegarDenuncias();
        const denuncia = denuncias.find(d => d.id === id);
        
        if (denuncia) {
            document.getElementById('id').value = denuncia.id;
            document.getElementById('nome').value = denuncia.nome;
            document.getElementById('placa').value = denuncia.placa;
            document.getElementById('motivo').value = denuncia.motivo;
            document.getElementById('data').value = denuncia.data.split('T')[0];
            
            // Exibir imagem existente
            if (denuncia.imagem) {
                imagemPreview.innerHTML = `<img src="${denuncia.imagem}" alt="Pré-visualização">`;
                imagemPreview.style.display = 'block';
            } else {
                imagemPreview.style.display = 'none';
                imagemPreview.innerHTML = '';
            }
            
            // Rolagem até o formulário
            document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    // Função para excluir denúncia 
    window.excluirDenuncia = function(id) {
        if (confirm('Tem certeza que deseja excluir esta denúncia?')) {
            let denuncias = pegarDenuncias();
            denuncias = denuncias.filter(d => d.id !== id);
            localStorage.setItem('denuncias', JSON.stringify(denuncias));
            
            // Remove também as avaliações associadas
            let avaliacoes = pegarAvaliacoes();
            avaliacoes = avaliacoes.filter(a => a.denunciaId !== id);
            localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));
            
            carregarDenuncias();
            
            // Se a denúncia excluída era a selecionada para avaliação, limpa a seção
            if (denunciaSelecionadaParaAvaliacao && denunciaSelecionadaParaAvaliacao.id === id) {
                denunciaSelecionadaParaAvaliacao = null;
                denunciaSelecionadaInfo.style.display = 'none';
                formAvaliacaoContainer.style.display = 'none';
                avaliacoesLista.innerHTML = '<p>Selecione uma denúncia para ver ou adicionar avaliações.</p>';
            }
        }
    };
    
    // Função para mostrar imagem 
    window.mostrarImagemModal = function(id) {
        const denuncias = pegarDenuncias();
        const denuncia = denuncias.find(d => d.id === id);
        
        if (denuncia && denuncia.imagem) {
            const modalImagem = document.getElementById('modalImagem');
            modalImagem.src = denuncia.imagem;
            modal.style.display = 'block';
        }
    };
    
    // Fechar modal ao clicar fora da imagem
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});