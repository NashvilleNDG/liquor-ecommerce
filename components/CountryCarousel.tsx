"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const COUNTRIES = [
  { name: "Italy",        code: "IT", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=280&fit=crop&q=80",  fallback: "from-green-700 to-red-600"    },
  { name: "France",       code: "FR", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=280&fit=crop&q=80",  fallback: "from-blue-800 to-blue-500"    },
  { name: "Spain",        code: "ES", img: "https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=400&h=280&fit=crop&q=80",  fallback: "from-yellow-600 to-red-600"   },
  { name: "USA",          code: "US", img: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400&h=280&fit=crop&q=80",  fallback: "from-blue-700 to-red-700"     },
  { name: "Australia",    code: "AU", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=280&fit=crop&q=80",  fallback: "from-blue-800 to-red-500"     },
  { name: "South Africa", code: "ZA", img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&h=280&fit=crop&q=80",  fallback: "from-green-700 to-yellow-600" },
  { name: "Argentina",    code: "AR", img: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400&h=280&fit=crop&q=80",  fallback: "from-sky-500 to-sky-700"      },
  { name: "Chile",        code: "CL", img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=280&fit=crop&q=80",  fallback: "from-red-700 to-blue-700"     },
  { name: "New Zealand",  code: "NZ", img: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&h=280&fit=crop&q=80",  fallback: "from-blue-900 to-red-600"     },
  { name: "Germany",      code: "DE", img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=280&fit=crop&q=80",  fallback: "from-stone-800 to-yellow-600" },
  { name: "Austria",      code: "AT", img: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=400&h=280&fit=crop&q=80",  fallback: "from-red-700 to-stone-800"    },
  { name: "Portugal",     code: "PT", img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=280&fit=crop&q=80",  fallback: "from-red-700 to-green-700"    },
  { name: "Greece",       code: "GR", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=280&fit=crop&q=80",  fallback: "from-blue-600 to-white/80"    },
  { name: "Israel",       code: "IL", img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&h=280&fit=crop&q=80",  fallback: "from-blue-700 to-stone-100"   },
  { name: "Mexico",       code: "MX", img: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400&h=280&fit=crop&q=80",  fallback: "from-green-700 to-red-600"    },
  { name: "Ireland",      code: "IE", img: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=400&h=280&fit=crop&q=80",  fallback: "from-green-700 to-orange-600" },
  { name: "Scotland",     code: "SC", img: "https://images.unsplash.com/photo-1583425423900-5b8b7a3f1a7f?w=400&h=280&fit=crop&q=80",  fallback: "from-blue-800 to-stone-600"   },
  { name: "Japan",        code: "JP", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=280&fit=crop&q=80",  fallback: "from-red-600 to-stone-200"    },
  { name: "Canada",       code: "CA", img: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&h=280&fit=crop&q=80",  fallback: "from-red-700 to-stone-100"    },
];

const CARD_WIDTH = 172;

function CountryCard({ name, code, img, fallback }: { name: string; code: string; img: string; fallback: string }) {
  const [broken, setBroken] = useState(false);

  return (
    <Link
      href={`/shop?country=${code}`}
      className="flex-shrink-0 group relative w-40 h-48 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-200"
    >
      {broken ? (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallback}`} />
      ) : (
        <img
          src={img}
          alt={name}
          loading="lazy"
          onError={() => setBroken(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute bottom-3 left-0 right-0 text-center text-white text-sm font-bold drop-shadow-lg px-2 leading-tight">
        {name}
      </span>
    </Link>
  );
}

export default function CountryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? CARD_WIDTH * 3 : -CARD_WIDTH * 3,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative group/carousel">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                   w-10 h-10 rounded-full bg-white shadow-lg border border-stone-200
                   flex items-center justify-center
                   opacity-0 group-hover/carousel:opacity-100
                   hover:bg-stone-50 hover:shadow-xl transition-all duration-200"
      >
        <ChevronLeft size={18} className="text-stone-700" />
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {COUNTRIES.map((c) => (
          <CountryCard key={c.code} {...c} />
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                   w-10 h-10 rounded-full bg-white shadow-lg border border-stone-200
                   flex items-center justify-center
                   opacity-0 group-hover/carousel:opacity-100
                   hover:bg-stone-50 hover:shadow-xl transition-all duration-200"
      >
        <ChevronRight size={18} className="text-stone-700" />
      </button>
    </div>
  );
}
