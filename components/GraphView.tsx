import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DataModel, GraphNode, GraphLink } from '../types';
import { Download } from 'lucide-react';

interface GraphViewProps {
  data: DataModel;
  onSelect: (item: GraphNode | GraphLink | null) => void;
  selectedId: string | null;
}

const GraphView: React.FC<GraphViewProps> = ({ data, onSelect, selectedId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !dimensions.width) return;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "100%")
      // Add white background for export visibility
      .style("background-color", "#f8fafc"); 

    // Define Arrow Marker
    svg.append("defs").selectAll("marker")
      .data(["end-arrow"])
      .enter().append("marker")
      .attr("id", "end-arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25) // Shift arrow back so it doesn't overlap node text too much
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    // Colors
    const colorMap: Record<string, string> = {
      base: "#3b82f6",     // Blue-500
      extension: "#64748b", // Slate-500
      general: "#8b5cf6",   // Violet-500
      panel: "#10b981",     // Emerald-500
      causal: "#f97316"     // Orange-500
    };

    // Deep copy data to prevent mutation issues with React StrictMode
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(180))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(60));

    // Render Links
    const linkGroup = svg.append("g").attr("class", "links");
    
    const link = linkGroup.selectAll("g")
      .data(links)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        onSelect(d);
      });

    const linkPath = link.append("path")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#end-arrow)")
      .attr("fill", "none")
      .attr("class", "transition-all duration-300");

    // Invisible wide path for easier clicking
    link.append("path")
      .attr("stroke", "transparent")
      .attr("stroke-width", 20)
      .attr("fill", "none");

    // Add tooltip title for assumption changes
    link.append("title")
      .text(d => `${d.relation}\n\n${d.assumptions.join('\n')}`);

    const linkLabel = link.append("text")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .text(d => d.relation)
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .attr("font-weight", "500")
      .style("pointer-events", "none"); // Let clicks pass to the link group

    // Render Nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Node Circles
    node.append("circle")
      .attr("r", 35)
      .attr("fill", "white")
      .attr("stroke", d => colorMap[d.group])
      .attr("stroke-width", 3)
      .attr("class", "cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg")
      .on("click", (event, d) => {
        event.stopPropagation();
        onSelect(d);
      });

    // Node Labels
    node.append("text")
      .text(d => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#1e293b")
      .style("pointer-events", "none");

    // Highlights based on selection
    svg.on("click", () => onSelect(null));

    simulation.on("tick", () => {
      linkPath.attr("d", (d: any) => {
        // Calculate intersection point for arrow to stop at node edge
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        
        // Simple straight line for now, but curved looks nicer for dual links
        // Using straight lines for clarity in this specific topology
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Helper functions for drag
    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Initial Positioning logic to help the layout converge nicely
    // GMM top, OLS center, others around
    nodes.forEach(n => {
        if(n.id === 'GMM') { n.fx = width/2; n.fy = height * 0.15; }
        if(n.id === 'OLS') { n.x = width/2; n.y = height * 0.8; }
    });


  }, [data, dimensions, onSelect]);

  // Handle selected visual state separately to avoid full re-render of D3
  useEffect(() => {
    if(!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    // Reset styling
    svg.selectAll("circle")
       .attr("stroke-width", 3)
       .attr("stroke", (d: any) => {
         const map: any = { base: "#3b82f6", extension: "#64748b", general: "#8b5cf6", panel: "#10b981", causal: "#f97316" };
         return map[d.group];
       });
    
    svg.selectAll("path")
       .attr("stroke", "#cbd5e1")
       .attr("stroke-width", 2);

    if (selectedId) {
      // Highlight Node
      svg.selectAll("circle")
         .filter((d: any) => d.id === selectedId)
         .attr("stroke-width", 6)
         .attr("stroke", "#1e293b"); // Dark border for selected

      // Highlight Links connected to selected node
      svg.selectAll(".links path")
         .filter((d: any) => {
             // Check if link connects to node, or if link itself is selected (by comparing internal D3 link data structure if we had IDs on links, but here we just check nodes)
            return d.source.id === selectedId || d.target.id === selectedId;
         })
         .attr("stroke", "#3b82f6")
         .attr("stroke-width", 3);
    }

  }, [selectedId]);

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    // Serialize the SVG
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    
    // Add namespace if missing (often needed for standalone SVG)
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    // Add XML declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    
    // Create blob and download
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "econometrics_nexus.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 cursor-grab active:cursor-grabbing relative">
        <button 
            onClick={handleDownload}
            className="absolute top-4 right-4 z-20 bg-white p-2 rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all"
            title="Download Graph as SVG"
        >
            <Download size={20} />
        </button>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default GraphView;