const inBlackEl = (el) => {
  const blackElList = ['pre', 'code'].map((it) => it.toUpperCase());
  if (!el.parentNode) {
    return false;
  }

  if (blackElList.includes(el.nodeName)) {
    return true;
  } else {
    return inBlackEl(el.parentNode);
  }
};

let lastText = '';



const listenMouseup = (e) => {
  // console.log(' ================== 开始匹配选中模式 ================= ')
  if (isYTL(e.target)) {
    return;
  }
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
      let selectText = selection.toString().trim();


      if (lastText === selectText) {
        lastText = '';
        return;
      }

      if (selectText === '') {
        return;
      }

      // 不翻译中文
      if (!/^[^\u4e00-\u9fa5]+$/.test(selectText)) {
        // console.log(' ================== 匹配为中文 ================= ')
        return;
      }

      if (!/.*[a-zA-Z]{3,}.*/.test(selectText)) {
        // console.log(' ================== 匹配单词太短 ================= ')
        return;
      }

      const selectTextArr = selectText.split(' ');

      if (selectTextArr.length === 1) {
        // 非句子情况下，仅匹配纯粹单词，如果匹配到特殊符号就跳过，这里是为了避免干扰复制各类命令或url
        // 是否需要兼容，可能存在左右端误选了标点符号的情况呢？
        const symbolReg = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/im;
        if (symbolReg.test(selectText)) {
        // console.log(' ================== 匹配到特殊符号 ================= ')
          return;
        }
      }

      // 过滤类似日志文件之类的奇怪玩意。
      // 最长的单词45个字母，Pneumonoultramicroscopicsilicovolcanoconiosis
      if (selectTextArr.some((it) => it.length > 45)) {
        // console.log(' ================== 匹配单词过长 ================= ')
        return;
      }

      // 开始和边界不在黑名单标签内
      // if (inBlackEl(range.startContainer) || inBlackEl(range.endContainer)) {
      //   console.log('选中的内容存在特殊标签内，不展开');
      //   return;
      // }

      const rangeRect = range.getBoundingClientRect();

      selectedAxTip.render(rangeRect, {
        text: selectText,
        onMark: async (youdao) => {
          const material = bluesea.createMaterialObj(youdao.query, youdao);
          await bluesea.addMaterialObj(material);
          selectedAxTip.clear();
        },
      });
    }
  }
};

const listenMousedown = (e) => {
  if (isYTL(e.target)) {
    return;
  }
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    lastText = selection.toString().trim();
  }
  axTip.clear();
  selectedAxTip.clear();
};

document.addEventListener('DOMContentLoaded', () => {
  funCtrl.run(
    '划词翻译',
    () => {
      document.addEventListener('mouseup', listenMouseup);
      document.addEventListener('mousedown', listenMousedown);
    },
    () => {
      selectedAxTip.clear();
      document.removeEventListener('mouseup', listenMouseup);
      document.removeEventListener('mousedown', listenMousedown);
    }
  );
});
