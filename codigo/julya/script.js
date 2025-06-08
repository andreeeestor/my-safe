document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const form = document.getElementById('denunciaForm');
    const denunciasList = document.getElementById('denuncias-list');
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const formTitle = document.getElementById('form-title');
    const saveBtn = document.getElementById('save-btn');
    
    // Variável para controle de edição
    let editingId = null;
    
    // Carrega denúncias ao iniciar
    loadDenuncias();
    
    // Eventos
    form.addEventListener('submit', handleSubmit);
    searchBtn.addEventListener('click', handleSearch);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Função para carregar denúncias
    function loadDenuncias(filter = '') {
        const denuncias = getDenuncias();
        denunciasList.innerHTML = '';
        
        if (denuncias.length === 0) {
            denunciasList.innerHTML = '<div class="message">Nenhuma denúncia registrada ainda.</div>';
            return;
        }
        
        // Aplica filtro se existir
        const filtered = filter 
            ? denuncias.filter(d => 
                d.nomeDenunciado.toLowerCase().includes(filter.toLowerCase()) || 
                d.placa.toLowerCase().includes(filter.toLowerCase()))
            : denuncias;
        
        if (filtered.length === 0) {
            denunciasList.innerHTML = '<div class="message">Nenhuma denúncia encontrada.</div>';
            return;
        }
        
      
        filtered.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Adiciona cada denúncia na lista
        filtered.forEach(denuncia => {
            const denunciaItem = document.createElement('div');
            denunciaItem.className = 'denuncia-item';
            
            denunciaItem.innerHTML = `
                <div class="denuncia-info nome">${denuncia.nomeDenunciado}</div>
                <div class="denuncia-info placa">${denuncia.placa}</div>
                <div class="denuncia-info motivo">${denuncia.motivo}</div>
                <div class="denuncia-info data">${formatDate(denuncia.data)}</div>
                <div class="actions-container">
                    <button class="warning" onclick="editDenuncia('${denuncia.id}')">Editar</button>
                    <button class="danger" onclick="deleteDenuncia('${denuncia.id}')">Excluir</button>
                </div>
            `;
            
            denunciasList.appendChild(denunciaItem);
        });
    }
    
    // Função para lidar com o envio do formulário
    function handleSubmit(e) {
        e.preventDefault();
        
        const denuncia = {
            id: editingId || Date.now().toString(),
            nomeDenunciado: document.getElementById('nomeDenunciado').value,
            placa: document.getElementById('placa').value,
            motivo: document.getElementById('motivo').value,
            descricao: document.getElementById('descricao').value,
            data: document.getElementById('data').value || new Date().toISOString()
        };
        
        saveDenuncia(denuncia);
        resetForm();
        loadDenuncias();
    }
    
    // Função para salvar denúncia no localStorage
    function saveDenuncia(denuncia) {
        const denuncias = getDenuncias();
        const index = denuncias.findIndex(d => d.id === denuncia.id);
        
        if (index >= 0) {
            // Atualiza denúncia existente
            denuncias[index] = denuncia;
        } else {
            // Adiciona nova denúncia
            denuncias.push(denuncia);
        }
        
        localStorage.setItem('denuncias', JSON.stringify(denuncias));
    }
    
    // Função para carregar denúncia no formulário para edição
    window.editDenuncia = function(id) {
        const denuncias = getDenuncias();
        const denuncia = denuncias.find(d => d.id === id);
        
        if (denuncia) {
            editingId = denuncia.id;
            formTitle.textContent = 'Editar Denúncia';
            saveBtn.textContent = 'Atualizar';
            
            document.getElementById('denunciaId').value = denuncia.id;
            document.getElementById('nomeDenunciado').value = denuncia.nomeDenunciado;
            document.getElementById('placa').value = denuncia.placa;
            document.getElementById('motivo').value = denuncia.motivo;
            document.getElementById('descricao').value = denuncia.descricao;
            document.getElementById('data').value = denuncia.data;
            
            // Rolagem suave até o formulário
            document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    // Função para excluir denúncia
    window.deleteDenuncia = function(id) {
        if (confirm('Tem certeza que deseja excluir esta denúncia?')) {
            const denuncias = getDenuncias().filter(d => d.id !== id);
            localStorage.setItem('denuncias', JSON.stringify(denuncias));
            loadDenuncias();
            
            if (editingId === id) {
                resetForm();
            }
        }
    };
    
    // Função para buscar denúncias
    function handleSearch() {
        const filter = searchInput.value.trim();
        loadDenuncias(filter);
    }
    
    // Função para resetar o formulário
    function resetForm() {
        form.reset();
        editingId = null;
        formTitle.textContent = 'Nova Denúncia';
        saveBtn.textContent = 'Salvar';
        document.getElementById('denunciaId').value = '';
        document.getElementById('data').value = '';
    }
    
    // Função auxiliar para obter denúncias do localStorage
    function getDenuncias() {
        return JSON.parse(localStorage.getItem('denuncias')) || [];
    }
    
    // Função para formatar data
    function formatDate(dateString) {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleString('pt-BR', options);
    }
});

// função para excluir avaliação
async function excluirAvaliacao(id) {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
        await fetch(`http://localhost:3000/avaliacoes/${id}`, {
            method: 'DELETE'
        });
        location.reload(); 
    }
}
