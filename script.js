// VARIABLES
const PARSER = new DOMParser();

// DATA
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

(() => {
  copyPurpleToOrangePicks();
})();

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

function handleZoomMap(self, type) {
  const elements = document.querySelectorAll(".zoomin");
  for (const el of elements) {
    el.classList.remove("zoomin");
  }
  if (self) self.classList.add("zoomin");

  if (type === "top") {
    ElMap.classList.remove("zoom-mid", "zoom-bot");
    ElMap.classList.add("zoom-top");
  } else if (type ===  "mid") {
    ElMap.classList.remove("zoom-top", "zoom-bot");
    ElMap.classList.add("zoom-mid");
  } else if (type === "bot") {
    ElMap.classList.remove("zoom-top", "zoom-mid");
    ElMap.classList.add("zoom-bot");
  } else {
    ElMap.classList.remove("zoom-top", "zoom-mid", "zoom-bot");
  }
  
}