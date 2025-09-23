# Sol - Solar System Data Sonification

An interactive celestial symphony that transforms the orbital mechanics of our solar system into an immersive audiovisual experience. This project uses real astronomical data to create unique musical compositions based on planetary movements.

## 🌟 Features

### Interactive Visualization
- **Real-time Solar System**: Watch planets orbit the Sun with accurate relative speeds and distances
- **Beautiful Space Theme**: Dark space background with glowing celestial bodies and orbit paths
- **Interactive Planets**: Click on any planet to view detailed information
- **Responsive Design**: Works on different screen sizes with smooth animations

### Audio Sonification
- **Tone.js Integration**: Each planet generates unique musical patterns based on orbital data
- **Realistic Sound Mapping**: 
  - Orbital velocity affects note timing
  - Distance from Sun determines musical octave
  - Planet size influences volume
  - Each planet has its own musical note (C, D, E, F, G, A, B)
- **Audio Effects**: Built-in reverb and delay for space-like atmosphere
- **Individual Planet Control**: Mute/unmute specific planets

### User Controls
- **Play/Pause**: Start and stop the celestial symphony
- **Speed Control**: Adjust orbital speed from 1x to 10,000x
- **Volume Control**: Master volume adjustment
- **Tempo Control**: Adjust the overall musical tempo
- **Planet Information**: Detailed information panel for each celestial body

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sol
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to experience the solar system sonification.

### Build for Production

```bash
npm run build
npm start
```

## 🎵 How It Works

### Audio Generation
The project uses **Tone.js** to generate audio based on real astronomical data:

1. **Orbital Velocity**: Faster planets (closer to the Sun) play notes more frequently
2. **Distance Mapping**: Planets farther from the Sun play in higher octaves
3. **Musical Notes**: Each planet is assigned a specific note:
   - Mercury: C
   - Venus: D  
   - Earth: E
   - Mars: F
   - Jupiter: G
   - Saturn: A
   - Uranus: B
   - Neptune: C (higher octave)

### Visual Representation
- **Orbital Paths**: Dashed lines show planet orbits
- **Relative Sizes**: Planet sizes are logarithmically scaled for visibility
- **Realistic Colors**: Each planet has its characteristic color
- **Smooth Animation**: 60fps animation with requestAnimationFrame

### Interactive Features
- **Planet Selection**: Click any planet to see detailed information
- **Audio Control**: Individual planets can be muted/unmuted
- **Speed Adjustment**: Control how fast time passes in the simulation
- **Responsive UI**: Control panels adapt to different screen sizes

## 🛠️ Technical Stack

### Frontend
- **Next.js 14**: React framework with server-side rendering
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **React**: Component-based UI library

### Audio
- **Tone.js**: Web Audio framework for music synthesis
- **Web Audio API**: Low-level audio processing

### Visualization
- **D3.js**: Data-driven document manipulation
- **SVG**: Scalable vector graphics for crisp visuals
- **CSS Animations**: Smooth transitions and effects

### Data
- **Real Astronomical Data**: Accurate orbital periods, distances, and sizes
- **NASA Data Sources**: Planetary characteristics from scientific databases

## 📁 Project Structure

```
Sol/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main application page
│   │   ├── layout.tsx            # Root layout component
│   │   └── globals.css           # Global styles with Tailwind
│   ├── components/
│   │   ├── SolarSystemVisualization.tsx  # Main visualization component
│   │   ├── ControlPanel.tsx      # Audio and speed controls
│   │   └── PlanetInfoPanel.tsx   # Planet information display
│   ├── lib/
│   │   ├── audioEngine.ts        # Tone.js audio engine
│   │   ├── orbital-mechanics.ts  # Physics calculations
│   │   └── planets-data.ts       # Planet data and constants
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── data/
│       └── planets.ts            # Planet data and interfaces
├── package.json                  # Dependencies and scripts
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md                     # This file
```

## 🎮 Usage Guide

### Basic Controls
1. **Start the Symphony**: Click the play button to begin the audio and animation
2. **Adjust Speed**: Use the speed slider to control orbital velocity (1x to 10,000x)
3. **Control Volume**: Adjust master volume with the volume slider
4. **Set Tempo**: Change the overall musical tempo

### Planet Interaction
1. **Click Planets**: Click any planet to view detailed information
2. **Mute/Unmute**: Toggle individual planet audio in the planet info panel
3. **Close Info**: Click outside the info panel or use the close button

### Advanced Features
- **Real-time Audio**: Audio generation responds to speed changes instantly
- **Smooth Transitions**: All animations and audio changes are smoothly interpolated
- **Performance Optimized**: Efficient rendering even at high speeds

## 🔧 Configuration

### Customization Options
- **Color Themes**: Modify Tailwind config for different space themes
- **Audio Parameters**: Adjust reverb, delay, and synth settings in audioEngine.ts
- **Planet Data**: Update planetary characteristics in planets-data.ts
- **Orbital Mechanics**: Fine-tune physics calculations in orbital-mechanics.ts

### Environment Variables
Create a `.env.local` file for environment-specific settings:
```env
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_AUDIO_ENABLED=true
```

## 🐛 Troubleshooting

### Common Issues

**Audio Not Working**
- Ensure browser supports Web Audio API
- Check if audio context is blocked by browser
- Try clicking the page first to enable audio

**Performance Issues**
- Reduce number of background stars
- Lower animation quality in browser settings
- Close other tabs using audio

**Build Errors**
- Ensure all dependencies are installed
- Check TypeScript types are consistent
- Verify all imports are correct

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may require user interaction for audio)
- **Edge**: Full support

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write clear, documented code
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA**: For providing accurate planetary data
- **Tone.js**: For the powerful audio synthesis framework
- **D3.js**: For data visualization capabilities
- **Next.js Team**: For the excellent React framework

## 📞 Contact

For questions, suggestions, or contributions:
- Create an issue on GitHub
- Join our community discussions
- Follow our project updates

---

**Experience the music of the cosmos! 🌌🎵**
