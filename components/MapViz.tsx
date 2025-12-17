import React, { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ANCHORS, HotelResult, LocationPoint } from '../types';

interface MapVizProps {
  hotels: HotelResult[];
  selectedHotelId: string | null;
  onSelectHotel: (id: string) => void;
}

const MapViz: React.FC<MapVizProps> = ({ hotels, selectedHotelId, onSelectHotel }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine all points to calculate bounding box
  const allPoints = useMemo(() => {
    const points: Array<{ lat: number; lng: number }> = [
      ...ANCHORS.map(a => a.coords),
      ...hotels.map(h => h.coords)
    ];
    return points;
  }, [hotels]);

  // Dimensions
  const width = 800;
  const height = 600;
  const margin = 50;

  useEffect(() => {
    if (!svgRef.current || allPoints.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    // 1. Calculate Scales
    const minLat = d3.min(allPoints, d => d.lat) || 0;
    const maxLat = d3.max(allPoints, d => d.lat) || 0;
    const minLng = d3.min(allPoints, d => d.lng) || 0;
    const maxLng = d3.max(allPoints, d => d.lng) || 0;

    // Add padding to the bounds
    const latBuffer = (maxLat - minLat) * 0.1;
    const lngBuffer = (maxLng - minLng) * 0.1;

    // Longitude maps to X, Latitude maps to Y (inverted because SVG Y grows downwards)
    const xScale = d3.scaleLinear()
      .domain([minLng - lngBuffer, maxLng + lngBuffer])
      .range([margin, width - margin]);

    const yScale = d3.scaleLinear()
      .domain([minLat - latBuffer, maxLat + latBuffer])
      .range([height - margin, margin]); // Inverted range for correct geo mapping

    // 2. Draw Connections (Spokes) for Selected Hotel
    if (selectedHotelId) {
      const selectedHotel = hotels.find(h => h.id === selectedHotelId);
      if (selectedHotel) {
        ANCHORS.forEach(anchor => {
          // Draw Line
          svg.append("line")
            .attr("x1", xScale(selectedHotel.coords.lng))
            .attr("y1", yScale(selectedHotel.coords.lat))
            .attr("x2", xScale(anchor.coords.lng))
            .attr("y2", yScale(anchor.coords.lat))
            .attr("stroke", anchor.color || "#64748b")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.6)
            .attr("stroke-dasharray", "5,5");

          // Animate a "packet" traveling
          const path = svg.append("path")
            .attr("d", d3.line()([
              [xScale(selectedHotel.coords.lng), yScale(selectedHotel.coords.lat)],
              [xScale(anchor.coords.lng), yScale(anchor.coords.lat)]
            ]))
            .attr("stroke", "transparent")
            .attr("fill", "none");

          const circle = svg.append("circle")
            .attr("r", 4)
            .attr("fill", anchor.color || "#fff");

          // Infinite animation
          function repeat() {
            circle.transition()
              .duration(2000)
              .ease(d3.easeLinear)
              .attrTween("transform", function() {
                 // @ts-ignore - D3 Types tricky here, but standard pattern
                 const l = path.node().getTotalLength(); 
                 return function(t: number) {
                   const p = path.node().getPointAtLength(t * l);
                   return `translate(${p.x},${p.y})`;
                 };
              })
              .on("end", repeat);
          }
          repeat();
        });
      }
    }

    // 3. Draw Anchors (Fixed Points)
    ANCHORS.forEach(anchor => {
      const g = svg.append("g")
        .attr("transform", `translate(${xScale(anchor.coords.lng)},${yScale(anchor.coords.lat)})`);
      
      // Halo
      g.append("circle")
        .attr("r", 15)
        .attr("fill", anchor.color)
        .attr("fill-opacity", 0.2);
      
      // Core
      g.append("circle")
        .attr("r", 6)
        .attr("fill", anchor.color)
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 2);

      // Label
      g.append("text")
        .text(anchor.name)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", anchor.color)
        .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.8)");
    });

    // 4. Draw Hotels
    hotels.forEach(hotel => {
      const isSelected = hotel.id === selectedHotelId;
      const g = svg.append("g")
        .attr("transform", `translate(${xScale(hotel.coords.lng)},${yScale(hotel.coords.lat)})`)
        .style("cursor", "pointer")
        .on("click", () => onSelectHotel(hotel.id));

      if (isSelected) {
        g.append("circle")
          .attr("r", 20)
          .attr("fill", "#fff")
          .attr("fill-opacity", 0.1)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,2");
      }

      g.append("circle")
        .attr("r", isSelected ? 8 : 5)
        .attr("fill", isSelected ? "#fff" : "#94a3b8")
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 2)
        .transition()
        .duration(300)
        .attr("r", isSelected ? 8 : 5);

      if (isSelected) {
        g.append("text")
          .text(hotel.name)
          .attr("y", 25)
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .attr("fill", "#fff")
          .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.8)");
      }
    });

  }, [allPoints, hotels, selectedHotelId]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interactive Map</h3>
            <p className="text-xs text-slate-500">Visualization of relative distances</p>
        </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      />
    </div>
  );
};

export default MapViz;