
function Mvvm(options = {}) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    let data = this.$data = this.$options.data;
    observe(data); // 数据劫持
    for (let key in data) { // 数据代理
        Object.defineProperty(this, key, {
            configurable: true,
            get() {
                return this.$data[key]
            },
            set(newValue) {
                this.$data[key] = newValue;
            }
        })
    }
    render(this.$el, this);
    return this;
}

Mvvm.prototype = {
    $set(obj, key, val) {
        let data = this.$data[obj][key] = val;
        observe(data);
    }
}

function observe (data) {
    if (!data || typeof data !== 'object') return;
    let dep = new Dep();
    for (let key in data) {
        let val = data[key];
        observe(val);
        Object.defineProperty(data, key, {
            configurable: true,
            get() {
                Dep.target && dep.addSub(Dep.target);
                return val;
            },
            set(newValue) {
                if (newValue === val) {return;}
                val = newValue;
                observe(newValue);
                dep.notify();
            }
        })
    }
}

// 模板编译
function render (el, vm) {
    let fragment = document.createDocumentFragment(), child;
    while (child = el.firstChild) {
        fragment.appendChild(child);    // 此时将el中的内容放入内存中
    }
    function replace(frag) {
        let regx = /\{\{(.*?)\}\}/g;  // 正则匹配{{}}
        Array.from(frag.childNodes).forEach((node) => {
            let txt = node.textContent;
            if (node.nodeType === 3 && regx.test(txt)) {
                let arr = RegExp.$1.split('.');
                let val = vm;
                arr.forEach(key => {
                    val = val[key]; // 取值触发get
                });
                node.textContent = txt.replace(regx, val).trim();
                new Watcher(vm, RegExp.$1, newValue => {
                    node.textContent = txt.replace(regx, newValue).trim();
                });
            }
            if (node.childNodes && node.childNodes.length) {
                replace(node);
            }
        })
    }
    replace(fragment);
    vm.$el.appendChild(fragment)
}

// 发布订阅
class Dep {
    constructor() {
        this.subs = [];
    }
    addSub(sub)  {
        console.log('i am watch')
        this.subs.push(sub);
    }
    notify() {
        this.subs.forEach(sub => {
            sub.update();
        });
    }
}


class Watcher  {
    constructor(vm, exp, fn) {
        console.log('i am watcher');
        this.fn = fn;
        this.vm = vm;
        this.exp = exp;
        Dep.target = this;
        let arr = exp.split('.');
        let val = vm;
        arr.forEach(key => {
            val = val[key]; // 一层层往里取值, 触发get，添加订阅
        });
        Dep.target = null;
    }
    update() {
        console.log('i am update');
        let arr = this.exp.split('.');
        let val = this.vm;
        arr.forEach(key => {
            val = val[key];
        })
        this.fn(val);
    }
}

export default Mvvm;