document.addEventListener('DOMContentLoaded', () => {
  // Dados das aulas educacionais
  const conteudos = [
    { titulo: "Aula 1 - Direção Defensiva", descricao: "Entenda os princípios da direção defensiva no trânsito.", link: "aula1.html" },
    { titulo: "Aula 2 - Primeiros Socorros", descricao: "Aprenda como agir em situações de emergência até a chegada do socorro.", link: "aula2.html" },
    { titulo: "Aula 3 - Sinalização de Trânsito", descricao: "Conheça os principais sinais e suas funções no trânsito.", link: "aula3.html" },
    { titulo: "Aula 4 - Álcool e Direção", descricao: "Veja os perigos e consequências de dirigir sob o efeito de álcool.", link: "aula4.html" }
  ];
  
  const containerAulas = document.getElementById("conteudos-educacionais");

  conteudos.forEach(aula => {
    const link = document.createElement("a");
    link.href = aula.link;
    link.style.textDecoration = "none";
    link.style.color = "inherit";

    const article = document.createElement("article");
    const h3 = document.createElement("h3");
    h3.textContent = aula.titulo;

    const p = document.createElement("p");
    p.textContent = aula.descricao;

    article.appendChild(h3);
    article.appendChild(p);
    link.appendChild(article);
    containerAulas.appendChild(link);
  });

  // Avaliação de Motoristas
  const estrelas = document.querySelectorAll('.estrela');
  let valorSelecionado = 0;

  estrelas.forEach(estrela => {
    estrela.addEventListener('click', () => {
      valorSelecionado = Number(estrela.dataset.valor);
      estrelas.forEach(e => e.classList.toggle('selecionada', e.dataset.valor <= valorSelecionado));
    });
  });

  const btnEnviar = document.getElementById('enviar-avaliacao');
  const listaAvaliacoes = document.getElementById('lista-avaliacoes');

  btnEnviar.addEventListener('click', () => {
    const nomeMotorista = document.getElementById('nomeMotorista').value;
    const comentario = document.getElementById('comentario').value;

    if (nomeMotorista.trim() && valorSelecionado > 0) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${nomeMotorista}</strong> — ${'⭐'.repeat(valorSelecionado)}<br>${comentario}`;
      listaAvaliacoes.appendChild(li);

      // limpa campos
      document.getElementById('nomeMotorista').value = '';
      document.getElementById('comentario').value = '';
      valorSelecionado = 0;
      estrelas.forEach(e => e.classList.remove('selecionada'));
    } else {
      alert('Preencha o nome e selecione uma avaliação.');
    }
  });
});