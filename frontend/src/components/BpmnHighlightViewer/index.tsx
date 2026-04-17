import React, { useEffect, useRef } from 'react';
// @ts-ignore
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { request } from '@umijs/max';
import { Spin } from 'antd';

interface BpmnHighlightViewerProps {
  processDefinitionId: string;
  activeActivityIds?: string[];
  mode?: 'highlight' | 'heatmap';
}

const BpmnHighlightViewer: React.FC<BpmnHighlightViewerProps> = ({
  processDefinitionId,
  activeActivityIds = [],
  mode = 'highlight',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    viewerRef.current = new BpmnViewer({
      container: containerRef.current,
      width: '100%',
      height: '400px',
    });

    const loadXml = async () => {
      try {
        const { bpmn20Xml } = await request(`/engine-rest/process-definition/${processDefinitionId}/xml`);
        await viewerRef.current.importXML(bpmn20Xml);
        
        const canvas = viewerRef.current.get('canvas');
        canvas.zoom('fit-viewport');

        if (mode === 'highlight') {
          activeActivityIds.forEach((id) => {
            canvas.addMarker(id, 'highlight');
          });
        } else if (mode === 'heatmap') {
          // Fetch history activity data
          const historyRes = await request<any[]>('/engine-rest/history/activity-instance', {
            params: { processDefinitionId, finished: true }
          });
          
          // Calculate average duration per activity
          const stats: Record<string, number> = {};
          historyRes.forEach(item => {
            if (item.durationInMillis) {
              if (!stats[item.activityId]) stats[item.activityId] = 0;
              stats[item.activityId] += item.durationInMillis;
            }
          });

          // Apply heatmap markers
          Object.keys(stats).forEach(id => {
            const duration = stats[id];
            if (duration > 1000 * 60 * 60 * 24) { // > 1 day
              canvas.addMarker(id, 'heatmap-red');
            } else if (duration > 1000 * 60 * 60) { // > 1 hour
              canvas.addMarker(id, 'heatmap-yellow');
            } else {
              canvas.addMarker(id, 'heatmap-green');
            }
          });
        }
      } catch (err) {
        console.error('Error loading BPMN XML:', err);
      }
    };

    loadXml();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [processDefinitionId, activeActivityIds]);

  return (
    <div style={{ position: 'relative', width: '100%', border: '1px solid #d9d9d9', borderRadius: '4px', overflow: 'hidden' }}>
      <style>{`
        .highlight:not(.djs-connection) .djs-visual > :nth-child(1) {
          fill: rgba(0, 82, 239, 0.1) !important;
          stroke: #0052ef !important;
          stroke-width: 3px !important;
        }
        .heatmap-red:not(.djs-connection) .djs-visual > :nth-child(1) {
          fill: rgba(255, 0, 0, 0.2) !important;
          stroke: #ff4d4f !important;
          stroke-width: 4px !important;
        }
        .heatmap-yellow:not(.djs-connection) .djs-visual > :nth-child(1) {
          fill: rgba(255, 255, 0, 0.2) !important;
          stroke: #faad14 !important;
          stroke-width: 3px !important;
        }
        .heatmap-green:not(.djs-connection) .djs-visual > :nth-child(1) {
          fill: rgba(0, 255, 0, 0.2) !important;
          stroke: #52c41a !important;
          stroke-width: 2px !important;
        }
      `}</style>
      <div ref={containerRef} style={{ height: '400px' }} />
    </div>
  );
};

export default BpmnHighlightViewer;
