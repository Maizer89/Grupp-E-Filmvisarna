export default function BookingSteps({ currentStep }) {
  const steps = [
    { id: 1, label: "Välj platser" },
    { id: 2, label: "Dina uppgifter" },
    { id: 3, label: "Bekräfta" },
  ];

  return (
    <div className="flex flex-wrap items-center mb-6 justify-center gap-4 md:flex-nowrap md:gap-10">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-[#EEE7D6] ${
              currentStep === step.id ? "bg-[#FF8A3D]" : "bg-[#202026]"
            }`}
          >
            {step.id}
          </span>

          <span
            className={
              currentStep === step.id
                ? "font-semibold text-[#FF8A3D]"
                : "text-[#EEE7D6]"
            }
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
