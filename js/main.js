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

// Função para tirar foto
cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext('2d').drawImage(cameraView, 0, 0);
  cameraOutput.src = cameraSensor.toDataURL('image/webp');
  cameraOutput.classList.add('taken');

  // Adiciona a URL da foto ao array
  const novaFoto = { url: cameraOutput.src, descricao: descricaoInput.value };
  fotosTiradas.push(novaFoto);

  // Limpa o campo de descrição
  descricaoInput.value = '';

  // Armazena a última foto no IndexedDB
  armazenarUltimaFoto(novaFoto);
};

// Função para postar a última foto
photoPost.onclick = function () {
  // Limpa a div antes de adicionar as novas imagens
  lugarPostar.innerHTML = '';

  // Verifica se há pelo menos uma foto tirada
  if (fotosTiradas.length > 0) {
    const ultimaFoto = fotosTiradas[fotosTiradas.length - 1];

    // Cria elemento de imagem para a última foto
    const imgElement = document.createElement('img');
    imgElement.src = ultimaFoto.url;
    lugarPostar.appendChild(imgElement);

    // Adiciona a descrição como um parágrafo abaixo da foto
    const descricaoElement = document.createElement('p');
    descricaoElement.textContent = `@klfotos: ${ultimaFoto.descricao}`;
    lugarPostar.appendChild(descricaoElement);

  } else {
    // Exemplo: Exibir um alerta se não houver fotos tiradas
    alert('Nenhuma foto para postar.');
  }
};

// Carrega imagem da câmera quando a janela carregar
window.addEventListener('load', cameraStart, false);

// Função para estabelecer o acesso à câmera e inicializar a visualização
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

// Função para armazenar a última foto no IndexedDB
function armazenarUltimaFoto(novaFoto) {
  // Abre ou cria um banco de dados chamado 'fotosDB' com a versão 1
  const request = indexedDB.open('fotosDB', 1);

  // Configura o banco de dados e armazena a última foto quando for criado ou atualizado
  request.onupgradeneeded = function (event) {
    const db = event.target.result;

    // Cria um object store chamado 'fotos' com uma chave autoincrementável
    const objectStore = db.createObjectStore('fotos', { autoIncrement: true });

    // Adiciona a última foto ao object store
    objectStore.add(novaFoto);
  };

  // Manipula eventos de sucesso ou erro na abertura do banco de dados
  request.onsuccess = function (event) {
    const db = event.target.result;

    // Abre uma transação de leitura e gravação no object store 'fotos'
    const transaction = db.transaction(['fotos'], 'readwrite');

    // Obtém o object store 'fotos'
    const objectStore = transaction.objectStore('fotos');

    // Limpa todos os registros existentes
    objectStore.clear();

    // Adiciona a última foto ao object store
    objectStore.add(novaFoto);

    // Completa a transação
    transaction.oncomplete = function () {
      console.log('Última foto armazenada com sucesso no IndexedDB.');
    };

    // Manipula erros na transação
    transaction.onerror = function (error) {
      console.error('Erro ao armazenar a última foto no IndexedDB:', error);
    };
  };

  // Manipula erros na abertura do banco de dados
  request.onerror = function (event) {
    console.error('Erro ao abrir o banco de dados:', event.target.error);
  };
}
