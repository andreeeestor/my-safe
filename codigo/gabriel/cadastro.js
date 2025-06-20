document.getElementById("form-cadastro").addEventListener("submit", (e) => {
  e.preventDefault();

  const login = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const existe = usuarios.find((u) => u.login === login);

  if (existe) {
    alert("Usuário já existe!");
    return;
  }

  usuarios.push({ login, senha });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Cadastro realizado com sucesso!");
  window.location.href = "login.html";
});
