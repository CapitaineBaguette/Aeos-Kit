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
  historyPosition: 0,
  imgText: null,
  elImgText: null,
  writingMode: false
}

const dragData = {
  marker: undefined,
  mouseover: null,
  mouseup: null
}
const Markers = [];
const mouseData = {
  isRightClick: false,
  rightClickTimeout: null,
  isLongRightClick: false
}

// ELEMENTS
const ElMapContainer = document.getElementById("map-container");
const ElMap = document.getElementById("map");
const ElDiscordUsername = document.getElementById("discord-username");
const ElDiscordTooltip = document.getElementById("discord-tooltip");
const ElMarkers = document.getElementById("markers");

const ElDecTime = document.getElementById("dec-time");
const ElTime = document.getElementById("time");
const ElIncTime = document.getElementById("inc-time");

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
const ElTextTool = document.getElementById("text-tool");
const ElTextImg = document.getElementById("text-img");

const ElCanvas = document.getElementById("canvas");
const Ctx = ElCanvas.getContext("2d");
const ElDrawColor = document.getElementById("draw-color");
const ElDrawSize = document.getElementById("draw-size");

const ElCanvasText = document.createElement("canvas");
const CtxCanvasText = ElCanvasText.getContext("2d");

const ElModalHelp = document.getElementById("modal-help");


/**
 * Fonction d'initialisation
 */

window.onload = () => {
  initCanvas();
  addTime(0);
  copyPurpleToOrangePicks();
  addZoomEvents();
  setDraggableElements();
  addScrollEvents();

  initHoverText();
  
  initTextImg().then(() => {
    setDrawColor(ElDrawColor);
    setDrawSize(ElDrawSize);
    document.addEventListener("contextmenu", event => event.preventDefault());
  });
  
};

function initHoverText() {
  const elements = document.getElementsByClassName("draggable");
  for (const elem of elements) {
    const bckImg = elem.style.backgroundImage;
    const filename = bckImg.match(/\/([^/]+)\.[^/.]+$/)[1].replace(/[_-]/g, ' ');
    const result = filename.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    let tooltipTimerId;

    elem.onmouseover = () => {
      tooltipTimerId = setTimeout(() => {
        if (mouseData.isLongRightClick) return;
        const tooltip = document.createElement("div");
        tooltip.id = "tooltip-item";
        tooltip.classList.add("tooltip-item");
        tooltip.innerText = result;
        document.body.appendChild(tooltip);
  
        const rect = elem.getBoundingClientRect();
        tooltip.style.top = rect.top - tooltip.offsetHeight + "px";
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";
      }, 1000);
      elem.setAttribute("data-tooltip-timer-id", tooltipTimerId);
    };

    elem.onmouseout = () => {
      clearTimeout(tooltipTimerId);

      const tooltip = document.getElementById("tooltip-item");
      tooltip?.parentNode.removeChild(tooltip);
    };

    elem.onmousedown = () => {
      clearTimeout(tooltipTimerId);

      const tooltip = document.getElementById("tooltip-item");
      tooltip?.parentNode.removeChild(tooltip);
    }
  }
}

function addTime(t) {
  let time = parseInt(ElTime.getAttribute("data-time"));
  time += t;

  if (time >= 600) {
    time = 600;
    ElIncTime.classList.add("hide");
  } else {
    ElIncTime.classList.remove("hide");
  }
  if (time <= 0) {
    time = 0;
    ElDecTime.classList.add("hide");
  } else {
    ElDecTime.classList.remove("hide");
  }

  let m = Math.floor(time / 60);
	let s = time % 60;

	if (m < 10) m = `0${m}`;
	if (s < 10) s = `0${s}`;
	
	ElTime.innerText = `${m}:${s}`;
  ElTime.setAttribute("data-time", time);
}

function wheelTime(e) {
  const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
  (delta > 0) ? addTime(+1) : addTime(-1);
}

/**
 * Initialise le canvas en définissant sa largeur et sa hauteur en fonction de la taille de l'élément de la carte.
 */
function initCanvas() {
  const mapRect = ElMap.getBoundingClientRect();
  Ctx.canvas.width = mapRect.width;
  Ctx.canvas.height = mapRect.height;
  ElCanvas.addEventListener("click", writeText);
  drawingData.history.push(Ctx.getImageData(0, 0, ElCanvas.width, ElCanvas.height));
}

/**
 * Définit la couleur de remplissage du canvas en fonction de la valeur de l'élément de couleur du dessin
 */
function setDrawColor(self) {
  Ctx.fillStyle = self.value;
  setTextImg();
}

async function initTextImg() {
  ElCanvasText.width = ElTextImg.width.baseVal.value;
  ElCanvasText.height = ElTextImg.height.baseVal.value;
  const svgString = new XMLSerializer().serializeToString(ElTextImg);
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = function() {
      CtxCanvasText.drawImage(img, 0, 0); // Dessiner l'image sur le canvas
      drawingData.imgText = CtxCanvasText.getImageData(0, 0, ElCanvasText.width, ElCanvasText.height);
      
      drawingData.elImgText = document.createElement("img");
      drawingData.elImgText.src = ElCanvasText.toDataURL("image/png");

      ElTextImg.parentNode.appendChild(drawingData.elImgText);
      ElTextImg.remove();

      resolve();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  });
}

function setTextImg() {
  const rgb = hexToRgb(Ctx.fillStyle);

  for (var i = 0; i < drawingData.imgText.data.length; i += 4) {
    drawingData.imgText.data[i] = rgb[0];
    drawingData.imgText.data[i + 1] = rgb[1];
    drawingData.imgText.data[i + 2] = rgb[2];
  }

  CtxCanvasText.putImageData(drawingData.imgText, 0, 0);
  drawingData.elImgText.src = ElCanvasText.toDataURL("image/png");
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function handleText(e) {
  drawingData.writingMode = !drawingData.writingMode;
  if (drawingData.writingMode) {
    selectText(e);
  } else {
    unselectText(e);
  }
}

function writeText(e) {
  if (!drawingData.writingMode) return;
  drawingData.lastPointX = (e.clientX - zoomMapData.pointX) / zoomMapData.scale;
  drawingData.lastPointY = (e.clientY - zoomMapData.pointY) / zoomMapData.scale;
  const text = prompt("Write something...");
  if (text !== null && text !== "") {
    Ctx.font = `${32 + drawingData.size * 4}px Comic Sans MS`;
    Ctx.fillText(text, drawingData.lastPointX, drawingData.lastPointY);
    
    if (drawingData.historyPosition < drawingData.history.length-1) {
      drawingData.history.splice(drawingData.historyPosition + 1);
    }
    drawingData.history.push(Ctx.getImageData(0, 0, ElCanvas.width, ElCanvas.height));
    drawingData.historyPosition++;
  }
}

function selectText(e) {
  ElTextTool.classList.add("selected");

  ElPencilTool.classList.remove("selected");
}

function unselectText(e) {
  if (e.target === ElCanvas && !drawingData.moving) return;
  ElTextTool.classList.remove("selected");
  drawingData.writingMode = false;

  ElPencilTool.classList.add("selected");
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
function handleDrawing(e) {
  drawingData.inuse = !drawingData.inuse;

  unselectText(e);

  if (drawingData.inuse) {
    ElCanvas.classList.add("drawing");
    ElDrawColorTool.removeAttribute("disabled");
    ElDrawSizeTool.removeAttribute("disabled");
    ElEraserTool.removeAttribute("disabled");  
    ElUndoTool.removeAttribute("disabled"); 
    ElRedoTool.removeAttribute("disabled");
    ElTextTool.removeAttribute("disabled");
    
    ElPencilTool.classList.add("selected");
    document.addEventListener("mousedown", onStartDraw);
  } else {
    
    ElCanvas.classList.remove("drawing");
    ElDrawColorTool.setAttribute("disabled", "");
    ElDrawSizeTool.setAttribute("disabled", "");
    ElEraserTool.setAttribute("disabled", "");
    ElUndoTool.setAttribute("disabled", "");
    ElRedoTool.setAttribute("disabled", "");
    ElTextTool.setAttribute("disabled", "");

    ElPencilTool.classList.remove("selected");
    document.removeEventListener("mousedown", onStartDraw, false);
  }
}

function onStartDraw(e) {
  if (e.button !== 0) return;
  if (e.target.id !== "canvas") return;
  drawingData.drawing = true;
  drawingData.lastPointX = (e.clientX - zoomMapData.pointX) / zoomMapData.scale;
  drawingData.lastPointY = (e.clientY - zoomMapData.pointY) / zoomMapData.scale;
  document.addEventListener("mousemove", draw);
  document.addEventListener("mouseup", onEndDraw);
}

function onEndDraw(e) {
  if (!drawingData.drawing) return;
  drawingData.drawing = false;
  document.removeEventListener("mousemove", draw, false);
  document.removeEventListener("mouseup", onEndDraw, false);

  if (!drawingData.moving) return;
  drawingData.moving = false;
  if (drawingData.historyPosition < drawingData.history.length-1) {
    drawingData.history.splice(drawingData.historyPosition + 1);
  }
  drawingData.history.push(Ctx.getImageData(0, 0, ElCanvas.width, ElCanvas.height));
  drawingData.historyPosition++;
  
}

function draw(e) {
  if(!drawingData.drawing) return;
  drawingData.moving = true;
  unselectText(e);
  // Calcul de la position du point actuel de la souris
  const pointX = (e.clientX - zoomMapData.pointX) / zoomMapData.scale;
  const pointY = (e.clientY - zoomMapData.pointY) / zoomMapData.scale;

  // Calcule le nombre d'étapes nécessaires pour dessiner un trait fluide entre le point de départ et le point actuel
  const distance = Math.sqrt(Math.pow(pointX - drawingData.lastPointX, 2) + Math.pow(pointY - drawingData.lastPointY, 2));
  const steps = Math.floor(distance);

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

  window.addEventListener("mouseup", (e) => {
    if (e.button === 2) {
      if (mouseData.isRightClick) {
        removeDragElement(e);
      }
      mouseData.isRightClick = false;
      mouseData.isLongRightClick = false;
      clearTimeout(mouseData.rightClickTimeout);
    }
  });

  for (const el of purpleDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("data-droppable", "true");
    el.setAttribute("data-drop-item", "true");
    el.addEventListener("mousedown", onDragMouseDown);

    INC_DRAGID++;
  }

  for (const el of orangeDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("data-droppable", "true");
    el.setAttribute("data-drop-item", "true");
    el.addEventListener("mousedown", onDragMouseDown);

    INC_DRAGID++;
  }

  for (const el of neutralDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.addEventListener("mousedown", onDragCloneMouseDown);

    INC_DRAGID++;
  }

  for (const el of baseDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.addEventListener("mousedown", onDragCloneMouseDown);

    INC_DRAGID++;
  }

  for (const el of itemDragElts) {
    el.id = `dragId-${INC_DRAGID}`;
    el.setAttribute("data-item", "true");
    el.addEventListener("mousedown", onDragCloneMouseDown);

    INC_DRAGID++;
  }
}

/**
 * Permet de déplacer un élément sur la page.
 */
function moveAt(elem, x, y) {
  const parent = elem.closest(".closed");
  if (parent) {
    x -= parent.getBoundingClientRect().x;
    y -= parent.getBoundingClientRect().y;
  }

  if (elem.classList.contains("dropped")) {
    elem.style.left = `${(x - zoomMapData.pointX) / zoomMapData.scale - elem.offsetWidth / 2}px`;
    elem.style.top = `${(y - zoomMapData.pointY) / zoomMapData.scale - elem.offsetHeight / 2}px`;
  } else {
    elem.style.left = `${x - elem.offsetWidth / 2}px`;
    elem.style.top = `${y - elem.offsetHeight / 2}px`;
  }
}

function onDragMouseDown(e, clone) {
  if (e.button === 2) {
    mouseData.isRightClick = true;
    mouseData.rightClickTimeout = setTimeout(() => {
      if (mouseData.isRightClick) {
        mouseData.isRightClick = false;
        mouseData.isLongRightClick = true;
      }
    }, 150);
  } else {
    dragFromOrigin(e, clone);
  }
}

function onDragCloneMouseDown(e) {
  onDragMouseDown(e, true);
}

/**
 * Gère le début du glisser-déposer.
 */
function dragFromOrigin(e, clone) {
  e.stopPropagation();
  e.preventDefault();

  const elem = clone ? e.target.cloneNode(true) : e.target;

  if (elem.parentElement?.getAttribute("data-drop-item")) {
    removeDragElement(e);
    return;
  }

  // Gère la suppression du tooltip de l'élément
  dragData.onmouseover = elem.onmouseover;
  dragData.onmouseout = elem.onmouseout;
  if (typeof elem.onmouseout === "function") elem.onmouseout();
  elem.onmouseover = null;
  elem.onmouseout = null;

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
    elem.addEventListener("mousedown", onDragMouseDown);
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
  document.addEventListener("mouseup", dragDrop);
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
  
  // Gère la restoration du tooltip de l'élément
  marker.element.onmouseover = dragData.onmouseover;
  marker.element.onmouseout = dragData.onmouseout;

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
    marker.pointX = e.pageX;
    marker.pointY = e.pageY;
    setDragElemTransform(marker);
  } else if (marker.element.getAttribute("data-item")
  &&  elemDroppableBelow.getAttribute("data-drop-item")) 
  {
    if (marker.element.classList.contains("hitem-mon")) {
      const items = elemDroppableBelow.getElementsByClassName("hitem-mon");
      if (items.length >= 3) {
        cancelDragAndDrop();
        return;
      }
      marker.element.style.left = null;
      marker.element.style.top = null;

      const bitems = elemDroppableBelow.querySelector(".bitem-mon");
      if (bitems) {
        elemDroppableBelow.insertBefore(marker.element, elemDroppableBelow.lastElementChild);
      } else {
        elemDroppableBelow.appendChild(marker.element);
      }
    } else if (marker.element.classList.contains("bitem-mon")) {
      const items = elemDroppableBelow.getElementsByClassName("bitem-mon");
      if (items.length >= 1) {
        cancelDragAndDrop();
        return;
      }
      marker.element.style.left = null;
      marker.element.style.top = null;
      elemDroppableBelow.appendChild(marker.element);
    }
    marker.element.removeEventListener("mousedown", onDragMouseDown, false);
    marker.element.removeEventListener("mousedown", onDragCloneMouseDown, false);
    marker.element.addEventListener("mousedown", cancelDragAndDrop);
  } else {
    cancelDragAndDrop();
    return;
  }

  document.removeEventListener("mousemove", dragMove, false);
  document.removeEventListener("mouseup", dragDrop, false);

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
  document.removeEventListener("mouseup", dragDrop, false);

  dragData.marker.element.classList.remove("dropped");
  dragData.marker.element.classList.remove("dragging");
  
  dragData.marker.element.remove();
  if (dragData.marker.parent) {
    dragData.marker.parent.appendChild(dragData.marker.element);
  }

  const childs = [];
  for (const child of dragData.marker.element.children) {
    childs.push(child);
  }
  for (const child of childs) {
    const markerIndex = Markers.findIndex(m => m.element.id === child.id);
    Markers.splice(markerIndex, 1)[0];
    child.remove();
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

  const childs = [];
  for (const child of marker.element.children) {
    childs.push(child);
  }
  for (const child of childs) {
    const markerIndex = Markers.findIndex(m => m.element.id === child.id);
    Markers.splice(markerIndex, 1)[0];
    child.remove();
  }
}

/**
 * Ajoute les évènements de zoom sur la carte
 */
function addZoomEvents() {
  ElMapContainer.addEventListener("mousedown", onMapMouseDown);
  ElMapContainer.addEventListener("mouseup", onMapMouseUp);
  window.addEventListener("mousemove", onMapMouseMove);
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
  const elArrow = self.children[0];
  if (elArrow.innerText === "◄") elArrow.innerText = "►";
  else if (elArrow.innerText === "►") elArrow.innerText = "◄";
  else if (elArrow.innerText === "▲") elArrow.innerText = "▼";
  else if (elArrow.innerText === "▼") elArrow.innerText = "▲";

  const elMenu = document.getElementById(id);
  elMenu.parentElement.classList.toggle("closed");

  const elName = self.children[1];
  elName.classList.toggle("closed")
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

function openHelp() {
  ElModalHelp.classList.remove("closed");
}

function closeHelp() {
  ElModalHelp.classList.add("closed");
}

function setLang(l) {
  ElModalHelp.classList.remove("lang-en");
  ElModalHelp.classList.remove("lang-fr");
  ElModalHelp.classList.add(l);
}

function setSelected(elem) {
  const parent = elem.parentElement;
  for (const child of parent.children) {
    if (child.classList.contains("selected")) child.classList.remove("selected");
  }
  elem.classList.add("selected");
}