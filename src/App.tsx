import { Canvas, useFrame } from '@react-three/fiber'
import './App.css'
import { Cloud, Clouds, MeshTransmissionMaterial, OrbitControls, Outlines, Sky, Text, Text3D, useGLTF } from '@react-three/drei'
import { useControls } from "leva"
import { useState } from 'react';
import { Color, MeshNormalMaterial, MeshStandardMaterial } from 'three';

const Number = ({ value }: { value: string }) => {
  // load all numbers using drei and show accordingly
  return <Text3D position={[-3, -8, 0]} letterSpacing={-0.06} size={4} font="/Inter_Bold.json" >
    {value}
    <meshStandardMaterial color="#454545" metalness={0.6} roughness={0.6} />
  </Text3D>


}

const Experience = ({ targetConfig }: any) => {

  const [{ skyInclination, skyAzimuth, color, x, y, z, temp, useCelsius, ...config }, set] = useControls(() => ({
    seed: { value: 1, min: 1, max: 100, step: 1 },
    segments: { value: 25, min: 1, max: 80, step: 1 },
    volume: { value: 6, min: 0, max: 100, step: 0.1 },
    opacity: { value: 0.8, min: 0, max: 1, step: 0.01 },
    fade: { value: 10, min: 0, max: 400, step: 1 },
    growth: { value: 4, min: 0, max: 20, step: 1 },
    speed: { value: 0.1, min: 0, max: 1, step: 0.01 },
    x: { value: 5, min: 0, max: 100, step: 1 },
    y: { value: 1, min: 0, max: 100, step: 1 },
    z: { value: 5, min: 0, max: 100, step: 1 },
    color: "#ffffff",
    temp: { value: 0, min: -10, max: 40, step: 1 },
    useCelsius: true,
    skyInclination: { value: 0.6, min: 0, max: 1, step: 0.01 },
    skyAzimuth: { value: 0.78, min: 0, max: 1, step: 0.01 },
  }));

  const beveledCube = useGLTF('/beveled_cube.glb');

  // flag to check if we need to lerp
  let needsLerp = false;
  Object.keys(targetConfig).forEach((key) => {
    if (targetConfig[key] !== config[key] && key !== "color") {
      needsLerp = true;
    }
  });

  useFrame(() => {
    // lerp to target config
    if (!needsLerp) return;

    const lerped = Object.keys(targetConfig).reduce((acc, key) => {
      if (key === "speed") {
        acc[key] = targetConfig[key];
        return acc;
      }
      if (key === "color") {
        const start = parseInt(color.substring(1, 3), 16);
        const end = parseInt(targetConfig.color.substring(1, 3), 16);

        // Interpolate grayscale values
        const grayScale = (start + (end - start) * 0.01);

        // Convert back to hexadecimal
        const interpolatedColor = '#' + grayScale.toString(16).substring(0, 2).padStart(2, '0').repeat(3);
        acc[key] = interpolatedColor;

        return acc;
      }
      if (Math.abs(config[key] - targetConfig[key]) < 0.01) {
        acc[key] = targetConfig[key];
        return acc;
      }
      acc[key] = config[key] + (targetConfig[key] - config[key]) * 0.01;
      return acc;
    }
      , {});
    set(lerped);
  });

  return (<>
    <mesh scale={[8, 8, 8]} renderOrder={1} position={[0, -2, 0]}>
      <bufferGeometry {...beveledCube.nodes.Cube.geometry} />
      <MeshTransmissionMaterial
        transmission={0.999}
        color="white"
        roughness={0}
        thickness={0.1}
        chromaticAberration={0.01}

      />
    </mesh>
    <Text position={[-12, -16, 0]} color="black" fontSize={5} font="/RampartOne-Regular.ttf" characters='曇り晴れ雨快晴雪' whiteSpace='overflowWrap' overflowWrap='break-word' maxWidth={1}  >
      曇り晴れ雨快晴雪
    </Text>
    <Sky inclination={skyInclination} azimuth={skyAzimuth} mieCoefficient={0} rayleigh={0.05} />
    <Cloud {...config} bounds={[x, y, z]} color={color} concentrate="inside" renderOrder={10} position={[0, 1, 0]} />
    <Number value={`${temp} ${useCelsius ? 'C˚' : 'F˚'}`} />
  </>
  )
}

function App() {
  const [targetConfig, setTargetConfig] = useState({
    opacity: 0.8,
    volume: 6,
    fade: 10,
    growth: 4,
    speed: 0.1,
    color: "#ffffff",
  });

  const cloudyConfig = {
    opacity: 1,
    volume: 13.7,
    fade: 0,
    growth: 2,
    speed: 0.1,
    color: "#ffffff"
  }

  const rainyConfig = {
    opacity: 1,
    volume: 13.7,
    fade: 0,
    growth: 4,
    speed: 0.5,
    color: "#232323"
  }

  const normalConfig = {
    opacity: 0.25,
    volume: 2.2,
    fade: 0,
    growth: 2,
    speed: 0.1,
    color: "#ffffff"
  }

  const clearConfig = {
    opacity: 0,
    volume: 0.1,
    fade: 0,
    growth: 1,
    speed: 0.1,
    color: "#ffffff"
  }

  return (<>
    <div className="controls">
      <button onClick={() => setTargetConfig(cloudyConfig)}>Cloudy</button>
      <button onClick={() => setTargetConfig(rainyConfig)}>Rainy</button>
      <button onClick={() => setTargetConfig(normalConfig)}>Normal</button>
      <button onClick={() => setTargetConfig(clearConfig)}>Clear</button>
    </div>
    <Canvas>
      <ambientLight intensity={10} />
      <pointLight position={[0, -8, 4]} intensity={100} />

      <Experience targetConfig={targetConfig} />
      <OrbitControls />
    </Canvas>
  </>
  )
}

export default App
