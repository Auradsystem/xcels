import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Layers, Shield, Cpu, Server, Monitor, Clock, Camera, Play, RotateCw, Maximize2, Volume2, VolumeX, CheckCircle, Car, Flame } from 'lucide-react';

// Custom hook for animations
const useAnimationFrame = (callback) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  
  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
};

const XcelQParkRealisticSimulation = () => {
  // State management
  const [activeLevel, setActiveLevel] = useState('p1');
  const [selectedDetector, setSelectedDetector] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [dataPackets, setDataPackets] = useState([]);
  const [smokeParticles, setSmokeParticles] = useState([]);
  const [flameParticles, setFlameParticles] = useState([]);
  const [alarmActive, setAlarmActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showProcessFlow, setShowProcessFlow] = useState(false);
  const [cameraView, setCameraView] = useState(null);
  const [cameraFullscreen, setCameraFullscreen] = useState(false);
  
  // Refs for sound effects
  const alarmSoundRef = useRef(null);
  const notificationSoundRef = useRef(null);
  
  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Detector data for Q-PARK with specific parking spots and camera associations
  const detectors = {
    p1: [
      { id: '01', type: 'DI', x: 20, y: 18, zone: 'P1-A', location: 'Niveau -1 Place 101', place: 'P101', camera: 'CAM-P1-01', cameraX: 25, cameraY: 12, carColor: '#3b82f6' },
      { id: '02', type: 'DM', x: 82, y: 15, zone: 'P1-B', location: 'Niveau -1 Entrée Centre', place: '', camera: 'CAM-P1-02', cameraX: 88, cameraY: 10, carColor: null },
      { id: '03', type: 'DI', x: 50, y: 45, zone: 'P1-C', location: 'Niveau -1 Place 150', place: 'P150', camera: 'CAM-P1-03', cameraX: 45, cameraY: 38, carColor: '#ef4444' },
      { id: '04', type: 'DI', x: 25, y: 75, zone: 'P1-D', location: 'Niveau -1 Place 175', place: 'P175', camera: 'CAM-P1-04', cameraX: 30, cameraY: 70, carColor: '#10b981' },
      { id: '05', type: 'DM', x: 80, y: 80, zone: 'P1-E', location: 'Niveau -1 Sortie Est', place: '', camera: 'CAM-P1-05', cameraX: 85, cameraY: 75, carColor: null },
    ],
    p2: [
      { id: '06', type: 'DI', x: 30, y: 20, zone: 'P2-A', location: 'Niveau -2 Place 201', place: 'P201', camera: 'CAM-P2-01', cameraX: 35, cameraY: 15, carColor: '#f59e0b' },
      { id: '07', type: 'DM', x: 75, y: 15, zone: 'P2-B', location: 'Niveau -2 Issue Secours', place: '', camera: 'CAM-P2-02', cameraX: 80, cameraY: 10, carColor: null },
      { id: '08', type: 'DI', x: 45, y: 50, zone: 'P2-C', location: 'Niveau -2 Place 230', place: 'P230', camera: 'CAM-P2-03', cameraX: 40, cameraY: 45, carColor: '#8b5cf6' },
      { id: '09', type: 'DI', x: 15, y: 80, zone: 'P2-D', location: 'Niveau -2 Place 250', place: 'P250', camera: 'CAM-P2-04', cameraX: 20, cameraY: 75, carColor: '#ec4899' },
      { id: '10', type: 'DI', x: 85, y: 60, zone: 'P2-E', location: 'Niveau -2 Place 280', place: 'P280', camera: 'CAM-P2-05', cameraX: 90, cameraY: 55, carColor: '#6366f1' },
    ],
    p3: [
      { id: '11', type: 'DI', x: 25, y: 20, zone: 'P3-A', location: 'Niveau -3 Place 301', place: 'P301', camera: 'CAM-P3-01', cameraX: 30, cameraY: 15, carColor: '#14b8a6' },
      { id: '12', type: 'DM', x: 80, y: 25, zone: 'P3-B', location: 'Niveau -3 Cage Escalier', place: '', camera: 'CAM-P3-02', cameraX: 85, cameraY: 20, carColor: null },
      { id: '13', type: 'DI', x: 15, y: 65, zone: 'P3-C', location: 'Niveau -3 Place 350', place: 'P350', camera: 'CAM-P3-03', cameraX: 20, cameraY: 60, carColor: '#f97316' },
      { id: '14', type: 'DI', x: 60, y: 70, zone: 'P3-D', location: 'Niveau -3 Place 375', place: 'P375', camera: 'CAM-P3-04', cameraX: 65, cameraY: 65, carColor: '#84cc16' },
      { id: '15', type: 'DI', x: 85, y: 85, zone: 'P3-E', location: 'Niveau -3 Place 390', place: 'P390', camera: 'CAM-P3-05', cameraX: 90, cameraY: 80, carColor: '#a855f7' },
    ]
  };
  
  // Parking spot data with specific spot numbers
  const definedParkingSpots = {
    p1: [
      { id: 'p1-101', x: 20, y: 18, number: 'P101', occupied: true, carColor: '#3b82f6' },
      { id: 'p1-102', x: 32, y: 18, number: 'P102', occupied: true, carColor: '#64748b' },
      { id: 'p1-103', x: 44, y: 18, number: 'P103', occupied: false, carColor: null },
      { id: 'p1-150', x: 50, y: 45, number: 'P150', occupied: true, carColor: '#ef4444' },
      { id: 'p1-151', x: 62, y: 45, number: 'P151', occupied: true, carColor: '#0f766e' },
      { id: 'p1-175', x: 25, y: 75, number: 'P175', occupied: true, carColor: '#10b981' },
      { id: 'p1-176', x: 37, y: 75, number: 'P176', occupied: true, carColor: '#7c3aed' },
    ],
    p2: [
      { id: 'p2-201', x: 30, y: 20, number: 'P201', occupied: true, carColor: '#f59e0b' },
      { id: 'p2-202', x: 42, y: 20, number: 'P202', occupied: true, carColor: '#475569' },
      { id: 'p2-230', x: 45, y: 50, number: 'P230', occupied: true, carColor: '#8b5cf6' },
      { id: 'p2-231', x: 57, y: 50, number: 'P231', occupied: true, carColor: '#0ea5e9' },
      { id: 'p2-250', x: 15, y: 80, number: 'P250', occupied: true, carColor: '#ec4899' },
      { id: 'p2-280', x: 85, y: 60, number: 'P280', occupied: true, carColor: '#6366f1' },
    ],
    p3: [
      { id: 'p3-301', x: 25, y: 20, number: 'P301', occupied: true, carColor: '#14b8a6' },
      { id: 'p3-302', x: 37, y: 20, number: 'P302', occupied: true, carColor: '#dc2626' },
      { id: 'p3-350', x: 15, y: 65, number: 'P350', occupied: true, carColor: '#f97316' },
      { id: 'p3-375', x: 60, y: 70, number: 'P375', occupied: true, carColor: '#84cc16' },
      { id: 'p3-390', x: 85, y: 85, number: 'P390', occupied: true, carColor: '#a855f7' },
    ]
  };
  
  // Generate parking spot layout for background filling
  const generateParkingSpots = (level) => {
    const spots = [];
    const rows = 4;
    const spotsPerRow = 7;
    
    for (let row = 0; row < rows; row++) {
      for (let spot = 0; spot < spotsPerRow; spot++) {
        // Skip if there's already a defined spot near this location
        const x = 10 + spot * 12;
        const y = 20 + row * 20;
        
        const nearbyDefinedSpot = definedParkingSpots[level].find(definedSpot => {
          const distance = Math.sqrt(Math.pow(definedSpot.x - x, 2) + Math.pow(definedSpot.y - y, 2));
          return distance < 5; // Skip if there's a defined spot within 5 units
        });
        
        if (!nearbyDefinedSpot) {
          const isOccupied = Math.random() > 0.4;
          // Generate a random color for the car if the spot is occupied
          const carColor = isOccupied ? 
            ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6']
            [Math.floor(Math.random() * 8)] : null;
            
          spots.push({
            id: `${level}-${row}-${spot}`,
            x,
            y,
            occupied: isOccupied,
            carColor
          });
        }
      }
    }
    
    return spots;
  };
  
  // Generate structure elements
  const generateStructures = (level) => {
    // Generate columns
    const columns = [
      { type: 'column', x: 20, y: 30 },
      { type: 'column', x: 50, y: 30 },
      { type: 'column', x: 80, y: 30 },
      { type: 'column', x: 20, y: 70 },
      { type: 'column', x: 50, y: 70 },
      { type: 'column', x: 80, y: 70 },
    ];
    
    // Add standard features
    const standardFeatures = [
      { type: 'elevator', x: 10, y: 50, width: 8, height: 8 },
      { type: 'stairs', x: 90, y: 50, width: 8, height: 8 },
    ];
    
    // Add level-specific elements
    let levelFeatures = [];
    if (level === 'p1') {
      levelFeatures = [
        { type: 'entrance', x: 0, y: 40, width: 8, height: 15 },
        { type: 'exit', x: 100, y: 40, width: 8, height: 15 },
        { type: 'ramp', x: 50, y: 90, width: 20, height: 8, to: 'p2' },
      ];
    } else if (level === 'p2') {
      levelFeatures = [
        { type: 'ramp', x: 50, y: 10, width: 20, height: 8, to: 'p1' },
        { type: 'ramp', x: 50, y: 90, width: 20, height: 8, to: 'p3' },
      ];
    } else if (level === 'p3') {
      levelFeatures = [
        { type: 'ramp', x: 50, y: 10, width: 20, height: 8, to: 'p2' },
        { type: 'technicalRoom', x: 85, y: 85, width: 12, height: 12 },
      ];
    }
    
    return [...columns, ...standardFeatures, ...levelFeatures];
  };
  
  // Generate initial data
  const parkingSpots = {
    p1: [...definedParkingSpots.p1, ...generateParkingSpots('p1')],
    p2: [...definedParkingSpots.p2, ...generateParkingSpots('p2')],
    p3: [...definedParkingSpots.p3, ...generateParkingSpots('p3')],
  };
  
  const structures = {
    p1: generateStructures('p1'),
    p2: generateStructures('p2'),
    p3: generateStructures('p3'),
  };
  
  // Play sound effect
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    if (type === 'alarm' && alarmSoundRef.current) {
      alarmSoundRef.current.currentTime = 0;
      alarmSoundRef.current.play();
    } else if (type === 'notification' && notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0;
      notificationSoundRef.current.play();
    }
  };
  
  // Generate data packet
  const generateDataPacket = (startX, startY, endX, endY, color, delay = 0) => {
    setTimeout(() => {
      const newPacket = {
        id: `packet-${Date.now()}-${Math.random()}`,
        startX,
        startY,
        endX,
        endY,
        progress: 0,
        color
      };
      
      setDataPackets(prev => [...prev, newPacket]);
    }, delay);
  };
  
  // Generate flame particles
  const generateFlameParticles = (x, y) => {
    const newFlames = Array.from({ length: 10 }, (_, i) => ({
      id: `flame-${Date.now()}-${i}`,
      x: x + (Math.random() * 10 - 5),
      y: y + (Math.random() * 10 - 5),
      size: Math.random() * 15 + 10,
      opacity: Math.random() * 0.5 + 0.5,
      hue: Math.random() * 50 + 10, // Range from orange to red
      life: Math.random() * 1 + 0.5,
      delay: Math.random() * 0.5
    }));
    
    setFlameParticles(prev => [...prev, ...newFlames]);
  };
  
  // Animate data packets and particles
  useAnimationFrame(() => {
    // Update data packets
    if (dataPackets.length > 0) {
      setDataPackets(prev => 
        prev.map(packet => ({
          ...packet,
          progress: Math.min(packet.progress + 0.02, 1)
        })).filter(p => p.progress < 1)
      );
    }
    
    // Update smoke particles
    if (smokeParticles.length > 0) {
      setSmokeParticles(prev => 
        prev.map(particle => ({
          ...particle,
          y: particle.y - particle.speed,
          opacity: particle.opacity - 0.01,
          size: particle.size + 0.1
        })).filter(p => p.opacity > 0)
      );
    }
    
    // Update flame particles
    if (flameParticles.length > 0) {
      setFlameParticles(prev => 
        prev.map(flame => ({
          ...flame,
          y: flame.y - 0.3,
          opacity: flame.life > 0 ? flame.opacity : flame.opacity - 0.1,
          size: flame.life > 0 ? flame.size + 0.2 : Math.max(0, flame.size - 0.5),
          life: flame.life - 0.02
        })).filter(f => f.opacity > 0)
      );
    }
  });
  
  // Reset simulation
  const resetSimulation = () => {
    setSelectedDetector(null);
    setSimulationStep(0);
    setDataPackets([]);
    setSmokeParticles([]);
    setFlameParticles([]);
    setAlarmActive(false);
    setCameraView(null);
  };
  
  // NEW: Simulate random fire 
  const simulateRandomFire = () => {
    // Don't start a new simulation if one is already running
    if (simulationStep > 0) return;
    
    // Select a random detector from the current level
    const currentLevelDetectors = detectors[activeLevel];
    const randomIndex = Math.floor(Math.random() * currentLevelDetectors.length);
    const randomDetector = currentLevelDetectors[randomIndex];
    
    // Run the simulation with the randomly selected detector
    runSimulation(randomDetector);
  };
  
  // Run simulation
  const runSimulation = (detector) => {
    if (!detector) return;
    
    setSelectedDetector(detector);
    
    // Step 1: Detector activation
    setSimulationStep(1);
    setAlarmActive(true);
    playSound('alarm');
    
    // Create smoke particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: `smoke-${Date.now()}-${i}`,
      x: detector.x + (Math.random() * 6 - 3),
      y: detector.y + (Math.random() * 6 - 3),
      size: Math.random() * 8 + 2,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.2 + 0.1
    }));
    
    setSmokeParticles(prev => [...prev, ...newParticles]);
    
    // Create flame effect
    const flameInterval = setInterval(() => {
      if (alarmActive) {
        generateFlameParticles(detector.x, detector.y);
      } else {
        clearInterval(flameInterval);
      }
    }, 500);
    
    // Step 2: Data from detector to ESSER panel
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        generateDataPacket(
          detector.x, 
          detector.y, 
          10, 
          350, 
          '#e63946', 
          i * 200
        );
      }
    }, 1000);
    
    // Step 3: ESSER panel processes
    setTimeout(() => {
      setSimulationStep(2);
      playSound('notification');
      
      // Generate data from ESSER to MOXA
      for (let i = 0; i < 4; i++) {
        generateDataPacket(
          40, 
          350, 
          200, 
          350, 
          '#2196f3', 
          i * 150
        );
      }
    }, 2500);
    
    // Step 4: MOXA processes
    setTimeout(() => {
      setSimulationStep(3);
      
      // Generate data from MOXA to IVPARK
      for (let i = 0; i < 4; i++) {
        generateDataPacket(
          230, 
          350, 
          390, 
          350, 
          '#4caf50', 
          i * 150
        );
      }
    }, 4000);
    
    // Step 5: IVPARK processes
    setTimeout(() => {
      setSimulationStep(4);
      playSound('notification');
      
      // Generate data from IVPARK to GTC
      for (let i = 0; i < 3; i++) {
        generateDataPacket(
          420, 
          350, 
          580, 
          350, 
          '#ff9800', 
          i * 200
        );
      }
    }, 5500);
    
    // Step 6: GTC Displays, activate camera view
    setTimeout(() => {
      setSimulationStep(5);
      playSound('notification');
      setCameraView(detector.camera);
      
      // Clean up the interval after the whole simulation
      setTimeout(() => {
        if (flameInterval) clearInterval(flameInterval);
      }, 20000);
    }, 7000);
    
    return () => {
      if (flameInterval) clearInterval(flameInterval);
    };
  };
  
  // DataPacket component
  const DataPacket = ({ packet }) => {
    const x = packet.startX + (packet.endX - packet.startX) * packet.progress;
    const y = packet.startY + (packet.endY - packet.startY) * packet.progress;
    
    return (
      <div 
        className="absolute w-3 h-3 rounded-full z-20 transform -translate-x-1/2 -translate-y-1/2" 
        style={{ 
          left: `${x}%`, 
          top: `${y}px`, 
          backgroundColor: packet.color,
          boxShadow: `0 0 6px ${packet.color}`,
        }}
      >
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-30" 
          style={{ backgroundColor: packet.color }}
        ></div>
      </div>
    );
  };
  
  // Xcel Security Services Logo Component
  const XcelLogo = ({ size = 'normal' }) => {
    const width = size === 'large' ? 300 : size === 'normal' ? 180 : 120;
    
    return (
      <div className="relative" style={{ width: `${width}px` }}>
        <div className="relative">
          {/* Logo Shield */}
          <svg viewBox="0 0 100 100" className="w-full">