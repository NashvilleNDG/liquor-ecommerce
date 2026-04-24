export interface Product {
  ItemUPC: string;
  ItemName: string;
  Size: string;
  Pack: string;
  Department: string;
  CurrentStock: number;
  Price: number;
  OnlinePrice: number;
}

const MOCK_PRODUCTS: Product[] = [
  { ItemUPC: "000000000001", ItemName: "Jack Daniel's Old No. 7 Tennessee Whiskey", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 24, Price: 27.99, OnlinePrice: 26.99 },
  { ItemUPC: "000000000002", ItemName: "Jack Daniel's Old No. 7 Tennessee Whiskey", Size: "1.75L", Pack: "1", Department: "Spirits", CurrentStock: 12, Price: 49.99, OnlinePrice: 47.99 },
  { ItemUPC: "000000000003", ItemName: "Tito's Handmade Vodka", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 36, Price: 24.99, OnlinePrice: 23.99 },
  { ItemUPC: "000000000004", ItemName: "Tito's Handmade Vodka", Size: "1.75L", Pack: "1", Department: "Spirits", CurrentStock: 18, Price: 44.99, OnlinePrice: 42.99 },
  { ItemUPC: "000000000005", ItemName: "Grey Goose Vodka", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 15, Price: 34.99, OnlinePrice: 33.99 },
  { ItemUPC: "000000000006", ItemName: "Casamigos Blanco Tequila", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 10, Price: 49.99, OnlinePrice: 47.99 },
  { ItemUPC: "000000000007", ItemName: "Don Julio 1942 Tequila", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 6, Price: 149.99, OnlinePrice: 144.99 },
  { ItemUPC: "000000000008", ItemName: "Hennessy VS Cognac", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 20, Price: 39.99, OnlinePrice: 37.99 },
  { ItemUPC: "000000000009", ItemName: "Jameson Irish Whiskey", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 28, Price: 29.99, OnlinePrice: 28.99 },
  { ItemUPC: "000000000010", ItemName: "Maker's Mark Bourbon Whisky", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 22, Price: 32.99, OnlinePrice: 31.99 },
  { ItemUPC: "000000000011", ItemName: "Woodford Reserve Bourbon Whiskey", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 16, Price: 39.99, OnlinePrice: 37.99 },
  { ItemUPC: "000000000012", ItemName: "Buffalo Trace Bourbon Whiskey", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 8, Price: 29.99, OnlinePrice: 28.49 },
  { ItemUPC: "000000000013", ItemName: "Bacardi Superior White Rum", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 30, Price: 14.99, OnlinePrice: 13.99 },
  { ItemUPC: "000000000014", ItemName: "Captain Morgan Original Spiced Rum", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 25, Price: 17.99, OnlinePrice: 16.99 },
  { ItemUPC: "000000000015", ItemName: "Bombay Sapphire London Dry Gin", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 14, Price: 27.99, OnlinePrice: 26.49 },
  { ItemUPC: "000000000016", ItemName: "Caymus Cabernet Sauvignon", Size: "750ml", Pack: "1", Department: "Wine", CurrentStock: 18, Price: 89.99, OnlinePrice: 85.99 },
  { ItemUPC: "000000000017", ItemName: "Kim Crawford Sauvignon Blanc", Size: "750ml", Pack: "1", Department: "Wine", CurrentStock: 24, Price: 14.99, OnlinePrice: 13.99 },
  { ItemUPC: "000000000018", ItemName: "Whispering Angel Rosé", Size: "750ml", Pack: "1", Department: "Wine", CurrentStock: 20, Price: 24.99, OnlinePrice: 23.49 },
  { ItemUPC: "000000000019", ItemName: "La Marca Prosecco", Size: "750ml", Pack: "1", Department: "Wine", CurrentStock: 32, Price: 16.99, OnlinePrice: 15.99 },
  { ItemUPC: "000000000020", ItemName: "Meiomi Pinot Noir", Size: "750ml", Pack: "1", Department: "Wine", CurrentStock: 16, Price: 19.99, OnlinePrice: 18.99 },
  { ItemUPC: "000000000021", ItemName: "Bud Light Beer", Size: "12pk 12oz Cans", Pack: "12", Department: "Beer", CurrentStock: 48, Price: 14.99, OnlinePrice: 13.99 },
  { ItemUPC: "000000000022", ItemName: "Budweiser Beer", Size: "12pk 12oz Cans", Pack: "12", Department: "Beer", CurrentStock: 40, Price: 14.99, OnlinePrice: 13.99 },
  { ItemUPC: "000000000023", ItemName: "Coors Light Beer", Size: "18pk 12oz Cans", Pack: "18", Department: "Beer", CurrentStock: 35, Price: 18.99, OnlinePrice: 17.99 },
  { ItemUPC: "000000000024", ItemName: "Miller Lite Beer", Size: "12pk 12oz Cans", Pack: "12", Department: "Beer", CurrentStock: 42, Price: 14.99, OnlinePrice: 13.99 },
  { ItemUPC: "000000000025", ItemName: "Modelo Especial Beer", Size: "12pk 12oz Cans", Pack: "12", Department: "Beer", CurrentStock: 50, Price: 17.99, OnlinePrice: 16.99 },
  { ItemUPC: "000000000026", ItemName: "Corona Extra Beer", Size: "12pk 12oz Bottles", Pack: "12", Department: "Beer", CurrentStock: 38, Price: 17.99, OnlinePrice: 16.99 },
  { ItemUPC: "000000000027", ItemName: "Heineken Lager Beer", Size: "12pk 12oz Bottles", Pack: "12", Department: "Beer", CurrentStock: 30, Price: 18.99, OnlinePrice: 17.99 },
  { ItemUPC: "000000000028", ItemName: "Blue Moon Belgian White Ale", Size: "6pk 12oz Bottles", Pack: "6", Department: "Beer", CurrentStock: 22, Price: 10.99, OnlinePrice: 9.99 },
  { ItemUPC: "000000000029", ItemName: "Truly Hard Seltzer Variety Pack", Size: "12pk 12oz Cans", Pack: "12", Department: "Beer", CurrentStock: 28, Price: 17.99, OnlinePrice: 16.99 },
  { ItemUPC: "000000000030", ItemName: "White Claw Hard Seltzer Variety Pack", Size: "12pk 12oz Cans", Pack: "12", Department: "Beer", CurrentStock: 33, Price: 17.99, OnlinePrice: 16.99 },
  { ItemUPC: "000000000031", ItemName: "Patrón Silver Tequila", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 12, Price: 44.99, OnlinePrice: 42.99 },
  { ItemUPC: "000000000032", ItemName: "Absolut Vodka", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 26, Price: 22.99, OnlinePrice: 21.99 },
  { ItemUPC: "000000000033", ItemName: "Crown Royal Canadian Whisky", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 19, Price: 32.99, OnlinePrice: 31.49 },
  { ItemUPC: "000000000034", ItemName: "Evan Williams Black Label Bourbon", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 5, Price: 12.99, OnlinePrice: 11.99 },
  { ItemUPC: "000000000035", ItemName: "Jose Cuervo Especial Silver Tequila", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 20, Price: 19.99, OnlinePrice: 18.99 },
  { ItemUPC: "000000000036", ItemName: "Pappy Van Winkle 15 Year Bourbon", Size: "750ml", Pack: "1", Department: "Spirits", CurrentStock: 2, Price: 899.99, OnlinePrice: 875.00 },
  { ItemUPC: "000000000037", ItemName: "Opus One Cabernet Sauvignon", Size: "750ml", Pack: "1", Department: "Wine", CurrentStock: 4, Price: 379.99, OnlinePrice: 364.99 },
  { ItemUPC: "000000000038", ItemName: "Silver Oak Alexander Valley Cabernet Sauvignon", Size: "750ml", Pack: "1", Department: "Wine", CurrentStock: 9, Price: 74.99, OnlinePrice: 71.99 },
  { ItemUPC: "000000000039", ItemName: "Veuve Clicquot Brut Champagne", Size: "750ml", Pack: "1", Department: "Wine", CurrentStock: 14, Price: 64.99, OnlinePrice: 61.99 },
  { ItemUPC: "000000000040", ItemName: "Moët & Chandon Impérial Brut Champagne", Size: "750ml", Pack: "1", Department: "Wine", CurrentStock: 11, Price: 54.99, OnlinePrice: 52.99 },
];

export async function fetchProducts(): Promise<Product[]> {
  const key = process.env.KANJI_API_KEY;
  const base = process.env.KANJI_API_BASE_URL;

  if (!key || !base || key === "mock") {
    return MOCK_PRODUCTS;
  }

  try {
    const res = await fetch(`${base}/item?Key=${key}`, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LiquorStore/1.0)" },
    });

    if (!res.ok) {
      console.warn(`Kanji API error: ${res.status} — falling back to mock data`);
      return MOCK_PRODUCTS;
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    console.warn("Kanji API unreachable — falling back to mock data");
    return MOCK_PRODUCTS;
  }
}
