let mineArray = null;             // 有雷的数组索引
let mineArea = $('.mineArea');  // 雷区
let tableData = [];             // 每个位置的信息
let gameStatus = 1;             // 游戏状态 1进行中,2胜利,0失败
let mineNumber = curLevel.mineNum; //雷数目
let checkedNumber = 0;          // 翻开的数目
let successCondition = curLevel.row * curLevel.col - curLevel.mineNum;
let btns = $$('.level>button');
let DOMmineNumber = $('.mineNum');
let DOMflagNumber = $(".flagNum");
let gstatus = ['lose', 'gaming', 'win'];
let openPositionArray = [];
let chance = 3;
let chanceNumber = $('.tipInfo>span');
let cntClick = 0;
//定义变量保存时间
let before = 0;
//定义变量保存计时器时间
let time = 0;
//保存点击按钮暂停的时间
// let suspendTime = 0;
//定义变量存储分割的时间
// var cutting = 0;
let timer = null;
/**
 * 生成地雷数组
 * @retruns 返回地一个数组,这个数组存的是索引,这些位置上有雷
 */
function initMine(){
    // 根据配置生成指定大小的数组
    let arr = new Array(curLevel.row * curLevel.col);
    for (let i = 0; i < arr.length; i ++) arr[i] = i;
    
    // 打乱数组
    arr.sort(()=>0.5-Math.random());
    // 截取雷数目的索引数目
    return arr.slice(0, curLevel.mineNum);
}

/**
 * 显示答案
 */
function showAnswer(){
    let mineArr = $$("td>div.mine");
    for (let i = 0; i < mineArr.length; i ++)
    {
        mineArr[i].parentNode.style.border = "none";
        mineArr[i].style.opacity = 1;
    }
}

/**
 * 找到对应DOM在tableData里面的js对象
 * @param {*} el 
 */
function getTableItem(el) {
    // 它在DOM的属性名是data-id
    let index = el.dataset.id
    // console.log(typeof index);
    if (typeof index !== 'string') return;
    // flat 排平数组
    // let flatTableData = tableData.flat();
    // filter返回的是一个新数组 
    // flatTableData.filter(item => item.index == index)[0];
    // 坐标转换避免遍历
    // console.log(tableData[parseInt(index/curLevel.col)][index % curLevel.col])
    let [x, y] = convert2xy(index)
    return tableData[x][y]
}

/**
 * 根据对象拿到DOM元素
 * @param {*} obj.index
 */
function getDOM(index) {
    return $$("td>div")[index];
}

/**
 * 更新信息
 */
function updateInfo(){
    DOMmineNumber.innerText = `${mineNumber}`;
    DOMflagNumber.innerText = `${curLevel.mineNum - mineNumber}`;
}

/**
 * 根据状态更新
 * @param {} index 
 */
function updateGamestatus(op, index) {
    if (op === "clear")
    {
        if (index !== 1)
        {
            $('.gamestatus').classList.remove(gstatus[index]);
            gameStatus = 1;
        }
    }
    else if (op === "add")
    {
        gameStatus = index;
        $('.gamestatus').classList.add(gstatus[index]);
        clearInterval(timer);
    }
}

function resetclock(){
    //重置样式
    before = 0;
    time = 0;
    // suspendTime = 0;
    // cutting = 0;
    clearInterval(timer);
    content.innerHTML = showTime(time);
    timer = null;
}

/**
 * 搜索该单元格周围的九宫格区域
 * @param {*} el 用户点击的单元格
 */
function getAround(el) {

    let tableItem = getTableItem(el); // 获取该DOM元素在tableData里所对应的对象
    if (!tableItem) return; // 点在不是格子上不处理
    if (el.classList.contains('flag')) return; //插旗了不打开
    if (tableItem.checked) return; // 已经被打开了就返回 用checked看有没有被开
    if (tableItem.type == 'mine') return; //组件是雷也返回
    tableItem.checked = true;
    curLevel.curNum --;     // 待开数量-1
    checkedNumber ++;
    
    el.parentNode.style.border = "none"; // 将父节点div border 删掉
    el.classList.remove("canFlag");      // 标记不可插旗

    if (tableItem.value !== 0)
    {
        el.classList.add(`number${tableItem.value}`); // 如果有雷周围就添加图片类,不继续开雷\
    }
    else{
        // 递归开,如何根据单元格对象拿到dom
        let [x, y] = convert2xy(tableItem.index);
        for (let i = 0; i < 8; i ++)
        {
            let tx = x + dx[i];
            let ty = y + dy[i];
            if (tx >= 0 && tx < curLevel.row && ty >= 0 && ty < curLevel.col) //判断是否合法 ,还要防止左右跨
            {
                let tmpindex = xy2index(tx, ty);
                // console.log(tmpindex)
                getAround(getDOM(tmpindex));
            }
        }
    }
}
/**
 * 开图
 */
function searchArea(el)
{
    // console.log(el);
    // 判断是否有canflag
    // 坏处class会暴漏雷
    if (el.classList.contains('mine')) {
        // 踩雷,当前雷红色背景,其他雷显示
        el.classList.add('error');
        showAnswer();
        updateGamestatus("add", 0)
        return;
    }
    // 有   ,开图
    getAround(el);
}

/**
 * 输入一个el来探测周围雷的情况
 * @param {*} el 
 */
function detect(el){
    let tableItem = getTableItem(el); // 获取该DOM元素在tableData里所对应的对象
    if (!tableItem) return; // 点在不是格子上不处理
    let canFlagGrid = []    //没被插旗子
    let FlagGrid = []       //被插旗子
    if (tableItem.checked) // 已经被打开了就返回 看周围有没有没被打开的
    {
        let tmpDOM = $$("td>div") //获取所有div
        let [x, y] = convert2xy(tableItem.index);
        for (let i = 0; i < 8; i ++)
        {
            let tx = x + dx[i];
            let ty = y + dy[i];
            if (tx >= 0 && tx < curLevel.row && ty >= 0 && ty < curLevel.col) //判断是否合法 ,还要防止左右跨
            {
                let tmpIndex = xy2index(tx, ty);
                if (tmpDOM[tmpIndex].classList.contains('flag')) //没有被插旗子
                {
                    FlagGrid.push(tmpDOM[tmpIndex]);
                }
                else {
                    if (tmpDOM[tmpIndex].classList.contains('canFlag'))
                        canFlagGrid.push(tmpDOM[tmpIndex]);
                }
            }    
        }
    }
    // 如果能标记的格子 + 被标记的格子 == 雷的数目 说明剩下都是雷,都标雷
    if (canFlagGrid.length + FlagGrid.length === tableItem.value)
    {
        canFlagGrid.forEach(t=>{
            t.classList.add("flag")
            mineNumber --;
            return true;
        })
        return;
    }
    // 如果标的雷数目和目标相同就剩下的开掉
    if (FlagGrid.length >= tableItem.value)
    {
        canFlagGrid.forEach(t=>{
            searchArea(t);
            return true;
        })
        return
    }
    // 如果雷数和没开的格子数不相等
    canFlagGrid.forEach(t=>{
        t.parentNode.style.border = "none";
        return true;
    })
    setTimeout(() => {
        canFlagGrid.forEach(t=>{
            t.parentNode.style.border = "2px solid";
            t.parentNode.style.borderColor = "#fff #a1a1a1 #a1a1a1 #fff";
        })   
    }, 100);
}

/**
 * 场景重置
 */
function clearScene(){
    mineArea.innerText = "";
    mineArea.style.minWidth = `${curLevel.col * 24}px`;
    updateGamestatus("clear",gameStatus)
    mineNumber = curLevel.mineNum;
    tableData = [];
    openPositionArray = []
    checkedNumber = 0;
    chance = 3;
    chanceNumber.innerText = chance
    successCondition = curLevel.row * curLevel.col - curLevel.mineNum
    updateInfo();
    resetclock();
}

/**
 * 
 * @returns boolean
 */
function checkPosition(){
    for (let i = 0; i < curLevel.row; i ++)
        for (let j = 0; j < curLevel.col; j ++)
        {
            if (tableData[i][j].value === 0 && tableData[i][j].type !== "mine")
            {
                openPositionArray.push([i, j])
            }
        }
    if (openPositionArray.length < 1) return false;
    return true;
}

/**
 * 开一块
 */
function openPatch(){
    let pos = Math.ceil(Math.random() * (openPositionArray.length + 1)) - 1;
    let [x, y] = openPositionArray[pos];
    searchArea(getDOM(xy2index(x,y)));
}
/**
 * 辅助开一块
 */
function openPatch2(){
    let flag = true;
    for (let i = 0; i < curLevel.row; i ++)
    {
        if (!flag) break;
        for (let j = 0; j < curLevel.col; j ++)
        {
            if (!flag) break;
            if (!tableData[i][j].checked && tableData[i][j].type !== 'mine')
            {
                searchArea(getDOM(xy2index(i,j)));
                flag = false;
            }
        }
    }
}

/**
 * 提示信息
 * @param {} msg 
 * @param {*} duration 
 */
function tempAlert(msg, duration) {
    let el = document.createElement("div");
    el.setAttribute("style", "position:fixed;top:10%;right:10%;background-color:#FF6347;color:#FFE4B5;height:50px;width:150px;font-size:50%;text-align:center;line-height:50px;box-shadow:0px 0px 10px #FF7F50;border-radius: 15px 50px");
    el.innerHTML = msg;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, duration);
    document.body.appendChild(el);
}

/**
 * 游戏初始化函数
 */
function init(){

    clearScene(); // 清空场景
    bindEvent();
    mineArray = initMine();
    let table = document.createElement('table');

    let index = 0;

    for (let i = 0; i < curLevel.row; i ++)
    {
        let tr = document.createElement("tr");
        // 新开一行数组
        tableData[i] = [];
        for (let j = 0; j < curLevel.col; j ++)
        {
            let td = document.createElement("td");
            let div = document.createElement("div");
            // 记录每一个小格子信息,存了一个js对象,存额外信息
            // 拿一个js对象记录dom对象更详细的信息
            tableData[i][j] = {
                row : i,        // 行
                col: j,         // 列
                type: "number", // 数组,number, mine
                value: 0,       // 周围雷的数量
                index,          // 格子的下标
                checked: false  // 是否被检验过
            }
            // 位每一个div添加一个下标,方便用户点击的时候获取对应格子的下标 名字段是data-id
            div.dataset.id = index;
            // 标记能否插旗子
            div.classList.add("canFlag");
            // 查看当前格子的下标是否在雷的数组里面
            if (mineArray.includes(tableData[i][j].index)){
                // 当前对象类型数字改为雷
                tableData[i][j].type = "mine";
                // 添加一个雷的类
                div.classList.add("mine");
            }

            td.appendChild(div);
            // 有字的时候要去除border
            tr.appendChild(td);
            index ++;
        }
        table.appendChild(tr);
    }
    updateMine();
    mineArea.appendChild(table);
    if (!checkPosition())
    {
        init();
        return;
    }
    if (curLevel.total > 100)
        openPatch();

}

/**
 * 计时功能
 */
function Time(){
    if (gameStatus === 1 && before == 0)
    {
        //获取相对的时间
        before = new Date().getTime();
        timer = setInterval(() => {
            //实时时间
            var now = new Date().getTime();
            //计时器时间 = 实时时间 - 相对时间 + 点击暂停按钮时保存的时间
            time = now - before;
            //把处理过的时间显示到content标签中
            content.innerHTML = showTime(time);
        }, 1000 / 60);
    }
}

/**
 * 该方法用来处理点击事件
 * @param {传入一个点击事件} e 
 * @returns 
 */
function processClick(e){
        // div没有canFlag && class不为空 说明有图片
        if (e.target.classList.length !== 0 && !e.target.classList.contains('canFlag'))
        {
            Time();
            detect(e.target);
        }
        // 如果插了旗子,转到删除旗子
        else if (e.target.classList.contains('flag'))
        {
            Time();
            if (e.button === 2) return;
            if (e.target.classList.contains('flag')) mineNumber++;
            else mineNumber--;
            e.target.classList.toggle('flag');
        }
        // 移除边框,增加雷图,且不可点击 e.button 0左键,1滚轮 2右键  考虑柯里化
        else if (e.button === 0)
        {
            Time();
            searchArea(e.target)// 开图
        }
        updateInfo()
        // 游戏在进行中吗, 翻开的所有都不是雷, 且旗子插完了
        if (gameStatus === 1 && checkedNumber === successCondition && mineNumber === 0)
        {
            updateGamestatus("add", 2); // 修改表情.
        }
}

/**
 * 扫雷游戏事件逻辑
 */
function bindEvent(){
    // 给雷区添加点击事件
    // onmousedown部分左右键
    if (document.body.clientWidth < 800 )
    {
        mineArea.onmousedown = function(e) {
            if (gameStatus !== 1 || cntClick === 2) return;
            e.preventDefault();
                cntClick ++;
                setTimeout(() => {
                    if (cntClick >= 2)
                    {
                        if (gameStatus === 0 || mineNumber === 0) return;
                        // console.log(e.target);
                        // 添加或移除 flag类样式,且不可点击
                        if (e.target.classList.contains('canFlag'))
                        {
                            Time();
                            if (e.target.classList.contains('flag')) mineNumber++;
                            else mineNumber--;
                            e.target.classList.toggle('flag');
                            updateInfo();
                        }
                    }
                    if (cntClick === 1)
                        processClick(e);
                    cntClick = 0;
                }, 400);
        }
    }
    else {
        mineArea.onmousedown = function(e) {
            if (gameStatus !== 1) return;
            e.preventDefault();
            processClick(e);
        }
    }
    // oncontextmenu右键,默认的鼠标右键弹出菜单的行为
    mineArea.oncontextmenu = function(e){
        e.preventDefault();
        // 游戏结束,旗子数量满了不能插旗子
        if (gameStatus === 0 || mineNumber === 0) return;
        // console.log(e.target);
        // 添加或移除 flag类样式,且不可点击
        if (e.target.classList.contains('canFlag'))
        {
            Time();
            if (e.target.classList.contains('flag')) mineNumber++;
            else mineNumber--;
            e.target.classList.toggle('flag');
            updateInfo();
        }
    }
    // 先去掉所有active,然后给当前元素添加active
    $('.level').onclick = function (e) {
        // console.log(1);
        for (let i = 0; i < btns.length; i ++)
        {
            btns[i].classList.remove("active");
        }
        e.target.classList.add("active");
        // console.log(e.target.innerText);
        switch(e.target.innerText){
            case "初级": {
                curLevel = config.easy;
                break;
            }
            case "中级": {
                curLevel = config.normal;
                break;
            }
            case "高级": {
                curLevel = config.hard;
                break;
            }
        }
        // console.log(curLevel);
        init();
    }

    $('.gamestatus').onclick = function(e) {
        // e.preventDefault();
        init();
    }
    $('.autoOpen').onclick = function(e) {
        // e.preventDefault();
        if (checkedNumber + curLevel.mineNum === curLevel.total)
        {
            tempAlert("剩下的都是雷",1000);
            return;
        }
        if (chance > 0)
        {
            chance --;
            openPatch2();
            chanceNumber.innerText = chance
        }
        else{
            tempAlert("没有开雷机会了",1000);
        }
    }
}

/**
 * 用于更新雷表
 */
function updateMine (){
    for (let i = 0; i < curLevel.row; i ++)
        for (let j = 0; j < curLevel.col; j ++)
        {
            if (tableData[i][j].type == "mine")
            {
                for (let k = 0; k < 8; k ++)
                {
                    let tx = i + dx[k];
                    let ty = j + dy[k];
                    if (tx >= 0 && tx < curLevel.row && ty >= 0 && ty < curLevel.col)
                    {
                        tableData[tx][ty].value ++;
                    }
                }
            }
        }
}

function main() {
     init();
}

function addRank() {
    let el = document.createElement("div");
    el.setAttribute("style", 
        "position:fixed;width:200px;height:500px;top:30%;left:450%;background-color:#FFE4B5;height:50px;width:150px;font-size:50%;text-align:cent;border-radius: 15px");
    el.innerHTML = msg;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, 1000);
    document.body.appendChild(el);
}


function showTime(time){
    //定义变量  小时  分钟 秒 毫秒
    var hour;
    var min;
    var second;
    var msecond;

    //分别  获取到小时 分钟 秒 毫秒
    hour = Math.floor(time / (3600 * 1000));
    min = Math.floor(time / 1000 / 60 % 60);
    second = Math.floor(time / 1000 % 60);
    msecond = time % 1000;

    //对时间进行处理
    hour = hour < 10 ? "0" + hour : hour;
    min = min < 10 ? "0" + min : min;
    second = second < 10 ? "0" + second : second;
    msecond = msecond < 100 ? "0" + msecond : msecond;
    msecond = msecond < 10 ? "0" + msecond : msecond;

    return hour + ":" + min + ":" + second + ":" + msecond;
}
main()