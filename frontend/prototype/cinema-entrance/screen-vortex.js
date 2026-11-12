import * as THREE from 'three';

/** A portal painted on the fixed screen plane, never on the viewport. */
export function createScreenVortex(){
  return new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,stencilWrite:true,stencilRef:1,stencilFunc:THREE.EqualStencilFunc,
    uniforms:{opening:{value:0},time:{value:0},pattern:{value:null},usePattern:{value:0}},
    vertexShader:`varying vec2 screenUV;
      void main(){screenUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`precision highp float;
      varying vec2 screenUV;uniform float opening;uniform float time;uniform sampler2D pattern;uniform float usePattern;
      void main(){
        vec2 p=(screenUV-.5)*vec2(2.05,1.);
        float radius=length(p),angle=atan(p.y,p.x);
        float rimRadius=.375*opening;
        float edge=abs(radius-rimRadius);
        float rim=exp(-edge*145.);
        float halo=exp(-edge*29.)*.35;
        float inside=1.-smoothstep(rimRadius-.012,rimRadius+.008,radius);
        float spiral=pow(.5+.5*cos(angle*5.+radius*65.-time*3.8),9.);
        float funnel=spiral*inside*smoothstep(.02,.2,radius)*.22;
        float center=exp(-radius*22.);
        vec3 dark=vec3(.025,.045,.105);
        vec3 lavender=vec3(.57,.62,1.);
        vec3 ice=vec3(.65,.9,1.);
        vec3 color=mix(dark,lavender,funnel)+ice*(rim+halo)+lavender*center*.17;
        float alpha=clamp(inside*.96+rim+halo,0.,1.)*smoothstep(0.,.12,opening);
        if(usePattern>.5){
          float turn=time*.19+radius*.18;
          mat2 spin=mat2(cos(turn),-sin(turn),sin(turn),cos(turn));
          vec2 sampleUV=(spin*p)/max(.04,opening)*vec2(.85,1.275)+.5;
          vec3 field=texture2D(pattern,clamp(sampleUV,vec2(.002),vec2(.998))).rgb;
          float edgeMask=1.-smoothstep(rimRadius*.88,rimRadius*1.18,radius);
          color=field*1.25+ice*halo*.16;
          alpha=edgeMask*smoothstep(0.,.12,opening);
        }
        gl_FragColor=vec4(color,alpha);
      }`,
  });
}
