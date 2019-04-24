import Mvvm from '../lib/mvvm.js';

window.vm = new Mvvm({
    el: '#app',
    data: {
        message: 'hell world',
        h2: 'hell h2',
        obj: {
            a: {
                c: 'ss'
            },
            b: 'i am b'
        }
    }
})