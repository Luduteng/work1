
class Promise {
    constructor(executor) {
      this.status = 'pending';
      this.value = undefined;
      this.reason = undefined; 
      this.onFulfilledCallbacks = [];
      this.onRejectedCallbacks = [];
      let resolve = value => {
        if (this.status === 'pending') {
            this.status = 'success';
            this.value = value;
            this.onFulfilledCallbacks.forEach(fn=>fn());
        } 
      }
      let reject = reason => {
        //   console.log('rejectedFn')
        if (this.status === 'pending') {
            this.status = 'rejected';
            this.reason = reason;
            this.onRejectedCallbacks.forEach(fn=>fn());
        } 
        // console.log('rejectedFn status', this.status)
      }
      try{
      executor(resolve, reject);
      }catch(e) {
          reject(e)
      }
    }
    static deferred() {
        let dfd = {};
        dfd.promise = new Promise((resolve, reject) => {
            dfd.resolve = resolve;
            dfd.reject = reject;
        })
        return dfd;
    }
    static all(values){
        
        
        return new Promise((resolve, reject) => {
            let result = [];
            let count = 0;
            function processData(i, data){
                result[i] = data;
                if (++count == values.length){
                    resolve(result);
                }
            }
            for(let i = 0; i < values.length; i++) {
                let current = values[i];
                let then = current.then;
                if (then && typeof then === 'function') {
                    then.call(current, (data) => {
                        processData(i, data);
                    }, reject)
                } else {
                    resolve(current);
                }
            }
        })
    }
    catch(errCal) {
        return this.then(null, errCal)
    }
    finally(fn){
        fn();
        return this;
    }
    resolvePromise(promise2, x, resolve, reject) {
        if(promise2 === x) {
            reject(new TypeError('循环引用'))
        }
        if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
            let called;
            try{
                let then = x.then;
                if (typeof then === 'function') {
                    then.call(x, y => {
                        if(called) return;
                        called = true;
                        this.resolvePromise(promise2, y, resolve, reject);
                    }, r => {
                        if(called) return;
                        called = true;
                        reject(r);
                    })
                } else {
                    if(called) return;
                    called = true;
                    resolve(x)
                }
            }catch(e) {
                if(called) return;
                    called = true;
                reject(e)
            }
        } else {
            resolve(x)
        }
    }
    then(onfulfilled, onrejected) {
        onfulfilled = typeof onfulfilled === 'function' ? onfulfilled : val => val;
        onrejected = typeof onrejected === 'function' ? onrejected : err=> {throw err};
        let promise2 = new Promise((resolve, reject) => {
            if (this.status === 'success') {
                setTimeout(() => {
                    try{
                        let x = onfulfilled(this.value);
                        this.resolvePromise(promise2, x, resolve, reject);
                    }catch(err) {
                        reject(err);
                    }
                })
            }
            // console.log('status', this.status, this.reason)
            if (this.status === 'rejected') {
                setTimeout(() => {
                    try{
                        let x = onrejected(this.reason);
                        // console.log(this.resolvePromise);
                        this.resolvePromise(promise2, x, resolve, reject);
                    }catch(err) {
                        reject(err);
                    }
                })
            }
            if (this.status === 'pending') {
                    this.onFulfilledCallbacks.push(() => {
                    setTimeout(() => {
                        try{
                            let x = onfulfilled(this.value);
                            this.resolvePromise(promise2, x, resolve, reject);
                        }catch(err) {
                            reject(err);
                        }
                    })
                    })
                    this.onRejectedCallbacks.push(() => {
                        setTimeout(() => {
                        try{
                            let x = onrejected(this.reason);
                            this.resolvePromise(promise2, x, resolve, reject);
                        }catch(err) {
                            reject(err);
                        }
                    })
                    })
            }
        })
        return promise2
    }
 }
 module.exports = Promise;