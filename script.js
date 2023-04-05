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
  size: 1,
  history: [],
  historyPosition: 0
}

const dragData = {
  marker: undefined
}
const Markers = [];

let scale = 1;

// ELEMENTS
const ElMapContainer = document.getElementById("map-container");
const ElMap = document.getElementById("map");
const ElDiscordUsername = document.getElementById("discord-username");
const ElDiscordTooltip = document.getElementById("discord-tooltip");
const ElMarkers = document.getElementById("markers");

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
const ElUndoTool = document.getElementById("undo-tool");
const ElRedoTool = document.getElementById("redo-tool");

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
  if (drawingData.historyPosition < drawingData.history.length-1) {
    drawingData.history.splice(drawingData.historyPosition + 1);
  }
  drawingData.history.push(Ctx.getImageData(0, 0, ElCanvas.width, ElCanvas.height));
  drawingData.historyPosition++;
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
    ElUndoTool.removeAttribute("disabled"); 
    ElRedoTool.removeAttribute("disabled"); 
  } else {
    ElCanvas.classList.remove("drawing");
    ElDrawColorTool.setAttribute("disabled", "");
    ElDrawSizeTool.setAttribute("disabled", "");
    ElEraserTool.setAttribute("disabled", "");
    ElUndoTool.setAttribute("disabled", "");
    ElRedoTool.setAttribute("disabled", "");
  }
}


/**
 * Ajoute les événements de dessin au canvas.
 * Elle permet à l'utilisateur de dessiner sur le canvas en utilisant la souris 
 * et en ajustant la taille du pinceau en fonction de la valeur du curseur.
 */
function addDrawingEvents() {
  drawingData.history.push(Ctx.getImageData(0, 0, ElCanvas.width, ElCanvas.height));
  ElCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (e.button !== 0) return;
    drawingData.drawing = true;
    drawingData.lastPointX = (e.clientX - zoomMapData.pointX) / zoomMapData.scale;
    drawingData.lastPointY = (e.clientY - zoomMapData.pointY) / zoomMapData.scale;
  });

  ElCanvas.addEventListener("mouseup", (e) => {
    if (!drawingData.drawing) return;
    drawingData.drawing = false;
    if (drawingData.historyPosition < drawingData.history.length-1) {
      drawingData.history.splice(drawingData.historyPosition + 1);
    }
    drawingData.history.push(Ctx.getImageData(0, 0, ElCanvas.width, ElCanvas.height));
    drawingData.historyPosition++;
  });
  ElCanvas.addEventListener("mouseleave", (e) => {
    if (!drawingData.drawing) return;
    drawingData.drawing = false;
    if (drawingData.historyPosition < drawingData.history.length-1) {
      drawingData.history.splice(drawingData.historyPosition + 1);
    }
    drawingData.history.push(Ctx.getImageData(0, 0, ElCanvas.width, ElCanvas.height));
    drawingData.historyPosition++;
  });

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

function redo() {
  if(drawingData.history.length > 1 && drawingData.historyPosition < drawingData.history.length-1) {
    drawingData.historyPosition++;
    Ctx.putImageData(drawingData.history[drawingData.historyPosition], 0, 0);
  }
}

function undo() {
  if(drawingData.history.length > 1 && drawingData.historyPosition > 0) {
    drawingData.historyPosition--;
    Ctx.putImageData(drawingData.history[drawingData.historyPosition], 0, 0);
  }
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
    el.setAttribute("data-droppable", "true");
    el.setAttribute("data-drop-item", "true");
    el.addEventListener("mousedown", dragFromOrigin);

    INC_DRAGID++;
  }

  for (const el of orangeDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("data-droppable", "true");
    el.setAttribute("data-drop-item", "true");
    el.addEventListener("mousedown", dragFromOrigin);

    INC_DRAGID++;
  }

  for (const el of neutralDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.addEventListener("mousedown", dragCloneFromOrigin);

    INC_DRAGID++;
  }

  for (const el of baseDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.addEventListener("mousedown", dragCloneFromOrigin);

    INC_DRAGID++;
  }

  for (const el of itemDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("data-item", "true");
    el.addEventListener("mousedown", dragCloneFromOrigin);

    INC_DRAGID++;
  }
}

/**
 * Permet de déplacer un élément sur la page.
 */
function moveAt(elem, x, y) {
  if (elem.classList.contains("dropped")) {
    elem.style.left = `${(x - zoomMapData.pointX) / zoomMapData.scale - elem.offsetWidth / 2}px`;
    elem.style.top = `${(y - zoomMapData.pointY) / zoomMapData.scale - elem.offsetHeight / 2}px`;
  } else {
    elem.style.left = `${x - elem.offsetWidth / 2}px`;
    elem.style.top = `${y - elem.offsetHeight / 2}px`;
  }
}


function dragCloneFromOrigin(e) {
  e.stopPropagation();
  e.preventDefault();
  dragFromOrigin(e, true);
}

/**
 * Gère le début du glisser-déposer.
 */
function dragFromOrigin(e, clone) {
  e.stopPropagation();
  e.preventDefault();
  if (e.button === 2) {
    removeDragElement(e);
    return;
  }

  const elem = clone ? e.target.cloneNode(true) : e.target;
  const marker = { 
    element: elem, 
    parent: undefined, 
    pointX: 0,
    pointY: 0,
    clone: clone,
    dropped: false
  }
  
  if (clone) {
    elem.id = `dragId-${INC_DRAGID}`;
    INC_DRAGID++;
    e.target.parentElement.appendChild(elem);
    elem.addEventListener("mousedown", dragFromOrigin);
  } else {
    marker.parent = elem.parentElement;
  }

  if (elem.classList.contains("dropped")) {
    dragData.marker = Markers.find(m => m.element.id === elem.id);
  } else {
    dragData.marker = marker;
  }
  
  ElMapContainer.setAttribute("data-droppable", "true");

  // Commence à faire bouger l'élement sans le faire sortir de sa zone d'origine
  elem.classList.add("dragging");

  moveAt(elem, e.pageX, e.pageY);
  
  document.addEventListener("mousemove", dragMove);
  elem.addEventListener("mouseup", dragDrop);
}

/**
 * Gère le déplacement de l'élément en cours de glisser-déposer
 */
function dragMove(e) {
  e.stopPropagation();
  e.preventDefault();
  moveAt(dragData.marker.element, e.pageX, e.pageY);
}

/**
 * Gère le relâchement de l'élément en cours de glisser-déposer
 */
function dragDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  const marker = dragData.marker;
  marker.element.style.pointerEvents = "none";
  const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
  marker.element.style.pointerEvents = "initial";
  
  if (!elemBelow) {
    cancelDragAndDrop();
    return;
  }
  const elemDroppableBelow = elemBelow.closest("[data-droppable]");
  if (!elemDroppableBelow) {
    cancelDragAndDrop();
    return;
  }
  marker.element.classList.remove("dragging");
  
  if (elemDroppableBelow.id === "map-container") {
    ElMarkers.appendChild(marker.element);
    if (marker.clone) marker.parent = ElMarkers;

    marker.pointX = e.pageX;
    marker.pointY = e.pageY;
    setDragElemTransform(marker);
  } else if (marker.element.getAttribute("data-item")
  &&  elemDroppableBelow.getAttribute("data-drop-item")) 
  {
    elemDroppableBelow.appendChild(marker.element);
    if (marker.element.classList.contains("hitem-mon")) {
      const items = elemDroppableBelow.getElementsByClassName("hitem-mon");
      if (items.length > 3) {
        cancelDragAndDrop();
        return;
      }
      marker.element.style.left = `${3.7 - 3.7 * (items.length-1)}vh`;
      marker.element.style.top = "100%";
    } else if (marker.element.classList.contains("bitem-mon")) {
      const items = elemDroppableBelow.getElementsByClassName("bitem-mon");
      if (items.length > 1) {
        cancelDragAndDrop();
        return;
      }
      marker.element.style.left = "100%";
      marker.element.style.top = "-50%";
    }
    marker.element.removeEventListener("mousedown", dragFromOrigin, false);
    marker.element.removeEventListener("mousedown", dragCloneFromOrigin, false);
    marker.element.addEventListener("mousedown", cancelDragAndDrop);
  } else {
    cancelDragAndDrop();
    return;
  }

  document.removeEventListener("mousemove", dragMove, false);
  marker.element.removeEventListener("mouseup", dragDrop, false);

  if (!marker.dropped) {
    Markers.push(marker);
  }
  marker.element.classList.add("dropped");
  marker.dropped = true;
  dragData.marker = undefined;
}

/**
 * Annule l'action de glisser-déposer d'un élément
 */
function cancelDragAndDrop() {
  if (!dragData.marker?.element) return;

  document.removeEventListener("mousemove", dragMove, false);
  dragData.marker.element.removeEventListener("mouseup", dragDrop, false);

  dragData.marker.element.classList.remove("dropped");
  dragData.marker.element.classList.remove("dragging");
  
  dragData.marker.element.remove();
  if (dragData.marker.parent) {
    dragData.marker.parent.appendChild(dragData.marker.element);
  }
 
  const markerIndex = Markers.findIndex(m => m.element.id === dragData.marker?.element.id);
  dragData.marker = undefined;
  if (markerIndex === -1) return;
  const marker = Markers.splice(markerIndex, 1)[0];
  if (!marker) return;
}

/**
 * Supprime un élément lorsqu'un clic droit est effectué sur celui-ci.
 */
function removeDragElement(e) {
  e.stopPropagation();
  e.preventDefault();

  const markerIndex = Markers.findIndex(m => m.element.id === e.target.id);
  if (markerIndex === -1) return;
  const marker = Markers.splice(markerIndex, 1)[0];
  if (!marker) return;

  marker.element.classList.remove("dragging");
  marker.element.classList.remove("dropped");
  marker.element.remove();

  if (!marker.clone) {
    marker.parent.appendChild(marker.element);
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
  e.preventDefault();
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
 */
function setMapTransform() {
  ElMapContainer.style.transform = `translate(${zoomMapData.pointX}px, ${zoomMapData.pointY}px) scale(${zoomMapData.scale})`;
}

/**
 * Met à jour la position et l'échelle d'un marqueur spécifique lorsqu'il est en cours de déplacement.
 */
function setDragElemTransform(marker) {
  marker.element.style.left = `${(marker.pointX - zoomMapData.pointX) / zoomMapData.scale - marker.element.offsetWidth / 2}px`;
  marker.element.style.top = `${(marker.pointY - zoomMapData.pointY) / zoomMapData.scale - marker.element.offsetHeight / 2}px`;
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