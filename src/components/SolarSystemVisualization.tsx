'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Planet, PLANETS, SUN_RADIUS } from '@/data/planets';
import { calculatePlanetRadius } from '@/lib/orbital-mechanics';

interface SolarSystemVisualizationProps {
  width?: number | string;
  height?: number | string;
  isPlaying?: boolean;
  speedMultiplier?: number;
  onPlanetClick?: (planet: Planet) => void;
  selectedPlanet?: Planet | null;
}

interface PlanetPosition {
  x: number;
  y: number;
}

export default function SolarSystemVisualization({
  width = '100%',
  height = '100%',
  isPlaying = false,
  speedMultiplier = 1000,
  onPlanetClick,
  selectedPlanet
}: SolarSystemVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const [isMobile, setIsMobile] = useState(false);
  const [planetPositions, setPlanetPositions] = useState<Map<string, PlanetPosition>>(new Map());
  const [starPositions, setStarPositions] = useState<Array<{x: number, y: number, r: number, opacity: number}>>([]);
  const [containerSize, setContainerSize] = useState({ width: 900, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSizeRef = useRef(containerSize);
  
  // Update ref when containerSize changes
  useEffect(() => {
    containerSizeRef.current = containerSize;
  }, [containerSize]);

  // Measure actual container size with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const newWidth = Math.round(width);
        const newHeight = Math.round(height);
        
        // Only update if size actually changed significantly (more than 1px difference)
        const currentSize = containerSizeRef.current;
        if (Math.abs(newWidth - currentSize.width) > 1 || Math.abs(newHeight - currentSize.height) > 1) {
          setContainerSize({
            width: newWidth,
            height: newHeight
          });
        }
      }
    });
    
    ro.observe(container);
    
    // Initialize with current size
    const rect = container.getBoundingClientRect();
    setContainerSize({
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    });
    
    console.log('📏 DEBUG: Container size measured:', { 
      width: Math.round(rect.width), 
      height: Math.round(rect.height) 
    });
    
    return () => ro.disconnect();
  }, []);
  
  // Use actual container size for calculations
  const actualWidth = containerSize.width;
  const actualHeight = containerSize.height;
  
  // Center of the solar system
  const centerX = actualWidth / 2;
  const centerY = actualHeight / 2;
  
  // Responsive orbital calculations - ensure planets never get cut off
  const minDimension = Math.min(actualWidth, actualHeight);
  const maxDimension = Math.max(actualWidth, actualHeight);
  
  // Dynamic margin based on container size (larger containers get proportionally larger margins)
  // Reduce margin for very small containers to ensure minimum orbit spacing
  const minMargin = 1; // Absolute minimum 1px
  const dynamicMargin = 2; // Absolute minimum 2px
  
  // Calculate available radius for orbits (from center to edge minus margin and Sun's radius)
  let availableRadius = (minDimension / 2) - dynamicMargin - SUN_RADIUS;
  
  // We need equal spacing between all orbits, including from Sun to Mercury
  // Total orbits = PLANETS.length, so we need PLANETS.length + 1 spacing segments
  // (Sun to Mercury, Mercury to Venus, Venus to Earth, etc.)
  const totalSpacingSegments = PLANETS.length + 1;
  
  // Make the rings fill the container: set spacing so the outermost ring is just inside the panel border
  // availableRadius is already (minDimension/2 - dynamicMargin - SUN_RADIUS)
  // We want: SUN_RADIUS + finalOrbitSpacing * PLANETS.length ~= (minDimension/2 - dynamicMargin)
  // => finalOrbitSpacing * PLANETS.length ~= availableRadius
  const fillFactor = 0.9; // 90% of the available radius to leave some margin
  const finalOrbitSpacing = Math.max((availableRadius * fillFactor) / PLANETS.length, 5); // ensure a reasonable minimum spacing
  
  // Calculate planet sizes based on container size
  const basePlanetSize = Math.max(minDimension * 0.008, 3); // 0.8% of min dimension, minimum 3px
  
  console.log('📏 Responsive orbital calculations:', { 
    width, 
    height: actualHeight,
    minDimension,
    maxDimension,
    minMargin: Math.round(minMargin),
    dynamicMargin: Math.round(dynamicMargin),
    availableRadius: Math.round(availableRadius),
    totalSpacingSegments,
    fillFactor,
    finalOrbitSpacing: Math.round(finalOrbitSpacing),
    outermostOrbitRadius: Math.round(finalOrbitSpacing * PLANETS.length),
    basePlanetSize: Math.round(basePlanetSize)
  });

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize star positions once (consistent across redraws)
  useEffect(() => {
    if (starPositions.length === 0) {
      const stars = [];
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * actualWidth,
          y: Math.random() * actualHeight,
          r: Math.random() * 1.5,
          opacity: 0.3 + Math.random() * 0.7
        });
      }
      setStarPositions(stars);
      console.log('✨ DEBUG: Initialized star positions', { count: stars.length });
    }
  }, [actualWidth, actualHeight, starPositions.length]);

  // Initialize planet positions
  useEffect(() => {
    console.log('🔍 DEBUG: Initializing planet positions');
    
    const positions = new Map<string, PlanetPosition>();
    
    // Get current date for real-world positioning
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st of this year
    const daysSinceStartOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('📅 DEBUG: Current date positioning:', { 
      currentDate: now.toDateString(),
      daysSinceStartOfYear,
      year: now.getFullYear()
    });
    
    // Set initial positions for all planets based on current date
    PLANETS.forEach((planet, index) => {
      // Convert orbital period from days to years for accurate calculation
      const orbitalPeriodInYears = planet.orbitalPeriod / 365.25;
      
      // Calculate angle based on orbital period and current day of year
      // This gives a realistic approximation of where planets are today
      const yearProgress = daysSinceStartOfYear / 365.25; // Fraction of year completed
      const orbitalPeriodsCompleted = yearProgress / orbitalPeriodInYears; // How many full orbits completed
      const angle = (orbitalPeriodsCompleted * 2 * Math.PI) % (2 * Math.PI); // Current angle in radians
      
      const orbitRadius = SUN_RADIUS + (finalOrbitSpacing * (index + 1)); // Use responsive spacing from Sun's edge
      const x = centerX + orbitRadius * Math.cos(angle);
      const y = centerY + orbitRadius * Math.sin(angle);
      positions.set(planet.id, { x, y });
      
      console.log(`🪐 DEBUG: ${planet.name} real-world position`, { 
        x: Math.round(x), 
        y: Math.round(y), 
        angle: Math.round(angle * 180 / Math.PI), // Convert to degrees for readability
        orbitRadius: Math.round(orbitRadius),
        orbitalPeriodDays: planet.orbitalPeriod,
        orbitalPeriodYears: orbitalPeriodInYears.toFixed(2),
        yearProgress: Math.round(yearProgress * 100),
        orbitalPeriodsCompleted: orbitalPeriodsCompleted.toFixed(2),
        orbitIndex: index + 1
      });
    });
    
    setPlanetPositions(positions);
  }, [centerX, centerY, finalOrbitSpacing]);

  // Animation loop - ONLY when isPlaying is true
  const animate = useCallback(() => {
    if (!isPlaying) {
      console.log('🛑 DEBUG: Animation stopped - isPlaying is false');
      return;
    }

    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000; // Convert to seconds
    
    // Convert elapsed time to years for accurate orbital calculation
    // There are 365.25 * 24 * 60 * 60 = 31,557,600 seconds in a year
    const elapsedYears = elapsed / 31557600;
    
    // Apply speed multiplier (1x = real-time, 10x = 10x faster, etc.)
    const scaledElapsedYears = elapsedYears * speedMultiplier;

    console.log('🔄 DEBUG: Animation frame', { 
      elapsedSeconds: elapsed, 
      elapsedYears: elapsedYears,
      scaledElapsedYears: scaledElapsedYears,
      speedMultiplier,
      isPlaying,
      planetCount: planetPositions.size 
    });

    const newPositions = new Map<string, PlanetPosition>();
    
    // Get current date for real-world positioning as starting point
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const daysSinceStartOfYear = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    const yearProgress = daysSinceStartOfYear / 365.25;
    
    PLANETS.forEach((planet, index) => {
      // Convert orbital period from days to years for accurate calculation
      const orbitalPeriodInYears = planet.orbitalPeriod / 365.25;
      
      // Calculate starting angle based on current date
      const orbitalPeriodsCompleted = yearProgress / orbitalPeriodInYears;
      const startAngle = (orbitalPeriodsCompleted * 2 * Math.PI) % (2 * Math.PI);
      
      // Calculate animation progress based on REAL orbital period
      // Add visual scaling to make movement visible while maintaining proportional accuracy
      const VISUAL_SCALE = 100000; // Makes movement 100,000x more visible for better user experience
      const animationProgress = (scaledElapsedYears * VISUAL_SCALE) / orbitalPeriodInYears;
      const animationAngle = animationProgress * 2 * Math.PI;
      const totalAngle = startAngle + animationAngle;
      
      const orbitRadius = SUN_RADIUS + (finalOrbitSpacing * (index + 1)); // Use responsive spacing from Sun's edge
      const x = centerX + orbitRadius * Math.cos(totalAngle);
      const y = centerY + orbitRadius * Math.sin(totalAngle);
      newPositions.set(planet.id, { x, y });
      
      console.log(`🪐 DEBUG: ${planet.name} animated position`, { 
        id: planet.id, 
        orbitalPeriodDays: planet.orbitalPeriod,
        orbitalPeriodYears: orbitalPeriodInYears.toFixed(2),
        animationProgress: animationProgress.toFixed(6),
        startAngle: Math.round(startAngle * 180 / Math.PI),
        animationAngle: Math.round(animationAngle * 180 / Math.PI),
        totalAngle: Math.round(totalAngle * 180 / Math.PI),
        orbitRadius: Math.round(orbitRadius),
        orbitIndex: index + 1,
        x: Math.round(x), 
        y: Math.round(y) 
      });
    });

    setPlanetPositions(newPositions);
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, speedMultiplier, centerX, centerY, finalOrbitSpacing]);

  // Start/stop animation based on isPlaying
  useEffect(() => {
    console.log('🔍 DEBUG: Animation control effect', { isPlaying });
    
    if (isPlaying) {
      startTimeRef.current = Date.now(); // Reset start time
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  // Render the solar system - COMPLETELY STATIC
  useEffect(() => {
    if (!svgRef.current) return;

    console.log('🔍 DEBUG: Rendering solar system', { isPlaying });

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    // Create main group
    const g = svg.append('g');

    // Draw static background
    g.append('rect')
      .attr('width', width)
      .attr('height', actualHeight)
      .attr('fill', '#000');

    // Draw static stars (using consistent positions)
    if (starPositions.length > 0) {
      starPositions.forEach(star => {
        g.append('circle')
          .attr('cx', star.x)
          .attr('cy', star.y)
          .attr('r', star.r)
          .attr('fill', 'white')
          .attr('opacity', star.opacity);
      });
    }

    // Draw sun - STATIC
    g.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', SUN_RADIUS)
      .attr('fill', '#FDB813')
      .attr('stroke', '#FFA000')
      .attr('stroke-width', 2);

    // Draw orbit paths - STATIC
    PLANETS.forEach((planet, index) => {
      // Calculate orbit radius with equal visual spacing, accounting for Sun's radius
      const orbitRadius = SUN_RADIUS + (finalOrbitSpacing * (index + 1)); // Start from Sun's edge + equal spacing
      g.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', orbitRadius)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.2)')
        .attr('stroke-width', 1);
    });

    // Draw planets - STATIC
    if (planetPositions.size > 0) {
      PLANETS.forEach(planet => {
        const position = planetPositions.get(planet.id);
        if (!position) return;

        const planetRadius = calculatePlanetRadius(planet, undefined, minDimension);
        
        // Planet circle
        g.append('circle')
          .attr('id', `planet-${planet.id}`)
          .attr('cx', position.x)
          .attr('cy', position.y)
          .attr('r', planetRadius)
          .attr('fill', planet.color)
          .attr('stroke', selectedPlanet?.id === planet.id ? '#fff' : 'none')
          .attr('stroke-width', selectedPlanet?.id === planet.id ? 2 : 0)
          .style('cursor', 'pointer')
          .on('click', () => onPlanetClick?.(planet));

        // Planet label
        g.append('text')
          .attr('id', `label-${planet.id}`)
          .attr('x', position.x)
          .attr('y', position.y + planetRadius + 15)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('font-weight', '500')
          .text(planet.name);
      });
    } else {
      console.log('🔍 DEBUG: Skipping planet drawing - positions not initialized yet');
    }

  }, [width, actualHeight, planetPositions, selectedPlanet, onPlanetClick, centerX, centerY]);

  // Redraw solar system when planet positions are initialized
  useEffect(() => {
    if (planetPositions.size > 0 && svgRef.current) {
      console.log('🔍 DEBUG: Planet positions initialized, redrawing solar system');
      
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear previous content
      
      // Recreate the entire solar system
      const g = svg.append('g');
      
      // Draw static background
      g.append('rect')
        .attr('width', width)
        .attr('height', actualHeight)
        .attr('fill', '#000');
        
      // Draw static stars (using consistent positions)
      starPositions.forEach(star => {
        g.append('circle')
          .attr('cx', star.x)
          .attr('cy', star.y)
          .attr('r', star.r)
          .attr('fill', 'white')
          .attr('opacity', star.opacity);
      });
      
      // Draw sun
      g.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', SUN_RADIUS)
        .attr('fill', '#FDB813')
        .attr('stroke', '#FFA000')
        .attr('stroke-width', 2);
        
      // Draw orbit paths
      PLANETS.forEach((planet, index) => {
        // Calculate orbit radius with equal visual spacing, accounting for Sun's radius
        const orbitRadius = SUN_RADIUS + (finalOrbitSpacing * (index + 1)); // Start from Sun's edge + equal spacing
        g.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', orbitRadius)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(255, 255, 255, 0.2)')
          .attr('stroke-width', 1);
      });
      
      // Draw planets
      PLANETS.forEach(planet => {
        const position = planetPositions.get(planet.id);
        if (!position) return;

        const planetRadius = calculatePlanetRadius(planet, undefined, minDimension);
        
        // Planet circle
        g.append('circle')
          .attr('id', `planet-${planet.id}`)
          .attr('cx', position.x)
          .attr('cy', position.y)
          .attr('r', planetRadius)
          .attr('fill', planet.color)
          .attr('stroke', selectedPlanet?.id === planet.id ? '#fff' : 'none')
          .attr('stroke-width', selectedPlanet?.id === planet.id ? 2 : 0)
          .style('cursor', 'pointer')
          .on('click', () => onPlanetClick?.(planet));

        // Planet label
        g.append('text')
          .attr('id', `label-${planet.id}`)
          .attr('x', position.x)
          .attr('y', position.y + planetRadius + 15)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .attr('font-weight', '500')
          .text(planet.name);
      });
    }
  }, [planetPositions, width, actualHeight, selectedPlanet, onPlanetClick, centerX, centerY]);

  // Update planet positions in D3 SVG when planetPositions changes
  useEffect(() => {
    if (!svgRef.current) return;

    console.log('🔍 DEBUG: Updating planet positions in SVG', { 
      planetPositions: planetPositions.size,
      isPlaying
    });

    const svg = d3.select(svgRef.current);

    // Update planet positions
    PLANETS.forEach(planet => {
      const position = planetPositions.get(planet.id);
      if (!position) {
        console.log(`⚠️ DEBUG: No position found for planet ${planet.name}`);
        return;
      }

      // Update planet circle position
      const planetElement = svg.select(`#planet-${planet.id}`);
      if (planetElement.empty()) {
        console.log(`⚠️ DEBUG: Planet element #planet-${planet.id} not found`);
      } else {
        planetElement
          .attr('cx', position.x)
          .attr('cy', position.y);
        console.log(`✅ DEBUG: Updated ${planet.name} position to`, { 
          x: Math.round(position.x), 
          y: Math.round(position.y) 
        });
      }

      // Update planet label position
      const planetRadius = calculatePlanetRadius(planet, undefined, minDimension);
      const labelElement = svg.select(`#label-${planet.id}`);
      if (labelElement.empty()) {
        console.log(`⚠️ DEBUG: Label element #label-${planet.id} not found`);
      } else {
        labelElement
          .attr('x', position.x)
          .attr('y', position.y + planetRadius + 15);
      }
    });
  }, [planetPositions]);


  return (
    <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full rounded-2xl"
        viewBox={`0 0 ${actualWidth} ${actualHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          background: '#000'
        }}
      />
    </div>
  );
}
