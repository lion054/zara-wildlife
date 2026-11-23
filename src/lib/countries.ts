/** Countries with their international dialling codes: [ISO 3166 code, name, dialling code without +]. */
export const COUNTRIES: [string, string, string][] = [
  ["AF", "Afghanistan", "93"], ["AL", "Albania", "355"], ["DZ", "Algeria", "213"], ["AD", "Andorra", "376"], ["AO", "Angola", "244"],
  ["AG", "Antigua and Barbuda", "1268"], ["AR", "Argentina", "54"], ["AM", "Armenia", "374"], ["AU", "Australia", "61"], ["AT", "Austria", "43"],
  ["AZ", "Azerbaijan", "994"], ["BS", "Bahamas", "1242"], ["BH", "Bahrain", "973"], ["BD", "Bangladesh", "880"], ["BB", "Barbados", "1246"],
  ["BY", "Belarus", "375"], ["BE", "Belgium", "32"], ["BZ", "Belize", "501"], ["BJ", "Benin", "229"], ["BT", "Bhutan", "975"],
  ["BO", "Bolivia", "591"], ["BA", "Bosnia and Herzegovina", "387"], ["BW", "Botswana", "267"], ["BR", "Brazil", "55"], ["BN", "Brunei", "673"],
  ["BG", "Bulgaria", "359"], ["BF", "Burkina Faso", "226"], ["BI", "Burundi", "257"], ["KH", "Cambodia", "855"], ["CM", "Cameroon", "237"],
  ["CA", "Canada", "1"], ["CV", "Cape Verde", "238"], ["CF", "Central African Republic", "236"], ["TD", "Chad", "235"], ["CL", "Chile", "56"],
  ["CN", "China", "86"], ["CO", "Colombia", "57"], ["KM", "Comoros", "269"], ["CG", "Congo", "242"], ["CD", "Congo (DRC)", "243"],
  ["CR", "Costa Rica", "506"], ["CI", "Côte d’Ivoire", "225"], ["HR", "Croatia", "385"], ["CU", "Cuba", "53"], ["CY", "Cyprus", "357"],
  ["CZ", "Czechia", "420"], ["DK", "Denmark", "45"], ["DJ", "Djibouti", "253"], ["DM", "Dominica", "1767"], ["DO", "Dominican Republic", "1809"],
  ["EC", "Ecuador", "593"], ["EG", "Egypt", "20"], ["SV", "El Salvador", "503"], ["GQ", "Equatorial Guinea", "240"], ["ER", "Eritrea", "291"],
  ["EE", "Estonia", "372"], ["SZ", "Eswatini", "268"], ["ET", "Ethiopia", "251"], ["FJ", "Fiji", "679"], ["FI", "Finland", "358"],
  ["FR", "France", "33"], ["GA", "Gabon", "241"], ["GM", "Gambia", "220"], ["GE", "Georgia", "995"], ["DE", "Germany", "49"],
  ["GH", "Ghana", "233"], ["GR", "Greece", "30"], ["GD", "Grenada", "1473"], ["GT", "Guatemala", "502"], ["GN", "Guinea", "224"],
  ["GW", "Guinea-Bissau", "245"], ["GY", "Guyana", "592"], ["HT", "Haiti", "509"], ["HN", "Honduras", "504"], ["HK", "Hong Kong", "852"],
  ["HU", "Hungary", "36"], ["IS", "Iceland", "354"], ["IN", "India", "91"], ["ID", "Indonesia", "62"], ["IR", "Iran", "98"],
  ["IQ", "Iraq", "964"], ["IE", "Ireland", "353"], ["IL", "Israel", "972"], ["IT", "Italy", "39"], ["JM", "Jamaica", "1876"],
  ["JP", "Japan", "81"], ["JO", "Jordan", "962"], ["KZ", "Kazakhstan", "7"], ["KE", "Kenya", "254"], ["KI", "Kiribati", "686"],
  ["KW", "Kuwait", "965"], ["KG", "Kyrgyzstan", "996"], ["LA", "Laos", "856"], ["LV", "Latvia", "371"], ["LB", "Lebanon", "961"],
  ["LS", "Lesotho", "266"], ["LR", "Liberia", "231"], ["LY", "Libya", "218"], ["LI", "Liechtenstein", "423"], ["LT", "Lithuania", "370"],
  ["LU", "Luxembourg", "352"], ["MO", "Macao", "853"], ["MG", "Madagascar", "261"], ["MW", "Malawi", "265"], ["MY", "Malaysia", "60"],
  ["MV", "Maldives", "960"], ["ML", "Mali", "223"], ["MT", "Malta", "356"], ["MH", "Marshall Islands", "692"], ["MR", "Mauritania", "222"],
  ["MU", "Mauritius", "230"], ["MX", "Mexico", "52"], ["FM", "Micronesia", "691"], ["MD", "Moldova", "373"], ["MC", "Monaco", "377"],
  ["MN", "Mongolia", "976"], ["ME", "Montenegro", "382"], ["MA", "Morocco", "212"], ["MZ", "Mozambique", "258"], ["MM", "Myanmar", "95"],
  ["NA", "Namibia", "264"], ["NR", "Nauru", "674"], ["NP", "Nepal", "977"], ["NL", "Netherlands", "31"], ["NZ", "New Zealand", "64"],
  ["NI", "Nicaragua", "505"], ["NE", "Niger", "227"], ["NG", "Nigeria", "234"], ["KP", "North Korea", "850"], ["MK", "North Macedonia", "389"],
  ["NO", "Norway", "47"], ["OM", "Oman", "968"], ["PK", "Pakistan", "92"], ["PW", "Palau", "680"], ["PS", "Palestine", "970"],
  ["PA", "Panama", "507"], ["PG", "Papua New Guinea", "675"], ["PY", "Paraguay", "595"], ["PE", "Peru", "51"], ["PH", "Philippines", "63"],
  ["PL", "Poland", "48"], ["PT", "Portugal", "351"], ["PR", "Puerto Rico", "1787"], ["QA", "Qatar", "974"], ["RE", "Réunion", "262"],
  ["RO", "Romania", "40"], ["RU", "Russia", "7"], ["RW", "Rwanda", "250"], ["KN", "Saint Kitts and Nevis", "1869"], ["LC", "Saint Lucia", "1758"],
  ["VC", "Saint Vincent and the Grenadines", "1784"], ["WS", "Samoa", "685"], ["SM", "San Marino", "378"], ["ST", "São Tomé and Príncipe", "239"],
  ["SA", "Saudi Arabia", "966"], ["SN", "Senegal", "221"], ["RS", "Serbia", "381"], ["SC", "Seychelles", "248"], ["SL", "Sierra Leone", "232"],
  ["SG", "Singapore", "65"], ["SK", "Slovakia", "421"], ["SI", "Slovenia", "386"], ["SB", "Solomon Islands", "677"], ["SO", "Somalia", "252"],
  ["ZA", "South Africa", "27"], ["KR", "South Korea", "82"], ["SS", "South Sudan", "211"], ["ES", "Spain", "34"], ["LK", "Sri Lanka", "94"],
  ["SD", "Sudan", "249"], ["SR", "Suriname", "597"], ["SE", "Sweden", "46"], ["CH", "Switzerland", "41"], ["SY", "Syria", "963"],
  ["TW", "Taiwan", "886"], ["TJ", "Tajikistan", "992"], ["TZ", "Tanzania", "255"], ["TH", "Thailand", "66"], ["TL", "Timor-Leste", "670"],
  ["TG", "Togo", "228"], ["TO", "Tonga", "676"], ["TT", "Trinidad and Tobago", "1868"], ["TN", "Tunisia", "216"], ["TR", "Türkiye", "90"],
  ["TM", "Turkmenistan", "993"], ["TV", "Tuvalu", "688"], ["UG", "Uganda", "256"], ["UA", "Ukraine", "380"], ["AE", "United Arab Emirates", "971"],
  ["GB", "United Kingdom", "44"], ["US", "United States", "1"], ["UY", "Uruguay", "598"], ["UZ", "Uzbekistan", "998"], ["VU", "Vanuatu", "678"],
  ["VA", "Vatican City", "39"], ["VE", "Venezuela", "58"], ["VN", "Vietnam", "84"], ["YE", "Yemen", "967"], ["ZM", "Zambia", "260"],
  ["ZW", "Zimbabwe", "263"],
];

/** Where most of the company's travellers come from, offered first. */
export const COMMON = ["US", "GB", "DE", "NL", "FR", "CA", "AU", "TZ", "KE", "ZA", "IN", "AE"];

/** 🇹🇿 from "TZ". */
export const flag = (iso: string) => String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));

/** The visitor's likely country, from the browser's language region or time zone; null when it cannot tell. */
export function guessCountry(): string | null {
  if (typeof navigator === "undefined") return null;
  // The time zone says more about where someone is than the language they set ("en-US" is everywhere).
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  if (TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
  for (const l of navigator.languages ?? [navigator.language]) {
    const region = l?.split("-")[1]?.toUpperCase();
    if (region && COUNTRIES.some((c) => c[0] === region)) return region;
  }
  return null;
}

/** Time zones that name one country, for the common travellers' countries. */
const TZ_COUNTRY: Record<string, string> = {
  "Africa/Dar_es_Salaam": "TZ", "Africa/Nairobi": "KE", "Africa/Kampala": "UG", "Africa/Kigali": "RW", "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG", "Africa/Cairo": "EG", "Africa/Casablanca": "MA", "Africa/Addis_Ababa": "ET", "Africa/Harare": "ZW", "Africa/Lusaka": "ZM",
  "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Berlin": "DE", "Europe/Amsterdam": "NL", "Europe/Brussels": "BE", "Europe/Paris": "FR",
  "Europe/Madrid": "ES", "Europe/Lisbon": "PT", "Europe/Rome": "IT", "Europe/Zurich": "CH", "Europe/Vienna": "AT", "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO", "Europe/Copenhagen": "DK", "Europe/Helsinki": "FI", "Europe/Warsaw": "PL", "Europe/Prague": "CZ", "Europe/Budapest": "HU",
  "Europe/Athens": "GR", "Europe/Istanbul": "TR", "Europe/Moscow": "RU", "Europe/Kyiv": "UA", "Asia/Dubai": "AE", "Asia/Riyadh": "SA",
  "Asia/Qatar": "QA", "Asia/Kolkata": "IN", "Asia/Singapore": "SG", "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Hong_Kong": "HK",
  "Asia/Seoul": "KR", "Asia/Jerusalem": "IL", "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Perth": "AU",
  "Australia/Brisbane": "AU", "Pacific/Auckland": "NZ", "America/Toronto": "CA", "America/Vancouver": "CA", "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR", "America/Argentina/Buenos_Aires": "AR",
};

/** "+44 7700 900123" → the country with the longest matching code (UK), and the rest of the number. */
export function splitIntl(raw: string): { iso: string; rest: string } | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits.startsWith("+")) return null;
  const n = digits.slice(1);
  let best: [string, string, string] | null = null;
  for (const c of COUNTRIES) if (n.startsWith(c[2]) && (!best || c[2].length > best[2].length)) best = c;
  if (!best) return null;
  // Codes several countries share (+1, +7): keep the more common one.
  const iso = best[2] === "1" ? "US" : best[2] === "7" ? "RU" : best[0];
  return { iso, rest: raw.replace(/^\s*\+?\s*/, "").replace(new RegExp(`^${best[2].split("").join("\\s*")}\\s*`), "").trim() };
}
