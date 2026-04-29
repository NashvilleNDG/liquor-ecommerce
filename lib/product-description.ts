import { inferOrigin } from "./product-origin";
import type { Product } from "./kanji-api";

function generateFallbackDescription(
  name: string,
  dept: string,
  size: string,
  country: string | null,
  state: string | null
): string {
  const n = name.toLowerCase();
  const origin = state ? `${state}, ${country}` : country;
  const originStr = origin ? ` from ${origin}` : "";
  const sizeStr = size ? ` Available in ${size}.` : "";

  if (n.includes("bourbon")) {
    return `${name} is a premium American straight bourbon whiskey${originStr}, crafted using a traditional mash bill rich in corn, rye, and malted barley. Aged in new charred American oak barrels, it develops its signature notes of caramel, vanilla, and toasted oak. With a warm, lingering finish, it's exceptional sipped neat, on the rocks, or in classic cocktails like an Old Fashioned or Manhattan.${sizeStr}`;
  }
  if (n.includes("tennessee") || (n.includes("whiskey") && state === "Tennessee")) {
    return `${name} is a distinguished Tennessee whiskey${originStr}, mellowed through the traditional Lincoln County Process — filtered through sugar maple charcoal before aging in charred American oak barrels. This extra step gives it an exceptionally smooth, mellow character with notes of vanilla, caramel, and a hint of smokiness. Perfect neat, over ice, or as the base of a whiskey sour.${sizeStr}`;
  }
  if (n.includes("scotch") || n.includes("highland") || n.includes("speyside") || n.includes("islay") || n.includes("single malt")) {
    return `${name} is a distinguished Scotch whisky${originStr}, aged in oak casks to develop its complex character of dried fruits, malt, and subtle smoke. Produced under the strict regulations of Scotch Whisky Associations, it carries the authentic heritage of Scottish distilling tradition. Best appreciated neat or with a splash of still water to open up its nuanced aromas and flavors.${sizeStr}`;
  }
  if (n.includes("irish whiskey") || country === "Ireland") {
    return `${name} is a smooth and approachable Irish whiskey${originStr}, triple-distilled for exceptional purity and a characteristically light, fruity, and mellow flavor profile. Its gentle notes of vanilla, honey, and light spice make it one of the world's most enjoyable whiskies — ideal for sipping straight, over ice, or as the star ingredient in an Irish Coffee.${sizeStr}`;
  }
  if (country === "Japan" || n.includes("japanese whisky") || n.includes("suntory") || n.includes("nikka")) {
    return `${name} is an elegant Japanese whisky${originStr}, crafted with meticulous attention to balance and harmony. Drawing on both Scottish traditions and Japanese precision, it delivers delicate floral and fruity notes alongside subtle oak influence and a silky smooth finish. A superb choice for contemplative sipping, and an essential addition to any whisky collection.${sizeStr}`;
  }
  if (n.includes("vodka")) {
    const usaNote = country === "United States" ? " Made with high-quality American ingredients," : "";
    return `${name} is a premium, ultra-smooth vodka${originStr}.${usaNote} distilled multiple times for exceptional purity and a clean, crisp finish. Its neutral yet refined character makes it the perfect base for virtually any cocktail — from a classic Martini and Moscow Mule to a simple vodka soda. Enjoy it chilled and neat to appreciate its full smoothness.${sizeStr}`;
  }
  if (n.includes("tequila")) {
    const type = n.includes("reposado") ? "reposado" : n.includes("añejo") || n.includes("anejo") ? "añejo" : n.includes("blanco") || n.includes("silver") ? "blanco" : "premium";
    return `${name} is a ${type} tequila crafted${originStr} from 100% blue Weber agave plants, slow-roasted in traditional ovens and distilled in copper pot stills. ${type === "reposado" ? "Rested in oak barrels for a minimum of two months, it gains subtle wood, caramel, and spice notes while preserving the bright agave character." : type === "blanco" ? "Unaged and bottled fresh, it showcases the pure, vibrant flavors of agave with hints of citrus and pepper." : "Aged for extended periods in American and French oak barrels, developing rich complexity with layers of caramel, dried fruit, and warm spice."} Perfect for sipping or mixing into a premium margarita.${sizeStr}`;
  }
  if (n.includes("mezcal")) {
    return `${name} is a handcrafted artisanal mezcal${originStr}, produced using traditional methods passed down through generations of Oaxacan mezcaleros. Made from agave hearts (piñas) that are slow-roasted in earthen pits over hot rocks and mesquite, it delivers the signature smoky, earthy complexity that sets mezcal apart. Sip it slowly neat in a copita glass to fully appreciate its depth and character.${sizeStr}`;
  }
  if (n.includes("rum")) {
    const style = n.includes("dark") ? "dark" : n.includes("spiced") ? "spiced" : n.includes("white") || n.includes("light") || n.includes("silver") ? "light" : "premium";
    return `${name} is a ${style} rum${originStr}, distilled from fermented sugarcane molasses or fresh sugarcane juice and aged to perfection. Its ${style === "dark" ? "rich, full-bodied character features notes of molasses, tropical fruits, and warm spices" : style === "spiced" ? "warm, aromatic profile combines natural rum with a blend of exotic spices and vanilla" : "clean, versatile character makes it ideal for mixing into your favorite cocktails"}. A must-have for any home bar.${sizeStr}`;
  }
  if (n.includes("gin")) {
    return `${name} is a craft gin${originStr}, distilled with a carefully selected blend of botanical ingredients including juniper berries, coriander, citrus peel, and other aromatic herbs and spices. Its bright, complex flavor profile features fresh juniper at the forefront, followed by floral and citrus notes with a clean, dry finish. Outstanding in a classic gin and tonic, a dry Martini, or a refreshing Negroni.${sizeStr}`;
  }
  if (n.includes("cognac") || n.includes("brandy") || n.includes("armagnac")) {
    return `${name} is a refined cognac and brandy${originStr}, crafted from Ugni Blanc grapes that are double-distilled in traditional copper pot stills and aged in French Limousin oak casks. This patient aging process develops layers of complexity — dried fruits, vanilla, warm spices, and oak — creating a spirit of remarkable depth and elegance. Ideal as an after-dinner digestif, sipped neat or over a single large ice cube.${sizeStr}`;
  }
  if ((dept === "Wines" || dept === "WINE") && (n.includes("red") || n.includes("cabernet") || n.includes("merlot") || n.includes("pinot noir") || n.includes("malbec") || n.includes("shiraz") || n.includes("syrah") || n.includes("zinfandel"))) {
    return `${name} is a full-bodied red wine${originStr}, crafted from carefully selected grapes harvested at optimal ripeness. Aged in oak barrels to develop structure and complexity, it presents rich aromas of dark berries, plum, and spice, with a smooth, velvety finish. An exceptional pairing with red meats, hearty pasta dishes, and aged cheeses. Serve at room temperature or slightly chilled.${sizeStr}`;
  }
  if ((dept === "Wines" || dept === "WINE") && (n.includes("white") || n.includes("chardonnay") || n.includes("sauvignon blanc") || n.includes("riesling") || n.includes("pinot grigio") || n.includes("moscato"))) {
    return `${name} is a crisp, refreshing white wine${originStr}, showcasing the vibrant character of its grape variety. With lively aromas of fresh citrus, stone fruit, and floral notes, it delivers a bright, clean palate with well-balanced acidity. An excellent companion to seafood, light pasta, salads, and soft cheeses. Best served well chilled at 45–50°F.${sizeStr}`;
  }
  if (dept === "Wines" || dept === "WINE") {
    return `${name} is a carefully crafted wine${originStr}, produced from grapes selected for their exceptional quality and expression of terroir. Its elegant aromatics and well-balanced character make it a versatile choice for a wide variety of occasions and food pairings. Serve at the appropriate temperature to best enjoy its full complexity and character.${sizeStr}`;
  }
  if (dept === "BEER") {
    const style = n.includes("ipa") ? "India Pale Ale (IPA)" : n.includes("lager") ? "lager" : n.includes("stout") ? "stout" : n.includes("porter") ? "porter" : n.includes("wheat") ? "wheat beer" : n.includes("sour") ? "sour ale" : n.includes("pilsner") ? "pilsner" : "craft beer";
    return `${name} is a premium ${style}${originStr}, brewed with quality malted barley, select hops, and pure water using time-honored brewing traditions. ${style.includes("IPA") ? "Its bold hop character delivers bright aromas of citrus and pine, balanced by a clean malt backbone and a satisfying bitter finish." : style === "stout" ? "Rich and full-bodied with roasted coffee and dark chocolate flavors, it has a creamy texture and a smooth, warming finish." : style === "lager" || style === "pilsner" ? "Crisp, clean, and refreshing with a balanced malt character and subtle hop bitterness — the perfect all-occasion beer." : "Crafted with passion and attention to detail, it delivers a well-balanced flavor experience that showcases the brewer's artistry."} Best enjoyed ice-cold in a chilled glass.${sizeStr}`;
  }
  if (dept === "LIQUOR") {
    return `${name} is a premium spirit${originStr}, crafted with care and expertise using the finest ingredients available. Produced using traditional methods and aged to perfection, it delivers a complex, rewarding flavor profile that appeals to both casual drinkers and connoisseurs alike. Enjoy it neat, on the rocks, or as the cornerstone of your favorite cocktail.${sizeStr}`;
  }
  return `${name} is a quality beverage${originStr} available in ${size || "various sizes"}. Visit Stones River Total Beverages in Murfreesboro, TN, to explore our full selection — over 7,000 products available for in-store pickup or local delivery.`;
}

export function getEffectiveDescription(product: Product, overrideDescription?: string | null): string {
  if (overrideDescription) return overrideDescription;
  const { country, state } = inferOrigin(product.ItemName, product.Department);
  return generateFallbackDescription(product.ItemName, product.Department, product.Size || "", country, state);
}
