function confirmarEmergencia() {
    const confirmacao = confirm("Você realmente deseja ligar para o serviço de emergência?");

    if (confirmacao) {
        window.location.href = "tel:190";
    }
}