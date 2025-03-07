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
            <defs>
              <linearGradient id="xcelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f2027" />
                <stop offset="50%" stopColor="#203a43" />
                <stop offset="100%" stopColor="#2c5364" />
              </linearGradient>
            </defs>
            <path 
              d="M50,5 L90,20 L90,45 C90,65 75,85 50,95 C25,85 10,65 10,45 L10,20 L50,5 Z" 
              fill="url(#xcelGradient)" 
              stroke="#fff" 
              strokeWidth="1"
            />
            <path 
              d="M30,40 L45,65 L55,65 L70,40 L60,40 L50,55 L40,40 L30,40 Z" 
              fill="#fff" 
              stroke="#fff" 
              strokeWidth="0.5"
            />
          </svg>
        </div>
        <div className="text-center font-bold text-blue-900 mt-2" style={{ fontSize: size === 'large' ? '1.5rem' : '1rem' }}>
          XCEL SECURITY
        </div>
      </div>
    );
  };
  
  // Render the simulation
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sound effects (hidden) */}
      <audio ref={alarmSoundRef} src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-tone-996.mp3" preload="auto"></audio>
      <audio ref={notificationSoundRef} src="https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3" preload="auto"></audio>
      
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <XcelLogo size="small" />
          <div>
            <h1 className="text-xl font-bold">Q-PARK Simulation</h1>
            <p className="text-sm text-gray-400">Système de détection incendie</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-400" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-2 rounded-full hover:bg-gray-700"
            title={soundEnabled ? "Désactiver le son" : "Activer le son"}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          
          <div className={`flex items-center space-x-2 ${alarmActive ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
            <Bell className="h-5 w-5" />
            <span>{alarmActive ? "ALARME ACTIVE" : "Système normal"}</span>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Parking levels */}
        <div className="w-48 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
          <h2 className="font-bold mb-4 text-lg">Niveaux</h2>
          
          <div className="space-y-2">
            <button 
              onClick={() => setActiveLevel('p1')} 
              className={`w-full p-2 rounded text-left flex items-center space-x-2 ${activeLevel === 'p1' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Layers className="h-5 w-5" />
              <span>Niveau -1</span>
            </button>
            
            <button 
              onClick={() => setActiveLevel('p2')} 
              className={`w-full p-2 rounded text-left flex items-center space-x-2 ${activeLevel === 'p2' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Layers className="h-5 w-5" />
              <span>Niveau -2</span>
            </button>
            
            <button 
              onClick={() => setActiveLevel('p3')} 
              className={`w-full p-2 rounded text-left flex items-center space-x-2 ${activeLevel === 'p3' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Layers className="h-5 w-5" />
              <span>Niveau -3</span>
            </button>
          </div>
          
          <div className="mt-8">
            <h2 className="font-bold mb-4 text-lg">Simulation</h2>
            
            <div className="space-y-2">
              <button 
                onClick={simulateRandomFire} 
                disabled={simulationStep > 0}
                className={`w-full p-2 rounded text-left flex items-center space-x-2 ${simulationStep > 0 ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-red-700 hover:bg-red-600'}`}
              >
                <Flame className="h-5 w-5" />
                <span>Simuler Incendie</span>
              </button>
              
              <button 
                onClick={resetSimulation} 
                disabled={simulationStep === 0}
                className={`w-full p-2 rounded text-left flex items-center space-x-2 ${simulationStep === 0 ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <RotateCw className="h-5 w-5" />
                <span>Réinitialiser</span>
              </button>
              
              <button 
                onClick={() => setShowProcessFlow(!showProcessFlow)} 
                className={`w-full p-2 rounded text-left flex items-center space-x-2 ${showProcessFlow ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <Server className="h-5 w-5" />
                <span>Flux Processus</span>
              </button>
            </div>
          </div>
          
          <div className="mt-auto">
            <XcelLogo />
          </div>
        </div>
        
        {/* Main visualization area */}
        <div className="flex-1 flex flex-col">
          {/* Parking visualization */}
          <div className="flex-1 relative bg-gray-900 overflow-hidden">
            {/* Parking level title */}
            <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-80 p-2 rounded z-10">
              <h2 className="font-bold text-lg">
                {activeLevel === 'p1' ? 'Niveau -1' : activeLevel === 'p2' ? 'Niveau -2' : 'Niveau -3'}
              </h2>
            </div>
            
            {/* Parking structures */}
            {structures[activeLevel].map((structure, index) => {
              if (structure.type === 'column') {
                return (
                  <div 
                    key={`column-${index}`}
                    className="absolute w-4 h-4 bg-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${structure.x}%`, top: `${structure.y}%` }}
                  ></div>
                );
              } else if (structure.type === 'elevator') {
                return (
                  <div 
                    key={`elevator-${index}`}
                    className="absolute bg-blue-900 rounded-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: `${structure.x}%`, 
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`
                    }}
                  >
                    <div className="text-xs font-bold">ASCENSEUR</div>
                  </div>
                );
              } else if (structure.type === 'stairs') {
                return (
                  <div 
                    key={`stairs-${index}`}
                    className="absolute bg-green-900 rounded-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: `${structure.x}%`, 
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`
                    }}
                  >
                    <div className="text-xs font-bold">ESCALIER</div>
                  </div>
                );
              } else if (structure.type === 'entrance' || structure.type === 'exit') {
                return (
                  <div 
                    key={`${structure.type}-${index}`}
                    className={`absolute ${structure.type === 'entrance' ? 'bg-indigo-900' : 'bg-purple-900'} rounded-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2`}
                    style={{ 
                      left: `${structure.x}%`, 
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`
                    }}
                  >
                    <div className="text-xs font-bold">{structure.type === 'entrance' ? 'ENTRÉE' : 'SORTIE'}</div>
                  </div>
                );
              } else if (structure.type === 'ramp') {
                return (
                  <div 
                    key={`ramp-${index}`}
                    className="absolute bg-gray-700 rounded-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: `${structure.x}%`, 
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`
                    }}
                  >
                    <div className="text-xs font-bold">RAMPE {structure.to === 'p1' ? '↑' : '↓'}</div>
                  </div>
                );
              } else if (structure.type === 'technicalRoom') {
                return (
                  <div 
                    key={`tech-${index}`}
                    className="absolute bg-red-900 bg-opacity-50 rounded-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: `${structure.x}%`, 
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`
                    }}
                  >
                    <div className="text-xs font-bold text-center">LOCAL<br/>TECHNIQUE</div>
                  </div>
                );
              }
              return null;
            })}
            
            {/* Parking spots */}
            {parkingSpots[activeLevel].map(spot => (
              <div 
                key={spot.id}
                className={`absolute w-10 h-5 border ${spot.occupied ? 'border-gray-500' : 'border-gray-700'} rounded transform -translate-x-1/2 -translate-y-1/2`}
                style={{ 
                  left: `${spot.x}%`, 
                  top: `${spot.y}%`,
                  backgroundColor: spot.occupied ? spot.carColor : 'transparent'
                }}
              >
                {spot.number && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                    {spot.number}
                  </div>
                )}
              </div>
            ))}
            
            {/* Detectors */}
            {detectors[activeLevel].map(detector => (
              <div 
                key={detector.id}
                className={`absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer z-10 ${selectedDetector?.id === detector.id ? 'ring-2 ring-yellow-400' : ''}`}
                style={{ 
                  left: `${detector.x}%`, 
                  top: `${detector.y}%`,
                  backgroundColor: detector.type === 'DI' ? '#ef4444' : '#3b82f6',
                  opacity: selectedDetector?.id === detector.id && alarmActive ? '1' : '0.8',
                  animation: selectedDetector?.id === detector.id && alarmActive ? 'pulse 1s infinite' : 'none'
                }}
                onClick={() => runSimulation(detector)}
              >
                <div className="text-xs font-bold">{detector.id}</div>
                
                {/* Detector label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
                  {detector.type === 'DI' ? 'Détecteur Incendie' : 'Déclencheur Manuel'}
                </div>
              </div>
            ))}
            
            {/* Cameras */}
            {detectors[activeLevel].map(detector => (
              <div 
                key={`cam-${detector.id}`}
                className={`absolute w-5 h-5 rounded-full bg-gray-700 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer ${cameraView === detector.camera ? 'ring-2 ring-blue-400' : ''}`}
                style={{ 
                  left: `${detector.cameraX}%`, 
                  top: `${detector.cameraY}%`,
                }}
                onClick={() => setCameraView(detector.camera)}
              >
                <Camera className="w-3 h-3" />
              </div>
            ))}
            
            {/* Smoke particles */}
            {smokeParticles.map(particle => (
              <div 
                key={particle.id}
                className="absolute rounded-full bg-gray-400 transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${particle.x}%`, 
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity
                }}
              ></div>
            ))}
            
            {/* Flame particles */}
            {flameParticles.map(flame => (
              <div 
                key={flame.id}
                className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${flame.x}%`, 
                  top: `${flame.y}%`,
                  width: `${flame.size}px`,
                  height: `${flame.size}px`,
                  opacity: flame.opacity,
                  background: `radial-gradient(circle, rgba(255,${flame.hue},0,1) 0%, rgba(255,${flame.hue/2},0,0.6) 70%, rgba(255,0,0,0) 100%)`,
                  filter: 'blur(1px)'
                }}
              ></div>
            ))}
            
            {/* Data packets */}
            {dataPackets.map(packet => (
              <DataPacket key={packet.id} packet={packet} />
            ))}
            
            {/* Selected detector info */}
            {selectedDetector && (
              <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 p-3 rounded-lg z-10 max-w-xs">
                <h3 className="font-bold text-lg flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  Détecteur {selectedDetector.id}
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-400">Type:</span> {selectedDetector.type === 'DI' ? 'Détecteur Incendie' : 'Déclencheur Manuel'}</p>
                  <p><span className="text-gray-400">Zone:</span> {selectedDetector.zone}</p>
                  <p><span className="text-gray-400">Emplacement:</span> {selectedDetector.location}</p>
                  <p><span className="text-gray-400">Caméra:</span> {selectedDetector.camera}</p>
                  {selectedDetector.place && <p><span className="text-gray-400">Place:</span> {selectedDetector.place}</p>}
                  {alarmActive && <p className="text-red-500 font-bold">ALARME ACTIVE</p>}
                </div>
              </div>
            )}
          </div>
          
          {/* Process flow visualization (conditionally shown) */}
          {showProcessFlow && (
            <div className="h-64 bg-gray-800 border-t border-gray-700 p-4 relative">
              <h2 className="font-bold mb-4">Flux de Traitement des Alarmes</h2>
              
              <div className="flex justify-between items-center h-32 px-10">
                {/* ESSER Panel */}
                <div className={`flex flex-col items-center ${simulationStep >= 1 ? 'text-red-500' : 'text-gray-500'}`}>
                  <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center mb-2 ${simulationStep >= 1 ? 'border-red-500 bg-red-900 bg-opacity-20' : 'border-gray-600'}`}>
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="text-center text-sm">
                    <div className="font-bold">ESSER</div>
                    <div className="text-xs">Centrale Incendie</div>
                  </div>
                </div>
                
                {/* Arrow 1 */}
                <div className={`w-24 h-0.5 ${simulationStep >= 2 ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                
                {/* MOXA */}
                <div className={`flex flex-col items-center ${simulationStep >= 2 ? 'text-blue-500' : 'text-gray-500'}`}>
                  <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center mb-2 ${simulationStep >= 2 ? 'border-blue-500 bg-blue-900 bg-opacity-20' : 'border-gray-600'}`}>
                    <Cpu className="w-8 h-8" />
                  </div>
                  <div className="text-center text-sm">
                    <div className="font-bold">MOXA</div>
                    <div className="text-xs">Convertisseur</div>
                  </div>
                </div>
                
                {/* Arrow 2 */}
                <div className={`w-24 h-0.5 ${simulationStep >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                
                {/* IVPARK */}
                <div className={`flex flex-col items-center ${simulationStep >= 3 ? 'text-green-500' : 'text-gray-500'}`}>
                  <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center mb-2 ${simulationStep >= 3 ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-600'}`}>
                    <Car className="w-8 h-8" />
                  </div>
                  <div className="text-center text-sm">
                    <div className="font-bold">IVPARK</div>
                    <div className="text-xs">Système Parking</div>
                  </div>
                </div>
                
                {/* Arrow 3 */}
                <div className={`w-24 h-0.5 ${simulationStep >= 4 ? 'bg-orange-500' : 'bg-gray-600'}`}></div>
                
                {/* GTC */}
                <div className={`flex flex-col items-center ${simulationStep >= 4 ? 'text-orange-500' : 'text-gray-500'}`}>
                  <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center mb-2 ${simulationStep >= 4 ? 'border-orange-500 bg-orange-900 bg-opacity-20' : 'border-gray-600'}`}>
                    <Monitor className="w-8 h-8" />
                  </div>
                  <div className="text-center text-sm">
                    <div className="font-bold">GTC</div>
                    <div className="text-xs">Gestion Technique</div>
                  </div>
                </div>
              </div>
              
              {/* Status indicators */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${simulationStep > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className="text-sm">Détection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${simulationStep >= 2 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className="text-sm">Traitement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${simulationStep >= 4 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className="text-sm">Notification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${simulationStep >= 5 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className="text-sm">Visualisation</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right sidebar - Camera view */}
        <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Caméra</h2>
            
            {cameraView && (
              <button 
                onClick={() => setCameraFullscreen(!cameraFullscreen)} 
                className="p-1 rounded hover:bg-gray-700"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {cameraView ? (
            <div className={`relative bg-black rounded overflow-hidden ${cameraFullscreen ? 'flex-1' : 'h-48'}`}>
              {/* Camera overlay elements */}
              <div className="absolute top-0 left-0 w-full p-2 flex justify-between text-xs">
                <span>{cameraView}</span>
                <span className="text-red-500">{currentTime.toLocaleTimeString()}</span>
              </div>
              
              {/* Camera content - show the detector that triggered the camera */}
              {selectedDetector && selectedDetector.camera === cameraView && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Simulated parking spot with car */}
                  {selectedDetector.place && selectedDetector.carColor && (
                    <div className="relative">
                      <div 
                        className="w-20 h-10 rounded-md" 
                        style={{ backgroundColor: selectedDetector.carColor }}
                      ></div>
                      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                        {selectedDetector.place}
                      </div>
                      
                      {/* Fire effect if alarm is active */}
                      {alarmActive && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <div className="w-12 h-16 relative">
                            <div className="absolute bottom-0 left-0 right-0 h-12 rounded-t-full" style={{ 
                              background: 'radial-gradient(ellipse at center, rgba(255,78,0,0.8) 0%, rgba(255,0,0,0.4) 70%, rgba(255,0,0,0) 100%)',
                              animation: 'flame 0.5s infinite alternate'
                            }}></div>
                            <div className="absolute bottom-2 left-2 right-2 h-10 rounded-t-full" style={{ 
                              background: 'radial-gradient(ellipse at center, rgba(255,180,0,0.9) 0%, rgba(255,120,0,0.5) 70%, rgba(255,0,0,0) 100%)',
                              animation: 'flame 0.7s infinite alternate'
                            }}></div>
                            <div className="absolute bottom-4 left-4 right-4 h-6 rounded-t-full" style={{ 
                              background: 'radial-gradient(ellipse at center, rgba(255,255,0,1) 0%, rgba(255,180,0,0.6) 70%, rgba(255,0,0,0) 100%)',
                              animation: 'flame 0.3s infinite alternate'
                            }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* For manual pull stations or areas without cars */}
                  {(!selectedDetector.place || !selectedDetector.carColor) && (
                    <div className="relative">
                      {selectedDetector.type === 'DM' ? (
                        <div className="w-16 h-24 bg-red-600 rounded-md flex items-center justify-center">
                          <div className="w-8 h-8 bg-white rounded-full"></div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-32 h-16 bg-gray-700 rounded-md flex items-center justify-center">
                            <span className="text-xs">Zone {selectedDetector.zone}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Fire effect if alarm is active */}
                      {alarmActive && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <div className="w-12 h-16 relative">
                            <div className="absolute bottom-0 left-0 right-0 h-12 rounded-t-full" style={{ 
                              background: 'radial-gradient(ellipse at center, rgba(255,78,0,0.8) 0%, rgba(255,0,0,0.4) 70%, rgba(255,0,0,0) 100%)',
                              animation: 'flame 0.5s infinite alternate'
                            }}></div>
                            <div className="absolute bottom-2 left-2 right-2 h-10 rounded-t-full" style={{ 
                              background: 'radial-gradient(ellipse at center, rgba(255,180,0,0.9) 0%, rgba(255,120,0,0.5) 70%, rgba(255,0,0,0) 100%)',
                              animation: 'flame 0.7s infinite alternate'
                            }}></div>
                            <div className="absolute bottom-4 left-4 right-4 h-6 rounded-t-full" style={{ 
                              background: 'radial-gradient(ellipse at center, rgba(255,255,0,1) 0%, rgba(255,180,0,0.6) 70%, rgba(255,0,0,0) 100%)',
                              animation: 'flame 0.3s infinite alternate'
                            }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* If no specific detector is selected for this camera */}
              {(!selectedDetector || selectedDetector.camera !== cameraView) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-500">Aucune activité détectée</span>
                </div>
              )}
              
              {/* Recording indicator */}
              <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs">REC</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded h-48 flex items-center justify-center">
              <span className="text-gray-500">Sélectionnez une caméra</span>
            </div>
          )}
          
          {/* Camera list */}
          <div className="mt-4">
            <h3 className="font-bold mb-2">Caméras disponibles</h3>
            
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {Object.keys(detectors).flatMap(level => 
                detectors[level].map(detector => (
                  <button
                    key={detector.camera}
                    onClick={() => setCameraView(detector.camera)}
                    className={`w-full p-2 text-left text-sm rounded flex items-center space-x-2 ${cameraView === detector.camera ? 'bg-blue-900' : 'hover:bg-gray-700'}`}
                  >
                    <Camera className="h-4 w-4 flex-shrink-0" />
                    <div className="truncate">
                      <div>{detector.camera}</div>
                      <div className="text-xs text-gray-400">{detector.location}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* System status */}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Système opérationnel</span>
            </div>
            
            {alarmActive && (
              <div className="flex items-center space-x-2 mt-2 text-red-500 animate-pulse">
                <AlertTriangle className="h-5 w-5" />
                <span>Alarme incendie active</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes flame {
          0% { transform: scale(0.9, 1.1); }
          100% { transform: scale(1.1, 0.9); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default XcelQParkRealisticSimulation;
