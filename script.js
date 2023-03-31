// VARIABLES
const zoomMapData = {
  scale: 1,
  pointX: 0,
  pointY: 0,
  start: {x: 0, y: 0},
  delta: 0
} 

// DATA
let INC_DRAGID = 0;
const dragData = {
  clone: false,
  pointX: 0,
  pointY: 0,
  dropped: false,
  markerId: -1
}
const Markers = [];

// ELEMENTS
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

(() => {
  copyPurpleToOrangePicks();
  addZoomEvents();
  setDraggableElements();

  document.addEventListener("contextmenu", event => event.preventDefault());
})();

function setDraggableElements() {
  const purpleDragElts = ElPurplePicks.getElementsByClassName("draggable");
  const orangeDragElts = ElOrangePicks.getElementsByClassName("draggable");
  const neutralDragElts = ElNeutralPicks.getElementsByClassName("draggable");
  const baseDragElts = ElBasePicks.getElementsByClassName("draggable");

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
}

function onDragStart(e, clone) {
  dragData.clone = clone;
  e.dataTransfer.setData("text/plain", e.target.id);
}

function onMapDragStart(e, dropped, markerId) {
  dragData.dropped = dropped;
  dragData.markerId = markerId;
  e.dataTransfer.setData("text/plain", e.target.id);
}

function onDragOver(e) {
  e.preventDefault();
}

function onDrop(e) {
  const id = e.dataTransfer.getData("text");
  let elem = document.getElementById(id);
  const marker = { 
    element: undefined, 
    parent: undefined, 
    pointX: 0,
    pointY: 0,
    clone: dragData.clone
  };
  console.log(1, dragData, marker)
  if (!dragData.dropped) {
    if (dragData.clone) {
      elem = elem.cloneNode(true);
      elem.id = `dragId-${INC_DRAGID}`;
  
      INC_DRAGID++;
    }
  
    marker.element = elem; 
    marker.parent = elem.parentElement; 
    marker.pointX = e.offsetX;
    marker.pointY = e.offsetY;
    
    Markers.push(marker);

    if (!dragData.clone) elem.remove();
  
    elem.classList.add("dragged");
    const index = Markers.length-1;
    elem.ondragstart = (event) => onMapDragStart(event, true, index);
    ElMap.parentElement.appendChild(elem);
    setDragElemTransform(marker);
  } else {
    Markers[dragData.markerId].pointX = e.offsetX;
    Markers[dragData.markerId].pointY = e.offsetY;
    setDragElemTransform(Markers[dragData.markerId]);
  }

  elem.onmouseup = removeDragElement;

  dragData.clone = false;
  dragData.dropped = false;
}

function removeDragElement(e) {
  e.preventDefault();
  if (e.button !== 2) return;
  
  const markerIndex = Markers.findIndex(m => m.element.id === e.target.id);
  const marker = Markers.splice(markerIndex, 1)[0];
  
  marker.element.remove();
  if (marker.parent) {
    marker.parent.appendChild(marker.element);
    marker.element.ondragstart = (event) => onDragStart(event);
  } else {
    marker.element.ondragstart = (event) => onDragStart(event, true);
  }
  marker.element.classList.remove("dragged");
  marker.element.style.scale = 1;
}

function addZoomEvents() {
  ElMap.addEventListener("mousedown", onMapMouseDown);
  ElMap.addEventListener("mouseup", onMapMouseUp);
  ElMap.addEventListener("mousemove", onMapMouseMove);
  ElMap.addEventListener("mousewheel", onMapMouseWheel);
}

function copyPurpleToOrangePicks() {
  const cloneAtk = ElPurpleAttackers.cloneNode(true);
  const cloneDfd = ElPurpleDefenders.cloneNode(true);
  const cloneSup = ElPurpleSupporters.cloneNode(true);
  const cloneArd = ElPurpleAllrounders.cloneNode(true);
  const cloneSpd = ElPurpleSpeedsters.cloneNode(true);

  cloneAtk.id = "orange-attackers";
  cloneAtk.classList.remove("purple-side");
  cloneAtk.classList.add("orange-side");
  for (let i = 0; i < cloneAtk.children.length; i++) {
    cloneAtk.children[i].classList.remove("purple-mon");
    cloneAtk.children[i].classList.add("orange-mon");
  }

  cloneDfd.id = "orange-defenders";
  cloneDfd.classList.remove("purple-side");
  cloneDfd.classList.add("orange-side");
  for (let i = 0; i < cloneDfd.children.length; i++) {
    cloneDfd.children[i].classList.remove("purple-mon");
    cloneDfd.children[i].classList.add("orange-mon");
  }

  cloneSup.id = "orange-supporters";
  cloneSup.classList.remove("purple-side");
  cloneSup.classList.add("orange-side");
  for (let i = 0; i < cloneSup.children.length; i++) {
    cloneSup.children[i].classList.remove("purple-mon");
    cloneSup.children[i].classList.add("orange-mon");
  }

  cloneArd.id = "orange-allrounders";
  cloneArd.classList.remove("purple-side");
  cloneArd.classList.add("orange-side");
  for (let i = 0; i < cloneArd.children.length; i++) {
    cloneArd.children[i].classList.remove("purple-mon");
    cloneArd.children[i].classList.add("orange-mon");
  }

  cloneSpd.id = "orange-speedsters";
  cloneSpd.classList.remove("purple-side");
  cloneSpd.classList.add("orange-side");
  for (let i = 0; i < cloneSpd.children.length; i++) {
    cloneSpd.children[i].classList.remove("purple-mon");
    cloneSpd.children[i].classList.add("orange-mon");
  }
  
  ElOrangePicks.appendChild(cloneAtk);
  ElOrangePicks.appendChild(cloneDfd);
  ElOrangePicks.appendChild(cloneSup);
  ElOrangePicks.appendChild(cloneArd);
  ElOrangePicks.appendChild(cloneSpd);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

function copyDiscordUsername() {
  copyToClipboard(ElDiscordUsername.innerText);
  
  ElDiscordTooltip.innerHTML = "Copied: " + ElDiscordUsername.innerText;
  ElDiscordTooltip.classList.remove("hide");
}

function onMouseOutTooltip(id) {
  const elTooltip = document.getElementById(id);
  elTooltip.innerHTML = "";
  elTooltip.classList.add("hide");
}

function toggleMenu(self, id) {
  if (self.innerText === "◄") self.innerText = "►";
  else if (self.innerText === "►") self.innerText = "◄";
  else if (self.innerText === "▲") self.innerText = "▼";
  else if (self.innerText === "▼") self.innerText = "▲";

  const elMenu = document.getElementById(id);
  elMenu.parentElement.classList.toggle("closed");
}

function resetZoomMap() {
  zoomMapData.scale = 1;
  zoomMapData.pointX = 0;
  zoomMapData.pointY = 0;
  zoomMapData.start = {x: 0, y: 0};

  setMapTransform();
}

function onMapMouseDown(e) {
  e.preventDefault();
  zoomMapData.start.x = e.clientX - zoomMapData.pointX;
  zoomMapData.start.y = e.clientY - zoomMapData.pointY;
  zoomMapData.panning = true;
}

function onMapMouseUp(e) {
  zoomMapData.panning = false;
}

function onMapMouseMove(e) {
  e.preventDefault();
  if (!zoomMapData.panning) return;
  zoomMapData.pointX = e.clientX - zoomMapData.start.x;
  zoomMapData.pointY = e.clientY - zoomMapData.start.y;
  setMapTransform();
}

function onMapMouseWheel(e) {
  e.preventDefault();
  const xs = (e.clientX - zoomMapData.pointX) / zoomMapData.scale;
  const ys = (e.clientY - zoomMapData.pointY) / zoomMapData.scale;
  zoomMapData.delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
  (zoomMapData.delta > 0) ? (zoomMapData.scale += 0.1) : (zoomMapData.scale -= 0.1);
  if (zoomMapData.scale < 0.1) zoomMapData.scale = 0.1;
  zoomMapData.pointX = e.clientX - xs * zoomMapData.scale;
  zoomMapData.pointY = e.clientY - ys * zoomMapData.scale;


  setMapTransform();
}

function setMapTransform() {
  ElMap.style.transform = `translate(${zoomMapData.pointX}px, ${zoomMapData.pointY}px) scale(${zoomMapData.scale})`;
  
  for (const marker of Markers) {
    marker.element.style.scale = zoomMapData.scale;
    marker.element.style.left = `${zoomMapData.pointX + marker.pointX * zoomMapData.scale - marker.element.offsetWidth / 2}px`;
    marker.element.style.top = `${zoomMapData.pointY + marker.pointY * zoomMapData.scale - marker.element.offsetHeight / 2}px`;
  }
}


function setDragElemTransform(marker) {
  marker.element.style.scale = zoomMapData.scale;
  marker.element.style.left = `${zoomMapData.pointX + marker.pointX * zoomMapData.scale - marker.element.offsetWidth / 2}px`;
  marker.element.style.top = `${zoomMapData.pointY + marker.pointY * zoomMapData.scale - marker.element.offsetHeight / 2}px`;
}