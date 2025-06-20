document.getElementById("form-login").addEventListener("submit", (e) => {
  e.preventDefault();

  const login = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const usuario = usuarios.find((u) => u.login === login && u.senha === senha);

  if (usuario) {
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    alert("Login realizado!");
    window.location.href = "index.html";
  } else {
    alert("Usuário ou senha inválidos!");
  }
});
