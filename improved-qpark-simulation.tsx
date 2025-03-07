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
            <path d="M50,10 C70,10 80,20 90,30 C90,60 70,90 50,90 C30,90 10,60 10,30 C20,20 30,10 50,10 Z" 
                  fill="#e63946" stroke="#ffffff" strokeWidth="2" />
            <circle cx="50" cy="40" r="10" fill="#ffffff" />
            <path d="M30,45 C30,70 50,75 50,75 C50,75 70,70 70,45" 
                  fill="none" stroke="#ffffff" strokeWidth="4" />
          </svg>
        </div>
        
        {/* Logo Text */}
        <div className="text-center font-bold mt-2">
          <span className="text-gray-800">XCEL</span>
          <span className="text-red-600">SECURITY</span>
          <span className="text-gray-800">SERVICES</span>
        </div>
      </div>
    );
  };
  
  // Process Flow Component with proper spacing
  const ProcessFlow = () => {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-300 mb-4">
        <h3 className="font-bold text-lg mb-4 text-center border-b border-gray-300 pb-2 text-gray-800">Processus d'Intégration</h3>
        
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div className="bg-red-100 p-2 font-bold text-center text-gray-800 truncate">XCEL SECURITY</div>
          <div className="bg-blue-100 p-2 font-bold text-center text-gray-800 truncate">Q-PARK</div>
          <div className="bg-green-100 p-2 font-bold text-center text-gray-800 truncate">NETCELER</div>
          
          <div className="bg-red-50 p-2 text-gray-700 text-xs truncate">Programmation centrale</div>
          <div className="p-2"></div>
          <div className="p-2"></div>
          
          <div className="bg-red-50 p-2 text-gray-700 text-xs truncate">Configuration SEI2</div>
          <div className="p-2"></div>
          <div className="p-2"></div>
          
          <div className="bg-red-50 p-2 text-gray-700 text-xs truncate">Câblage MOXA</div>
          <div className="bg-blue-50 p-2 text-gray-700 text-xs truncate">Adressage IP</div>
          <div className="p-2"></div>
          
          <div className="bg-red-50 p-2 text-gray-700 text-xs truncate">Test communication</div>
          <div className="p-2"></div>
          <div className="bg-green-50 p-2 text-gray-700 text-xs truncate">Reprise données</div>
          
          <div className="bg-red-50 p-2 text-gray-700 text-xs truncate">Table corrélation</div>
          <div className="p-2"></div>
          <div className="bg-green-50 p-2 text-gray-700 text-xs truncate">Intégration données</div>
          
          <div className="bg-red-50 p-2 text-gray-700 text-xs truncate">Test sur site</div>
          <div className="bg-blue-50 p-2 text-gray-700 text-xs truncate">Test IVPARK</div>
          <div className="bg-green-50 p-2 text-gray-700 text-xs truncate">Validation</div>
        </div>
      </div>
    );
  };
  
  // Car SVG Component - More realistic car shape
  const CarSvg = ({ color = '#3b82f6', className = '', style = {} }) => {
    return (
      <svg 
        viewBox="0 0 24 24" 
        className={`car-svg ${className}`} 
        style={style}
      >
        {/* Car body */}
        <path d="M20,8 L19,4 C18.9,3.4 18.4,3 17.8,3 L6.2,3 C5.6,3 5.1,3.4 5,4 L4,8 C2.3,8.3 1,9.8 1,11.5 L1,16 C1,16.6 1.4,17 2,17 L3,17 C3.6,17 4,16.6 4,16 L4,15 L20,15 L20,16 C20,16.6 20.4,17 21,17 L22,17 C22.6,17 23,16.6 23,16 L23,11.5 C23,9.8 21.7,8.3 20,8 Z" 
              fill={color} 
              stroke="#333" 
              strokeWidth="0.5"/>
        
        {/* Windows */}
        <path d="M5,8 L19,8 L19,11 C19,11.6 18.6,12 18,12 L6,12 C5.4,12 5,11.6 5,11 L5,8 Z" 
              fill="#d1d5db" 
              stroke="#333" 
              strokeWidth="0.3"/>
        
        {/* Wheels */}
        <circle cx="7" cy="14" r="2.5" fill="#333" stroke="#111" strokeWidth="0.5"/>
        <circle cx="17" cy="14" r="2.5" fill="#333" stroke="#111" strokeWidth="0.5"/>
        
        {/* Headlights and details */}
        <rect x="3" y="7" width="1.5" height="1" rx="0.5" fill="#fef3c7"/>
        <rect x="19.5" y="7" width="1.5" height="1" rx="0.5" fill="#fef3c7"/>
        <line x1="8" y1="10" x2="16" y2="10" stroke="#333" strokeWidth="0.2"/>
      </svg>
    );
  };
  
  // Flame SVG Component
  const FlameSvg = ({ width = 20, height = 20, className = '' }) => {
    return (
      <svg 
        viewBox="0 0 24 24" 
        width={width} 
        height={height} 
        className={className}
      >
        <defs>
          <radialGradient id="flameGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#FFEB3B" stopOpacity="1" />
            <stop offset="40%" stopColor="#FF9800" stopOpacity="1" />
            <stop offset="90%" stopColor="#F44336" stopOpacity="1" />
            <stop offset="100%" stopColor="#D32F2F" stopOpacity="0.8" />
          </radialGradient>
        </defs>
        <path d="M12,2 C12,2 18,9 18,14 C18,19 15,22 12,22 C9,22 6,19 6,14 C6,9 12,2 12,2 Z" 
              fill="url(#flameGradient)" />
        <path d="M12,5 C12,5 16,10 16,14 C16,17 14,19 12,19 C10,19 8,17 8,14 C8,10 12,5 12,5 Z" 
              fill="#FFEB3B" 
              opacity="0.6" />
      </svg>
    );
  };
  
  // Modern Camera View Component
  const CameraView = ({ detector, expanded = false }) => {
    if (!detector) return null;
    
    // Find the car associated with this detector's parking spot
    const spotDetails = definedParkingSpots[activeLevel].find(spot => 
      spot.number === detector.place
    );
    
    // Generate random camera fuzziness animation
    const cameraNoise = Math.random() * 0.5;
    
    // Camera view styles
    const cameraStyles = {
      filter: `contrast(1.1) brightness(${0.9 + cameraNoise * 0.1})`,
      background: '#111',
      position: 'relative',
      overflow: 'hidden'
    };
    
    return (
      <div className={`relative ${expanded ? 'h-full' : 'h-full'} border-4 border-gray-800 rounded-lg overflow-hidden shadow-lg`} style={cameraStyles}>
        {/* Camera view background - parking garage */}
        <div className="absolute inset-0 bg-gray-900">
          {/* Garage floor with parking lines */}
          <div className="absolute inset-0 bg-gray-800">
            {/* Floor texture */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(80, 80, 80, 0.2) 1px, transparent 1px)',
              backgroundSize: '8px 8px'
            }}></div>
            
            {/* Parking lines */}
            <div className="absolute left-1/2 right-0 top-0 bottom-0 border-l-2 border-dashed border-yellow-500 opacity-40"></div>
            <div className="absolute left-0 right-0 top-1/3 bottom-0 border-t-4 border-yellow-500 opacity-40"></div>
            
            {/* Parking spot */}
            <div className="absolute left-1/4 right-1/4 top-1/3 bottom-1/6 border-2 border-yellow-500 opacity-60"></div>
            
            {/* Spot number */}
            {detector.place && (
              <div className="absolute left-1/2 bottom-1/6 transform -translate-x-1/2 translate-y-4">
                <div className="bg-yellow-500 text-black font-bold px-2 py-1 rounded">
                  {detector.place}
                </div>
              </div>
            )}
          </div>
          
          {/* Wall and ceiling */}
          <div className="absolute left-0 right-0 top-0 h-1/3 bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            </div>
            
            {/* Ceiling lights */}
            <div className="absolute bottom-0 left-1/4 w-1/2 h-2 bg-yellow-100 opacity-20 blur-sm"></div>
            <div className="absolute bottom-0 left-3/4 w-1/4 h-2 bg-yellow-100 opacity-10 blur-sm"></div>
          </div>
          
          {/* Car in the parking spot - if there's a car at this spot */}
          {detector.place && detector.carColor && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/3">
              <div className="relative w-48 h-24">
                <CarSvg color={detector.carColor} className="w-full h-full" />
              </div>
            </div>
          )}
          
          {/* Fire and smoke effect when alarm is active */}
          {alarmActive && simulationStep >= 5 && (
            <>
              {/* Smoke */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/3 pointer-events-none">
                <div className="absolute w-48 h-48 bg-gray-500 rounded-full opacity-30 animate-pulse blur-xl"></div>
                <div className="absolute w-32 h-32 bg-gray-400 rounded-full opacity-40 animate-pulse blur-lg" 
                     style={{animation: 'pulse 3s infinite ease-in-out 0.5s'}}></div>
                <div className="absolute w-24 h-24 bg-gray-300 rounded-full opacity-30 animate-pulse blur-md"
                     style={{animation: 'pulse 2s infinite ease-in-out 1s'}}></div>
              </div>
              
              {/* Flames */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/3 pointer-events-none">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute transform scale-100 opacity-80 animate-pulse" 
                       style={{animation: 'pulse 1s infinite ease-in-out'}}>
                    <FlameSvg width={80} height={80} />
                  </div>
                  <div className="absolute transform scale-75 opacity-90 animate-pulse" 
                       style={{animation: 'pulse 1.5s infinite ease-in-out 0.2s', transform: 'translate(-15px, 5px) scale(0.7)'}}>
                    <FlameSvg width={60} height={60} />
                  </div>
                  <div className="absolute transform scale-50 opacity-80 animate-pulse" 
                       style={{animation: 'pulse 1.2s infinite ease-in-out 0.4s', transform: 'translate(20px, -5px) scale(0.6)'}}>
                    <FlameSvg width={40} height={40} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Camera overlay effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scan line effect */}
          <div className="absolute left-0 right-0 h-px bg-white opacity-20 animate-scanline"></div>
          
          {/* Camera noise effect */}
          <div className="absolute inset-0 bg-noise opacity-5"></div>
          
          {/* Vignette effect */}
          <div className="absolute inset-0 bg-vignette opacity-60"></div>
        </div>
        
        {/* Camera info overlay */}
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 z-20 flex justify-between items-center">
          <div className="flex items-center">
            <Camera size={16} className="text-red-500 mr-2 flex-shrink-0" />
            <span className="font-mono text-sm truncate">{detector.camera}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
            <span className="text-xs font-mono">LIVE</span>
          </div>
        </div>
        
        {/* Zone/place info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 z-20">
          <div className="font-bold truncate">{detector.location}</div>
          <div className="flex justify-between text-xs">
            <span>Zone: {detector.zone}</span>
            <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
        
        {/* Alarm indication */}
        {alarmActive && simulationStep >= 5 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse z-30 flex items-center">
            <Flame size={12} className="mr-1" />
            ALERTE FEU
          </div>
        )}
      </div>
    );
  };
  
  // Custom Step Indicator Component
  const StepIndicator = () => {
    return (
      <div className="w-full flex justify-between items-center my-8 relative">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
        
        {/* Active line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-red-500 -translate-y-1/2 z-10 transition-all duration-700" 
          style={{ 
            width: simulationStep === 0 ? '0%' : 
                   simulationStep === 1 ? '20%' : 
                   simulationStep === 2 ? '40%' : 
                   simulationStep === 3 ? '60%' : 
                   simulationStep === 4 ? '80%' : '100%' 
          }}
        ></div>
        
        {/* Step circles */}
        <div className={`step-circle ${simulationStep >= 1 ? 'active' : ''}`}>
          <div className="relative">
            <div className="p-1.5 rounded-full bg-white border-4 border-gray-200 z-20 relative">
              <div className={`p-0.5 rounded-full ${simulationStep >= 1 ? 'bg-red-500' : 'bg-gray-300'}`}>
                <Bell size={16} className={`${simulationStep >= 1 ? 'text-white' : 'text-gray-500'}`} />
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
              <span className={simulationStep >= 1 ? 'text-gray-800' : 'text-gray-500'}>Détecteur</span>
            </div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-red-600 font-semibold">
              XCEL SECURITY
            </div>
          </div>
        </div>
        
        <div className={`step-circle ${simulationStep >= 2 ? 'active' : ''}`}>
          <div className="relative">
            <div className="p-1.5 rounded-full bg-white border-4 border-gray-200 z-20 relative">
              <div className={`p-0.5 rounded-full ${simulationStep >= 2 ? 'bg-red-500' : 'bg-gray-300'}`}>
                <Shield size={16} className={`${simulationStep >= 2 ? 'text-white' : 'text-gray-500'}`} />
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
              <span className={simulationStep >= 2 ? 'text-gray-800' : 'text-gray-500'}>ESSER</span>
            </div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-blue-600 font-semibold">
              INTÉGRATION
            </div>
          </div>
        </div>
        
        <div className={`step-circle ${simulationStep >= 3 ? 'active' : ''}`}>
          <div className="relative">
            <div className="p-1.5 rounded-full bg-white border-4 border-gray-200 z-20 relative">
              <div className={`p-0.5 rounded-full ${simulationStep >= 3 ? 'bg-red-500' : 'bg-gray-300'}`}>
                <Cpu size={16} className={`${simulationStep >= 3 ? 'text-white' : 'text-gray-500'}`} />
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
              <span className={simulationStep >= 3 ? 'text-gray-800' : 'text-gray-500'}>MOXA</span>
            </div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-blue-600 font-semibold">
              Q-PARK
            </div>
          </div>
        </div>
        
        <div className={`step-circle ${simulationStep >= 4 ? 'active' : ''}`}>
          <div className="relative">
            <div className="p-1.5 rounded-full bg-white border-4 border-gray-200 z-20 relative">
              <div className={`p-0.5 rounded-full ${simulationStep >= 4 ? 'bg-red-500' : 'bg-gray-300'}`}>
                <Server size={16} className={`${simulationStep >= 4 ? 'text-white' : 'text-gray-500'}`} />
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
              <span className={simulationStep >= 4 ? 'text-gray-800' : 'text-gray-500'}>IVPARK</span>
            </div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-green-600 font-semibold">
              NETCELER
            </div>
          </div>
        </div>
        
        <div className={`step-circle ${simulationStep >= 5 ? 'active' : ''}`}>
          <div className="relative">
            <div className="p-1.5 rounded-full bg-white border-4 border-gray-200 z-20 relative">
              <div className={`p-0.5 rounded-full ${simulationStep >= 5 ? 'bg-red-500' : 'bg-gray-300'}`}>
                <Monitor size={16} className={`${simulationStep >= 5 ? 'text-white' : 'text-gray-500'}`} />
              </div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
              <span className={simulationStep >= 5 ? 'text-gray-800' : 'text-gray-500'}>IVPARK</span>
            </div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-green-600 font-semibold">
              OPÉRATEUR
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen">
      {/* Sound elements */}
      <audio ref={alarmSoundRef} src="https://www.soundjay.com/mechanical/sounds/smoke-detector-1.mp3" preload="auto"></audio>
      <audio ref={notificationSoundRef} src="https://www.soundjay.com/buttons/sounds/button-35.mp3" preload="auto"></audio>
      
      {/* Header with Xcel branding */}
      <div className="bg-gradient-to-r from-gray-100 to-red-100 p-4 shadow-lg flex justify-between items-center border-b border-gray-300">
        <div className="flex items-center">
          <XcelLogo size="small" />
        </div>
        
        <div className="text-center flex-grow">
          <h1 className="text-2xl font-bold text-gray-800">Solution de Détection Incendie pour <span className="text-blue-700">Q-PARK</span></h1>
          <p className="text-sm">Intégration ESSER • MOXA • <span className="text-green-700">IVPARK</span></p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock size={18} className="text-blue-700 mr-2" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          
          <button 
            className={`p-2 rounded ${soundEnabled ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-700'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>
      
      {/* Camera fullscreen overlay */}
      {cameraFullscreen && selectedDetector && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center p-8">
          <div className="relative w-full max-w-4xl h-full max-h-[80vh]">
            <CameraView detector={selectedDetector} expanded={true} />
            <button 
              className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full z-30"
              onClick={() => setCameraFullscreen(false)}
            >
              <Maximize2 size={24} />
            </button>
          </div>
        </div>
      )}
      
      {/* Process flow step indicator - moved below content */}
      <div className="container mx-auto px-4 mt-4 pb-6 pt-4 border-b border-gray-300">
        <h2 className="text-xl font-bold text-center mb-2">Processus de Transmission de l'Alarme</h2>
        <StepIndicator />
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 flex flex-col md:flex-row pt-6">
        {/* Main visualization area */}
        <div className="w-full md:w-7/12 pr-0 md:pr-4">
          <div className="flex flex-wrap items-center justify-between bg-white p-3 rounded-lg shadow-sm mb-4 border border-gray-300">
            <h2 className="text-xl font-bold flex items-center text-gray-800 mr-4">
              <Layers size={18} className="mr-2 text-blue-700" />
              Plan du Parking Q-PARK
            </h2>
            
            <div className="flex my-2">
              <button 
                className={`px-3 py-1 rounded-l-lg ${activeLevel === 'p1' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-blue-300'}`}
                onClick={() => setActiveLevel('p1')}
              >
                Niveau -1
              </button>
              <button 
                className={`px-3 py-1 ${activeLevel === 'p2' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-t border-b border-blue-300'}`}
                onClick={() => setActiveLevel('p2')}
              >
                Niveau -2
              </button>
              <button 
                className={`px-3 py-1 rounded-r-lg ${activeLevel === 'p3' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-blue-300'}`}
                onClick={() => setActiveLevel('p3')}
              >
                Niveau -3
              </button>
            </div>
            
            <button 
              className={`px-3 py-1 rounded-lg ${showProcessFlow ? 'bg-red-600 text-white' : 'bg-white text-gray-800 border border-red-300'}`}
              onClick={() => setShowProcessFlow(!showProcessFlow)}
            >
              {showProcessFlow ? 'Masquer Processus' : 'Afficher Processus'}
            </button>
          </div>
          
          {showProcessFlow && <ProcessFlow />}
          
          {/* Floor plan with interactive elements - WHITE BACKGROUND */}
          <div className="w-full h-96 bg-white rounded-lg relative overflow-hidden border border-gray-300 mb-4 shadow-md">
            {/* XCEL Watermark */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
              <XcelLogo size="large" />
            </div>
            
            {/* Background grid */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'linear-gradient(rgba(200,200,200,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,200,200,0.3) 1px, transparent 1px)',
              backgroundSize: '10% 10%'
            }}></div>
            
            {/* Parking spots with cars */}
            {parkingSpots[activeLevel].map(spot => (
              <div 
                key={spot.id}
                className={`absolute rounded ${spot.occupied ? 'bg-gray-200' : 'bg-gray-100 border border-gray-300'}`}
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  width: '10%',
                  height: '6%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Display spot number if it exists */}
                {spot.number && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-800">
                    {spot.number}
                  </div>
                )}
                
                {/* Car if the spot is occupied */}
                {spot.occupied && spot.carColor && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CarSvg color={spot.carColor} className="w-full h-full" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Structures */}
            {structures[activeLevel].map((structure, index) => {
              if (structure.type === 'column') {
                return (
                  <div 
                    key={`${structure.type}-${index}`}
                    className="absolute rounded-sm bg-gray-400"
                    style={{
                      left: `${structure.x}%`,
                      top: `${structure.y}%`,
                      width: '3%',
                      height: '3%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  ></div>
                );
              } else if (structure.type === 'elevator') {
                return (
                  <div 
                    key={`${structure.type}-${index}`}
                    className="absolute rounded-sm bg-blue-200 border border-blue-400 flex items-center justify-center"
                    style={{
                      left: `${structure.x}%`,
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="text-xs text-blue-800">ASC</span>
                  </div>
                );
              } else if (structure.type === 'stairs') {
                return (
                  <div 
                    key={`${structure.type}-${index}`}
                    className="absolute rounded-sm bg-blue-100 border border-blue-400 flex items-center justify-center"
                    style={{
                      left: `${structure.x}%`,
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="text-xs text-blue-800">ESC</span>
                  </div>
                );
              } else if (structure.type === 'ramp') {
                return (
                  <div 
                    key={`${structure.type}-${index}`}
                    className="absolute rounded-sm bg-blue-50 border border-blue-300 flex items-center justify-center"
                    style={{
                      left: `${structure.x}%`,
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="text-xs text-blue-800">→ {structure.to.toUpperCase()}</span>
                  </div>
                );
              } else if (structure.type === 'entrance' || structure.type === 'exit') {
                return (
                  <div 
                    key={`${structure.type}-${index}`}
                    className={`absolute rounded-sm ${structure.type === 'entrance' ? 'bg-green-100 border-green-500' : 'bg-blue-100 border-blue-500'} border flex items-center justify-center`}
                    style={{
                      left: `${structure.x}%`,
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`,
                    }}
                  >
                    <span className="text-xs text-gray-800 transform -rotate-90">{structure.type === 'entrance' ? 'ENTRÉE' : 'SORTIE'}</span>
                  </div>
                );
              } else if (structure.type === 'technicalRoom') {
                return (
                  <div 
                    key={`${structure.type}-${index}`}
                    className="absolute rounded-sm bg-gray-300 border border-gray-500 flex items-center justify-center"
                    style={{
                      left: `${structure.x}%`,
                      top: `${structure.y}%`,
                      width: `${structure.width}%`,
                      height: `${structure.height}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <span className="text-xs text-gray-800">LOCAL<br/>TECH</span>
                  </div>
                );
              }
              return null;
            })}
            
            {/* Cameras */}
            {detectors[activeLevel].map(detector => (
              <div 
                key={`camera-${detector.id}`}
                className="absolute z-10"
                style={{
                  left: `${detector.cameraX}%`,
                  top: `${detector.cameraY}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 border border-blue-500 flex items-center justify-center">
                  <Camera size={12} className="text-blue-800" />
                </div>
              </div>
            ))}
            
            {/* Fire detectors */}
            {detectors[activeLevel].map(detector => (
              <div 
                key={detector.id}
                className={`absolute cursor-pointer transition-transform duration-200 z-20 ${
                  selectedDetector?.id === detector.id && selectedDetector?.type === detector.type ? 'scale-125' : 'hover:scale-110'
                }`}
                style={{
                  left: `${detector.x}%`,
                  top: `${detector.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => runSimulation(detector)}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  detector.type === 'DI' ? 'bg-amber-500' : 'bg-red-500'
                } ${
                  selectedDetector?.id === detector.id && selectedDetector?.type === detector.type && alarmActive ? 'animate-pulse' : ''
                }`}>
                  {detector.type === 'DI' ? 
                    <Bell size={16} className="text-white" /> : 
                    <AlertTriangle size={16} className="text-white" />
                  }
                </div>
                <div className="absolute whitespace-nowrap mt-6 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 text-gray-800 text-xs px-1.5 py-0.5 rounded border border-gray-300">
                  {detector.type}-{detector.id}
                </div>
                
                {/* Smoke effect */}
                {selectedDetector?.id === detector.id && smokeParticles.length > 0 && (
                  <div className="absolute inset-0">
                    {smokeParticles.map(particle => (
                      <div
                        key={particle.id}
                        className="absolute rounded-full bg-gray-500"
                        style={{
                          width: `${particle.size}px`,
                          height: `${particle.size}px`,
                          left: `${particle.x}px`,
                          top: `${particle.y - 10}px`,
                          opacity: particle.opacity,
                          filter: 'blur(3px)',
                          transform: 'translate(-50%, -50%)'
                        }}
                      ></div>
                    ))}
                  </div>
                )}
                
                {/* Flame effect */}
                {selectedDetector?.id === detector.id && flameParticles.length > 0 && (
                  <div className="absolute inset-0">
                    {flameParticles.map(flame => (
                      <div
                        key={flame.id}
                        className="absolute"
                        style={{
                          left: `${flame.x}px`,
                          top: `${flame.y}px`,
                          opacity: flame.opacity,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <FlameSvg 
                          width={flame.size} 
                          height={flame.size} 
                          className="transform -translate-y-1/2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Zone labels */}
            {detectors[activeLevel].map(detector => (
              <div
                key={`zone-${detector.zone}`}
                className="absolute text-blue-700 text-xs font-bold"
                style={{
                  left: `${detector.x - 5}%`,
                  top: `${detector.y - 8}%`,
                }}
              >
                {detector.zone}
              </div>
            ))}
            
            {/* Legend */}
            <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded border border-gray-300 text-xs">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></div>
                <span className="text-gray-800">Détecteur Incendie (DI)</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
                <span className="text-gray-800">Déclencheur Manuel (DM)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-500 flex items-center justify-center mr-1.5">
                  <Camera size={8} className="text-blue-800" />
                </div>
                <span className="text-gray-800">Caméra</span>
              </div>
            </div>
            
            {/* Data packets animation */}
            {dataPackets.map(packet => (
              <DataPacket key={packet.id} packet={packet} />
            ))}
          </div>
          
          {/* Control buttons - UPDATED with new "Simuler un départ de feu" button */}
          <div className="mb-4 flex justify-center gap-3">
            <button 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors rounded-lg shadow text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={resetSimulation}
              disabled={simulationStep === 0}
            >
              <RotateCw size={16} className="mr-2" />
              Réinitialiser
            </button>
            
            <button 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg shadow text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => runSimulation(selectedDetector)}
              disabled={simulationStep > 0 || !selectedDetector}
            >
              <Play size={16} className="mr-2" />
              Démarrer
            </button>
            
            {/* NEW BUTTON: Simulate random fire */}
            <button 
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 transition-colors rounded-lg shadow text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={simulateRandomFire}
              disabled={simulationStep > 0}
            >
              <Flame size={16} className="mr-2" />
              Simuler un départ de feu
            </button>
          </div>
          
          {/* System statistics */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Statistiques Système</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-xs text-gray-600">Détecteurs</div>
                <div className="text-xl font-bold text-gray-800">15</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-xs text-gray-600">Zones</div>
                <div className="text-xl font-bold text-gray-800">15</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-xs text-gray-600">Temps moyen</div>
                <div className="text-xl font-bold text-gray-800">4.5s</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-xs text-gray-600">Caméras</div>
                <div className="text-xl font-bold text-gray-800">15</div>
              </div>
            </div>
          </div>
        </div>
        
                  {/* Alert and details panel - REORGANIZED for side-by-side display */}
        <div className="w-full md:w-5/12 mt-4 md:mt-0">
          <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-300">
            <h2 className="text-xl font-bold text-gray-800">État de la Surveillance</h2>
            <div className="p-2 px-4 bg-gray-100 rounded-full text-sm flex items-center border border-gray-300 shadow-sm">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${alarmActive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
              {alarmActive ? 'Alerte en cours' : 'Système normal'}
            </div>
          </div>
          
          {/* Side by side camera view and notification */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Left: Camera view panel */}
            <div className="h-full">
              <div className="flex justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Vue Caméra</h2>
                {cameraView && (
                  <button 
                    className="flex items-center text-sm bg-blue-100 hover:bg-blue-200 transition-colors text-blue-700 px-2 py-1 rounded border border-blue-300"
                    onClick={() => setCameraFullscreen(true)}
                  >
                    <Maximize2 size={14} className="mr-1" />
                    Agrandir
                  </button>
                )}
              </div>
              
              {selectedDetector && cameraView ? (
                <div className="camera-container h-full">
                  <CameraView detector={selectedDetector} />
                </div>
              ) : (
                <div className="h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Camera size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">La vue caméra sera<br/>affichée lors d'une alarme</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right: Current alert */}
            <div className="h-full">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Notification d'Alarme</h2>
              
              {selectedDetector && simulationStep >= 5 ? (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 animate-pulse-slow relative overflow-hidden h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <AlertTriangle size={20} className="text-red-500 mr-2 flex-shrink-0" />
                      <h3 className="text-base font-bold text-red-600">ALERTE INCENDIE</h3>
                    </div>
                    <span className="text-gray-700 text-xs font-mono">{currentTime.toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-600">Détecteur:</div>
                      <div className="font-bold text-gray-800 text-sm">{selectedDetector.type}-{selectedDetector.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Zone:</div>
                      <div className="font-bold text-gray-800 text-sm">{selectedDetector.zone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Emplacement:</div>
                      <div className="font-bold text-gray-800 text-sm truncate">{selectedDetector.location}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Caméra:</div>
                      <div className="font-bold text-gray-800 text-sm">{selectedDetector.camera}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs bg-white p-2 rounded border border-red-200 mt-auto">
                    <div className="font-semibold">Temps de réponse:</div>
                    <div>4.2 secondes</div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 opacity-5 rounded-full -mt-12 -mr-12"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-500 opacity-5 rounded-full -mb-8 -ml-8"></div>
                </div>
              ) : (
                <div className="bg-white border border-gray-300 rounded-lg p-4 h-full flex items-center justify-center shadow-sm">
                  <div className="text-center text-gray-500">
                    <div className="mb-2">Aucune alerte active</div>
                    <div className="text-sm">Utilisez le bouton "Simuler un départ de feu"<br/>pour lancer une simulation</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action plan */}
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Plan d'Action</h2>
            
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className={`flex items-start p-2 rounded ${simulationStep >= 1 ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${simulationStep >= 1 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">Vérification alerte</div>
                    <div className="text-xs text-gray-600 truncate">Confirmation incendie</div>
                  </div>
                  {simulationStep >= 1 && (
                    <CheckCircle size={16} className="text-green-500 ml-auto flex-shrink-0" />
                  )}
                </div>
                
                <div className={`flex items-start p-2 rounded ${simulationStep >= 3 ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${simulationStep >= 3 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">Notification équipes</div>
                    <div className="text-xs text-gray-600 truncate">Transmission agents</div>
                  </div>
                  {simulationStep >= 3 && (
                    <CheckCircle size={16} className="text-green-500 ml-auto flex-shrink-0" />
                  )}
                </div>
                
                <div className={`flex items-start p-2 rounded ${simulationStep >= 5 ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${simulationStep >= 5 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">Intervention site</div>
                    <div className="text-xs text-gray-600 truncate">Localisation précise</div>
                  </div>
                  {simulationStep >= 5 && (
                    <CheckCircle size={16} className="text-green-500 ml-auto flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-100 to-red-100 p-2 text-xs text-center border-t border-gray-300 mt-6">
        <div className="flex justify-center items-center">
          <span className="text-red-600 font-bold">XCEL SECURITY SERVICES</span>
          <span className="mx-3 text-gray-400">•</span>
          <span className="text-blue-600">Q-PARK</span>
          <span className="mx-3 text-gray-400">•</span>
          <span className="text-green-600">NETCELER</span>
        </div>
        <div className="mt-1 text-gray-600">
          Simulation de la solution intégrée de détection incendie
        </div>
      </div>
      
      {/* CSS for custom animations */}
      <style jsx>{`
        .step-circle {
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 20;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes scanline {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
        
        .animate-scanline {
          animation: scanline 5s linear infinite;
        }
        
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
        
        .bg-vignette {
          background: radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.8) 150%);
        }
        
        .camera-container {
          position: relative;
          z-index: 10;
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default XcelQParkRealisticSimulation;
