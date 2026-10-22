import mergedAsset11 from "../assets/merged-asset-11@2x.png";
import mergedAsset21 from "../assets/merged-asset-21@2x.png";
import containerBox from "../assets/Container-Box.svg";

function BackgroundPattern() {
  return (
    <div className="relative h-[1024px] w-full shrink-0 overflow-hidden">
      {/* Övre vänstra dekorationen */}
      <img
        src={mergedAsset21}
        alt=""
        className="absolute top-[37.5px] left-0 w-[258px] h-[132px] object-cover"
      />

      {/* Mindre detaljer */}
      <div className="absolute top-[92.3px] left-[236.2px] h-[15.9px] w-[15.8px] origin-top-left -rotate-[21.2deg] bg-gradient-to-l from-[#B44A1A] to-[#FF8A3D]" />

      <div className="absolute top-[183.9px] left-0 h-[15.9px] w-[15.8px] origin-top-left -rotate-[21.2deg] bg-gradient-to-l from-[#B44A1A] to-[#FF8A3D]" />

      <img
        src={mergedAsset11}
        alt=""
        className="absolute top-[158.2px] left-[23.6px] w-[84px] h-[35px] object-cover"
      />

      {/* Penseldrag vänster */}
      <img
        src={containerBox}
        alt=""
        className="absolute top-[180px] right-[1300px] h-[230px] w-[488px]"
      />

      {/* Stora penseldraget längst ner */}
      <img
        src={containerBox}
        alt=""
        className="absolute bottom-[-500.3px] left-[-1115px] h-[1311.3px] w-[1951.7px] object-contain"
      />

      {/* Penseldrag höger nere */}
      <img
        src={containerBox}
        alt=""
        className="absolute top-[700px] right-[150px] h-[230px] w-[488px]"
      />

      {/* Penseldrag höger uppe */}
      <img
        src={containerBox}
        alt=""
        className="absolute top-[57px] right-[-250px] h-[363px] w-[684px]"
      />
    </div>
  );
}

export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#070706]"
    >
      <div className="flex flex-col">
        <BackgroundPattern />
        <BackgroundPattern />
        <BackgroundPattern />
        <BackgroundPattern />
      </div>
    </div>
  );
}
