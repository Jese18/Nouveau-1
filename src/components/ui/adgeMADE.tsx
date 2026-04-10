import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { Card } from "@/components/ui/card";

interface IDCardProps {
  name: string;
  role: "Personnel" | "Mère" | "Enfant";
  idNumber: string;
  photoUrl?: string;
}

export function IDCard({ name, role, idNumber, photoUrl }: IDCardProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  // Définition de la couleur selon le rôle
  const roleColors = {
    Personnel: "bg-blue-700",
    Mère: "bg-green-600",
    Enfant: "bg-orange-500",
  };

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, idNumber, {
        format: "CODE128",
        width: 1.5,
        height: 40,
        displayValue: true,
      });
    }
  }, [idNumber]);

  return (
    <Card id="badge-to-download" className="w-[300px] h-[450px] overflow-hidden bg-white shadow-2xl border-none flex flex-col items-center">
      {/* Header avec couleur dynamique */}
      <div className={`w-full h-24 ${roleColors[role]} flex items-center justify-center p-4`}>
        <h1 className="text-white font-bold text-xl tracking-widest">ONG MADE</h1>
      </div>

      {/* Photo de profil */}
      <div className="-mt-12">
        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-lg">
          {photoUrl ? (
            <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">👤</div>
          )}
        </div>
      </div>

      {/* Infos Personne */}
      <div className="mt-4 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 uppercase leading-tight">{name}</h2>
        <p className={`mt-1 font-semibold ${role === 'Personnel' ? 'text-blue-700' : 'text-gray-500'}`}>{role}</p>
      </div>

      {/* Code-barres pour le scanner laser */}
      <div className="mt-auto mb-6 flex flex-col items-center">
        <svg ref={barcodeRef}></svg>
      </div>
    </Card>
  );
}