export interface Planet {
  id: string;
  name: string;
  color: string;
  orbitalPeriod: number;
  distanceFromSun: number;
  radius: number;
  description: string;
  musicalNote: string;
  frequency: number;
  isMuted?: boolean;
}

export const PLANETS: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#8C7853',
    orbitalPeriod: 88,
    distanceFromSun: 0.39,
    radius: 0.38,
    description: 'The smallest planet and closest to the Sun. Mercury has extreme temperature variations.',
    musicalNote: 'C',
    frequency: 261.63
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#FFC649',
    orbitalPeriod: 225,
    distanceFromSun: 0.72,
    radius: 0.95,
    description: 'The hottest planet in our solar system with a thick, toxic atmosphere.',
    musicalNote: 'D',
    frequency: 293.66
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#6B93D6',
    orbitalPeriod: 365,
    distanceFromSun: 1.0,
    radius: 1.0,
    description: 'Our home planet, the only known world to harbor life.',
    musicalNote: 'E',
    frequency: 329.63
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#CD5C5C',
    orbitalPeriod: 687,
    distanceFromSun: 1.52,
    radius: 0.53,
    description: 'The Red Planet, with the largest volcano and canyon in the solar system.',
    musicalNote: 'F',
    frequency: 349.23
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#D8CA9D',
    orbitalPeriod: 4333,
    distanceFromSun: 5.20,
    radius: 5.0,
    description: 'The largest planet, a gas giant with over 80 moons including the four Galilean moons.',
    musicalNote: 'G',
    frequency: 392.00
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#FAD5A5',
    orbitalPeriod: 10759,
    distanceFromSun: 9.58,
    radius: 4.2,
    description: 'Famous for its spectacular ring system, Saturn is less dense than water.',
    musicalNote: 'A',
    frequency: 440.00
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#4FD0E7',
    orbitalPeriod: 30687,
    distanceFromSun: 19.22,
    radius: 2.0,
    description: 'An ice giant that rotates on its side, with a unique tilted magnetic field.',
    musicalNote: 'B',
    frequency: 493.88
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#4B70DD',
    orbitalPeriod: 60190,
    distanceFromSun: 30.05,
    radius: 1.9,
    description: 'The windiest planet with storms reaching speeds of 2,100 km/h.',
    musicalNote: 'C',
    frequency: 523.25
  }
];

// Scale factor for visualization (to fit planets nicely on screen)
export const SCALE_FACTOR = 50;
export const SUN_RADIUS = 20;

// Musical scale for harmonious sonification
export const PENTATONIC_SCALE: string[] = ['C', 'D', 'E', 'G', 'A'];
export const MAJOR_SCALE: string[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
