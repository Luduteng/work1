// let a = require('./a');
let path = require('path');
let fs = require('fs');
let vm = require('vm');
function Module(id) {
    this.id =  id;
    this.exports = {};
    this.loaded = false;
}

Module._cache = Object.create(null);
Module._extensions = Object.create(null);
Module.wrapper = ["(function(exports, require, module, __dirname, __filename){", "})"];
// Module._pathCache[cacheKey]
Module._load = function(id) { // 判断缓存中有没有 没有创建模块 尝试加载
    let filename = Module._resolveFilename(id);
    let cacheModule = Module._cache[filename];
    if(cacheModule) {
        console.log('cacheModule.exports')
        return cacheModule.exports;
    } 
    let module = new Module(filename);
    Module._cache[filename] = module;
    tryModuleLoad(module, filename);
    return module.exports
}
Module._resolveFilename = function(id) {
    let ext = path.extname(id);
    if (!ext) {
        let exts = Object.keys(Module._extensions);
        return tryExtensions(id, exts)
    } 
    return id;
}
Module._extensions['.js'] = function(module, filename) {
    let content = fs.readFileSync(filename, 'utf8');
    module.compile(content, filename);
}
Module._extensions['.json'] = function(module, filename) {
    let content = fs.readFileSync(filename, 'utf8');
    module.exports = JSON.parse(content);
}

Module.prototype.compile = function(content, filename){
    let wrapper = Module.wrapper[0] + content + Module.wrapper[1];
    let compiledWrapper = vm.runInThisContext(wrapper);
     let result = compiledWrapper.call(this.exports, this.exports, req, this, __dirname, __filename); // 这里传入了 module 把创建对象的 exports 赋值为读取文件的exports
     return result;
}
Module.prototype.load = function(id){
    var extension = path.extname(id) || '.js';
    if (!Module._extensions[extension]) extension = js; // 如果没有找到对应扩展名的编译方法 则按js处理
    Module._extensions[extension](this, id);
}

function tryModuleLoad(module, id) {
    let threw = true;
    try{
        module.load(id);
        threw = false;
    }catch(e){
        delete Module._cache[id]
        console.log('err ' + ' ' + e)
    }
}
function tryExtensions(id, exts) {
    for (let i = 0; i < exts.length; i++) {
        try{
            let temPath = id + exts[i]
            fs.accessSync(temPath);
            return temPath;
        }catch(e) {}
    }
}

function req(id){ 
    let currentPath = path.resolve(__dirname, id);
    return Module._load(currentPath);
}

// console.log('fist', req('./b'))
// console.log('cache', req('./b'))







// require -> module.require -> Module._load -> tryModuleLoad -> module.load -> 
// 1. require(path) 方法 return module.require(path)
// 2. module 是 Module实例
// 3. 调用Module._road(id)
// 4. 检查传入名称 是不是本地模块 如果是 返回本地模块 本地模块 NativeModule.require
// 5. 检查缓存是否存在 模块如果存在 返回缓存模块
// 6. 如果不存在 const nativeModule = new NativeModule(id);

// nativeModule.cache();
// nativeModule.compile();


// 1. require(path) 方法 return module.require(path)
// 2. module 是 Module实例
// 3. 调用Module._road(id)
// 4. 检查传入名称 是不是存在父级 
// 5. 然后 解析 文件名称 Module._resolveFilename 返回加载文件的 路径  tryExtensions
// 6. var module = new Module(filename, parent);
// {
//     this.id = id;
//   this.exports = {};
//   this.parent = parent;
//   updateChildren(parent, this, false);
//   this.filename = null;
//   this.loaded = false;
//   this.children = [];
// }
// 7.   Module._cache[filename] = module;
// 8.  tryModuleLoad(module, filename);
// 9. return module.exports;
// threw
// try {
//     module.load(filename);
//     threw = false;
//   } finally {
//     if (threw) {
//       delete Module._cache[filename]; // 如果加载模块报错 则删除缓存中的模块
//     }
//   }

// module.load
// var extension = path.extname(filename) || '.js'; // 如果取不到扩展名 默认js
//   if (!Module._extensionss[extension]) extension = '.js'; // 加载不到 默认js
// Module.cache = Object.create(null); 不继承 object 原型链
// Module._extensionss = Object.create(null); 不继承 object 原型链
// this.loaded = true
// Module._extensionss = {
//     '.js': function(){
//       module._compile(stripBOM(content), filename);
// },
//     '.json': function(){},
//     '.node': function(){}
// }
//           scriptBom linux下处理windows utf8文件，发现vim头会多一个<feff>
//           module._compile(){
//           包一层 wrapper = Module.wrapper(content);
// compiledWrapper = vm.runInThisContext(wrapper, {
//     filename: filename,
//     lineOffset: 0,
//     displayErrors: true
//   });
//   compiledWrapper.call()
// }