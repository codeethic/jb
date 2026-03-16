'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableFeatureCardProps {
  id: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function SortableFeatureCard({
  id,
  disabled,
  children,
}: SortableFeatureCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={disabled ? '' : 'cursor-grab active:cursor-grabbing'}
    >
      {children}
    </div>
  );
}
