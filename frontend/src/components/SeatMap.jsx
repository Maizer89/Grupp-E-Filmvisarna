import { useEffect, useRef, useState } from "react";

export default function SeatMap({
  seats,
  ticketCount = 0,
  selectedSeats,
  setSelectedSeats,
}) {
  const [hoveredSeats, setHoveredSeats] = useState([]);
  const [pointerPosition, setPointerPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const seatMapRef = useRef(null);
  const pointerRef = useRef(null);
  const dragRef = useRef(null);
  const previewRef = useRef([]);

  const rows = Object.groupBy(seats, (seat) => seat.row_number);

  // Hitta en sammanhängande grupp utifrån antal biljetter.
  function getSeatGroup(seat, rowSeats) {
    if (!seat.isAvailable || ticketCount === 0) return [];

    const sortedSeats = [...rowSeats].sort(
      (a, b) => a.seat_number - b.seat_number,
    );

    const hoveredIndex = sortedSeats.findIndex(
      (currentSeat) => currentSeat.id === seat.id,
    );

    const seatsToLeft = Math.floor((ticketCount - 1) / 2);
    const startIndex = hoveredIndex - seatsToLeft;

    const group = sortedSeats.slice(startIndex, startIndex + ticketCount);

    const validGroup =
      startIndex >= 0 &&
      group.length === ticketCount &&
      group.every(
        (currentSeat, index) =>
          currentSeat.isAvailable &&
          currentSeat.seat_number === group[0].seat_number + index,
      );

    return validGroup ? group.map((currentSeat) => currentSeat.id) : [];
  }

  function handleSeatHover(seat, rowSeats) {
    if (dragRef.current) return;
    setHoveredSeats(getSeatGroup(seat, rowSeats));
  }

  function handleSeatClick(seat, rowSeats) {
    if (!seat.isAvailable || ticketCount === 0) return;

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats([]);
      return;
    }

    const group = getSeatGroup(seat, rowSeats);

    if (group.length === 0) return;

    setSelectedSeats(group);
    setHoveredSeats([]);
  }

  // Hitta närmaste stol till droppens spets.
  function findSeatAtPosition(clientX, clientY) {
    const map = seatMapRef.current;
    if (!map) return null;

    const buttons = map.querySelectorAll("[data-seat-id]");

    let closestButton = null;
    let closestDistance = Infinity;

    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.hypot(clientX - centerX, clientY - centerY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestButton = button;
      }
    });

    if (!closestButton || closestDistance > 35) return null;

    const seat = seats.find(
      (item) => String(item.id) === closestButton.dataset.seatId,
    );

    if (!seat) return null;

    return {
      seat,
      rowSeats: rows[seat.row_number],
    };
  }

  // Placera droppen vid en ledig stol när kartan visas.
  useEffect(() => {
    if (!seatMapRef.current || seats.length === 0) return;

    if (pointerPosition !== null) return;

    const availableSeat = seats.find((seat) => seat.isAvailable);
    if (!availableSeat) return;

    const button = Array.from(
      seatMapRef.current.querySelectorAll("[data-seat-id]"),
    ).find((element) => element.dataset.seatId === String(availableSeat.id));

    if (!button) return;

    const seatRect = button.getBoundingClientRect();
    const mapRect = seatMapRef.current.getBoundingClientRect();

    setPointerPosition({
      x: seatRect.left + seatRect.width / 2 - mapRect.left,
      y: seatRect.top + seatRect.height / 2 - mapRect.top,
    });
  }, [seats, pointerPosition]);

  // Uppdatera vilka stolar som droppens spets pekar på.
  function updatePointerSelection(x, y) {
    const mapRect = seatMapRef.current.getBoundingClientRect();

    const target = findSeatAtPosition(mapRect.left + x, mapRect.top + y);

    if (!target) {
      previewRef.current = [];
      setHoveredSeats([]);
      return;
    }

    const group = getSeatGroup(target.seat, target.rowSeats);

    previewRef.current = group;
    setHoveredSeats(group);
  }

  function handlePointerDown(event) {
    if (
      event.pointerType !== "touch" ||
      !window.matchMedia("(max-width: 767px)").matches ||
      !pointerPosition ||
      ticketCount === 0
    ) {
      return;
    }

    event.preventDefault();

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      pointerX: pointerPosition.x,
      pointerY: pointerPosition.y,
    };

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);

    updatePointerSelection(pointerPosition.x, pointerPosition.y);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const map = seatMapRef.current;
    if (!map) return;

    const x = drag.pointerX + event.clientX - drag.startX;
    const y = drag.pointerY + event.clientY - drag.startY;

    const clampedX = Math.max(0, Math.min(map.clientWidth, x));
    const clampedY = Math.max(0, Math.min(map.clientHeight, y));

    setPointerPosition({
      x: clampedX,
      y: clampedY,
    });

    setSelectedSeats([]);
    updatePointerSelection(clampedX, clampedY);
  }

  function finishDrag(event, cancelled = false) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    if (!cancelled && previewRef.current.length === ticketCount) {
      setSelectedSeats([...previewRef.current]);
    }

    dragRef.current = null;
    previewRef.current = [];
    setIsDragging(false);
    setHoveredSeats([]);

    // pointerPosition nollställs INTE.
    // Droppen ligger därför kvar efter att fingret släppts.
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 text-[#EEE7D6]">
      <h2 className="text-lg font-semibold">Välj dina platser</h2>

      <div
        ref={seatMapRef}
        className="relative flex w-full flex-col items-center gap-2.5 sm:gap-3"
        onMouseLeave={() => {
          if (!dragRef.current) {
            setHoveredSeats([]);
          }
        }}
      >
        {Object.entries(rows).map(([rowNumber, rowSeats]) => (
          <div
            key={rowNumber}
            className="flex w-full items-center justify-center gap-1 sm:gap-2"
          >
            <span className="hidden w-12 shrink-0 text-sm md:block">
              Rad {rowNumber}
            </span>

            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.id);
                const isHovered = hoveredSeats.includes(seat.id);

                return (
                  <button
                    key={seat.id}
                    type="button"
                    data-seat-id={seat.id}
                    disabled={!seat.isAvailable}
                    onMouseEnter={() => handleSeatHover(seat, rowSeats)}
                    onClick={() => handleSeatClick(seat, rowSeats)}
                    aria-pressed={isSelected}
                    aria-label={`Rad ${rowNumber}, plats ${seat.seat_number}`}
                    className={`flex aspect-square w-[clamp(18px,5.5vw,36px)] shrink-0 items-center justify-center rounded-t-md text-[10px] transition-colors sm:rounded-t-lg sm:text-sm ${
                      !seat.isAvailable
                        ? "bg-[#E23A1A] text-white"
                        : isSelected || isHovered
                          ? "bg-[#6FAF65] text-[#070706]"
                          : "bg-[#EEE7D6] text-[#070706]"
                    }`}
                  >
                    {seat.seat_number}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Permanent droppformad pekare för mobil */}
        {pointerPosition && (
          <div
            ref={pointerRef}
            className="absolute z-50 md:hidden"
            style={{
              left: pointerPosition.x,
              top: pointerPosition.y,
              transform: "translate(-50%, 0)",
            }}
          >
            <button
              type="button"
              aria-label="Dra för att välja stolar"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => finishDrag(event)}
              onPointerCancel={(event) => finishDrag(event, true)}
              className={`flex h-[92px] w-[64px] touch-none items-center justify-center border-0 bg-transparent p-0 ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <svg
                width="64"
                height="92"
                viewBox="0 0 64 92"
                fill="none"
                aria-hidden="true"
                className="pointer-events-none drop-shadow-[0_4px_12px_rgba(255,138,61,0.35)]"
              >
                <path
                  d="M32 2 L54 43 C59 52 61 59 61 65 C61 81 48 90 32 90 C16 90 3 81 3 65 C3 59 5 52 10 43 Z"
                  fill="#202026"
                  stroke="#FF8A3D"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                <circle cx="32" cy="65" r="13" fill="#FF8A3D" />
                <circle cx="32" cy="65" r="5" fill="#202026" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-t bg-[#EEE7D6]" />
          <span>Ledig</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-t bg-[#6FAF65]" />
          <span>Vald</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-t bg-[#E23A1A]" />
          <span>Upptagen</span>
        </div>
      </div>
    </div>
  );
}
