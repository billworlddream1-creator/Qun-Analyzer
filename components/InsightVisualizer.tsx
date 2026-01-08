
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Insight {
  type: string;
  title: string;
  description: string;
  confidence: number;
}

interface Props {
  insights: Insight[];
}

const InsightVisualizer: React.FC<Props> = ({ insights }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!insights || insights.length === 0 || !svgRef.current || !containerRef.current) return;

    // Dimensions
    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const height = 350;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const radius = Math.min(width / 2, height / 2) - margin.top;

    // Clear previous
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Main Group
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Data processing
    // If fewer than 3 points, radar charts look weird (lines/triangles). 
    // We duplicate points if needed or handle it, but for now let's assume > 3 or render slightly differently.
    // To ensure a closed shape that looks good, if < 3, we might want to use a bar chart, but let's force a radar shape
    // by spacing them out on a circle anyway.
    
    const data = insights.slice(0, 8); // Limit to 8 for visual clarity
    const total = data.length;
    const angleSlice = (Math.PI * 2) / total;

    // Scales
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, 1]); // Confidence is 0-1

    // 1. Draw the Circular Grid (Web)
    const levels = 4;
    const levelWrapper = g.append("g").attr("class", "levelWrapper");

    for (let j = 0; j < levels; j++) {
      const levelFactor = radius * ((j + 1) / levels);
      
      levelWrapper.selectAll(".level")
        .data(d3.range(1, total + 1).map(i => {
          return {
            x: levelFactor * Math.cos(angleSlice * i - Math.PI / 2),
            y: levelFactor * Math.sin(angleSlice * i - Math.PI / 2)
          };
        }))
        .enter()
        .append("line")
        .attr("x1", (d, i) => { 
            const prevIndex = i === 0 ? total - 1 : i - 1;
            return levelFactor * Math.cos(angleSlice * prevIndex - Math.PI / 2);
        })
        .attr("y1", (d, i) => {
            const prevIndex = i === 0 ? total - 1 : i - 1;
            return levelFactor * Math.sin(angleSlice * prevIndex - Math.PI / 2);
        })
        .attr("x2", d => d.x)
        .attr("y2", d => d.y)
        .attr("class", "line")
        .style("stroke", "#334155") // slate-700
        .style("stroke-opacity", "0.5")
        .style("stroke-width", "1px");
    }

    // 2. Draw Axes
    const axisGrid = g.append("g").attr("class", "axisWrapper");

    const axes = axisGrid.selectAll(".axis")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "axis");

    axes.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("class", "line")
      .style("stroke", "#475569") // slate-600
      .style("stroke-width", "1px");

    // Labels
    axes.append("text")
      .attr("class", "legend")
      .style("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => rScale(1.25) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => rScale(1.25) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d.type.length > 10 ? d.type.substring(0, 10) + '...' : d.type)
      .style("fill", "#94a3b8") // slate-400
      .style("font-family", "Orbitron");

    // 3. Draw the Blob (Radar Area)
    const radarLine = d3.lineRadial<Insight>()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.confidence))
      .angle((d, i) => i * angleSlice);

    // Create a glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const blobWrapper = g.append("g").attr("class", "blobWrapper");

    // Background Area
    blobWrapper
      .append("path")
      .attr("class", "radarArea")
      .attr("d", radarLine(data) || "")
      .style("fill", "rgba(139, 92, 246, 0.35)") // violet-500 alpha
      .style("fill-opacity", 0.5)
      .style("filter", "url(#glow)");

    // Stroke
    blobWrapper
      .append("path")
      .attr("class", "radarStroke")
      .attr("d", radarLine(data) || "")
      .style("stroke-width", "2px")
      .style("stroke", "#8b5cf6") // violet-500
      .style("fill", "none")
      .style("filter", "url(#glow)");

    // 4. Draw Circles at vertices
    blobWrapper.selectAll(".radarCircle")
      .data(data)
      .enter().append("circle")
      .attr("class", "radarCircle")
      .attr("r", 4)
      .attr("cx", (d, i) => rScale(d.confidence) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(d.confidence) * Math.sin(angleSlice * i - Math.PI / 2))
      .style("fill", "#06b6d4") // cyan-500
      .style("fill-opacity", 0.9)
      .style("stroke", "#fff")
      .style("stroke-width", 1);
    
    // Add interactions
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(15, 23, 42, 0.9)")
      .style("border", "1px solid rgba(139, 92, 246, 0.5)")
      .style("padding", "8px")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("color", "#f8fafc")
      .style("z-index", "10");

    blobWrapper.selectAll(".radarCircle")
      .on("mouseover", function(event, d: any) {
        d3.select(this).transition().duration(200).attr("r", 7);
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`
          <strong style="color: #a78bfa">${d.type}</strong><br/>
          Confidence: ${Math.round(d.confidence * 100)}%
        `)
        .style("left", (event.pageX - containerRef.current!.getBoundingClientRect().left + 10) + "px")
        .style("top", (event.pageY - containerRef.current!.getBoundingClientRect().top - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).transition().duration(200).attr("r", 4);
        tooltip.transition().duration(200).style("opacity", 0);
      });

  }, [insights]);

  return (
    <div ref={containerRef} className="relative w-full flex justify-center items-center py-4 bg-slate-900/30 rounded-xl border border-slate-800">
      <svg ref={svgRef} className="overflow-visible" />
      <div className="absolute top-4 left-4 text-xs font-mono text-slate-500">
        VISUAL_MODE: RADAR_CONFIDENCE
      </div>
    </div>
  );
};

export default InsightVisualizer;
