import React from 'react';
import { GraphNode, GraphLink } from '../types';
import { X, ArrowRight, BookOpen, Sigma, GitBranch } from 'lucide-react';

interface InfoPanelProps {
  selectedItem: GraphNode | GraphLink | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedItem, onClose }) => {
  if (!selectedItem) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center border-l border-slate-200 bg-white/50 backdrop-blur-sm">
        <GitBranch className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Explore the Nexus</h3>
        <p className="text-sm">Click on a node (Model) or a link (Relationship) to view its mathematical details and assumptions.</p>
      </div>
    );
  }

  const isNode = (item: any): item is GraphNode => 'group' in item;

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
        <div>
          <span className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1 block">
            {isNode(selectedItem) ? 'Model' : 'Relationship'}
          </span>
          <h2 className="text-2xl font-bold text-slate-800">
            {isNode(selectedItem) 
              ? selectedItem.label 
              : `${(selectedItem.source as GraphNode).label} → ${(selectedItem.target as GraphNode).label}`}
          </h2>
          {isNode(selectedItem) && (
             <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium 
               ${selectedItem.group === 'base' ? 'bg-blue-100 text-blue-700' : 
                 selectedItem.group === 'general' ? 'bg-purple-100 text-purple-700' :
                 selectedItem.group === 'panel' ? 'bg-emerald-100 text-emerald-700' :
                 selectedItem.group === 'causal' ? 'bg-orange-100 text-orange-700' :
                 'bg-slate-100 text-slate-700'}`}>
               {selectedItem.group.toUpperCase()}
             </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-8">
        
        {/* Description */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3>Intuition</h3>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">
            {selectedItem.description}
          </p>
        </section>

        {/* Assumptions / Details List */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
            <ArrowRight className="w-5 h-5 text-emerald-500" />
            <h3>{isNode(selectedItem) ? 'Key Properties' : 'Assumption Changes / Requirements'}</h3>
          </div>
          <ul className="space-y-2">
            {(isNode(selectedItem) ? selectedItem.details : selectedItem.assumptions).map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
                <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Mathematics / Transformation */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
            <Sigma className="w-5 h-5 text-purple-500" />
            <h3>{isNode(selectedItem) ? 'Formulation' : 'Transformation'}</h3>
          </div>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg shadow-inner font-mono text-sm overflow-x-auto whitespace-pre-wrap">
            {isNode(selectedItem) ? selectedItem.math : selectedItem.transformation}
          </div>
          {!isNode(selectedItem) && (
            <p className="mt-2 text-xs text-slate-500 italic">
              *The data is transformed prior to applying OLS to achieve these properties.
            </p>
          )}
        </section>

      </div>
    </div>
  );
};

export default InfoPanel;