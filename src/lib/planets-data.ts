import { Planet } from '@/types';

export const SUN_RADIUS = 30;
export const SCALE_FACTOR = 25;

export const PLANETS: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#8C7853',
    radius: 0.38,
    distanceFromSun: 0.39,
    orbitalPeriod: 88,
    frequency: 261.63, // C4
    musicalNote: 'C',
    description: 'The smallest planet in our solar system and nearest to the Sun. Mercury completes an orbit every 88 Earth days and has extreme temperature variations.'
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#FFC649',
    radius: 0.95,
    distanceFromSun: 0.72,
    orbitalPeriod: 225,
    frequency: 293.66, // D4
    musicalNote: 'D',
    description: 'The second planet from the Sun, often called Earth\'s twin. Venus has a thick, toxic atmosphere and is the hottest planet in our solar system.'
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#6B93D6',
    radius: 1.0,
    distanceFromSun: 1.0,
    orbitalPeriod: 365,
    frequency: 329.63, // E4
    musicalNote: 'E',
    description: 'Our home planet, the third from the Sun. Earth is the only known planet to harbor life, with liquid water covering 71% of its surface.'
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#CD5C5C',
    radius: 0.53,
    distanceFromSun: 1.52,
    orbitalPeriod: 687,
    frequency: 349.23, // F4
    musicalNote: 'F',
    description: 'The fourth planet from the Sun, known as the Red Planet. Mars has the largest dust storms in the solar system and two small moons.'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#D8CA9D',
    radius: 11.21,
    distanceFromSun: 5.20,
    orbitalPeriod: 4333,
    frequency: 392.00, // G4
    musicalNote: 'G',
    description: 'The largest planet in our solar system, a gas giant with a Great Red Spot storm. Jupiter has 79 known moons and acts as a cosmic vacuum cleaner.'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#FAD5A5',
    radius: 9.45,
    distanceFromSun: 9.54,
    orbitalPeriod: 10759,
    frequency: 440.00, // A4
    musicalNote: 'A',
    description: 'The sixth planet from the Sun, famous for its spectacular ring system. Saturn is a gas giant with 82 known moons and the lowest density of any planet.'
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#4FD0E7',
    radius: 4.01,
    distanceFromSun: 19.19,
    orbitalPeriod: 30687,
    frequency: 493.88, // B4
    musicalNote: 'B',
    description: 'The seventh planet from the Sun, an ice giant that rotates on its side. Uranus has 27 known moons and a faint ring system.'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#4B70DD',
    radius: 3.88,
    distanceFromSun: 30.07,
    orbitalPeriod: 60190,
    frequency: 523.25, // C5
    musicalNote: 'C',
    description: 'The eighth and outermost planet in our solar system. Neptune has the fastest winds in the solar system and 14 known moons.'
  }
];
