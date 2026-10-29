// Cached sample responses shaped like Qloo output. Used only when QLOO_API_KEY is missing.
const P = (name, tags, address) => ({ id: "demo-" + name.toLowerCase().replace(/\W+/g, "-"), name, tags, address, affinity: +(0.7 + Math.random() * 0.29).toFixed(2), demo: true });
const places = {
  default: [P("Third Wave Coffee", ["cafe","specialty coffee"]), P("The Courtyard", ["live music","bar"]), P("Blue Tokai Roastery", ["coffee","brunch"]), P("Indie Vinyl Store", ["records","music shop"]), P("Rooftop Bistro", ["dinner","views"]), P("City Art Gallery", ["art","museum"])],
  bengaluru: [P("Blue Tokai, Indiranagar", ["specialty coffee","work friendly"], "Indiranagar, Bengaluru"), P("The Humming Tree", ["live music","indie"], "Indiranagar, Bengaluru"), P("Toit Brewpub", ["craft beer","lively"], "Indiranagar, Bengaluru"), P("Cubbon Park", ["park","morning walk"], "Bengaluru"), P("Museum of Art and Photography", ["art","museum"], "Kasturba Rd, Bengaluru"), P("Vidyarthi Bhavan", ["dosa","heritage eatery"], "Basavanagudi, Bengaluru")],
};
const other = {
  artist: [P("Prateek Kuhad", ["indie","singer songwriter"]), P("The Local Train", ["indian rock"]), P("Lifafa", ["electronic"]), P("When Chai Met Toast", ["indie folk"])],
  movie: [P("Before Sunrise", ["romance","walk and talk"]), P("Lost in Translation", ["drama"]), P("Lunchbox", ["indian","food"])],
  brand: [P("Blue Tokai", ["coffee"]), P("Bombay Shirt Company", ["fashion"]), P("Nicobar", ["lifestyle"])],
  book: [P("Norwegian Wood", ["literary fiction"]), P("Kitchen Confidential", ["food","memoir"])],
};
export const DEMO = {
  search: (query, type) => [P(query, [type || "entity"])],
  insights: (type, city) => type === "place" ? (places[(city || "").toLowerCase().split(/[ ,]/)[0]] || places.default) : (other[type] || other.artist),
};
