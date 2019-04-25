import Mvvm from '../lib/mvvm.js';

window.vm = new Mvvm({
    el: '#app',
    data: {
        message: 'hell world',
        obj: {
            a: {
                c: 'i am obj.a.c'
            },
            b: 'i am obj.b'
        }
    }
})