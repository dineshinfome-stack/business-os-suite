import { getHeaderSlots, type HeaderSlotArea } from "@/lib/header/slot-registry";

interface Props {
  area: HeaderSlotArea;
  className?: string;
}

/**
 * Renders every registered header slot for the given area, sorted by `order`.
 * Slot components own their own state and popovers via HeaderProvider.
 */
export function HeaderSlots({ area, className }: Props) {
  const slots = getHeaderSlots(area);
  return (
    <div className={className}>
      {slots.map(({ id, component: Slot }) => (
        <Slot key={id} />
      ))}
    </div>
  );
}
