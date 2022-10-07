let $ = function(name) {
    return document.querySelector(name);
}

let create_el = function(name) {
    return document.createElement(name);
}

let time = 10.000

const upload = $('#uploadimg');
const imgContainer = $('#imgContainer');
const img = $('#img');
const icon = $('#icon');
const filemaxsize = 1024
// 平时置0,通关了置1
let posttime = 1;
// const filetypes = [".jpg", "jpg", ]
let server = "http://81.68.153.205:8000/rank/"
// 创建对象
// var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

let imgUrl = '';
// 图片上传成功后创建 URL
upload.onchange = function (e) {
    // 可以上传多图的,这里就一个头像
    const fileList = e.target.files;
    // 有文件
    if (fileList.length) {
        let file = fileList[0]
        let filesize = file.size;
        if (filesize / 1024 > filemaxsize)
        {
            alert(`文件大小不能超过${filemaxsize / 1024}Mb`)
            upload.value = '';
            return ;
        }
        // 后缀判断,拿到后缀然后和types Array逐个比
        // let fileend = filepath.substring(filepath.indexOf("."));

        imgContainer.style.display = 'block';
        icon.style.display = 'none';
        imgUrl = window.URL.createObjectURL(file);
        img.src = imgUrl;
    }
}



$('#delImg').onclick = function(e){
    e.preventDefault();
    upload.value = '';
    imgContainer.style.display = 'none';
    icon.style.display = 'block';
    img.src = "";
}

// console.log($(".showForm"));
$(".showForm").onclick = function(e) {
    this.style.display = 'block';
}.bind($(".container"))
$(".close").onclick = function(e) {
    // 判断是否要关闭,搞一个计数
    // 上传过一次直接关闭
    // 没上传过就提示一下是否要关闭,次数归零
    this.style.display = 'none';
    posttime = 0;
}.bind($(".container"))

$(".join").onclick = function(e) {
    // 如果上传过一次不可以上传了,防止手速太快点两次
    if (posttime === 0)
    {
        alert("已经加入排行榜了");
    }
    // 次数置0
    posttime = 0;
    // 这一块将图片上传到服务器拿到图片url
    // http://81.68.153.205:8000/1664786217683.jpg
    // 可以从服务器根据url访问到静态资源
    let imgfile = upload.files[0];
    let formdata = new FormData();
    formdata.append('iconhead',imgfile);
    // console.log(formdata.get('iconhead'));
    const xhr = new XMLHttpRequest();
    // 初始化,给谁发
    xhr.open('post', `${server}join`, true)
    // 发送
    xhr.send(formdata);
    // 处理相应结果
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4)
            // 判断响应状态码
            if (xhr.status >= 200 && xhr.status < 300) {
                // 控制台输出响应体
                // console.log(xhr.response);
                postRank(JSON.parse(xhr.response).img)
            } else {
                // 控制台输出响应状态码
                console.log(xhr.status);
                posttime = 1;
            }
    }

}
function postRank(imgurl)
{
    // let imgurl = "http://81.68.153.205:8000/1664786217683.jpg";
    let apidata = {
        "username" : `${$('.username').value}`,
        "passtime" : `${time}`,
        "imageurl" : `${imgurl}`,
        "degree" : "easy"
    }
    const xhr2 = new XMLHttpRequest();
    xhr2.open('post', `${server}insert`, true);
    xhr2.setRequestHeader('content-type', 'application/json')
    xhr2.send(JSON.stringify(apidata))
    xhr2.onreadystatechange = function(){
        if (xhr2.readyState === 4)
        // 判断响应状态码
        if (xhr2.status >= 200 && xhr2.status < 300) {
            // 控制台输出响应体
            // console.log(xhr2.response);
            $('.container').style.display = 'none';
            alert("加入排行榜成功!")
        } else {
            // 控制台输出响应状态码
            posttime = 1;
            alert("加入排行榜失败!")
        }  
    }
}

$('.getrank').onclick = function(e) {
    const xhr = new XMLHttpRequest();
    xhr.open('get', `${server}getrank?degree=easy`, true);
    // xhr.setRequestHeader('content-type', 'application/json')
    // xhr.send(JSON.stringify(apidata))
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4)
        // 判断响应状态码
        if (xhr.status >= 200 && xhr.status < 300) {
            
            // 创造头
            let list = create_el('table');
            let info = JSON.parse(xhr.responseText)
            let theadDatas = ['排名','头像', '昵称', '通关时间'];
            list.appendChild(create_head(theadDatas))
            createTable(list, info)


            $('.rankArea').appendChild(list);
            // alert("成功")
        } else {
            alert("获取排行榜发生错误")
        }  
    }

}

function create_head(theadDatas) {
    let th = create_el('thead');
    let thr = create_el('tr')
    for (let i = 0; i < theadDatas.length; i ++)
    {
        let td = create_el("td");
        td.innerText = theadDatas[i];
        thr.appendChild(td);
    }
    th.appendChild(thr);
    return th;
}

function createTable(table, Datas) {
    let tbody = create_el("tbody");
    for (let i = 0; i < Datas.length; i ++)
    {
        // icon, username, passtime
        let tr = create_el("tr");

        let td1= create_el("td");
        td1.innerText = `${i + 1}`
        tr.appendChild(td1)

        let td2 = create_el("td");
        let img = create_el("img");
        img.src = `http://81.68.153.205:8000/${Datas[i].img}`
        img.alt = `头像`
        td2.appendChild(img)
        tr.appendChild(td2)

        let td3 = create_el("td");
        td3.innerText = `${Datas[i].username}`
        tr.appendChild(td3)

        let td4 = document.createElement("td");
        td4.innerText = `${Datas[i].passtime}`
        tr.appendChild(td4)

        tbody.appendChild(tr)
    }
    table.appendChild(tbody)
}

// function getRequest(){
//     const xhr = new XMLHttpRequest();
//     // 初始化,给谁发
//     xhr.open('GET', "http://81.68.153.205:8000/rank/test")
//     // 发送
//     xhr.send();
//     // 处理相应结果
//     xhr.onreadystatechange = function(){
//         if (xhr.readyState === 4)
//             // 判断响应状态码
//             if (xhr.status >= 200 && xhr.status < 300) {
//                 // 控制台输出响应体
//                 console.log(xhr.response);
//             } else {
//                 // 控制台输出响应状态码
//                 console.log(xhr.status);
//             }
//     }
// }
