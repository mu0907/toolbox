chrome.runtime.onInstalled.addListener(() => {
  console.log("拡張機能がインストールされました。");

  const rules = [
    {
      "id": 1,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "urlFilter": "*doubleclick.net*",
        "resourceTypes": ["script", "image", "sub_frame"]
      }
    },
    {
      "id": 2,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "urlFilter": "*adservice.google.com*",
        "resourceTypes": ["script", "image", "sub_frame"]
      }
    },
    {
      "id": 3,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "urlFilter": "*taboola.com*",
        "resourceTypes": ["script", "image", "sub_frame"]
      }
    }
  ];

  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
    removeRuleIds: [1, 2, 3]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      console.log("広告ブロックルールが適用されました。");
    }
  });
});

chrome.tabs.onCreated.addListener((tab) => {
  console.log(`作成されたタブ: ${tab.id}`);
});
