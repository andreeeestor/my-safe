//contatos emergencia
const contatosEmergencia = [
    { nome: "Polícia", numero: "190" },
    { nome: "Bombeiros", numero: "193" },
    { nome: "SAMU", numero: "192" }
];

function carregarPagina() {
    const container = document.getElementById("container");

    //botoes
    contatosEmergencia.forEach(contato => {
        const botao = document.createElement("button");
        botao.className = "btn-emergencia";
        botao.textContent = contato.nome;
        botao.onclick = () => confirmarEmergencia(contato.numero);
        container.appendChild(botao);
    });

    //mensagem automatica
    setTimeout(() => {
        document.getElementById("alerta-auto").textContent =
            "Se for um trote, você pode ser responsabilizado legalmente.";
    }, 2000);
}

//confirmação de ligação
function confirmarEmergencia(numero) {
    const confirmacao = confirm(`Você realmente deseja ligar para o número ${numero}?`);
    if (confirmacao) {
        window.location.href = `tel:${numero}`;
    }
}
