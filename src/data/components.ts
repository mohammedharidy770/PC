import { HardwareComponentInfo } from '../types/hardware';

export const HARDWARE_COMPONENTS: HardwareComponentInfo[] = [
  {
    id: 'processor',
    number: '01',
    name: 'Apex X9-1600K Compute Die',
    category: 'Processor',
    shortDescription:
      'Precision-lapped nickel-copper integrated heat spreader housing a high-density multi-tile compute architecture.',
    materialFinish: 'Nickel-plated copper IHS · Matte obsidian substrate',
    specs: [
      { label: 'Architecture', value: 'Illustrative 24-Core Hybrid' },
      { label: 'Socket Class', value: 'LGA Precision Array' },
      { label: 'Boost Envelope', value: 'Up to 6.0 GHz (Illustrative)' },
      { label: 'Thermal Interface', value: 'Soldered Indium TIM' },
    ],
    cameraTarget: {
      position: [-1.45, 0.55, 0.95],
      lookAt: [-0.08, 0.42, -0.05],
    },
    explodeOffset: [-0.9, 0.15, 0.1],
  },
  {
    id: 'gpu',
    number: '02',
    name: 'Valkyrie Triple-Axial Accelerator',
    category: 'Graphics Card',
    shortDescription:
      'Triple-slot milled aluminum shroud with vapor-chamber fin stack, exposed copper heatpipes, and full-length flow-through backplate.',
    materialFinish: 'CNC anodized aluminum · Sintered copper heatpipes',
    specs: [
      { label: 'Cooling Array', value: 'Triple Axial-Tech Fans' },
      { label: 'Slot Footprint', value: '3.2-Slot Reinforced PCIe' },
      { label: 'Thermal Core', value: 'Vapor Chamber + 7 Heatpipes' },
      { label: 'Power Delivery', value: '16-Pin High-Current Header' },
    ],
    cameraTarget: {
      position: [-1.65, -0.05, 1.35],
      lookAt: [-0.05, -0.18, 0.15],
    },
    explodeOffset: [-1.35, -0.15, 0.35],
  },
  {
    id: 'motherboard',
    number: '03',
    name: 'Monolith Z-Max Mainboard',
    category: 'Motherboard',
    shortDescription:
      '8-layer low-loss matte PCB armored with sculpted VRM heatsinks, steel-sheathed expansion slots, and integrated rear I/O shroud.',
    materialFinish: 'Matte black 8-layer PCB · Brushed aluminum VRM armor',
    specs: [
      { label: 'Form Factor', value: 'ATX Precision Layout' },
      { label: 'VRM Topology', value: '20+2 Phase Alloy Chokes' },
      { label: 'Expansion', value: 'Dual PCIe 5.0 Steel Slots' },
      { label: 'Connectivity', value: 'Dual 10G LAN & Wi-Fi 7 Class' },
    ],
    cameraTarget: {
      position: [-2.05, 0.25, 1.2],
      lookAt: [-0.15, 0.15, -0.05],
    },
    explodeOffset: [-0.45, 0.0, -0.05],
  },
  {
    id: 'memory',
    number: '04',
    name: 'Lumina Quad-Channel DDR5',
    category: 'Memory',
    shortDescription:
      'Four matched low-latency modules featuring CNC-fluted aluminum heatspreaders and seamless top-mounted light-guide diffusers.',
    materialFinish: 'Bead-blasted aluminum · Frosted optical acrylic',
    specs: [
      { label: 'Configuration', value: '4 × 32 GB Quad-DIMM Array' },
      { label: 'Profile Speed', value: 'DDR5-8000 MT/s (Illustrative)' },
      { label: 'Heatspreader', value: '2mm Solid Extruded Alloy' },
      { label: 'Illumination', value: '8-Zone Addressable Diffuser' },
    ],
    cameraTarget: {
      position: [-1.35, 0.6, 1.05],
      lookAt: [-0.08, 0.42, 0.28],
    },
    explodeOffset: [-1.05, 0.25, 0.35],
  },
  {
    id: 'storage',
    number: '05',
    name: 'Chronos Gen5 NVMe Array',
    category: 'Storage',
    shortDescription:
      'High-endurance M.2 solid-state module enclosed beneath a micro-finned anodized thermal shield for sustained sequential throughput.',
    materialFinish: 'Micro-finned anodized alloy · Copper thermal pad',
    specs: [
      { label: 'Interface', value: 'PCIe 5.0 ×4 NVMe M.2' },
      { label: 'Capacity Tier', value: '4 TB TLC NAND (Illustrative)' },
      { label: 'Thermal Shield', value: 'Dual-Sided Finned Heatsink' },
      { label: 'Form Factor', value: 'M.2 2280 Direct-to-CPU Lane' },
    ],
    cameraTarget: {
      position: [-1.45, 0.15, 0.95],
      lookAt: [-0.12, 0.06, 0.05],
    },
    explodeOffset: [-1.1, 0.05, 0.15],
  },
  {
    id: 'cooling',
    number: '06',
    name: 'CryoLoop 360 Liquid & Airflow',
    category: 'Cooling',
    shortDescription:
      'Top-mounted 360mm high-fin-density aluminum radiator linked by braided EPDM tubing to a low-profile halo pump block and 7 PWM fans.',
    materialFinish: 'Brazed aluminum fins · Braided EPDM sleeving',
    specs: [
      { label: 'Radiator Size', value: '360 × 120 × 30 mm' },
      { label: 'Airflow Matrix', value: '7 × 120mm Static-Pressure Fans' },
      { label: 'Pump Housing', value: 'Ceramic Bearing Halo Block' },
      { label: 'Tubing', value: '400mm Reinforced Braided EPDM' },
    ],
    cameraTarget: {
      position: [-1.9, 1.35, 1.55],
      lookAt: [0.0, 0.95, 0.0],
    },
    explodeOffset: [0.0, 1.15, 0.0],
  },
  {
    id: 'psu',
    number: '07',
    name: 'Titanium 1600W Power Core',
    category: 'Power Supply',
    shortDescription:
      'Fully modular lower-chamber power unit paired with individually sleeved paracord harnesses routed cleanly through recessed grommets.',
    materialFinish: 'Powder-coated steel · Individually sleeved cables',
    specs: [
      { label: 'Efficiency Class', value: 'Titanium Grade (Illustrative)' },
      { label: 'Output Ceiling', value: '1600W Continuous Rail' },
      { label: 'Cabling', value: '100% Modular Custom Sleeved' },
      { label: 'Acoustic Mode', value: 'Zero-RPM Low-Load Fan Stop' },
    ],
    cameraTarget: {
      position: [-1.7, -0.85, 1.4],
      lookAt: [-0.05, -0.92, -0.25],
    },
    explodeOffset: [0.0, -0.95, -0.65],
  },
  {
    id: 'case',
    number: '08',
    name: 'Obsidian Panoramic ATX Chassis',
    category: 'PC Case',
    shortDescription:
      'Architectural dual-chamber tower sculpted from dark brushed aluminum, perforated airflow grilles, and pillarless tempered glass panels.',
    materialFinish: 'Brushed anodized aluminum · 4mm tempered glass',
    specs: [
      { label: 'Chassis Alloy', value: '3mm CNC Brushed Aluminum' },
      { label: 'Glazing', value: 'Dual 4mm Tempered Glass' },
      { label: 'Airflow Paths', value: 'Front, Top & Rear Perforated Mesh' },
      { label: 'Cable Routing', value: '38mm Rear Dual-Chamber Channel' },
    ],
    cameraTarget: {
      position: [-2.9, 0.55, 2.75],
      lookAt: [0, 0, 0],
    },
    explodeOffset: [0.65, 0, 0],
  },
];

export const EXPLODED_EXTRA_PARTS = {
  fans: {
    name: 'Intake & Exhaust Fans',
    explodeOffset: [0, 0, 1.05] as [number, number, number],
  },
  glass: {
    name: 'Tempered Glass Panels',
    explodeOffset: [-1.85, 0, 0.45] as [number, number, number],
  },
};
