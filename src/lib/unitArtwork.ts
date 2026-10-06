import praetorian from "@/assets/units/Cohortes_Praetorianae.png.asset.json";
import urbanae from "@/assets/units/Cohortes_Urbanae.png.asset.json";
import germanic from "@/assets/units/Germanic_Guard.png.asset.json";
import italica from "@/assets/units/Legio_I_Italica.png.asset.json";
import fulminata from "@/assets/units/Legio_XII_Fulminata.png.asset.json";
import rapax from "@/assets/units/Legio_XXI_RAPAX.png.asset.json";
import valeria from "@/assets/units/Legio_XX_Valeria_Victrix.png.asset.json";
import lictores from "@/assets/units/Lictores_Guild.png.asset.json";

export const UNIT_ARTWORK = [
  { name: "Legio I Italica", src: italica.url, aliases: ["legio i italica", "legion i italica", "italica"] },
  { name: "Legio XII Fulminata", src: fulminata.url, aliases: ["legio xii fulminata", "legion xii fulminata", "fulminata"] },
  { name: "Legio XX Valeria Victrix", src: valeria.url, aliases: ["legio xx valeria victrix", "legion xx valeria victrix", "valeria victrix"] },
  { name: "Legio XXI Rapax", src: rapax.url, aliases: ["legio xxi rapax", "legion xxi rapax", "rapax"] },
  { name: "Cohortes Praetorianae", src: praetorian.url, aliases: ["cohortes praetorianae", "praetorian guard", "praetorianae"] },
  { name: "Cohortes Urbanae", src: urbanae.url, aliases: ["cohortes urbanae", "urbanae cohortis", "urban cohorts", "urbanae"] },
  { name: "Germanic Guard", src: germanic.url, aliases: ["germanic guard", "cohortes germanicae", "germanicae"] },
  { name: "Lictores Guild", src: lictores.url, aliases: ["lictores guild", "lictors guild", "lictores"] },
];

/** Match unit titles only, never descriptions or a general military list. */
export function getUnitArtwork(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return UNIT_ARTWORK.find((unit) => unit.aliases.includes(normalized)) ?? null;
}