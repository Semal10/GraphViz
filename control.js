//import * as Main from './main.js';

const textInput = document.getElementById('text_input');

textInput.defaultValue = ""

function render() {
    let text = textInput.value;
    let tokens = text.split(/\s+/);
    let N = Number(tokens[0]);
    let M = Number(tokens[1]);
    let V = [];
    for (let i = 0; i < N; i++) {
        V.push(i+1);
    }
    let E = [];
    for (let i = 0; i < M; i++) {
        let u = Number(tokens[2*i + 2]);
        let v = Number(tokens[2*i + 3]);
        let e = [u, v];
        E.push(e);
    }
    let G = new Graph(V, E);
    G.draw();
}