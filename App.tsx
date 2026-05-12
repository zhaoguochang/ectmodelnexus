import React, { useState } from 'react';
import GraphView from './components/GraphView';
import InfoPanel from './components/InfoPanel';
import { econometricsData } from './data/econometricsData';
import { GraphNode, GraphLink } from './types';
import { Network } from 'lucide-react';

const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<GraphNode | GraphLink | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSelect = (item: GraphNode | GraphLink | null) => {
    setSelectedItem(item);
    if (item) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  };

  const getSelectedId = () => {
    if (!selectedItem) return null;
    if ('id' in selectedItem) return selectedItem.id; // It's a node
    // It's a link, we can highlight both source and target, but for this simple ID check, we return null or specific link ID logic
    return null; 
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header Overlay */}
        <header className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm border border-slate-200 p-4 rounded-xl shadow-sm max-w-sm">
            <div className="flex items-center gap-2 mb-1">
                <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                    <Network size={20} />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                    Econometrics Nexus
                </h1>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
                Visualizing the structural relationships between OLS, GMM, and their extensions. 
                Drag nodes to rearrange. Click nodes or lines for math.
            </p>
            
            <div className="mt-3 flex flex-wrap gap-2">
                <LegendItem color="bg-blue-500" label="Base (OLS)" />
                <LegendItem color="bg-purple-500" label="General (GMM)" />
                <LegendItem color="bg-slate-500" label="Extension" />
                <LegendItem color="bg-emerald-500" label="Panel" />
                <LegendItem color="bg-orange-500" label="Causal" />
            </div>
        </header>

        {/* Graph Visualizer */}
        <div className="flex-1 w-full h-full">
          <GraphView 
            data={econometricsData} 
            onSelect={handleSelect} 
            selectedId={getSelectedId()}
          />
        </div>
      </div>

      {/* Sidebar Panel - Sliding on Mobile, Fixed on Desktop */}
      <div 
        className={`fixed inset-y-0 right-0 z-20 w-full md:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } md:relative md:transform-none md:w-[350px] lg:w-[400px] border-l border-slate-200 md:block`}
        style={{ display: isSidebarOpen ? 'block' : undefined }} // Force block when open on mobile
      >
        <InfoPanel 
          selectedItem={selectedItem} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </div>
      
      {/* Mobile Toggle Button (Visible only when sidebar is closed on mobile) */}
      {!isSidebarOpen && (
          <button 
            className="md:hidden absolute bottom-6 right-6 z-30 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
            onClick={() => {
                // If nothing selected, select OLS by default to open
                if (!selectedItem) {
                    const ols = econometricsData.nodes.find(n => n.id === 'OLS');
                    if (ols) handleSelect(ols);
                } else {
                    setIsSidebarOpen(true);
                }
            }}
          >
            <BookOpenIcon />
          </button>
      )}

    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
        <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wide">{label}</span>
    </div>
);

const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
)

export default App;
