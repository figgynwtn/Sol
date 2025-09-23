'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Planet, PLANETS, SUN_RADIUS } from '@/data/planets';
import { calculatePlanetRadius } from '@/lib/orbital-mechanics';

interface SolarSystemVisualizationProps {
  width?: number;
  height?: number;
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
  width = 900,
  height = 700,
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
  
  // Center of the solar system
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Create equal orbital spacing for visual clarity
  const availableRadius = Math.min(width, height) / 2 - 80; // Leave 80px margin
  const orbitSpacing = (availableRadius / PLANETS.length) * 1.5; // Equal spacing with 1.5x multiplier
  
  console.log('📏 DEBUG: Equal orbital spacing', { 
    availableRadius, 
    orbitSpacing: orbitSpacing.toFixed(2),
    planetCount: PLANETS.length,
    svgSize: { width, height }
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
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.5,
          opacity: 0.3 + Math.random() * 0.7
        });
      }
      setStarPositions(stars);
      console.log('✨ DEBUG: Initialized star positions', { count: stars.length });
    }
  }, [width, height, starPositions.length]);

  // Initialize planet positions
  useEffect(() => {
    console.log('🔍 DEBUG: Initializing planet positions');
    
    const positions = new Map<string, PlanetPosition>();
    
    // Set initial positions for all planets
    PLANETS.forEach((planet, index) => {
      const angle = 0; // Starting angle
      const orbitRadius = orbitSpacing * (index + 1); // Equal spacing, starting from orbitSpacing
      const x = centerX + orbitRadius * Math.cos(angle);
      const y = centerY + orbitRadius * Math.sin(angle);
      positions.set(planet.id, { x, y });
      
      console.log(`🪐 DEBUG: ${planet.name} initial position`, { 
        x: Math.round(x), 
        y: Math.round(y), 
        angle, 
        orbitRadius: Math.round(orbitRadius),
        orbitIndex: index + 1
      });
    });
    
    setPlanetPositions(positions);
  }, [centerX, centerY]);

  // Animation loop - ONLY when isPlaying is true
  const animate = useCallback(() => {
    if (!isPlaying) {
      console.log('🛑 DEBUG: Animation stopped - isPlaying is false');
      return;
    }

    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000; // Convert to seconds
    const scaledElapsed = elapsed * (speedMultiplier / 1000);

    console.log('🔄 DEBUG: Animation frame', { 
      elapsed, 
      scaledElapsed, 
      isPlaying,
      planetCount: planetPositions.size 
    });

    const newPositions = new Map<string, PlanetPosition>();
    
    // Visual scaling factor for orbital periods (makes planets move faster for better visualization)
    const VISUAL_ORBITAL_SCALE = 0.01; // Scale down orbital periods by 99%
    
    PLANETS.forEach((planet, index) => {
      const visualOrbitalPeriod = planet.orbitalPeriod * VISUAL_ORBITAL_SCALE;
      const angle = (scaledElapsed / visualOrbitalPeriod) * 2 * Math.PI;
      const orbitRadius = orbitSpacing * (index + 1); // Equal spacing
      const x = centerX + orbitRadius * Math.cos(angle);
      const y = centerY + orbitRadius * Math.sin(angle);
      newPositions.set(planet.id, { x, y });
      
      console.log(`🪐 DEBUG: ${planet.name} position`, { 
        id: planet.id, 
        orbitalPeriod: planet.orbitalPeriod,
        visualOrbitalPeriod: visualOrbitalPeriod,
        angle: angle.toFixed(3), 
        orbitRadius: Math.round(orbitRadius),
        orbitIndex: index + 1,
        x: Math.round(x), 
        y: Math.round(y) 
      });
    });

    setPlanetPositions(newPositions);
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, speedMultiplier, centerX, centerY, orbitSpacing]);

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
      .attr('height', height)
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
      const orbitRadius = orbitSpacing * (index + 1); // Equal spacing
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

        const planetRadius = calculatePlanetRadius(planet);
        
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

  }, [width, height, planetPositions, selectedPlanet, onPlanetClick, centerX, centerY]);

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
        .attr('height', height)
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
        const orbitRadius = orbitSpacing * (index + 1); // Equal spacing
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

        const planetRadius = calculatePlanetRadius(planet);
        
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
  }, [planetPositions, width, height, selectedPlanet, onPlanetClick, centerX, centerY]);

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
      const planetRadius = calculatePlanetRadius(planet);
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
    <div className="w-full h-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ 
          background: '#000',
          border: '1px solid #333'
        }}
      />
    </div>
  );
}
