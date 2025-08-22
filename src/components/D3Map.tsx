import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { HouseSample } from '@/types';

interface HousePosition {
  x: number;
  y: number;
  id: string;
  region: 'near' | 'far';
  isSelected: boolean;
}

interface D3MapProps {
  width: number;
  height: number;
  budget: number;
  sampleCost: number;
  nearSamples: HouseSample[];
  farSamples: HouseSample[];
  onHouseClick: (region: 'near' | 'far') => void;
  selectedRegion: 'near' | 'far' | null;
}

export const D3Map: React.FC<D3MapProps> = ({
  width,
  height,
  budget,
  sampleCost,
  nearSamples,
  farSamples,
  onHouseClick,
  selectedRegion
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedHouses, setSelectedHouses] = useState<Set<string>>(new Set());

  // Generate stable house positions using useMemo
  const housePositions = useMemo(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const circleRadius = Math.min(width, height) * 0.3;

    const generateHousePositions = (isNear: boolean, count: number) => {
      const positions: HousePosition[] = [];
      const minDistance = isNear ? 40 : circleRadius + 30;
      const maxDistance = isNear ? circleRadius - 20 : Math.min(width, height) * 0.45;
      const houseSize = 12; // Smaller houses to avoid overlap
      
      for (let i = 0; i < count; i++) {
        let x, y, distance;
        let attempts = 0;
        let validPosition = false;
        
        do {
          const angle = Math.random() * 2 * Math.PI;
          distance = minDistance + Math.random() * (maxDistance - minDistance);
          x = centerX + distance * Math.cos(angle);
          y = centerY + distance * Math.sin(angle);
          
          // Check if position is within bounds
          const withinBounds = x > houseSize + 10 && x < width - houseSize - 10 && 
                              y > houseSize + 20 && y < height - houseSize - 10;
          
          // Check distance from other houses to avoid overlap
          const minDistanceFromOthers = positions.every(pos => {
            const dx = x - pos.x;
            const dy = y - pos.y;
            return Math.sqrt(dx * dx + dy * dy) > houseSize * 2;
          });
          
          validPosition = withinBounds && minDistanceFromOthers;
          attempts++;
        } while (!validPosition && attempts < 100);
        
        if (validPosition) {
          positions.push({ 
            x, 
            y, 
            id: `${isNear ? 'near' : 'far'}-${i}`, 
            region: isNear ? 'near' : 'far',
            isSelected: false
          });
        }
      }
      return positions;
    };

    return [
      ...generateHousePositions(true, 15),  // 15 near houses
      ...generateHousePositions(false, 25)  // 25 far houses
    ];
  }, [width, height]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Map dimensions
    const centerX = width / 2;
    const centerY = height / 2;
    const circleRadius = Math.min(width, height) * 0.3;

    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'hsl(var(--background))')
      .attr('rx', 8);

    // Incinerator circle (dashed)
    svg.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', circleRadius)
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--muted-foreground))')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '10,5')
      .attr('opacity', 0.6);

    // Incinerator building
    const incineratorGroup = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Main building
    incineratorGroup.append('rect')
      .attr('x', -25)
      .attr('y', -30)
      .attr('width', 50)
      .attr('height', 40)
      .attr('fill', 'hsl(var(--muted))');

    // Chimney
    incineratorGroup.append('rect')
      .attr('x', 15)
      .attr('y', -50)
      .attr('width', 8)
      .attr('height', 30)
      .attr('fill', 'hsl(var(--muted-foreground))');

    // Smoke
    const smokeData = [
      { x: 19, y: -55, r: 3 },
      { x: 16, y: -65, r: 4 },
      { x: 22, y: -70, r: 5 },
      { x: 18, y: -80, r: 4 }
    ];

    incineratorGroup.selectAll('.smoke')
      .data(smokeData)
      .enter()
      .append('circle')
      .attr('class', 'smoke')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .attr('fill', 'hsl(var(--muted-foreground))')
      .attr('opacity', 0.6);

    // Fire at bottom
    incineratorGroup.append('ellipse')
      .attr('cx', 0)
      .attr('cy', -5)
      .attr('rx', 8)
      .attr('ry', 5)
      .attr('fill', 'hsl(var(--destructive))');

    // Handle house click
    const handleHouseClick = (house: HousePosition) => {
      if (budget >= sampleCost) {
        setSelectedHouses(prev => new Set([...prev, house.id]));
        onHouseClick(house.region);
      }
    };

    // Draw all houses
    const allHouses = svg.selectAll('.house')
      .data(housePositions)
      .enter()
      .append('g')
      .attr('class', 'house')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', budget >= sampleCost ? 'pointer' : 'not-allowed')
      .on('click', function(event, d) {
        if (budget >= sampleCost && !selectedHouses.has(d.id)) {
          handleHouseClick(d);
          // Visual feedback for this house only
          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', `translate(${d.x}, ${d.y}) scale(1.3)`)
            .transition()
            .duration(200)
            .attr('transform', `translate(${d.x}, ${d.y}) scale(1)`);
        }
      });

    // House shapes (smaller size)
    allHouses.append('polygon')
      .attr('points', '-5,-8 0,-12 5,-8 5,5 -5,5')
      .attr('fill', d => {
        if (selectedHouses.has(d.id)) return 'hsl(var(--primary))';
        return d.region === 'near' ? 'hsl(var(--destructive))' : 'hsl(var(--accent))';
      })
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1);

    // House windows (smaller)
    allHouses.append('rect')
      .attr('x', -2.5)
      .attr('y', -2)
      .attr('width', 2)
      .attr('height', 2)
      .attr('fill', 'hsl(var(--background))');

    allHouses.append('rect')
      .attr('x', 0.5)
      .attr('y', -2)
      .attr('width', 2)
      .attr('height', 2)
      .attr('fill', 'hsl(var(--background))');

    // House door (smaller)
    allHouses.append('rect')
      .attr('x', -1)
      .attr('y', 1)
      .attr('width', 2)
      .attr('height', 3)
      .attr('fill', 'hsl(var(--background))');

    // Show collected samples count as overlay
    if (nearSamples.length > 0 || farSamples.length > 0) {
      svg.append('text')
        .attr('x', 20)
        .attr('y', height - 60)
        .attr('fill', 'hsl(var(--primary))')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(`已收集样本: ${nearSamples.length + farSamples.length}`);
      
      svg.append('text')
        .attr('x', 20)
        .attr('y', height - 45)
        .attr('fill', 'hsl(var(--destructive))')
        .attr('font-size', '10px')
        .text(`处理组: ${nearSamples.length}`);
      
      svg.append('text')
        .attr('x', 20)
        .attr('y', height - 30)
        .attr('fill', 'hsl(var(--accent))')
        .attr('font-size', '10px')
        .text(`对照组: ${farSamples.length}`);
    }

    // Add labels
    svg.append('text')
      .attr('x', centerX)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('北安德沃镇地图');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 140}, 30)`);

    legend.append('polygon')
      .attr('points', '-5,-8 0,-12 5,-8 5,5 -5,5')
      .attr('fill', 'hsl(var(--destructive))')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1);

    legend.append('text')
      .attr('x', 12)
      .attr('y', 0)
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', '11px')
      .text('处理组 (15栋)');

    legend.append('polygon')
      .attr('transform', 'translate(0, 20)')
      .attr('points', '-5,-8 0,-12 5,-8 5,5 -5,5')
      .attr('fill', 'hsl(var(--accent))')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1);

    legend.append('text')
      .attr('x', 12)
      .attr('y', 20)
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', '11px')
      .text('对照组 (25栋)');

    legend.append('polygon')
      .attr('transform', 'translate(0, 40)')
      .attr('points', '-5,-8 0,-12 5,-8 5,5 -5,5')
      .attr('fill', 'hsl(var(--primary))')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1);

    legend.append('text')
      .attr('x', 12)
      .attr('y', 40)
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', '11px')
      .text('已收集');

    // Instructions
    svg.append('text')
      .attr('x', centerX)
      .attr('y', height - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'hsl(var(--muted-foreground))')
      .attr('font-size', '11px')
      .text('点击房屋收集数据 • 每次收集消耗 $100');

  }, [width, height, budget, sampleCost, nearSamples.length, farSamples.length, selectedRegion, housePositions, selectedHouses]);

  return (
    <div className="w-full flex justify-center">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-border rounded-lg"
      />
    </div>
  );
};