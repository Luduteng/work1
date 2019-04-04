let fs = require('fs');
let path = require('path');
// 广度 优先 
function rmdirWideSeries(d, cb){
    let arr = [d];
    let index = 0;
    function next(index){
        if (index === arr.length) return rmFn(arr.length - 1);
        let currentPath = path.join(__dirname, arr[index]);
        fs.stat(currentPath, (err, statObj) => {
            if (err) return console.log('err', err)
            if (statObj.isDirectory()) {
                    fs.readdir(currentPath, (err, dirs) => {
                        if (err) return console.log('err', err)
                        dirs = dirs.map(v => path.join(arr[index], v));
                        arr = [...arr, ...dirs];
                        next(++index);
                    })
            } else {
                next(++index)
            }
        })
    }
    next(index);
    function rmFn(index) {
        if (index < 0) return cb();
        let currentPath = path.join(__dirname, arr[index]);
        fs.stat(currentPath, (err, statObj) => {
            if (statObj.isDirectory()) {
                fs.rmdir(currentPath, (err) => {
                    if (!err) {
                        rmFn(--index);
                    } else {
                        console.log('err ' + err)
                    }
                })
            } else {
                fs.unlink(currentPath, (err) => {
                    if (!err) {
                        rmFn(--index);
                    } else {
                        console.log('err ' + err)
                    }
                })
            }
        }) 
    }
}
rmdirWideSeries('a', () => {
    console.log('删除成功！！')
});
// 深度 优先 async await
// fs = require('mz/fs');
// async function rmdirSeries(d, cb) {
//     try{
//         let currentPath = path.join(__dirname, d);
//         let statObj = await fs.stat(currentPath);
//         if (statObj.isDirectory()) {
//             let dirs = await fs.readdir(currentPath);
//             async function next(index) {
//                 if (index === dirs.length) {
//                     await fs.rmdir(currentPath);
//                     return cb();
//                 };
//                 rmdirSeries(path.join(d, dirs[index]), () => next(++index))
//             }
//             next(0);
//         } else {
//            await fs.unlink(currentPath);
//            cb();
//         }
//     }catch(e){
//         console.log('err ', e)
//     }
// }
// rmdirSeries('a', () => {
//     console.log('删除成功！');
// })


