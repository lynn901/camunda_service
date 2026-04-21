import { useEffect, useRef } from 'react';
import BpmnJS from 'bpmn-js/lib/NavigatedViewer';

interface BpmnViewerProps {
  xml: string;
  activeNodes?: string[];
  failedNodes?: string[];
}

export const BpmnViewer = ({ xml, activeNodes = [], failedNodes = [] }: BpmnViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    viewerRef.current = new BpmnJS({
      container: containerRef.current,
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current || !xml) return;

    const render = async () => {
      try {
        await viewerRef.current.importXML(xml);
        const canvas = viewerRef.current.get('canvas');
        canvas.zoom('fit-viewport');

        const elementRegistry = viewerRef.current.get('elementRegistry');
        
        activeNodes.forEach(nodeId => {
          const element = elementRegistry.get(nodeId);
          if (element) {
            canvas.addMarker(nodeId, 'highlight-active');
          }
        });

        failedNodes.forEach(nodeId => {
          const element = elementRegistry.get(nodeId);
          if (element) {
            canvas.addMarker(nodeId, 'highlight-failed');
          }
        });

      } catch (err) {
        console.error('Error rendering BPMN:', err);
      }
    };

    render();
  }, [xml, activeNodes, failedNodes]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      <style>{`
        .highlight-active:not(.djs-connection) .djs-visual > :nth-child(1) {
          stroke: #4f46e5 !important;
          stroke-width: 3px !important;
          fill: #eef2ff !important;
        }
        .highlight-failed:not(.djs-connection) .djs-visual > :nth-child(1) {
          stroke: #f43f5e !important;
          stroke-width: 3px !important;
          fill: #fff1f2 !important;
        }
      `}</style>
    </div>
  );
};
