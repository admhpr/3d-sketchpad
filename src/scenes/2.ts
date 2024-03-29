import {
  GridHelper,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  SphereGeometry,
} from "three";

import "../style.css";

export function createScene() {
  const scene = new Scene();

  const sideLength = 1;
  const sphereGeometry = new SphereGeometry(sideLength);
  const sphereMaterial = new MeshStandardMaterial({
    color: "blue",
    metalness: 0.5,
    roughness: 0.7,
  });
  const sphere = new Mesh(sphereGeometry, sphereMaterial);
  sphere.castShadow = true;
  sphere.position.y = 0.5;

  const planeGeometry = new PlaneGeometry(3, 3);
  const planeMaterial = new MeshLambertMaterial({
    color: "gray",
    emissive: "teal",
    emissiveIntensity: 0.2,
    side: 2,
    transparent: true,
    opacity: 0.4,
  });
  const plane = new Mesh(planeGeometry, planeMaterial);
  plane.rotateX(Math.PI / 2);
  plane.receiveShadow = true;

  scene.add(sphere);
  scene.add(plane);

  const gridHelper = new GridHelper(20, 20, "teal", "darkgray");
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);

  return { scene };
}
