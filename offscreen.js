// offscreen.js - 在 offscreen 环境中处理 DOM 解析

/**
 * 获取音标信息
 * @param {Element} phonetic 音标元素
 * @returns {PhoneticInfo | undefined} 音标信息对象
 */
function getPhonetic(phonetic) {
  if (!phonetic) return
  let [name, value] = phonetic.textContent.trim().split(/\s+/)
  // 去除方括号
  value = value.slice(1, -1)
  const audioLink = phonetic.nextElementSibling?.getElementsByTagName('a')[0]
  const ttsURI = audioLink ? audioLink.getAttribute('data-mp3link') : ''
  return { name, value, ttsURI }
}

/**
 * 解析 Bing 词典 HTML
 * @param {string} html HTML 内容
 * @returns {BingTranslationResult} 解析结果
 */
function parseBingTranslation(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const result = doc.getElementsByClassName('qdef')[0]
  const americanPhonetic = doc.getElementsByClassName('hd_prUS')[0]
  const britishPhonetic = doc.getElementsByClassName('hd_pr')[0]
  
  /** @type {BingTranslationResult} */
  const res = {
    phonetic: [],
    dict: [],
  }

  // 解析音标
  if (americanPhonetic) {
    const phoneticInfo = getPhonetic(americanPhonetic)
    if (phoneticInfo) res.phonetic.push(phoneticInfo)
  }
  if (britishPhonetic) {
    const phoneticInfo = getPhonetic(britishPhonetic)
    if (phoneticInfo) res.phonetic.push(phoneticInfo)
  }

  // 解析词典定义
  if (result) {
    const partsOfSpeechAndTheirTranslation = result.querySelectorAll('ul li')
    partsOfSpeechAndTheirTranslation.forEach(item => {
      const pos = item.getElementsByClassName('pos')[0]
      if (pos) {
        const translation = pos.nextSibling
        let posStr = pos.textContent.trim()
        if (posStr === '网络') posStr = 'oth.'
        
        if (translation) {
          const translationStr = translation.textContent.trim()
          const term = translationStr.split(/；\s*/)
          res.dict.push({ pos: posStr, term })
        }
      }
    })
  }

  return res
}

/** 解析 Bing HTML 消息策略实现 */
function parseBingHtmlStrategy(message, sender, sendResponse) {
  const result = parseBingTranslation(message.html)
  sendResponse({ success: true, data: result })
}

/** 播放音频消息策略实现 */
function playAudioStrategy(message, sender, sendResponse) {
  const audio = new Audio(message.url)
  audio.play()
  sendResponse({ success: true })
}

/** 消息处理策略对象 */
const messageStrategy = {
  'PARSE_BING_HTML': parseBingHtmlStrategy,
}

// 监听来自 background script 的消息
chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
  // 只处理 offscreen 页面应该处理的消息类型
  const strategy = messageStrategy[message.type]
  if (!strategy) return false;
  
  try {
    // 调度消息策略
    await strategy(message, sender, sendResponse)
  } catch (error) {
    sendResponse({ success: false, error: error.message })
  }
  return true;
})
