// Bitmap art of the app (rendered by tools/render-game-art.js).
export const ART = {
  felt: require("../../assets/game/felt.jpg"),
  woodTop: require("../../assets/game/wood-top.jpg"),
  woodBottom: require("../../assets/game/wood-bottom.jpg"),
  // White line icons, for tintColor:
  iconMenu: require("../../assets/game/icon-menu.png"),
  iconCards: require("../../assets/game/icon-cards.png"),
  iconPerson: require("../../assets/game/icon-person.png"),
  iconBook: require("../../assets/game/icon-book.png"),
  iconGear: require("../../assets/game/icon-gear.png"),
  iconWifi: require("../../assets/game/icon-wifi.png"),
  iconTarget: require("../../assets/game/icon-target.png"),
  iconHistory: require("../../assets/game/icon-history.png"),
  iconChevron: require("../../assets/game/icon-chevron.png"),
};

/** Character portraits by (lower-case) name; "ty" is you. */
export const PORTRAITS: Record<string, number> = {
  zosia: require("../../assets/game/portrait-zosia.png"),
  kuba: require("../../assets/game/portrait-kuba.png"),
  witek: require("../../assets/game/portrait-witek.png"),
  hela: require("../../assets/game/portrait-hela.png"),
  ola: require("../../assets/game/portrait-ola.png"),
  marek: require("../../assets/game/portrait-marek.png"),
  profesor: require("../../assets/game/portrait-profesor.png"),
  hrabia: require("../../assets/game/portrait-hrabia.png"),
  ty: require("../../assets/game/portrait-you.png"),
};
