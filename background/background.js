// 在 service worker 中导入依赖的脚本
importScripts('../lib/dayjs.js');
importScripts('../logic.js');

// chrome.runtime.onInstalled.addListener(async () => {
//   console.log('欢迎使用');
// });

/**
 * Create offscreen page
 */
async function createOffscreen() {
  // 检查是否已存在 offscreen 页面
  const offscreenUrl = chrome.runtime.getURL('offscreen.html');
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return; // offscreen 页面已存在
  }

  // 创建 offscreen 页面
  await chrome.offscreen.createDocument({
    url: offscreenUrl,
    reasons: ['DOM_PARSER'],
    justification: 'Parse Bing translation HTML using DOMParser'
  });
}

/**
 * 获取 Bing 翻译结果（使用 Offscreen API）
 * @param {string} query 查询词汇
 * @returns {Promise<BingTranslationResult>} 翻译结果
 */
async function fetchBingTranslation(query) {
  // 确保 offscreen 页面存在
  await createOffscreen();
  
  // 获取 HTML
  const html = await fetch(`https://www.bing.com/dict/search?q=${encodeURIComponent(query)}&cc=cn`).then(r => r.text())
  
  // 发送到 offscreen 页面进行解析
  const response = await chrome.runtime.sendMessage({
    type: 'PARSE_BING_HTML',
    html: html
  });

  if (response.success) {
    return response.data;
  } else {
    console.error('解析 HTML 失败:', response.error);
    // 返回空结果
    return {
      phonetic: [],
      dict: [],
    };
  }
}



chrome.runtime.onMessage.addListener(
  ({ type, payload }, sender, sendResponse) => {
    if (type === 'tf') {
      (async () => {
        const materialList = await bluesea.getMaterials();
        const material = materialList.find((it) => it.text === payload);
        if (material && material.youdao) {
          sendResponse(material.youdao);
        } else {
          const config = await bluesea.getConfig()
          const res = await fetchBingTranslation(payload)
          const youdao = {
            query: payload,
            translation: res.dict.map(it => it.pos + it.term[0]),
          }
          sendResponse(youdao)
          // const res = await fetch(
          //   `http://8.146.208.186:9000/?text=${payload}&appkey=${config['有道智云appkey'] || ''}&key=${config['有道智云key'] || ''}`
          // ).then((raw) => raw.json());
          // if (res.success) {
          //   sendResponse(res.content);
          // } else {
          //   sendResponse();
          // }
        }
      })();
    }

    if (type === 'calcEls') {
      const forLowerCase = (text) => {
        return text.toLowerCase();
      };
      const result = payload[0].reduce((pre, cur, index) => {
        const hasExist = payload[1].some((it) => {
          return forLowerCase(cur).includes(forLowerCase(it.text));
        });
        return hasExist ? [...pre, index] : pre;
      }, []);
      sendResponse(result);
    }

    return true;
  }
);
