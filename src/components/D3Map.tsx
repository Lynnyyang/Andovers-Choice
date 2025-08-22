import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { HouseSample } from '@/types';

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

    // Generate house positions
    const generateHousePositions = (isNear: boolean, count: number) => {
      const positions = [];
      const minDistance = isNear ? 60 : circleRadius + 40;
      const maxDistance = isNear ? circleRadius - 30 : Math.min(width, height) * 0.45;
      
      for (let i = 0; i < count; i++) {
        let x, y, distance;
        let attempts = 0;
        do {
          const angle = Math.random() * 2 * Math.PI;
          distance = minDistance + Math.random() * (maxDistance - minDistance);
          x = centerX + distance * Math.cos(angle);
          y = centerY + distance * Math.sin(angle);
          attempts++;
        } while ((x < 30 || x > width - 30 || y < 30 || y > height - 30) && attempts < 50);
        
        positions.push({ x, y, id: i });
      }
      return positions;
    };

    // Generate houses in both regions
    const nearHousePositions = generateHousePositions(true, 8);
    const farHousePositions = generateHousePositions(false, 12);

    // Draw near houses (red, affected by incinerator)
    const nearHouses = svg.selectAll('.near-house')
      .data(nearHousePositions)
      .enter()
      .append('g')
      .attr('class', 'near-house')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', budget >= sampleCost ? 'pointer' : 'not-allowed')
      .on('click', function(event, d) {
        if (budget >= sampleCost) {
          onHouseClick('near');
          // Visual feedback
          d3.select(this)
            .transition()
            .duration(300)
            .attr('transform', `translate(${d.x}, ${d.y}) scale(1.2)`)
            .transition()
            .duration(300)
            .attr('transform', `translate(${d.x}, ${d.y}) scale(1)`);
        }
      });

    // Near house shapes
    nearHouses.append('polygon')
      .attr('points', '-8,-12 0,-20 8,-12 8,8 -8,8')
      .attr('fill', selectedRegion === 'near' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1);

    // Near house windows
    nearHouses.append('rect')
      .attr('x', -4)
      .attr('y', -4)
      .attr('width', 3)
      .attr('height', 3)
      .attr('fill', 'hsl(var(--background))');

    nearHouses.append('rect')
      .attr('x', 1)
      .attr('y', -4)
      .attr('width', 3)
      .attr('height', 3)
      .attr('fill', 'hsl(var(--background))');

    // Draw far houses (green, control group)
    const farHouses = svg.selectAll('.far-house')
      .data(farHousePositions)
      .enter()
      .append('g')
      .attr('class', 'far-house')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', budget >= sampleCost ? 'pointer' : 'not-allowed')
      .on('click', function(event, d) {
        if (budget >= sampleCost) {
          onHouseClick('far');
          // Visual feedback
          d3.select(this)
            .transition()
            .duration(300)
            .attr('transform', `translate(${d.x}, ${d.y}) scale(1.2)`)
            .transition()
            .duration(300)
            .attr('transform', `translate(${d.x}, ${d.y}) scale(1)`);
        }
      });

    // Far house shapes
    farHouses.append('polygon')
      .attr('points', '-8,-12 0,-20 8,-12 8,8 -8,8')
      .attr('fill', selectedRegion === 'far' ? 'hsl(var(--primary))' : 'hsl(var(--accent))')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1);

    // Far house windows
    farHouses.append('rect')
      .attr('x', -4)
      .attr('y', -4)
      .attr('width', 3)
      .attr('height', 3)
      .attr('fill', 'hsl(var(--background))');

    farHouses.append('rect')
      .attr('x', 1)
      .attr('y', -4)
      .attr('width', 3)
      .attr('height', 3)
      .attr('fill', 'hsl(var(--background))');

    // Add collected samples indicators
    const allSamples = [...nearSamples, ...farSamples];
    svg.selectAll('.sample-dot')
      .data(allSamples)
      .enter()
      .append('circle')
      .attr('class', 'sample-dot')
      .attr('cx', () => centerX + (Math.random() - 0.5) * circleRadius * 2)
      .attr('cy', () => centerY + (Math.random() - 0.5) * circleRadius * 2)
      .attr('r', 2)
      .attr('fill', 'hsl(var(--primary))')
      .style('opacity', 0)
      .transition()
      .delay((d, i) => i * 100)
      .duration(500)
      .style('opacity', 1);

    // Add labels
    svg.append('text')
      .attr('x', centerX)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('北安德沃镇地图');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 160}, 40)`);

    legend.append('polygon')
      .attr('points', '-8,-12 0,-20 8,-12 8,8 -8,8')
      .attr('fill', 'hsl(var(--destructive))')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1);

    legend.append('text')
      .attr('x', 15)
      .attr('y', -2)
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', '12px')
      .text('处理组 (受影响)');

    legend.append('polygon')
      .attr('transform', 'translate(0, 25)')
      .attr('points', '-8,-12 0,-20 8,-12 8,8 -8,8')
      .attr('fill', 'hsl(var(--accent))')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 1);

    legend.append('text')
      .attr('x', 15)
      .attr('y', 23)
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', '12px')
      .text('对照组 (未受影响)');

    // Sample counts
    legend.append('text')
      .attr('x', 0)
      .attr('y', 60)
      .attr('fill', 'hsl(var(--muted-foreground))')
      .attr('font-size', '10px')
      .text(`处理组样本: ${nearSamples.length}`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 75)
      .attr('fill', 'hsl(var(--muted-foreground))')
      .attr('font-size', '10px')
      .text(`对照组样本: ${farSamples.length}`);

  }, [width, height, budget, sampleCost, nearSamples.length, farSamples.length, selectedRegion]);

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