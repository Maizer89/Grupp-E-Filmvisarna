import { useParams } from "react-router-dom";

export default function BookingConfirmation() {
  const { id } = useParams();

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">
        Bokningsbekräftelse
      </h1>

      <p className="mt-4">
        Bokningsnummer: {id}
      </p>
    </div>
  );
}