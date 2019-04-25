
function Mvvm(options = {}) {
    let vm = this;
    this.$options = options;
    this.$el = document.querySelector(options.el);
    let data = this.$data = this.$options.data;
    observe(data); // 数据劫持
    // 数据代理
    function agent(target, data) {
        if (!target || typeof target !== 'object') {
            return;
        };
        for (let key in data) { // 数据代理
            let val = data[key];
            if (val && typeof val === 'object') {
                agent(val[key], val); // 深度劫持
            };
            Object.defineProperty(target, key, {
                configurable: true,
                get() {
                    return val;
                },
                set(newValue) {
                    if (newValue === val) {return;}
                    val = newValue;
                    agent(val[key], val);
                }
            })
        }
    }
    agent(vm, data);
    render(this.$el, vm);
    return vm;
}


 
Mvvm.prototype = {
    $set(obj, key, value) {
        obj[key] = value;
        observe(obj);
    }
}

function observe (data) {
    if (!data || typeof data !== 'object') return;
    let dep = new Dep();
    for (let key in data) {
        let val = data[key];
        observe(val); // 递归深度遍历
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
            if (node.nodeType === 1) { // 元素节点
                let attrs = node.attributes;
                Array.from(attrs).forEach(attr => {
                    let name = attr.name;
                    let exp = attr.value;
                    if (name.includes('v-')) { // 如果是指令
                        let arr = exp.split('.');
                        let val = vm;
                        arr.forEach(key => {
                            val = val[key]; 
                        });
                        node.value = val;
                        new Watcher(vm, exp, newValue => {
                            node.value = newValue;
                        });
                        node.addEventListener('input', e => {
                            let newValue = e.target.value;
                            let val = vm;
                            for (let i = 0, len = arr.length; i < len; i++) {
                                let key = arr[i];
                                if (i === len - 1) {
                                    val[key] = newValue;
                                    return;
                                }
                                val = val[key];
                            }
                        })
                    }
                });
            }
            if (node.nodeType === 3 && regx.test(txt)) { // 文本节点
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
        let arr = this.exp.split('.');
        let val = this.vm;
        arr.forEach(key => {
            val = val[key];
        })
        console.log('更新数据:' + val);
        this.fn(val);
    }
}

export default Mvvm;