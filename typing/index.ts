interface TB {
  /** 单词字符串 */
  query: string
}
interface TfData {
  /** 单词字符串 */
  query: string
  returnPhrase: any[]
  basic: any
  translation: any
}

/** 单词数据 */
interface Material {
  /** 原单词 */
  text: string,
  /** 扩展单词 */
  textExts: string[],
  /** 翻译 */
  translation: string,
  /** 创建时间 */
  ctime: string,
  /** 学习状态 */
  learn: any,
  /** 保留完整数据，后面可能会使用 */
  youdao: any,
  /** 添加来源 */
  addFrom: string,
}
