const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchBtn');
const searchEngineSelect = document.getElementById('searchEngine');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const searchHistory = document.getElementById('searchHistory');
const openTabsBtn = document.getElementById('openTabsBtn');
const blockAdsBtn = document.getElementById('blockAdsBtn');
const summaryBtn = document.getElementById('summaryBtn');
const loginBtn = document.getElementById('loginBtn');
const userEmail = document.getElementById('userEmail');
const syncBtn = document.getElementById('syncBtn');

let isBlockingAds = false;

// 検索処理を実行する関数
function performSearch() {
  const query = searchInput.value.trim();
  const selectedEngine = searchEngineSelect.value;

  if (query) {
    let searchUrl;

    switch (selectedEngine) {
      case 'google':
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'yahoo':
        searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
        break;
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'duckduckgo':
        searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        break;
      case 'brave':
        searchUrl = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
        break;
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    chrome.tabs.create({ url: searchUrl });
    saveSearchHistory(query); // 検索履歴にクエリを保存
    displaySearchHistory(); // 検索履歴を更新して表示
  }
}

// 検索ボタンクリックしたときの処理
searchButton.addEventListener('click', performSearch);

// 検索バーでエンターキーが押されたときの処理
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    performSearch();
  }
});

// 検索履歴の保存（永続的に保存）
function saveSearchHistory(query) {
  chrome.storage.local.get({ searchHistory: [] }, (result) => {
    let history = result.searchHistory;
    const encryptedQuery = btoa(query); // Base64エンコード（簡易暗号化）
    history.unshift(encryptedQuery);
    chrome.storage.local.set({ searchHistory: history });
  });
}

// 検索履歴の表示（保存した履歴を復元）
function displaySearchHistory() {
  chrome.storage.local.get({ searchHistory: [] }, (result) => {
    searchHistory.innerHTML = '';
    result.searchHistory.forEach((query) => {
      const decodedQuery = atob(query); // Base64デコード
      const listItem = document.createElement('li');
      listItem.textContent = decodedQuery;
      searchHistory.appendChild(listItem);
    });
  });
}

// 履歴を消去するボタン
clearHistoryBtn.addEventListener('click', () => {
  chrome.storage.local.set({ searchHistory: [] }, () => {
    displaySearchHistory();
    alert('検索履歴が消去されました。');
  });
});

// タブの管理ボタン
openTabsBtn.addEventListener('click', () => {
  chrome.tabs.query({}, (tabs) => {
    const tabUrls = tabs.map(tab => tab.url);
    console.log('開いているタブ: ', tabUrls);
    alert(`現在開いているタブ数: ${tabs.length}`);
  });
});

// 広告ブロック機能の切り替え
blockAdsBtn.addEventListener('click', () => {
  isBlockingAds = !isBlockingAds;
  if (isBlockingAds) {
    chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: ['blockAds'] });
    alert('広告がブロックされました。');
  } else {
    chrome.declarativeNetRequest.updateEnabledRulesets({ disableRulesetIds: ['blockAds'] });
    alert('広告のブロックが解除されました。');
  }
  saveAdBlockState();
  updateAdBlockButton();
});

function updateAdBlockButton() {
  blockAdsBtn.textContent = isBlockingAds ? '広告のブロックを解除' : '広告をブロック';
  blockAdsBtn.style.backgroundColor = isBlockingAds ? 'red' : '#007bff';
}

function loadAdBlockState() {
  chrome.storage.local.get({ isBlockingAds: false }, (result) => {
    isBlockingAds = result.isBlockingAds;
    updateAdBlockButton();
  });
}

function saveAdBlockState() {
  chrome.storage.local.set({ isBlockingAds: isBlockingAds });
}

// Googleアカウントログイン処理
loginBtn.addEventListener('click', () => {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token)
      .then((response) => response.json())
      .then((userInfo) => {
        userEmail.textContent = userInfo.email;
      });
  });
});

// ページ読み込み時に初期状態を読み込む
document.addEventListener('DOMContentLoaded', () => {
  loadAdBlockState();
  loadSearchEnginePreference();
  displaySearchHistory();
});

// 検索エンジンの設定保存
searchEngineSelect.addEventListener('change', () => {
  const selectedEngine = searchEngineSelect.value;
  chrome.storage.local.set({ selectedEngine: selectedEngine });
});

// 検索エンジン設定の読み込み
function loadSearchEnginePreference() {
  chrome.storage.local.get({ selectedEngine: 'google' }, (result) => {
    searchEngineSelect.value = result.selectedEngine;
  });
}

// ページの要約機能を実装
summaryBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: summarizePageContent
    });
  });
});

function summarizePageContent() {
  // ページのテキストコンテンツを取得
  let pageText = document.body.innerText;

  // 2000文字以内に制限（文単位で制限）
  let truncatedText = pageText.slice(0, 2000);

  // 2000文字の中で最後の文が途切れないように文の区切りで再調整
  let sentences = truncatedText.split('. ').slice(0, -1).join('. ') + '.';

  // 概要を表示
  alert("ページの概要:\n" + sentences);
}
