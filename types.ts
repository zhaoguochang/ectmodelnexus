import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  group: 'base' | 'extension' | 'general' | 'panel' | 'causal';
  description: string;
  math: string;
  details: string[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
  description: string;
  assumptions: string[];
  transformation: string;
}

export interface DataModel {
  nodes: GraphNode[];
  links: GraphLink[];
}