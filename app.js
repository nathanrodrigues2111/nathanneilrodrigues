console.log(`Oh!, I see that you like to mess around with the console

-----------------------------------------------------

XXXX     XX  XXXX     XX  XXXXXXXX
XX  XX   XX  XX  XX   XX  XX    XX
XX   XX  XX  XX   XX  XX  XXXXXXXX
XX    XX XX  XX    XX XX  XX   XX
XX     XXXX  XX     XXXX  XX    XX 

-----------------------------------------------------

Want to hire me ? 
Email : nathanrodrigues2111@gmail.com
LinkedIn : https://www.linkedin.com/in/nathan-rodrigues-5a4aa6148`); 

document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);

//Three.js donut.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(15, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 10, 10).setLength(17);
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
let container = document.getElementById("ring-canvas");
if (container) {
  container.appendChild(renderer.domElement);
}

window.addEventListener("resize", (event) => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;

let gu = {
  time: { value: 0 },
};

let params = {
  instanceCount: { value: 10 },
  instanceLength: { value: 1.75 },
  instanceGap: { value: 0.5 },
  profileFactor: { value: 1.5 },
};

let ig = new THREE.InstancedBufferGeometry().copy(
  new THREE.BoxGeometry(1, 1, 1, 100, 1, 1).translate(0.5, 0, 0)
);
ig.instanceCount = params.instanceCount.value;

let m = new THREE.MeshBasicMaterial({
  vertexColors: true,
  onBeforeCompile: (shader) => {
    shader.uniforms.time = gu.time;
    shader.uniforms.instanceCount = params.instanceCount;
    shader.uniforms.instanceLength = params.instanceLength;
    shader.uniforms.instanceGap = params.instanceGap;
    shader.uniforms.profileFactor = params.profileFactor;
    shader.vertexShader = `
      uniform float time;
      
      uniform float instanceCount;
      uniform float instanceLength;
      uniform float instanceGap;
      
      uniform float profileFactor;
      
      varying float noGrid;
      
      mat2 rot(float a){return mat2(cos(a), sin(a), -sin(a), cos(a));}
      
      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
      
        float t = time * 0.1;
        
        float iID = float(gl_InstanceID);
        
        float instanceTotalLength = instanceLength + instanceGap;
        float instanceFactor = instanceLength / instanceTotalLength;
        
        float circleLength = instanceTotalLength * instanceCount;
        float circleRadius = circleLength / PI2;
        
        float partAngle = PI2 / instanceCount;
        float boxAngle = partAngle * instanceFactor;

        float partTurn = PI / instanceCount;
        float boxTurn = partTurn * instanceFactor;
        
        float startAngle = t + partAngle * iID;
        float startTurn = t * 0.5 + partTurn * iID;
        
        float angleFactor = position.x;
        
        float angle = startAngle + boxAngle * angleFactor;
        float turn = startTurn + boxTurn * angleFactor;
        
        vec3 pos = vec3(0, position.y, position.z);
        pos.yz *= rot(turn);
        pos.yz *= profileFactor;
        pos.z += circleRadius;
        pos.xz *= rot(angle);
        
        transformed = pos;
        float nZ = floor(abs(normal.z) + 0.1);
        float nX = floor(abs(normal.x) + 0.1);
        noGrid = 1. - nX;
        vColor = vec3(nZ == 1. ? 0.1 : nX == 1. ? 0. : 0.01);
      `
    );
    //console.log(shader.vertexShader);
    shader.fragmentShader = `
      varying float noGrid;
      
      float lines(vec2 coord, float thickness){
        vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord) / thickness;
        float line = min(grid.x, grid.y);
        return 1.0 - min(line, 1.0);
      }
      ${shader.fragmentShader}
    `.replace(
      `#include <color_fragment>`,
      `#include <color_fragment>
        
        float multiply = vColor.r > 0.05 ? 3. : 2.;
        float edges = lines(vUv, 3.);
        float grid = min(noGrid, lines(vUv * multiply, 1.));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1), max(edges, grid));
      `
    );
    //console.log(shader.fragmentShader)
  },
});
m.defines = { USE_UV: "" };

let o = new THREE.Mesh(ig, m);
scene.add(o);
o.rotation.z = -Math.PI * 0.25;

let clock = new THREE.Clock();
let t = 0;

renderer.setAnimationLoop(() => {
  let dt = clock.getDelta();
  t += dt;
  gu.time.value = t;
  controls.update();
  renderer.render(scene, camera);
});

// Canvas cursor.

const canvas = document.querySelector(".cursor-canvas");
const ctx = canvas.getContext("2d");

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

let mouseX = width / 2;
let mouseY = height / 2;

let circle = {
  radius: 10,
  lastX: mouseX,
  lastY: mouseY,
};

const elems = [...document.querySelectorAll("[data-hover]")];

function onResize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function render() {
  circle.lastX = lerp(circle.lastX, mouseX, 0.25);
  circle.lastY = lerp(circle.lastY, mouseY, 0.25);

  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.arc(circle.lastX, circle.lastY, circle.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.closePath();

  requestAnimationFrame(render);
}

function init() {
  requestAnimationFrame(render);

  window.addEventListener("mousemove", function (e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  });

  window.addEventListener("resize", onResize, false);

  let tween = TweenMax.to(circle, 0.25, {
    radius: circle.radius * 3,
    ease: Power1.easeInOut,
    paused: true,
  });

  elems.forEach((el) => {
    el.addEventListener(
      "mouseenter",
      () => {
        tween.play();
      },
      false
    );
    el.addEventListener(
      "mouseleave",
      () => {
        tween.reverse();
      },
      false
    );
  });
}

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

init();

// Connect with me.

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const randomCharacter = () => chars[Math.floor(Math.random() * chars.length)];
const randomString = (length) =>
  Array.from({ length }).map(randomCharacter).join("");

const cardHover = (card, letters, e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  letters.style.setProperty("--x", `${x}px`);
  letters.style.setProperty("--y", `${y}px`);

  letters.innerText = randomString(2000);
};

const cards = document.querySelectorAll(".card-hover-container");

cards.forEach((card) => {
  card.addEventListener("mousemove", (e) =>
    cardHover(card, card.querySelector(".card-bg-characters"), e)
  );
  card.addEventListener("touchmove", (e) =>
    cardHover(card, card.querySelector(".card-bg-characters"), e)
  );
});

const text = document.querySelectorAll(".text");
const halfX = window.innerWidth / 2;
const halfY = window.innerHeight / 2;

text.forEach((el, i) => {
  TweenMax.to(el, 1, {
    z: 1 * (i + 8),
  });
});

document.addEventListener("mousemove", (e) => {
  text.forEach((el, i) => {
    TweenMax.to(el, 0.5, {
      x: (e.clientX - halfX) * (i + 1) * 0.01,
      y: (e.clientY - halfY) * (i + 1) * 0.01,
    });
  });
});

AOS.init();
