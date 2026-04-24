// Maps 2-letter country code → full country name used by inferOrigin
export const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  US: "United States",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  AU: "Australia",
  ZA: "South Africa",
  AR: "Argentina",
  NZ: "New Zealand",
  MX: "Mexico",
  IE: "Ireland",
  GB: "United Kingdom",
  SC: "Scotland",
  JP: "Japan",
  CA: "Canada",
  DE: "Germany",
  AT: "Austria",
  PT: "Portugal",
  CL: "Chile",
  GR: "Greece",
  IL: "Israel",
  BR: "Brazil",
  PE: "Peru",
  CU: "Cuba",
  PR: "Puerto Rico",
};

export const COUNTRY_FLAG: Record<string, string> = {
  "United States": "🇺🇸", "France": "🇫🇷", "Italy": "🇮🇹",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Ireland": "🇮🇪", "Mexico": "🇲🇽",
  "Japan": "🇯🇵", "Canada": "🇨🇦", "Australia": "🇦🇺",
  "Spain": "🇪🇸", "Germany": "🇩🇪", "Argentina": "🇦🇷",
  "Chile": "🇨🇱", "Portugal": "🇵🇹", "New Zealand": "🇳🇿",
  "United Kingdom": "🇬🇧", "Cuba": "🇨🇺", "Puerto Rico": "🇵🇷",
  "South Africa": "🇿🇦", "Peru": "🇵🇪", "Brazil": "🇧🇷",
  "Austria": "🇦🇹", "Greece": "🇬🇷", "Israel": "🇮🇱",
};

export function inferOrigin(
  name: string,
  dept: string
): { country: string | null; state: string | null } {
  const n = name.toLowerCase();

  if (n.includes("tequila") || n.includes("mezcal") || n.includes("sotol"))
    return { country: "Mexico", state: null };
  if (
    n.includes("scotch") || n.includes("highland") || n.includes("speyside") ||
    n.includes("islay") || n.includes("lowland") || n.includes("campbeltown")
  )
    return { country: "Scotland", state: null };
  if (
    n.includes("irish whiskey") || n.includes("irish cream") || n.includes("jameson") ||
    n.includes("bushmills") || n.includes("tullamore") || n.includes("redbreast") ||
    n.includes("powers gold")
  )
    return { country: "Ireland", state: null };
  if (
    n.includes("japanese whisky") || n.includes("suntory") || n.includes("nikka") ||
    n.includes("yamazaki") || n.includes("hakushu") || n.includes("hibiki") || n.includes("toki")
  )
    return { country: "Japan", state: null };
  if (
    n.includes("cognac") || n.includes("armagnac") || n.includes("calvados") ||
    n.includes("champagne") || n.includes("bordeaux") || n.includes("burgundy") ||
    n.includes("beaujolais") || n.includes("hennessy") || n.includes("courvoisier") ||
    n.includes("remy martin") || n.includes("rémy martin")
  )
    return { country: "France", state: null };
  if (
    n.includes("grappa") || n.includes("chianti") || n.includes("barolo") ||
    n.includes("prosecco") || n.includes("amaretto") || n.includes("limoncello")
  )
    return { country: "Italy", state: null };
  if (
    n.includes("canadian whisky") || n.includes("canadian club") ||
    n.includes("crown royal") || n.includes("alberta")
  )
    return { country: "Canada", state: null };
  if (n.includes("rum") && (n.includes("cuban") || n.includes("cuba") || n.includes("havana")))
    return { country: "Cuba", state: null };
  if (n.includes("rum") && (n.includes("puerto rico") || n.includes("bacardi")))
    return { country: "Puerto Rico", state: null };
  if (n.includes("pisco") && (n.includes("peruvian") || n.includes("peru")))
    return { country: "Peru", state: null };
  if (n.includes("cachaca") || n.includes("cachaça") || n.includes("leblon"))
    return { country: "Brazil", state: null };

  // US-specific state origins
  if (
    n.includes("tennessee") || n.includes("jack daniel") || n.includes("george dickel") ||
    n.includes("uncle nearest") || n.includes("nelson's")
  )
    return { country: "United States", state: "Tennessee" };
  if (
    n.includes("bourbon") || n.includes("kentucky") || n.includes("buffalo trace") ||
    n.includes("maker's mark") || n.includes("wild turkey") || n.includes("four roses") ||
    n.includes("woodford") || n.includes("knob creek") || n.includes("basil hayden") ||
    n.includes("bulleit") || n.includes("jim beam") || n.includes("evan williams")
  )
    return { country: "United States", state: "Kentucky" };
  if (
    n.includes("tito") || n.includes("iron butterfly") || n.includes("dripping springs") ||
    n.includes("treaty oak") || n.includes("lone star")
  )
    return { country: "United States", state: "Texas" };

  // Generic US spirits
  if (
    dept === "LIQUOR" || n.includes("american") || n.includes("vodka") ||
    n.includes("gin") || n.includes("whiskey") || n.includes("whisky")
  )
    return { country: "United States", state: null };

  // Wine origins
  if (n.includes("rioja") || n.includes("cava") || n.includes("tempranillo"))
    return { country: "Spain", state: null };
  if (n.includes("riesling") || n.includes("jagermeister") || n.includes("schnapps"))
    return { country: "Germany", state: null };
  if (n.includes("malbec") && !n.includes("france"))
    return { country: "Argentina", state: null };
  if (n.includes("sauvignon blanc") && n.includes("new zealand"))
    return { country: "New Zealand", state: null };
  if (n.includes("austrian") || n.includes("grüner veltliner") || n.includes("gruner veltliner") || n.includes("zweigelt"))
    return { country: "Austria", state: null };
  if (n.includes("greek") || n.includes("ouzo") || n.includes("metaxa") || n.includes("assyrtiko"))
    return { country: "Greece", state: null };
  if (n.includes("chilean") || n.includes("carmenere") || (n.includes("malbec") && n.includes("chile")))
    return { country: "Chile", state: null };
  if (n.includes("israeli") || n.includes("israel") || n.includes("arak"))
    return { country: "Israel", state: null };
  if (n.includes("south african") || n.includes("pinotage"))
    return { country: "South Africa", state: null };

  return { country: null, state: null };
}
