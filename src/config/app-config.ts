import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Capitol Alpha",
  version: packageJson.version,
  copyright: `© ${currentYear}, Capitol Alpha.`,
  description: "Track the moves that move markets — Congress trades, whale wallets, and smart money in one premium dashboard.",
  meta: {
    title: "Capitol Alpha — Congress Trades & Crypto Whale Intelligence",
    description:
      "Track the moves that move markets — Congress trades, whale wallets, and smart money in one premium dashboard.",
  },
};
