"use strict";

// console.log("URL:", location.href);
// console.log("loading:", document.getElementById("loading"));

const grid = document.querySelector("#grid");
const loadingEl = document.querySelector("#loading");
const errorEl = document.querySelector("#error");
const radios = document.querySelectorAll('input[name="category"]');

// API（課題指定） 将来、URLが変更されても1箇所の修正（BASE_URL）で済む
const BASE_URL = "https://ihatov08.github.io";
const API_BASE_URL = `${BASE_URL}/kimetsu_api/api`;
const API_URL = `${API_BASE_URL}/all.json`;

// 表示制御
function showLoading() {
  loadingEl.classList.remove("hidden");
}
function hideLoading() {
  loadingEl.classList.add("hidden");
}
function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}
function hideError() {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

// radio value -> 実データの category（日本語）
const CATEGORY_MAP = {
  all: null,
  kisatsutai: "鬼殺隊",
  hashira: "柱",
  oni: "鬼",
};

// HTML生成
function renderCharacters(list) {
  grid.innerHTML = "";

  for(const ch of list) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
    <img src="${BASE_URL}${ch.image}" alt="${escapeHtml(ch.name)}">
    <div class = "name">${escapeHtml(ch.name)}</div>
    <div class = "category">${escapeHtml(ch.category)}</div>
    `;

    grid.appendChild(card);
  };
}

// fetch（選択するたびに叩く）
let currentAbortController = null;

  // データ取得
async function fetchCharacters(categoryKey) {
  if(currentAbortController) currentAbortController.abort();
  currentAbortController = new AbortController();

  showLoading();
  hideError();

  try {
    const url = `${API_BASE_URL}/${categoryKey}.json`;

    const response = await fetch(url, {
      signal: currentAbortController.signal,
    });

    if(!response.ok) {
      throw new Error(`APIの取得に失敗しました(${response.status})`);
    }

    const data = await response.json();
    renderCharacters(data);

  } catch (err) {
    // Abort はエラー表示しない
    if(err.name !== "AbortError") showError(err.message);
  } finally {
    hideLoading();
  }
}

// XSS対策（最低限）
function escapeHtml(str) {
  return String(str)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");
}

// 初期表示
fetchCharacters("all");

// ラジオボタン切り替え
radios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    fetchCharacters(e.target.value);
  });
});
