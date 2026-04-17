import React, { useEffect, useRef } from 'react';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import './BpmnViewer.css';

interface BpmnViewerProps {
  xml: string;
  highlightedActivities?: string[];
  className?: string;
}

export const BpmnViewer: React.FC<BpmnViewerProps> = ({ xml, highlightedActivities, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    viewerRef.current = new NavigatedViewer({
      container: containerRef.current,
      keyboard: {
        bindTo: document
      }
    });

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current || !xml) return;

    const renderDiagram = async () => {
      try {
        await viewerRef.current.importXML(xml);
        const canvas = viewerRef.current.get('canvas');
        canvas.zoom('fit-viewport');

        if (highlightedActivities && highlightedActivities.length > 0) {
          highlightedActivities.forEach(activityId => {
            canvas.addMarker(activityId, 'highlight');
          });
        }
      } catch (err) {
        console.error('Failed to render BPMN diagram', err);
      }
    };

    renderDiagram();
  }, [xml, highlightedActivities]);

  return (
    <div className={`bpmn-viewer-container ${className || ''}`}>
      <div ref={containerRef} className="bpmn-canvas" />
    </div>
  );
};
