
function mvvm(options = {}) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    let data = this.$data = this.$options.data;
    observe(data, this);
    for (let key in data) {
        Object.defineProperty(this, key, {
            configurable: true,
            get() {
                return this.$data[key]
            },
            set(newValue) {
                this.$data[key] = newValue;
                render(this.$el, this);
            }
        })
    }
    render(this.$el, this);
    return this;
}

function observe (data, vm) {
    if (!data || typeof data !== 'object') return;
    for (let key in data) {
        let val = data[key];
        observe(val, vm);
        Object.defineProperty(data, key, {
            configurable: true,
            get() {
                return val;
            },
            set(newValue) {
                if (newValue === val) {return;}
                val = newValue;
                render(vm.$el, vm);
            }
        })
    }
}

function render (el, vm) {
    console.log('i am in');
    console.log(vm);
    let fragment = document.createDocumentFragment(), child;
    while (child = el.firstChild) {
        fragment.appendChild(child);    // 此时将el中的内容放入内存中
    }
    // console.log(fragment.childNodes);
    function replace(frag) {
        let regx = /\{\{(.*?)\}\}/g;  // 正则匹配{{}}
        Array.from(frag.childNodes).forEach((node) => {
            let txt = node.textContent;
            if (node.nodeType === 1 && regx.test(txt)) {
                let arr = RegExp.$1.split('.');
                let val = vm;
                arr.forEach(key => {
                    val = val[key];
                });
                node.textContent = txt.replace(regx, val).trim();
            }
        })
    }
    replace(fragment);
    vm.$el.appendChild(fragment)
}

export default mvvm;