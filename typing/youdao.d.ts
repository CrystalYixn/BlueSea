/**
 * 音标信息
 */
interface PhoneticInfo {
  /** 音标类型名称 (如 "美式", "英式") */
  name: string;
  /** 音标值 */
  value: string;
  /** TTS 语音链接 */
  ttsURI: string;
}

/**
 * 词典条目
 */
interface DictEntry {
  /** 词性 */
  pos: string;
  /** 翻译词条 */
  term: string[];
}

/**
 * Bing 翻译返回结果
 */
interface BingTranslationResult {
  /** 音标信息列表 */
  phonetic: PhoneticInfo[];
  /** 词典条目列表 */
  dict: DictEntry[];
}

interface YouDao {
  
  /**
   * 源语言
   * @description 查询正确时，一定存在
   */
  query: string;
  
  /**
   * 翻译结果
   * @description 查询正确时，一定存在
   */
  translation: string[];
}
