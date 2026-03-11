export const DEFAULT_AMENITIES = [
  // Daily essentials — 1000m threshold
  { name: "Tesco", osmTag: "name=Tesco", googleType: "Tesco", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "Lidl", osmTag: "name=Lidl", googleType: "Lidl", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "Aldi", osmTag: "name=Aldi", googleType: "Aldi", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "Dunnes Stores", osmTag: "name=Dunnes", googleType: "Dunnes Stores", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "SuperValu", osmTag: "name=SuperValu", googleType: "SuperValu", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "Any Supermarket", osmTag: "shop=supermarket", googleType: "supermarket", icon: "🏪", maxWalkingMetres: 1000 },
  { name: "Pharmacy", osmTag: "amenity=pharmacy", googleType: "pharmacy", icon: "💊", maxWalkingMetres: 1000 },
  { name: "Café", osmTag: "amenity=cafe", googleType: "cafe", icon: "☕", maxWalkingMetres: 1000 },
  // Daily commute infra — 1000m
  { name: "Bus Stop", osmTag: "highway=bus_stop", googleType: "bus stop", icon: "🚌", maxWalkingMetres: 1000 },
  { name: "LUAS Stop", osmTag: "railway=tram_stop", googleType: "LUAS stop", icon: "🚊", maxWalkingMetres: 1000 },
  { name: "DART Station", osmTag: "railway=station", googleType: "DART station", icon: "🚆", maxWalkingMetres: 1000 },
  // Regular use — 1500m
  { name: "GP / Doctor", osmTag: "amenity=doctors", googleType: "GP doctor", icon: "🏥", maxWalkingMetres: 1500 },
  { name: "Park", osmTag: "leisure=park", googleType: "park", icon: "🌳", maxWalkingMetres: 1500 },
  { name: "Playground", osmTag: "leisure=playground", googleType: "playground", icon: "🛝", maxWalkingMetres: 1500 },
  { name: "Restaurant", osmTag: "amenity=restaurant", googleType: "restaurant", icon: "🍽️", maxWalkingMetres: 1500 },
  // Destination — 2000m
  { name: "Gym", osmTag: "leisure=fitness_centre", googleType: "gym", icon: "🏋️", maxWalkingMetres: 2000 },
  { name: "Swimming Pool", osmTag: "leisure=swimming_pool", googleType: "swimming pool", icon: "🏊", maxWalkingMetres: 2000 },
  { name: "Primary School", osmTag: "amenity=school", googleType: "primary school", icon: "🏫", maxWalkingMetres: 2000 },
  { name: "Secondary School", osmTag: "amenity=school", googleType: "secondary school", icon: "🎓", maxWalkingMetres: 2000 },
  { name: "Pilates / Yoga", osmTag: "leisure=fitness_centre", googleType: "pilates", icon: "🧘", maxWalkingMetres: 2000 },
];
