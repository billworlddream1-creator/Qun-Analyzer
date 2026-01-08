
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

type VisMode = 'particles' | 'force' | 'heatmap';

const QuantumVisualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<VisMode>('particles');

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 300;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll("*").remove();

    // Create a main group for zoom/pan
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Initial transform
    svg.call(zoom.transform, d3.zoomIdentity);

    let cleanup = () => {};

    if (mode === 'particles') {
      const particles = d3.range(60).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? '#8b5cf6' : '#06b6d4'
      }));

      const render = () => {
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -100 || p.x > width + 100) p.vx *= -1;
          if (p.y < -100 || p.y > height + 100) p.vy *= -1;
        });

        const circles = g.selectAll<SVGCircleElement, any>("circle").data(particles);
        circles.enter()
          .append("circle")
          .merge(circles)
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", d => d.size)
          .attr("fill", d => d.color)
          .attr("opacity", 0.6)
          .style("filter", "blur(0.5px)");

        const connections: any[] = [];
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 70) {
              connections.push({ source: particles[i], target: particles[j], opacity: (1 - dist/70) * 0.4 });
            }
          }
        }

        const lines = g.selectAll<SVGLineElement, any>("line").data(connections);
        lines.enter().append("line")
          .merge(lines)
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)
          .attr("stroke", "#475569")
          .attr("stroke-width", 0.5)
          .attr("opacity", d => d.opacity);
        lines.exit().remove();
      };

      const timer = d3.timer(render);
      cleanup = () => timer.stop();

    } else if (mode === 'force') {
      const nodes = d3.range(30).map(i => ({ id: i, group: Math.floor(i/10) }));
      const links = d3.range(45).map(() => ({
        source: Math.floor(Math.random() * 30),
        target: Math.floor(Math.random() * 30),
        value: Math.random()
      }));

      const simulation = d3.forceSimulation<any>(nodes)
        .force("link", d3.forceLink<any, any>(links).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-80))
        .force("center", d3.forceCenter(width / 2, height / 2));

      const link = g.append("g")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#475569")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", d => Math.sqrt(d.value) * 2);

      const node = g.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", d => d.group === 0 ? "#8b5cf6" : d.group === 1 ? "#06b6d4" : "#f43f5e")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .call(d3.drag<SVGCircleElement, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
        );

      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });

      cleanup = () => simulation.stop();

    } else if (mode === 'heatmap') {
      const densityData = d3.range(200).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height
      }));

      const density = d3.contourDensity<any>()
        .x(d => d.x)
        .y(d => d.y)
        .size([width, height])
        .bandwidth(30)
        (densityData);

      const color = d3.scaleSequential(d3.interpolateCool)
        .domain([0, d3.max(density, d => d.value) || 0]);

      g.selectAll("path")
        .data(density)
        .enter().append("path")
        .attr("d", d3.geoPath())
        .attr("fill", d => color(d.value))
        .attr("opacity", 0.3)
        .attr("stroke", "none");

      // Add "sparks" for flavor
      const sparks = g.selectAll("circle").data(densityData.slice(0, 40));
      sparks.enter().append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 1.5)
        .attr("fill", "#fff")
        .attr("opacity", 0.4);
    }

    return cleanup;
  }, [mode]);

  return (
    <div ref={containerRef} className="relative w-full h-[300px] overflow-hidden rounded-2xl glass border border-slate-800 transition-all duration-500">
      <svg ref={svgRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-sm font-orbitron font-semibold text-slate-300">
          {mode === 'particles' ? 'QUANTUM FIELD MAPPING' : mode === 'force' ? 'ENTANGLEMENT GRAPH' : 'PROBABILITY DENSITY'}
        </h3>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
          {mode === 'particles' ? 'STOCHASTIC_SYNC_ACTIVE' : mode === 'force' ? 'NON_LOCAL_CORRELATION' : 'SUPERPOSITION_STATE_ESTIMATION'}
        </p>
      </div>

      <div className="absolute top-4 right-4 z-20 flex bg-slate-900/80 rounded-lg p-1 border border-slate-700">
        <button 
          onClick={() => setMode('particles')}
          className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${mode === 'particles' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          FIELD
        </button>
        <button 
          onClick={() => setMode('force')}
          className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${mode === 'force' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          GRAPH
        </button>
        <button 
          onClick={() => setMode('heatmap')}
          className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${mode === 'heatmap' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          DENSITY
        </button>
      </div>

      <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 font-mono italic">
        Scroll to zoom • Drag to pan
      </div>
      
      <div className="absolute bottom-4 right-4 text-right">
        <span className="text-xs font-mono text-cyan-400 opacity-80">STOCHASTIC_SYNC_OK</span>
      </div>
    </div>
  );
};

export default QuantumVisualizer;
