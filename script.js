const DISCORD_USERNAME = "Captain Baguette#6805";

// VARIABLES
let INC_DRAGID = 0;
const zoomMapData = {
  scale: 1,
  pointX: 0,
  pointY: 0,
  start: {x: 0, y: 0},
  delta: 0
} 
const drawingData = {
  inuse: false,
  drawing: false,
  lastPointX: null,
  lastPointY: null,
  size: 1
}

const dragData = {
  clone: false,
  pointX: 0,
  pointY: 0,
  dropped: false,
  markerId: -1
}
const Markers = [];

// ELEMENTS
const ElMapContainer = document.getElementById("map-container");
const ElMap = document.getElementById("map");
const ElDiscordUsername = document.getElementById("discord-username");
const ElDiscordTooltip = document.getElementById("discord-tooltip");

const ElPurplePicks = document.getElementById("purple-picks");
const ElPurpleAttackers = document.getElementById("purple-attackers");
const ElPurpleDefenders = document.getElementById("purple-defenders");
const ElPurpleSupporters = document.getElementById("purple-supporters");
const ElPurpleAllrounders = document.getElementById("purple-allrounders");
const ElPurpleSpeedsters = document.getElementById("purple-speedsters");
const ElOrangePicks = document.getElementById("orange-picks");
const ElNeutralPicks = document.getElementById("neutral-picks");
const ElBasePicks = document.getElementById("base-picks");
const ElItemsPicks = document.getElementById("items-picks");
const ElNeutralPokemon = document.getElementById("neutral-pokemon");
const ElBaseMisc = document.getElementById("base-misc");

const ElPencilTool = document.getElementById("pencil-tool");
const ElDrawColorTool = document.getElementById("draw-color-tool");
const ElDrawSizeTool = document.getElementById("draw-size-tool");
const ElEraserTool = document.getElementById("eraser-tool");

const ElCanvas = document.getElementById("canvas");
const Ctx = ElCanvas.getContext("2d");
const ElDrawColor = document.getElementById("draw-color");
const ElDrawSize = document.getElementById("draw-size");


/**
 * Fonction d'initialisation
 */
(() => {
  initCanvas();
  copyPurpleToOrangePicks();
  addZoomEvents();
  setDraggableElements();
  addDrawingEvents();
  addScrollEvents();
  
  setDrawColor(ElDrawColor);
  setDrawSize(ElDrawSize);
  document.addEventListener("contextmenu", event => event.preventDefault());
})();

/**
 * Initialise le canvas en définissant sa largeur et sa hauteur en fonction de la taille de l'élément de la carte.
 */
function initCanvas() {
  const mapRect = ElMap.getBoundingClientRect();
  Ctx.canvas.width = mapRect.width;
  Ctx.canvas.height = mapRect.height;
}

/**
 * Définit la couleur de remplissage du canvas en fonction de la valeur de l'élément de couleur du dessin
 */
function setDrawColor(self) {
  Ctx.fillStyle = self.value;
}

/**
 * Définit la taille du pinceau de dessin en fonction de la valeur actuelle de l'élément de taille du dessin
 */
function setDrawSize(self) {
  drawingData.size = parseInt(self.value);
}

/**
 * Efface tout ce qui est dessiné sur le canvas
 */
function clearCanvas() {
  Ctx.clearRect(0, 0, Ctx.canvas.width, Ctx.canvas.height);
}

/**
 * Gère l'état de dessin sur l'élément canvas. 
 * Si le dessin est en cours, elle ajoute la classe "drawing" à l'élément canvas pour le signaler,
 * et réactive les boutons d'outils de dessin. 
 * Sinon, elle retire la classe "drawing" de l'élément canvas pour signaler que le dessin est terminé, 
 * et désactive les boutons d'outils de dessin. 
 * La variable drawingData.inuse est utilisé pour suivre l'état actuel de dessin.
 */
function handleDrawing() {
  drawingData.inuse = !drawingData.inuse;
  if (drawingData.inuse) {
    ElCanvas.classList.add("drawing");
    ElDrawColorTool.removeAttribute("disabled");
    ElDrawSizeTool.removeAttribute("disabled");
    ElEraserTool.removeAttribute("disabled");  
  } else {
    ElCanvas.classList.remove("drawing");
    ElDrawColorTool.setAttribute("disabled", "");
    ElDrawSizeTool.setAttribute("disabled", "");
    ElEraserTool.setAttribute("disabled", "");
  }
}


/**
 * Ajoute les événements de dessin au canvas.
 * Elle permet à l'utilisateur de dessiner sur le canvas en utilisant la souris 
 * et en ajustant la taille du pinceau en fonction de la valeur du curseur.
 */
function addDrawingEvents() {
  ElCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (e.button !== 0) return;
    drawingData.drawing = true;
    drawingData.lastPointX = (e.clientX - zoomMapData.pointX) / zoomMapData.scale;
    drawingData.lastPointY = (e.clientY - zoomMapData.pointY) / zoomMapData.scale;
  });

  ElCanvas.addEventListener("mouseup", (e) => drawingData.drawing = false);
  ElCanvas.addEventListener("mouseleave", (e) => drawingData.drawing = false);

  ElCanvas.addEventListener("mousemove", (e) => {
    if(!drawingData.drawing) return;

    // Calcul de la position du point actuel de la souris
    const pointX = (e.clientX - zoomMapData.pointX) / zoomMapData.scale;
    const pointY = (e.clientY - zoomMapData.pointY) / zoomMapData.scale;

    // Calcule le nombre d'étapes nécessaires pour dessiner un trait fluide entre le point de départ et le point actuel
    const distance = Math.sqrt(Math.pow(pointX - drawingData.lastPointX, 2) + Math.pow(pointY - drawingData.lastPointY, 2));
    const steps = Math.floor(distance / drawingData.size);

    // Dessin du trait
    for(let i = 0; i < steps; i++) {
      const t = (i + 1) / steps;
      const x = drawingData.lastPointX + (pointX - drawingData.lastPointX) * t;
      const y = drawingData.lastPointY + (pointY - drawingData.lastPointY) * t;
      Ctx.beginPath();
      Ctx.arc(x, y, drawingData.size, 0, 2*Math.PI);
      Ctx.fill();
    }

    // Dessin du point
    Ctx.beginPath();
    Ctx.arc(pointX, pointY, drawingData.size, 0, 2*Math.PI);
    Ctx.fill();

    // Enregistre la position actuelle de la souris comme étant la position de départ pour le prochain trait à dessiner
    drawingData.lastPointX = pointX;
    drawingData.lastPointY = pointY;
  });
}


/**
 * Cette fonction crée des éléments "draggable" pour différent éléments HTML.  
 */
function setDraggableElements() {
  const purpleDragElts = ElPurplePicks.getElementsByClassName("draggable");
  const orangeDragElts = ElOrangePicks.getElementsByClassName("draggable");
  const neutralDragElts = ElNeutralPicks.getElementsByClassName("draggable");
  const baseDragElts = ElBasePicks.getElementsByClassName("draggable");
  const itemDragElts = ElItemsPicks.getElementsByClassName("draggable");

  for (const el of purpleDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", (event) => onDragStart(event));
    
    INC_DRAGID++;
  }

  for (const el of orangeDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", (event) => onDragStart(event));

    INC_DRAGID++;
  }

  for (const el of neutralDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", (event) => onDragStart(event, true));

    INC_DRAGID++;
  }

  for (const el of baseDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", (event) => onDragStart(event, true));

    INC_DRAGID++;
  }

  for (const el of itemDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", (event) => onDragStart(event, true));

    INC_DRAGID++;
  }
}

/**
 * Cette fonction est appelée lorsque l'élément draggable n'est pas déposé sur la carte.
 * Au début du drag stocke l'information de clonage dans l'objet "dragData" 
 * et stocke l'identifiant de l'élément dans les données de transfert.
 */
function onDragStart(e, clone) {
  dragData.clone = clone;
  e.dataTransfer.setData("text/plain", e.target.id);
}

/**
 * Cette fonction est appelée lorsque l'élément draggable est déjà déposé sur la carte.
 * Stocke l'information que le marqueur est déjà sur la carte dans l'objet "dragData",
 * stocke l'index du marqueur dans le même objet
 * et stocke l'identifiant de l'élément dans les données de transfert.
 */
function onMapDragStart(e, dropped, markerId) {
  dragData.dropped = dropped;
  dragData.markerId = markerId;
  e.dataTransfer.setData("text/plain", e.target.id);
}

// Signale que l'élément est une cible valide pour le glisser-déposer
function onDragOver(e) {
  e.preventDefault();
}

// Relâche l'élément draggable
function onDrop(e) {
  // Récupère l'ID de l'élément draggable depuis les données de transfert
  const id = e.dataTransfer.getData("text");
  // Récupère l'élément draggable à partir de l'ID
  let elem = document.getElementById(id);
  // Crée un objet `marker` pour stocker les informations de l'élément draggable
  const marker = { 
    element: undefined, 
    parent: undefined, 
    pointX: 0,
    pointY: 0,
    clone: dragData.clone
  };

  // Si l'élément draggable n'a pas déjà été déposé sur la carte
  if (!dragData.dropped) {
    if (dragData.clone) { // Clone l'élément et générer un nouvel ID
      elem = elem.cloneNode(true);
      elem.id = `dragId-${INC_DRAGID}`;
  
      INC_DRAGID++;
    }
  
    // Enregistre l'élément draggable dans l'objet `marker` et l'ajoute aux marqueurs
    marker.element = elem; 
    marker.parent = elem.parentElement; 
    marker.pointX = e.offsetX;
    marker.pointY = e.offsetY;
    Markers.push(marker);

    // Si l'élément n'a pas été cloné, le supprime de sa position initiale
    if (!dragData.clone) elem.remove();
  
    // Gestion et positionnement de l'élément draggable
    elem.classList.add("dragged");
    const index = Markers.length-1;
    elem.ondragstart = (event) => onMapDragStart(event, true, index);
    ElMapContainer.parentElement.appendChild(elem);
    setDragElemTransform(marker);
  } else {
    // Gestion et positionnement de l'élément draggable
    Markers[dragData.markerId].pointX = e.offsetX;
    Markers[dragData.markerId].pointY = e.offsetY;
    setDragElemTransform(Markers[dragData.markerId]);
  }

  elem.onmouseup = removeDragElement;

  dragData.clone = false;
  dragData.dropped = false;
}

/**
 * Supprime un élément lorsqu'un clic droit est effectué sur celui-ci.
 */
function removeDragElement(e) {
  e.preventDefault();
  if (e.button !== 2) return;
  
  const markerIndex = Markers.findIndex(m => m.element.id === e.target.id);
  const marker = Markers.splice(markerIndex, 1)[0];
  marker.element.classList.remove("dragged");
  marker.element.style.scale = 1;
  marker.element.remove();

  dragData.clone = false;
  dragData.pointX = 0;
  dragData.pointY = 0;
  dragData.dropped = false;
  dragData.markerId = -1;

  if (marker.parent) {
    marker.parent.appendChild(marker.element);
    marker.element.ondragstart = (event) => onDragStart(event);
  } else {
    marker.element.ondragstart = (event) => onDragStart(event, true);
  }
}

/**
 * Ajoute les évènements de zoom sur la carte
 */
function addZoomEvents() {
  ElMapContainer.addEventListener("mousedown", onMapMouseDown);
  ElMapContainer.addEventListener("mouseup", onMapMouseUp);
  ElMapContainer.addEventListener("mousemove", onMapMouseMove);
  ElMapContainer.addEventListener("mouseleave", onMapMouseUp);
  ElMapContainer.addEventListener("mousewheel", onMapMouseWheel);
}

function copyPurpleToOrangePicks() {
  const clonePurple = ElPurplePicks.cloneNode(true);
  const clones = [];
  for(let i = 0; i < clonePurple.children.length; i++) {
    const cloneCat = clonePurple.children[i];
    cloneCat.classList.remove("purple-side");
    cloneCat.classList.add("orange-side");

    for (let j = 0; j < cloneCat.children.length; j++) {
      const cloneRole = cloneCat.children[j];
      if (cloneRole.id) {
        cloneRole.id = cloneRole.id.replace("purple", "orange");

        for (let k = 0; k < cloneRole.children.length; k++) {
          const clonePoke = cloneRole.children[k];
          clonePoke.classList.remove("purple-mon");
          clonePoke.classList.add("orange-mon");
        }
      }
    }
    clones.push(cloneCat);
    
  }
  
  for (const clone of clones) {
    ElOrangePicks.appendChild(clone);
  }
}

/**
 * Copie le texte donné dans le presse-papier
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

/** 
 * Copie le nom d'utilisateur Discord dans le presse-papier et affiche une notification
 */
function copyDiscordUsername() {
  copyToClipboard(DISCORD_USERNAME);
  
  // Affiche une notification pour indiquer que le nom d'utilisateur a été copié
  ElDiscordTooltip.innerHTML = `Copied: ${DISCORD_USERNAME}`;
  ElDiscordTooltip.classList.remove("hide");
}

/** 
 * Cache l'infobulle
 */
function onMouseOutTooltip(id) {
  const elTooltip = document.getElementById(id);
  elTooltip.innerHTML = "";
  elTooltip.classList.add("hide");
}

/**
 * Affiche ou cacher un menu
 */
function toggleMenu(self, id) {
  if (self.innerText === "◄") self.innerText = "►";
  else if (self.innerText === "►") self.innerText = "◄";
  else if (self.innerText === "▲") self.innerText = "▼";
  else if (self.innerText === "▼") self.innerText = "▲";

  const elMenu = document.getElementById(id);
  elMenu.parentElement.classList.toggle("closed");
}

/**
 * Réinitialise le zoom sur la carte
 */
function resetZoomMap() {
  zoomMapData.scale = 1;
  zoomMapData.pointX = 0;
  zoomMapData.pointY = 0;
  zoomMapData.start = {x: 0, y: 0};

  setMapTransform();
}

/**
 * Récupère les coordonnées de l'endroit où l'utilisateur a cliqué 
 * et active le défilement de la carte.
 */
function onMapMouseDown(e) {
  e.preventDefault();
  if (!(e.button === 1 || e.button === 2)) return;
  zoomMapData.start.x = e.clientX - zoomMapData.pointX;
  zoomMapData.start.y = e.clientY - zoomMapData.pointY;
  zoomMapData.panning = true;
}

/**
 * Désactive le défilement de la carte
 */
function onMapMouseUp(e) {
  zoomMapData.panning = false;
}


/**
 * Calcule la position de la carte en fonction de la distance parcourue par la souris depuis le clic.
 */
function onMapMouseMove(e) {
  e.preventDefault();
  if (!zoomMapData.panning) return;
  zoomMapData.pointX = e.clientX - zoomMapData.start.x;
  zoomMapData.pointY = e.clientY - zoomMapData.start.y;
  setMapTransform();
}

/**
 * Calcule la position de la carte en fonction de l'endroit où l'utilisateur a zoomé 
 * et de la nouvelle échelle de zoom.
 */
function onMapMouseWheel(e) {
  e.preventDefault();
  const xs = (e.clientX - zoomMapData.pointX) / zoomMapData.scale;
  const ys = (e.clientY - zoomMapData.pointY) / zoomMapData.scale;
  zoomMapData.delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
  (zoomMapData.delta > 0) ? (zoomMapData.scale += 0.1) : (zoomMapData.scale -= 0.1);
  if (zoomMapData.scale < 0.1) zoomMapData.scale = 0.1;
  if (zoomMapData.scale > 3.0) zoomMapData.scale = 3.0;
  zoomMapData.pointX = e.clientX - xs * zoomMapData.scale;
  zoomMapData.pointY = e.clientY - ys * zoomMapData.scale;

  setMapTransform();
}

/**
 * Met à jour la position et l'échelle de tous les marqueurs sur la carte. 
 * Elle définit la transformation CSS pour le conteneur de la carte 
 * et calcule la position des marqueurs en fonction de la nouvelle échelle et du nouvel emplacement de la carte.
 */
function setMapTransform() {
  ElMapContainer.style.transform = `translate(${zoomMapData.pointX}px, ${zoomMapData.pointY}px) scale(${zoomMapData.scale})`;

  for (const marker of Markers) {
    marker.element.style.scale = zoomMapData.scale;
    marker.element.style.left = `${zoomMapData.pointX + marker.pointX * zoomMapData.scale - marker.element.offsetWidth / 2}px`;
    marker.element.style.top = `${zoomMapData.pointY + marker.pointY * zoomMapData.scale - marker.element.offsetHeight / 2}px`;
  }
}

/**
 * Met à jour la position et l'échelle d'un marqueur spécifique lorsqu'il est en cours de déplacement.
 */
function setDragElemTransform(marker) {
  marker.element.style.scale = zoomMapData.scale;
  marker.element.style.left = `${zoomMapData.pointX + marker.pointX * zoomMapData.scale - marker.element.offsetWidth / 2}px`;
  marker.element.style.top = `${zoomMapData.pointY + marker.pointY * zoomMapData.scale - marker.element.offsetHeight / 2}px`;
}

/**
 * Ajoute des événements de défilement sur les éléments qui peuvent en avoir besoin.
 */
function addScrollEvents() {
  ElPurpleAttackers.addEventListener("wheel", (e) => onScrollY(e, ElPurpleAttackers));
  ElPurpleDefenders.addEventListener("wheel", (e) => onScrollY(e, ElPurpleDefenders));
  ElPurpleSupporters.addEventListener("wheel", (e) => onScrollY(e, ElPurpleSupporters));
  ElPurpleAllrounders.addEventListener("wheel", (e) => onScrollY(e, ElPurpleAllrounders));
  ElPurpleSpeedsters.addEventListener("wheel", (e) => onScrollY(e, ElPurpleSpeedsters));
  
  const elOrangeAtk = document.getElementById("orange-attackers");
  const elOrangeDef = document.getElementById("orange-defenders");
  const elOrangeSup = document.getElementById("orange-supporters");
  const elOrangeAlr = document.getElementById("orange-allrounders");
  const elOrangeSpd = document.getElementById("orange-speedsters");
  elOrangeAtk.addEventListener("wheel", (e) => onScrollY(e, elOrangeAtk));
  elOrangeDef.addEventListener("wheel", (e) => onScrollY(e, elOrangeDef));
  elOrangeSup.addEventListener("wheel", (e) => onScrollY(e, elOrangeSup));
  elOrangeAlr.addEventListener("wheel", (e) => onScrollY(e, elOrangeAlr));
  elOrangeSpd.addEventListener("wheel", (e) => onScrollY(e, elOrangeSpd));
  
  ElNeutralPokemon.addEventListener("wheel", (e) => onScrollY(e, ElNeutralPokemon));
  const elBitem = document.getElementById("bitem");
  const hitem = document.getElementById("hitem");
  elBitem.addEventListener("wheel", (e) => onScrollY(e, elBitem));
  hitem.addEventListener("wheel", (e) => onScrollY(e, hitem));
  ElBaseMisc.addEventListener("wheel", (e) => onScrollY(e, ElBaseMisc));
}

/**
 * Fait défiler horizontalement
 */
function onScrollY(e, container) {
  e.preventDefault();
  container.scrollLeft += e.deltaY;
}