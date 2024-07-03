/*let CapamanchaG, CapamanchaN, Capalineas, Capafondo;
let fondo; // Variable para la imagen de fondo
let cant = 5;
let manchaG = [], manchaN = [], lineas = [];
let tiempoDentroCapa = 0;
let tiempoAnterior = 0;
let capaActual = "";
let limiteImagenes = 5;
let manchasG = [], manchasN = [], manchasLineas = [];
let estado = "";
let tiempoRotacion = 500; // milisegundos o segundos
// Configuración de volumen y audio
let amp_min = 0.01;
let amp_max = 0.2;
let audioContext;
let mic;
let pitch;
let amp;
let haySonido = false;
let antesHabiaSonido = false;
let empezoElSonido = false;
let gestorAmp;
let amortiguacion = 0.9;

let tiempoInicioSonido = 0; // Variable para registrar el inicio del sonido
let duracionSonido = 0; // Variable para registrar la duración del sonido

function preload() {
  fondo = loadImage("data/Lienzo2.png"); // Cargar la imagen de fondo

  // Cargar imágenes de manchas y líneas
  for (let i = 0; i < cant; i++) {
    let dmanchaG = "data/manchasg" + (i + 1) + ".png";
    let dmanchaN = "data/manchasn" + (i + 1) + ".png";
    let dlineas = "data/Linea" + (i + 1) + ".png";

    manchaG[i] = loadImage(dmanchaG);
    manchaN[i] = loadImage(dmanchaN);
    lineas[i] = loadImage(dlineas);
  }
}

function setup() {
  let canvas = createCanvas(350, 550);
  canvas.parent('sketch-container'); // Attach canvas to div

  // Inicializar capas gráficas para p5.Graphics
  Capafondo = createGraphics(350, 550);
  Capafondo.image(fondo, 0, 0, 350, 550);

  CapamanchaG = createGraphics(350, 550);
  CapamanchaN = createGraphics(350, 550);
  Capalineas = createGraphics(350, 550);

  // Attach click event listener to canvas
  canvas.mouseClicked(startAudio);
}

function startAudio() {
  audioContext = getAudioContext();
  audioContext.resume().then(() => {
    mic = new p5.AudioIn();
    mic.start(startPitch);
  });
}

function startPitch() {
  pitch = ml5.pitchDetection('./model/', audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function draw() {
  background(200); // Establecer el color de fondo del canvas principal
  image(Capafondo, 0, 0); // Dibujar la capa de fondo en el canvas principal

  let tiempoTranscurrido = millis() - tiempoAnterior; // Calcular el tiempo transcurrido desde la última actualización
  tiempoAnterior = millis(); // Actualizar el tiempo anterior

  actualizarCapa(tiempoTranscurrido); // Actualizar la capa actual en función de la posición del mouse y el tiempo transcurrido

  // Manejar las manchas para cada capa
  if (capaActual === "N") {
    manejarAparicionManchas(manchasN, ManchaN, manchaN, 250, 450); // Manejar la aparición de manchas negras
    manejarRotacionManchas(manchasN); // Manejar la rotación de manchas negras
  } else if (capaActual === "L") {
    manejarAparicionManchas(manchasLineas, Linea, lineas, 200, 250); // Manejar la aparición de líneas
    manejarRotacionManchas(manchasLineas); // Manejar la rotación de líneas
  } else if (capaActual === "G") {
    manejarAparicionManchas(manchasG, ManchaG, manchaG, 250, 450); // Manejar la aparición de manchas grandes
    manejarRotacionManchas(manchasG); // Manejar la rotación de manchas grandes
  }

  dibujarManchas(CapamanchaN, manchasN); // Dibujar las manchas negras
  dibujarManchas(CapamanchaG, manchasG); // Dibujar las manchas grandes
  dibujarManchas(Capalineas, manchasLineas); // Dibujar las líneas

  image(CapamanchaG, 0, 0); // Dibujar la capa de manchas grandes en el canvas principal
  image(CapamanchaN, 0, 0); // Dibujar la capa de manchas negras en el canvas principal
  image(Capalineas, 0, 0); // Mostrar la duración del sonido
  fill(255, 50, 200);
  textSize(16);
  text('Duración del sonido: ' + duracionSonido.toFixed(2) + ' segundos', 10, height - 10);

  antesHabiaSonido = haySonido; // Guardar estado del fotograma anterior
}

function actualizarCapa(tiempoTranscurrido) {
  let nuevaCapa = "";

  if (pitch) {
    pitch.getPitch(function (err, frequency) {
      if (frequency > 90 && frequency < 245) {
        nuevaCapa = "N";
      } else if (frequency > 350) {
        nuevaCapa = "L";
      } else if (frequency > 250 && frequency < 345) {
        nuevaCapa = "G";
      }
      if (nuevaCapa !== capaActual) {
        if (capaActual) {
          detenerRotacionManchas(capaActual); // Detener la rotación de las manchas al cambiar de capa
        }
        capaActual = nuevaCapa;
        tiempoDentroCapa = 0; // Resetear el tiempo al cambiar de capa
      } else {
        tiempoDentroCapa += tiempoTranscurrido;
        if (manchasG.length >= limiteImagenes || manchasN.length >= limiteImagenes || manchasLineas.length >= limiteImagenes) {
          iniciarRotacionManchas(capaActual); // Iniciar la rotación de las manchas si se alcanzó el límite
        }
      }
    });
  }
}

function manejarAparicionManchas(manchas, ClaseMancha, imagenes, minSize, maxSize) {

  if (haySonido && !antesHabiaSonido) {


    if (manchas.length < limiteImagenes) {
      let i = floor(random(cant));
      let w = random(minSize, maxSize);
      let h = random(minSize, maxSize);
      let x = random(0, width);
      let y = random(0, height);
      let velocidad = random(0.01, 0.05);
      let nuevaMancha = new ClaseMancha(imagenes[i], x, y, w, h, velocidad);
      nuevaMancha.rotacionInicial = random(TWO_PI); // Asignar rotación inicial aleatoria
      nuevaMancha.apareciendo = true; // Marcar como apareciendo
      nuevaMancha.opacidad = 0; // Empezar con opacidad 0
      manchas.push(nuevaMancha);


     
    }
  }
}
function manejarRotacionManchas(manchas) {
  if (manchas.length >= limiteImagenes && tiempoDentroCapa >= tiempoRotacion) {
    for (let mancha of manchas) {
      if (!mancha.rotando) {
        mancha.velocidad = random(0.5, 0.25);
        mancha.startRotating();
      }
    }
  }
}

function dibujarManchas(capa, manchas) {
  capa.clear(); // Limpiar la capa antes de dibujar
  for (let mancha of manchas) {
    mancha.dibujar(capa); // Dibujar cada mancha en la capa correspondiente
  }
}
function detenerRotacionManchas(capa) {
  let manchas = obtenerManchasPorCapa(capa); // Obtener las manchas de la capa correspondiente
  if (manchas) {
    for (let mancha of manchas) {
      mancha.stopRotating(); // Detener la rotación de cada mancha
    }
  }
}

function iniciarRotacionManchas(capa) {
  let manchas = obtenerManchasPorCapa(capa); // Obtener las manchas de la capa correspondiente
  if (manchas && manchas.length >= limiteImagenes && tiempoDentroCapa >= tiempoRotacion) {
    for (let mancha of manchas) {
      if (!mancha.rotando) {
        mancha.startRotating(); // Iniciar la rotación de cada mancha si no está rotando
      }
    }
  }
}

function obtenerManchasPorCapa(capa) {
  if (capa === "N") return manchasN;
  if (capa === "L") return manchasLineas;
  if (capa === "G") return manchasG;
  return null; // Devolver las manchas correspondientes a la capa
}

// Función para manejar el resultado del clasificador de sonido
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
}

// Esta función se llama cuando se redimensiona la ventana del navegador
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (err) {
      console.error(err);
    } else {
      // Actualizar haySonido según la frecuencia detectada
      haySonido = (frequency > 0);

      if (haySonido && !antesHabiaSonido) {
        tiempoInicioSonido = millis(); // Registrar el tiempo cuando el sonido empieza
      }

      if (haySonido) {
        duracionSonido = (millis() - tiempoInicioSonido) / 1000; // Actualizar duración del sonido en segundos
      } else {
        duracionSonido = 0;
      }
    }
    // Llamar a getPitch de nuevo para mantener la detección continua
    getPitch();
  });
}
*/
let CapamanchaG, CapamanchaN, Capalineas, Capafondo;
let fondo; // Variable para la imagen de fondo
let cant = 5;
let manchaG = [], manchaN = [], lineas = [];
let tiempoDentroCapa = 0;
let tiempoAnterior = 0;
let capaActual = "";
let limiteImagenes = 5;
let manchasG = [], manchasN = [], manchasLineas = [];
let estado = "";
let tiempoRotacion = 500; // milisegundos o segundos
// Configuración de volumen y audio
let amp_min = 0.01;
let amp_max = 0.2;
let audioContext;
let mic;
let pitch;
let amp;
let haySonido = false;
let antesHabiaSonido = false;
let empezoElSonido = false;
let gestorAmp;
let amortiguacion = 0.9;

let tiempoInicioSonido = 0; // Variable para registrar el inicio del sonido
let duracionSonido = 0; // Variable para registrar la duración del sonido

function preload() {
  fondo = loadImage("data/Lienzo2.png"); // Cargar la imagen de fondo

  // Cargar imágenes de manchas y líneas
  for (let i = 0; i < cant; i++) {
    let dmanchaG = "data/manchasg" + (i + 1) + ".png";
    let dmanchaN = "data/manchasn" + (i + 1) + ".png";
    let dlineas = "data/Linea" + (i + 1) + ".png";

    manchaG[i] = loadImage(dmanchaG);
    manchaN[i] = loadImage(dmanchaN);
    lineas[i] = loadImage(dlineas);
  }
}

function setup() {
  let canvas = createCanvas(350, 550);
  canvas.parent('sketch-container'); // Attach canvas to div

  // Inicializar capas gráficas para p5.Graphics
  Capafondo = createGraphics(350, 550);
  Capafondo.image(fondo, 0, 0, 350, 550);

  CapamanchaG = createGraphics(350, 550);
  CapamanchaN = createGraphics(350, 550);
  Capalineas = createGraphics(350, 550);

  // Inicializar manchasG en posiciones aleatorias
  inicializarManchasG();

  // Attach click event listener to canvas
  canvas.mouseClicked(startAudio);
}

function inicializarManchasG() {
  let marginLeft = -30; // 30 píxeles fuera del canvas por el lado izquierdo
  let marginRight = 300; // Margen derecho dentro del canvas
  let marginTop = 0; // Margen superior dentro del canvas
  let marginBottom = 100; // Margen inferior dentro del canvas

  for (let i = 0; i < limiteImagenes; i++) {
    let idx = floor(random(cant));
    let w = random(250, 350); // Ancho entre 250 y 350
    let h = random(250, 350); // Alto entre 250 y 350
    let x = random(marginLeft, width - marginRight);
    let y = random(marginTop, height - marginBottom);
    let velocidad = 0; // Sin rotación

    // Nueva manchaG con parametros generados aleatoriamente
    let nuevaMancha = new ManchaG(manchaG[idx], x, y, w, h, velocidad);
    nuevaMancha.opacidad = 255; // Aparecer con opacidad completa
    nuevaMancha.apareciendo = false; // No aparecer progresivamente
    manchasG.push(nuevaMancha);

    // Dibujar la mancha en CapamanchaG
    nuevaMancha.dibujar(CapamanchaG);
  }
}


function startAudio() {
  audioContext = getAudioContext();
  audioContext.resume().then(() => {
    mic = new p5.AudioIn();
    mic.start(startPitch);
  });
}

function startPitch() {
  pitch = ml5.pitchDetection('./model/', audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function draw() {
  background(200); // Establecer el color de fondo del canvas principal
  image(Capafondo, 0, 0); // Dibujar la capa de fondo en el canvas principal

  let tiempoTranscurrido = millis() - tiempoAnterior; // Calcular el tiempo transcurrido desde la última actualización
  tiempoAnterior = millis(); // Actualizar el tiempo anterior

  actualizarCapa(tiempoTranscurrido); // Actualizar la capa actual en función de la posición del mouse y el tiempo transcurrido

  // Manejar las manchas para cada capa
  if (capaActual === "N") {
    manejarAparicionManchas(manchasN, ManchaN, manchaN, 250, 450); // Manejar la aparición de manchas negras
    manejarRotacionManchas(manchasN); // Manejar la rotación de manchas negras
  } else if (capaActual === "L") {
    manejarAparicionManchas(manchasLineas, Linea, lineas, 200, 250); // Manejar la aparición de líneas
    manejarRotacionManchas(manchasLineas); // Manejar la rotación de líneas
  } else if (capaActual === "G") {
    manejarAparicionManchas(manchasG, ManchaG, manchaG, 250, 450); // Manejar la aparición de manchas grandes
    manejarRotacionManchas(manchasG); // Manejar la rotación de manchas grandes
  }

  dibujarManchas(CapamanchaN, manchasN); // Dibujar las manchas negras
  dibujarManchas(CapamanchaG, manchasG); // Dibujar las manchas grandes
  dibujarManchas(Capalineas, manchasLineas); // Dibujar las líneas

  image(CapamanchaG, 0, 0); // Dibujar la capa de manchas grandes en el canvas principal
  image(CapamanchaN, 0, 0); // Dibujar la capa de manchas negras en el canvas principal
  image(Capalineas, 0, 0); // Dibujar la capa de líneas en el canvas principal

  fill(255, 50, 200);
  textSize(16);
  text('Duración del sonido: ' + duracionSonido.toFixed(2) + ' segundos', 10, height - 10);

  antesHabiaSonido = haySonido; // Guardar estado del fotograma anterior
}

function actualizarCapa(tiempoTranscurrido) {
  let nuevaCapa = "";

  if (pitch) {
    pitch.getPitch(function (err, frequency) {
      if (frequency > 190 && frequency < 245) {
        nuevaCapa = "N";
      } else if (frequency > 350) {
        nuevaCapa = "L";
      }
      if (nuevaCapa !== capaActual) {
        if (capaActual) {
          detenerRotacionManchas(capaActual); // Detener la rotación de las manchas al cambiar de capa
        }
        capaActual = nuevaCapa;
        tiempoDentroCapa = 0; // Resetear el tiempo al cambiar de capa
      } else {
        tiempoDentroCapa += tiempoTranscurrido;
        if (manchasG.length >= limiteImagenes || manchasN.length >= limiteImagenes || manchasLineas.length >= limiteImagenes) {
          iniciarRotacionManchas(capaActual); // Iniciar la rotación de las manchas si se alcanzó el límite
        }
      }
    });
  }
}

function manejarAparicionManchas(manchas, ClaseMancha, imagenes, minSize, maxSize) {
  if (haySonido && !antesHabiaSonido) {
    if (manchas.length < limiteImagenes) {
      let i = floor(random(cant));
      let w = random(minSize, maxSize);
      let h = random(minSize, maxSize);
      let x = random(0, width);
      let y = random(0, height);
      let velocidad = random(0.05, 0.25); // Velocidades más lentas
      let nuevaMancha = new ClaseMancha(imagenes[i], x, y, w, h, velocidad);
      nuevaMancha.rotacionInicial = random(TWO_PI); // Asignar rotación inicial aleatoria
      nuevaMancha.apareciendo = true; // Marcar como apareciendo
      nuevaMancha.opacidad = 0; // Empezar con opacidad 0
      manchas.push(nuevaMancha);
    }
  }
}

function manejarRotacionManchas(manchas) {
  if (manchas.length >= limiteImagenes && tiempoDentroCapa >= tiempoRotacion) {
    for (let mancha of manchas) {
      if (!mancha.rotando) {
        mancha.velocidad = random(0.02, 0.7); // Velocidades más lentas
        mancha.startRotating();
      }
    }
  }
}

function dibujarManchas(capa, manchas) {
  capa.clear(); // Limpiar la capa antes de dibujar
  for (let mancha of manchas) {
    mancha.dibujar(capa); // Dibujar cada mancha en la capa correspondiente
  }
}

function detenerRotacionManchas(capa) {
  let manchas = obtenerManchasPorCapa(capa); // Obtener las manchas de la capa correspondiente
  if (manchas) {
    for (let mancha of manchas) {
      mancha.stopRotating(); // Detener la rotación de cada mancha
    }
  }
}

function iniciarRotacionManchas(capa) {
  let manchas = obtenerManchasPorCapa(capa); // Obtener las manchas de la capa correspondiente
  if (manchas && manchas.length >= limiteImagenes && tiempoDentroCapa >= tiempoRotacion) {
    for (let mancha of manchas) {
      if (!mancha.rotando) {
        mancha.startRotating(); // Iniciar la rotación de cada mancha si no está rotando
      }
    }
  }
}

function obtenerManchasPorCapa(capa) {
  if (capa === "N") return manchasN;
  if (capa === "L") return manchasLineas;
  if (capa === "G") return manchasG;
  return null; // Devolver las manchas correspondientes a la capa
}

// Función para manejar el resultado del clasificador de sonido
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
}

// Esta función se llama cuando se redimensiona la ventana del navegador
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getPitch() {
  pitch.getPitch(function (err, frequency) {
    if (err) {
      console.error(err);
    } else {
      // Actualizar haySonido según la frecuencia detectada
      haySonido = (frequency > 0);

      if (haySonido && !antesHabiaSonido) {
        tiempoInicioSonido = millis(); // Registrar el tiempo cuando el sonido empieza
      }

      if (haySonido) {
        duracionSonido = (millis() - tiempoInicioSonido) / 1000; // Actualizar duración del sonido en segundos
      } else {
        duracionSonido = 0;
      }
    }
    // Llamar a getPitch de nuevo para mantener la detección continua
    getPitch();
  });
}
