const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');

const width = canvas.width = 970;
const height = canvas.height = 600;
const radius = 10;
const edgeLen = 100;

function Force(x, y) {
    this.x = x;
    this.y = y;
}

Force.prototype.add = function(f) {
    this.x += f.x;
    this.y += f.y;
}

Force.prototype.scale = function(v) {
    this.x *= v;
    this.y *= v;
}

function Node(x, y, velX, velY, color, size, val, force) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.color = color;
    this.size = size;
    this.val = val;
    this.force = force;
}

Node.prototype.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = 'crimson';
    ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.val, this.x, this.y+7);
}

Node.prototype.update = function() {
    this.velX += this.force.x;
    this.velY += this.force.y;
    this.x += this.velX;
    this.y += this.velY;
}

Node.prototype.copy = function() {
    return new Node(this.x, this.y, this.velX, this.velY, this.color, this.size, this.val, this.force);
}

function Edge(v1, v2, color) {
    this.v1 = v1;
    this.v2 = v2;
    this.color = color;
}

Edge.prototype.draw = function() {
    ctx.beginPath();
    ctx.moveTo(this.v1.x, this.v1.y);
    ctx.lineTo(this.v2.x, this.v2.y);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function dist(v1, v2) {
    return Math.sqrt((v2.x-v1.x)*(v2.x-v1.x) + (v2.y-v1.y)*(v2.y-v1.y));
}

function uvec(v1, v2) {
    let f = new Force(v2.x-v1.x, v2.y-v1.y);
    let d = dist(v1, v2);
    f.scale(1/d);
    return f;
}

function mag(x, y) {
    return Math.sqrt(x*x + y*y);
}

let nodes = [];
let edges = [];
let adj = [];

function loop() {
    for (let i = 0; i < nodes.length; i++) {
        let resultant = new Force(0, 0);
        for (let j = 0; j < nodes.length; j++) {
            if (j !== i) {
                let f = new Force(0, 0);
                if (adj[i][j]) {
                    f.add(uvec(nodes[i], nodes[j]));
                    f.scale(20*(dist(nodes[i], nodes[j])-edgeLen));
                }
                f.add(uvec(nodes[j], nodes[i]));
                f.scale(10/(dist(nodes[i], nodes[j])*dist(nodes[i], nodes[j])));
                resultant.add(f);
            }
        }
        let drag = new Force(-nodes[i].velX, -nodes[i].velY);
        drag.scale(0.005);
        resultant.add(drag);
        nodes[i].force = resultant;
    }
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
    }
}

function moveGraphToCenter() {
    let average_x = 0, average_y = 0;

    for (let i = 0; i < nodes.length; i++) {
        average_x += nodes[i].x;
        average_y += nodes[i].y;
    }

    average_x /= nodes.length;
    average_y /= nodes.length;

    for (let i = 0; i < nodes.length; i++) {
        nodes[i].x -= (average_x-canvas.width/2);
        nodes[i].y -= (average_y-canvas.height/2);
    }
}

function graphScore() {
    let mn = 100000000;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (i != j) {
                mn = Math.min(mn, dist(nodes[i], nodes[j]));
            }
        }
    }
    return mn;
}

function graphDia() {
    let mx = 0;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (i != j) {
                mx = Math.max(mx, dist(nodes[i], nodes[j]));
            }
        }
    }
    return mx;
}

function Graph(V, E) {
    this.V = V;
    this.E = E;
}

Graph.prototype.draw = function() {
    nodes = [];
    edges = [];
    adj = [];

    for (let i = 0; i < this.V.length; i++) {
        nodes.push(new Node(300+Math.floor(400*Math.random()), 200+Math.floor(400*Math.random()), 0, 0, 'white', 20, this.V[i], new Force(0, 0)));
    }
    
    for (let i = 0; i < this.V.length; i++) {
        let temp = [];
        for (let j = 0; j < this.V.length; j++) {
            temp.push(0);
        }
        adj.push(temp);
    }
    for (let i = 0; i < this.E.length; i++) {
        adj[this.E[i][0]-1][this.E[i][1]-1] = 1;
        adj[this.E[i][1]-1][this.E[i][0]-1] = 1;
    }

    var best_score = 0;
    var best_nodes = [];
    for (let j = 0; j < 20; j++) {
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].x = 300+Math.floor(400*Math.random() + 10*Math.random());
            nodes[i].y = 300+Math.floor(400*Math.random() + 20*Math.random());
            nodes[i].velX = 0;
            nodes[i].velY = 0;
            nodes[i].Force = new Force(0, 0);
        }
        for (let i = 0; i < 5000; i++) {
            loop();
        }
        let score = graphScore();
        let max_dist = graphDia();

        if (score > best_score && max_dist < canvas.height) {
            best_score = score;
            best_nodes = [];
            for (let i = 0; i < nodes.length; i++) {
                best_nodes[i] = nodes[i].copy();
            }
        }
    }

    nodes = best_nodes;
    moveGraphToCenter();
    
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, width, height);
    
    for (let i = 0; i < this.E.length; i++) {
        edges.push(new Edge(nodes[this.E[i][0]-1], nodes[this.E[i][1]-1], 'white'));
    }

    for (let i = 0; i < edges.length; i++) {
        edges[i].draw();
    }

    for (let i = 0; i < nodes.length; i++) {
        nodes[i].draw();
    }
}