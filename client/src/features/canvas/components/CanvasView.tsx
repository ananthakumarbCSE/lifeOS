'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { GoalNode } from './nodes/GoalNode';
import { TaskNode } from './nodes/TaskNode';
import { ProjectNode } from './nodes/ProjectNode';
import { EventNode } from './nodes/EventNode';
import { WarningNode } from './nodes/WarningNode';
import { apiClient } from '@/lib/api-client';
import { useDebounce } from '@/hooks/useDebounce';
import { Spinner } from '@/components/ui/Spinner';

const nodeTypes = {
  goalNode: GoalNode,
  taskNode: TaskNode,
  projectNode: ProjectNode,
  eventNode: EventNode,
  warningNode: WarningNode,
};

export function CanvasView() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const isLoaded = useRef(false);
  const pendingPositions = useRef<Map<string, { nodeId: string; type: string; position: { x: number; y: number } }>>(new Map());

  // Load canvas data
  useEffect(() => {
    async function loadCanvas() {
      try {
        const { data } = await apiClient.get('/canvas');
        setNodes(data.nodes as Node[]);
        setEdges(data.edges as Edge[]);
        isLoaded.current = true;
      } catch (error) {
        console.error('Failed to load canvas:', error);
      }
    }
    loadCanvas();
  }, [setNodes, setEdges]);

  // Debounced position save
  const savePositions = useDebounce(async () => {
    if (pendingPositions.current.size === 0) return;

    const updates = Array.from(pendingPositions.current.values());
    pendingPositions.current.clear();

    try {
      await apiClient.patch('/canvas/positions', { updates });
    } catch (error) {
      console.error('Failed to save positions:', error);
    }
  }, 500);

  // Track node position changes for autosave
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);

      if (!isLoaded.current) return;

      for (const change of changes) {
        if (change.type === 'position' && change.position && !change.dragging) {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            const [type, id] = node.id.split('-');
            pendingPositions.current.set(node.id, {
              nodeId: id,
              type,
              position: change.position,
            });
          }
        }
      }

      if (pendingPositions.current.size > 0) {
        savePositions();
      }
    },
    [onNodesChange, nodes, savePositions]
  );

  // Handle new connections
  const onConnect = useCallback(
    async (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'default' }, eds));

      const [sourceType, sourceId] = (connection.source || '').split('-');
      const [targetType, targetId] = (connection.target || '').split('-');

      try {
        await apiClient.post('/canvas/connections', {
          sourceId,
          sourceType,
          targetId,
          targetType,
          relationshipType: 'related-to',
        });
      } catch (error) {
        console.error('Failed to create connection:', error);
      }
    },
    [setEdges]
  );

  if (!isLoaded.current && nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--color-bg-primary)]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-border-muted)"
        />
        <Controls
          showInteractive={false}
          className="!bg-[var(--color-bg-surface)] !border-[var(--color-border-default)]"
        />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            const colorMap: Record<string, string> = {
              goalNode: 'var(--color-node-goal)',
              taskNode: 'var(--color-node-task)',
              projectNode: 'var(--color-node-project)',
              eventNode: 'var(--color-node-event)',
              warningNode: 'var(--color-node-warning)',
            };
            return colorMap[node.type || ''] || '#666';
          }}
          className="!bg-[var(--color-bg-surface)]"
        />
      </ReactFlow>

      {/* Empty state */}
      {isLoaded.current && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3 pointer-events-auto">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0-6 6c0 4 6 9 6 9s6-5 6-9a6 6 0 0 0-6-6z" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-[var(--color-text-primary)]">
              Your canvas is empty
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
              Use Brain Dump to describe your goals in natural language, or create nodes manually.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
