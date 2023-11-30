// Array para armazenar as URLs das fotos tiradas
const fotosTiradas = [];

// registrando a service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg;
      reg = await navigator.serviceWorker.register('/sw.js', { type: 'module' });

      console.log('Service worker registrada! 😎', reg);
    } catch (err) {
      console.log('😥 Service worker registro falhou: ', err);
    }
  });
}

// configurando as constraintes do video stream
var constraints = { video: { facingMode: 'user' }, audio: false };

// capturando os elementos em tela
const cameraView = document.querySelector('#camera--view'),
  cameraOutput = document.querySelector('#camera--output'),
  cameraSensor = document.querySelector('#camera--sensor'),
  cameraTrigger = document.querySelector('#camera--trigger'),
  photoPost = document.querySelector('#post--last-photo'),
  lugarPostar = document.getElementById('postadas'),
  descricaoInput = document.getElementById('descricao');

// Estabelecendo o acesso à câmera e inicializando a visualização
function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      let track = stream.getTracks()[0]; // Correção: getTracks é uma função
      cameraView.srcObject = stream;
    })
    .catch(function (error) {
      console.error('Ocorreu um Erro.', error);
    });
}

// Função para tirar foto
cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext('2d').drawImage(cameraView, 0, 0);
  cameraOutput.src = cameraSensor.toDataURL('image/webp');
  cameraOutput.classList.add('taken');

  // Adiciona a URL da foto ao array
  fotosTiradas.push({ url: cameraOutput.src, descricao: descricaoInput.value });

  // Limpa o campo de descrição
  descricaoInput.value = '';
};

// Função para postar a última foto
photoPost.onclick = function () {
  // Limpa a div antes de adicionar as novas imagens
  lugarPostar.innerHTML = '';

  // Itera sobre o array de fotos e cria elementos de imagem e descrição
  fotosTiradas.forEach(function (foto) {
    const imgElement = document.createElement('img');
    imgElement.src = foto.url;
    lugarPostar.appendChild(imgElement);

    // Adiciona a descrição como um parágrafo abaixo da foto
    const descricaoElement = document.createElement('p');
    descricaoElement.textContent = `Descrição: ${foto.descricao}`;
    lugarPostar.appendChild(descricaoElement);
  });
};

// Carrega imagem da câmera quando a janela carregar
window.addEventListener('load', cameraStart, false);
