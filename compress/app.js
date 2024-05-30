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
LinkedIn : https://www.linkedin.com/in/nathan-rodrigues-5a4aa6148`),document.documentElement.style.setProperty("--vh",`${window.innerHeight}px`);import*as e from"three";import{OrbitControls as n}from"three/addons/controls/OrbitControls.js";let scene=new e.Scene,camera=new e.PerspectiveCamera(15,innerWidth/innerHeight,1,1e3);camera.position.set(0,10,10).setLength(17);let renderer=new e.WebGLRenderer({antialias:!0});renderer.setSize(innerWidth,innerHeight);let container=document.getElementById("ring-canvas");container&&container.appendChild(renderer.domElement),window.addEventListener("resize",e=>{camera.aspect=innerWidth/innerHeight,camera.updateProjectionMatrix(),renderer.setSize(innerWidth,innerHeight)});let controls=new n(camera,renderer.domElement);controls.enableDamping=!0,controls.enableZoom=!1;let gu={time:{value:0}},params={instanceCount:{value:10},instanceLength:{value:1.75},instanceGap:{value:.5},profileFactor:{value:1.5}},ig=new e.InstancedBufferGeometry().copy(new e.BoxGeometry(1,1,1,100,1,1).translate(.5,0,0));ig.instanceCount=params.instanceCount.value;let m=new e.MeshBasicMaterial({vertexColors:!0,onBeforeCompile(e){e.uniforms.time=gu.time,e.uniforms.instanceCount=params.instanceCount,e.uniforms.instanceLength=params.instanceLength,e.uniforms.instanceGap=params.instanceGap,e.uniforms.profileFactor=params.profileFactor,e.vertexShader=`
      uniform float time;
      
      uniform float instanceCount;
      uniform float instanceLength;
      uniform float instanceGap;
      
      uniform float profileFactor;
      
      varying float noGrid;
      
      mat2 rot(float a){return mat2(cos(a), sin(a), -sin(a), cos(a));}
      
      ${e.vertexShader}
    `.replace("#include <begin_vertex>",`#include <begin_vertex>
      
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
      `),e.fragmentShader=`
      varying float noGrid;
      
      float lines(vec2 coord, float thickness){
        vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord) / thickness;
        float line = min(grid.x, grid.y);
        return 1.0 - min(line, 1.0);
      }
      ${e.fragmentShader}
    `.replace("#include <color_fragment>",`#include <color_fragment>
        
        float multiply = vColor.r > 0.05 ? 3. : 2.;
        float edges = lines(vUv, 3.);
        float grid = min(noGrid, lines(vUv * multiply, 1.));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1), max(edges, grid));
      `)}});m.defines={USE_UV:""};let o=new e.Mesh(ig,m);scene.add(o),o.rotation.z=-(.25*Math.PI);let clock=new e.Clock,t=0;renderer.setAnimationLoop(()=>{t+=clock.getDelta(),gu.time.value=t,controls.update(),renderer.render(scene,camera)});let canvas=document.querySelector(".cursor-canvas"),ctx=canvas.getContext("2d"),width=canvas.width=window.innerWidth,height=canvas.height=window.innerHeight,mouseX=width/2,mouseY=height/2,circle={radius:10,lastX:mouseX,lastY:mouseY},elems=[...document.querySelectorAll("[data-hover]")];function onResize(){width=canvas.width=window.innerWidth,height=canvas.height=window.innerHeight}function render(){circle.lastX=lerp(circle.lastX,mouseX,.25),circle.lastY=lerp(circle.lastY,mouseY,.25),ctx.clearRect(0,0,width,height),ctx.beginPath(),ctx.arc(circle.lastX,circle.lastY,circle.radius,0,2*Math.PI,!1),ctx.fillStyle="#ffffff",ctx.fill(),ctx.closePath(),requestAnimationFrame(render)}function init(){requestAnimationFrame(render),window.addEventListener("mousemove",function(e){mouseX=e.pageX,mouseY=e.pageY}),window.addEventListener("resize",onResize,!1);let e=TweenMax.to(circle,.25,{radius:3*circle.radius,ease:Power1.easeInOut,paused:!0});elems.forEach(n=>{n.addEventListener("mouseenter",()=>{e.play()},!1),n.addEventListener("mouseleave",()=>{e.reverse()},!1)})}function lerp(e,n,r){return(1-r)*e+r*n}init();let chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",randomCharacter=()=>chars[Math.floor(Math.random()*chars.length)],randomString=e=>Array.from({length:e}).map(randomCharacter).join(""),cardHover=(e,n,r)=>{let a=e.getBoundingClientRect(),i=r.clientX-a.left,l=r.clientY-a.top;n.style.setProperty("--x",`${i}px`),n.style.setProperty("--y",`${l}px`),n.innerText=randomString(2e3)},cards=document.querySelectorAll(".card-hover-container");cards.forEach(e=>{e.addEventListener("mousemove",n=>cardHover(e,e.querySelector(".card-bg-characters"),n)),e.addEventListener("touchmove",n=>cardHover(e,e.querySelector(".card-bg-characters"),n))});let text=document.querySelectorAll(".text"),halfX=window.innerWidth/2,halfY=window.innerHeight/2;text.forEach((e,n)=>{TweenMax.to(e,1,{z:1*(n+8)})}),document.addEventListener("mousemove",e=>{text.forEach((n,r)=>{TweenMax.to(n,.5,{x:(e.clientX-halfX)*(r+1)*.01,y:(e.clientY-halfY)*(r+1)*.01})})}),AOS.init();