/** "Filling fast" from this many seats left. */
export const FEW = 4;

/** Seats booked on a date, whether it is guaranteed to run (enough climbers booked) and whether it is nearly full. */
export function seatState(d: { capacity: number | null; seatsLeft: number | null; open: boolean }, minimum: number) {
  const taken = d.capacity !== null && d.seatsLeft !== null ? d.capacity - d.seatsLeft : null;
  return {
    taken,
    guaranteed: taken !== null && taken >= minimum,
    few: d.open && d.seatsLeft !== null && d.seatsLeft <= FEW,
  };
}
