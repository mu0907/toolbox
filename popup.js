const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchBtn');
const searchEngineSelect = document.getElementById('searchEngine');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const searchHistory = document.getElementById('searchHistory');
const openTabsBtn = document.getElementById('openTabsBtn');
const blockAdsBtn = document.getElementById('blockAdsBtn');
const summaryBtn = document.getElementById('summaryBtn');
const CustomizationBtn = document.getElementById('CustomizationBtn')

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

// ページ読み込み時に初期状態を読み込む
document.addEventListener('DOMContentLoaded', () => {
  loadAdBlockState();
  displaySearchHistory();
});

// カスタマイズ設定ページを開く
CustomizationBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('customize.html') });
});

// 要約ボタンのクリックイベントリスナー
summaryBtn.addEventListener('click', () => {
  // 現在のタブを取得
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tabId = tabs[0].id;
      
      // 要約機能をタブ内で実行
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: extractAndSummarizeContent,
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error('スクリプトの実行中にエラーが発生しました:', chrome.runtime.lastError);
            alert('要約に失敗しました。ページの構造を確認してください。');
          } else if (results && results[0] && results[0].result) {
            const summary = results[0].result;
            displaySummary(summary);
          } else {
            alert('要約結果が取得できませんでした。');
          }
        }
      );
    } else {
      alert('有効なタブが見つかりませんでした。');
    }
  });
});

// ページの内容を抽出し要約する関数
function extractAndSummarizeContent() {
  // ページから主要なテキストを抽出
  const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
  let content = '';
  elements.forEach((el) => {
    const text = el.innerText.trim();
    if (text && text.length > 50) {
      content += text + ' ';
    }
  });

  // 重要文抽出 (長さベース)
  const sentences = content.split(/(?<=。|\?|!)/);
  const scoredSentences = sentences.map((sentence) => ({
    text: sentence,
    score: sentence.length, // 長い文を優先
  }));
  scoredSentences.sort((a, b) => b.score - a.score);
  const topSentences = scoredSentences.slice(0, 5).map((s) => s.text);

  return topSentences.join('\n');
}

// 要約結果を表示する関数
function displaySummary(summary) {
  const summaryWindow = window.open('', '_blank', 'width=400,height=400');
  summaryWindow.document.write(`
    <html>
      <head>
        <title>ページ要約</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          pre {
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        <h1>ページ要約</h1>
        <pre>${summary}</pre>
      </body>
    </html>
  `);
  summaryWindow.document.close();
}



// タブ管理ボタンのクリックイベント
openTabsBtn.addEventListener('click', () => {
  chrome.tabs.query({}, (tabs) => {
    displayTabs(tabs);
  });
});

// タブ情報を表示する関数
function displayTabs(tabs) {
  const tabWindow = window.open('', '_blank', 'width=600,height=400');
  tabWindow.document.write(`
    <html>
      <head>
        <title>タブ管理</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
          button {
            padding: 5px 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
          }
          button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <h1>開いているタブ</h1>
        <table>
          <thead>
            <tr>
              <th>タイトル</th>
              <th>URL</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="tabList">
          </tbody>
        </table>
        <button id="closeAllTabsBtn">すべてのタブを閉じる</button>
      </body>
    </html>
  `);

  const tabList = tabWindow.document.getElementById('tabList');
  tabs.forEach((tab) => {
    const row = tabWindow.document.createElement('tr');

    const titleCell = tabWindow.document.createElement('td');
    titleCell.textContent = tab.title || '（無題のタブ）';
    row.appendChild(titleCell);

    const urlCell = tabWindow.document.createElement('td');
    const urlLink = tabWindow.document.createElement('a');
    urlLink.href = tab.url;
    urlLink.textContent = tab.url;
    urlLink.target = '_blank';
    urlCell.appendChild(urlLink);
    row.appendChild(urlCell);

    const actionCell = tabWindow.document.createElement('td');
    const closeButton = tabWindow.document.createElement('button');
    closeButton.textContent = '閉じる';
    closeButton.addEventListener('click', () => {
      chrome.tabs.remove(tab.id, () => {
        row.remove();
        alert(`タブ [${tab.title || tab.url}] を閉じました。`);
      });
    });
    actionCell.appendChild(closeButton);
    row.appendChild(actionCell);

    tabList.appendChild(row);
  });

  const closeAllTabsBtn = tabWindow.document.getElementById('closeAllTabsBtn');
  closeAllTabsBtn.addEventListener('click', () => {
    const confirmClose = confirm('すべてのタブを閉じますか？');
    if (confirmClose) {
      const tabIds = tabs.map((tab) => tab.id);
      chrome.tabs.remove(tabIds, () => {
        tabWindow.close();
        alert('すべてのタブを閉じました。');
      });
    }
  });
}

