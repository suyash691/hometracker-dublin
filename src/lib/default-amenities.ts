export const DEFAULT_AMENITIES = [
  // Daily essentials — 1000m threshold
  { name: "Tesco", osmTag: "name=Tesco", googleType: "supermarket", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "Lidl", osmTag: "name=Lidl", googleType: "supermarket", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "Aldi", osmTag: "name=Aldi", googleType: "supermarket", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "Dunnes Stores", osmTag: "name=Dunnes", googleType: "supermarket", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "SuperValu", osmTag: "name=SuperValu", googleType: "supermarket", icon: "🛒", maxWalkingMetres: 1000 },
  { name: "Any Supermarket", osmTag: "shop=supermarket", googleType: "supermarket", icon: "🏪", maxWalkingMetres: 1000 },
  { name: "Pharmacy", osmTag: "amenity=pharmacy", googleType: "pharmacy", icon: "💊", maxWalkingMetres: 1000 },
  { name: "Café", osmTag: "amenity=cafe", googleType: "cafe", icon: "☕", maxWalkingMetres: 1000 },
  // Daily commute infra — 1000m (used twice daily)
  { name: "Bus Stop", osmTag: "highway=bus_stop", googleType: "bus_station", icon: "🚌", maxWalkingMetres: 1000 },
  { name: "LUAS Stop", osmTag: "railway=tram_stop", googleType: "transit_station", icon: "🚊", maxWalkingMetres: 1000 },
  { name: "DART Station", osmTag: "railway=station", googleType: "train_station", icon: "🚆", maxWalkingMetres: 1000 },
  // Regular use — 1500m
  { name: "GP / Doctor", osmTag: "amenity=doctors", googleType: "doctor", icon: "🏥", maxWalkingMetres: 1500 },
  { name: "Park", osmTag: "leisure=park", googleType: "park", icon: "🌳", maxWalkingMetres: 1500 },
  { name: "Playground", osmTag: "leisure=playground", googleType: "park", icon: "🛝", maxWalkingMetres: 1500 },
  { name: "Restaurant", osmTag: "amenity=restaurant", googleType: "restaurant", icon: "🍽️", maxWalkingMetres: 1500 },
  // Destination — 2000m
  { name: "Gym", osmTag: "leisure=fitness_centre", googleType: "gym", icon: "🏋️", maxWalkingMetres: 2000 },
  { name: "Swimming Pool", osmTag: "leisure=swimming_pool", googleType: "gym", icon: "🏊", maxWalkingMetres: 2000 },
  { name: "Primary School", osmTag: "amenity=school", googleType: "primary_school", icon: "🏫", maxWalkingMetres: 2000 },
  { name: "Secondary School", osmTag: "amenity=school", googleType: "secondary_school", icon: "🎓", maxWalkingMetres: 2000 },
  { name: "Pilates / Yoga", osmTag: "leisure=fitness_centre", googleType: "gym", icon: "🧘", maxWalkingMetres: 2000 },
];
