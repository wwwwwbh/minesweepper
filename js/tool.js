
// 封装一个类似jquery的$选择器
// 选一个
function $(selector) {
    return document.querySelector(selector);
}
// $('.className')使用
// 全选
function $$(selector) {
    return document.querySelectorAll(selector);
}

function convert2xy(index) {
    index = parseInt(index)
    let x = parseInt(index / curLevel.col); //行数
    let y = index % curLevel.col; //列数
    return [x, y]
}
function xy2index(x, y) {
    return x * curLevel.col + y;
}
// $$('ul li')