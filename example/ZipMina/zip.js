const fs = require('fs')
const data = require('./address.js')

console.time('start')
let str = JSON.stringify(data.data)
let hashMap = {}

// 去除code字段
str = str.replace(/"code":"\d{6}",/g, '')

// 缩短变量名
str = str.replace(/regionEntitys/g, 'E')
str = str.replace(/region/g, 'R')

// 统计topK
for(let i = 0, len = str.length; i < len; i++){
  let char = str[i];
  if(['{', '}', '[', ']', ':', ',', '"', 'E', 'R'].indexOf(char) > -1) continue
  if(!hashMap[char]){
    hashMap[char] = 1
  }
  hashMap[char] += 1
}

let sortList = [];
for(var i in hashMap){
  sortList.push([i, hashMap[i]])
}

let top20 = sortList.sort((a,b)=>{return b[1] - a[1]}).slice(0, 20).map(i=>i[0])
let keyMap = 'abcdefghijklmnopqrstuvwxyz';

const pat = new RegExp(`(${top20.join('|')})`, 'g')
// 替换字符串
str = str.replace(pat, (hit)=>{
  let index = top20.indexOf(hit);
  return keyMap.charAt(index);
})

let top20Map = {};
top20.forEach((i, index)=>{
  top20Map[keyMap.charAt(index)] = i
})

let fileStr = `
let region = ${str};

let top20 = ${JSON.stringify(top20Map)};
let pat = new RegExp(\`(\${Object.keys(top20).join('|')})\`, 'g')
function getRegion() {
  let data = null;
  try {
    data = JSON.parse(JSON.stringify(region).replace(pat, (hit)=>{
      return top20[hit];
    }))
  } catch (error) {
    throw new Error(error);
  }
  return data
}
module.exports = getRegion;
`

fs.writeFile('demo.js', fileStr, err => {
  console.timeEnd('start')
  if(err){
    return console.log(err)
  }
  console.log('ok')
})





