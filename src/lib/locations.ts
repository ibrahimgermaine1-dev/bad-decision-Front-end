/**
 * BAD DECISION — Cascading Location Data
 * Comprehensive continent → country → state/region mapping
 */

export interface LocationOption {
  value: string;
  label: string;
}

export interface CountryData {
  value: string;
  label: string;
  states: LocationOption[];
}

export interface ContinentData {
  value: string;
  label: string;
  emoji: string;
  countries: CountryData[];
}

export const locationData: ContinentData[] = [
  {
    value: "africa",
    label: "Africa",
    emoji: "🌍",
    countries: [
      {
        value: "nigeria",
        label: "Nigeria",
        states: [
          { value: "abia", label: "Abia" },
          { value: "adamawa", label: "Adamawa" },
          { value: "akwa_ibom", label: "Akwa Ibom" },
          { value: "anambra", label: "Anambra" },
          { value: "bauchi", label: "Bauchi" },
          { value: "bayelsa", label: "Bayelsa" },
          { value: "benue", label: "Benue" },
          { value: "borno", label: "Borno" },
          { value: "cross_river", label: "Cross River" },
          { value: "delta", label: "Delta" },
          { value: "ebonyi", label: "Ebonyi" },
          { value: "edo", label: "Edo" },
          { value: "ekiti", label: "Ekiti" },
          { value: "enugu", label: "Enugu" },
          { value: "fct", label: "FCT (Abuja)" },
          { value: "gombe", label: "Gombe" },
          { value: "imo", label: "Imo" },
          { value: "jigawa", label: "Jigawa" },
          { value: "kaduna", label: "Kaduna" },
          { value: "kano", label: "Kano" },
          { value: "katsina", label: "Katsina" },
          { value: "kebbi", label: "Kebbi" },
          { value: "kogi", label: "Kogi" },
          { value: "kwara", label: "Kwara" },
          { value: "lagos", label: "Lagos" },
          { value: "nasarawa", label: "Nasarawa" },
          { value: "niger", label: "Niger" },
          { value: "ogun", label: "Ogun" },
          { value: "ondo", label: "Ondo" },
          { value: "osun", label: "Osun" },
          { value: "oyo", label: "Oyo" },
          { value: "plateau", label: "Plateau" },
          { value: "rivers", label: "Rivers" },
          { value: "sokoto", label: "Sokoto" },
          { value: "taraba", label: "Taraba" },
          { value: "yobe", label: "Yobe" },
          { value: "zamfara", label: "Zamfara" },
        ],
      },
      {
        value: "south_africa",
        label: "South Africa",
        states: [
          { value: "eastern_cape", label: "Eastern Cape" },
          { value: "free_state", label: "Free State" },
          { value: "gauteng", label: "Gauteng" },
          { value: "kwazulu_natal", label: "KwaZulu-Natal" },
          { value: "limpopo", label: "Limpopo" },
          { value: "mpumalanga", label: "Mpumalanga" },
          { value: "north_west", label: "North West" },
          { value: "northern_cape", label: "Northern Cape" },
          { value: "western_cape", label: "Western Cape" },
        ],
      },
      {
        value: "kenya",
        label: "Kenya",
        states: [
          { value: "nairobi", label: "Nairobi" },
          { value: "mombasa", label: "Mombasa" },
          { value: "kisumu", label: "Kisumu" },
          { value: "nakuru", label: "Nakuru" },
          { value: "eldoret", label: "Eldoret" },
          { value: "kiambu", label: "Kiambu" },
          { value: "machakos", label: "Machakos" },
          { value: "nyeri", label: "Nyeri" },
          { value: "meru", label: "Meru" },
          { value: "garissa", label: "Garissa" },
          { value: "kakamega", label: "Kakamega" },
          { value: "bungoma", label: "Bungoma" },
          { value: "malindi", label: "Malindi" },
          { value: "kitale", label: "Kitale" },
          { value: "thika", label: "Thika" },
        ],
      },
      {
        value: "egypt",
        label: "Egypt",
        states: [
          { value: "cairo", label: "Cairo" },
          { value: "alexandria", label: "Alexandria" },
          { value: "giza", label: "Giza" },
          { value: "shubra_el_kheima", label: "Shubra El Kheima" },
          { value: "portsaid", label: "Port Said" },
          { value: "suez", label: "Suez" },
          { value: "luxor", label: "Luxor" },
          { value: "aswan", label: "Aswan" },
          { value: "tanta", label: "Tanta" },
          { value: "mansoura", label: "Mansoura" },
        ],
      },
      {
        value: "ghana",
        label: "Ghana",
        states: [
          { value: "greater_accra", label: "Greater Accra" },
          { value: "ashanti", label: "Ashanti" },
          { value: "western", label: "Western" },
          { value: "eastern", label: "Eastern" },
          { value: "central", label: "Central" },
          { value: "volta", label: "Volta" },
          { value: "northern", label: "Northern" },
          { value: "upper_east", label: "Upper East" },
          { value: "upper_west", label: "Upper West" },
          { value: "brong_ahafo", label: "Brong-Ahafo" },
        ],
      },
      {
        value: "ethiopia",
        label: "Ethiopia",
        states: [
          { value: "addis_ababa", label: "Addis Ababa" },
          { value: "oromia", label: "Oromia" },
          { value: "amhara", label: "Amhara" },
          { value: "tigray", label: "Tigray" },
          { value: "snnpr", label: "SNNPR" },
          { value: "dire_dawa", label: "Dire Dawa" },
        ],
      },
      {
        value: "tanzania",
        label: "Tanzania",
        states: [
          { value: "dar_es_salaam", label: "Dar es Salaam" },
          { value: "dodoma", label: "Dodoma" },
          { value: "mwanza", label: "Mwanza" },
          { value: "arusha", label: "Arusha" },
          { value: "zanzibar", label: "Zanzibar" },
          { value: "mbeya", label: "Mbeya" },
        ],
      },
      {
        value: "morocco",
        label: "Morocco",
        states: [
          { value: "casablanca", label: "Casablanca" },
          { value: "rabat", label: "Rabat" },
          { value: "marrakech", label: "Marrakech" },
          { value: "fes", label: "Fès" },
          { value: "tangier", label: "Tangier" },
          { value: "agadir", label: "Agadir" },
        ],
      },
      {
        value: "rwanda",
        label: "Rwanda",
        states: [
          { value: "kigali", label: "Kigali" },
          { value: "eastern", label: "Eastern Province" },
          { value: "northern", label: "Northern Province" },
          { value: "southern", label: "Southern Province" },
          { value: "western", label: "Western Province" },
        ],
      },
      {
        value: "uganda",
        label: "Uganda",
        states: [
          { value: "kampala", label: "Kampala" },
          { value: "entebbe", label: "Entebbe" },
          { value: "jinja", label: "Jinja" },
          { value: "mbarara", label: "Mbarara" },
          { value: "gulu", label: "Gulu" },
        ],
      },
      {
        value: "cameroon",
        label: "Cameroon",
        states: [
          { value: "littoral", label: "Littoral" },
          { value: "centre", label: "Centre" },
          { value: "southwest", label: "South-West" },
          { value: "northwest", label: "North-West" },
          { value: "far_north", label: "Far North" },
        ],
      },
    ],
  },
  {
    value: "north_america",
    label: "North America",
    emoji: "🌎",
    countries: [
      {
        value: "usa",
        label: "United States",
        states: [
          { value: "alabama", label: "Alabama" },
          { value: "alaska", label: "Alaska" },
          { value: "arizona", label: "Arizona" },
          { value: "arkansas", label: "Arkansas" },
          { value: "california", label: "California" },
          { value: "colorado", label: "Colorado" },
          { value: "connecticut", label: "Connecticut" },
          { value: "delaware", label: "Delaware" },
          { value: "florida", label: "Florida" },
          { value: "georgia", label: "Georgia" },
          { value: "hawaii", label: "Hawaii" },
          { value: "idaho", label: "Idaho" },
          { value: "illinois", label: "Illinois" },
          { value: "indiana", label: "Indiana" },
          { value: "iowa", label: "Iowa" },
          { value: "kansas", label: "Kansas" },
          { value: "kentucky", label: "Kentucky" },
          { value: "louisiana", label: "Louisiana" },
          { value: "maine", label: "Maine" },
          { value: "maryland", label: "Maryland" },
          { value: "massachusetts", label: "Massachusetts" },
          { value: "michigan", label: "Michigan" },
          { value: "minnesota", label: "Minnesota" },
          { value: "mississippi", label: "Mississippi" },
          { value: "missouri", label: "Missouri" },
          { value: "montana", label: "Montana" },
          { value: "nebraska", label: "Nebraska" },
          { value: "nevada", label: "Nevada" },
          { value: "new_hampshire", label: "New Hampshire" },
          { value: "new_jersey", label: "New Jersey" },
          { value: "new_mexico", label: "New Mexico" },
          { value: "new_york", label: "New York" },
          { value: "north_carolina", label: "North Carolina" },
          { value: "north_dakota", label: "North Dakota" },
          { value: "ohio", label: "Ohio" },
          { value: "oklahoma", label: "Oklahoma" },
          { value: "oregon", label: "Oregon" },
          { value: "pennsylvania", label: "Pennsylvania" },
          { value: "rhode_island", label: "Rhode Island" },
          { value: "south_carolina", label: "South Carolina" },
          { value: "south_dakota", label: "South Dakota" },
          { value: "tennessee", label: "Tennessee" },
          { value: "texas", label: "Texas" },
          { value: "utah", label: "Utah" },
          { value: "vermont", label: "Vermont" },
          { value: "virginia", label: "Virginia" },
          { value: "washington", label: "Washington" },
          { value: "west_virginia", label: "West Virginia" },
          { value: "wisconsin", label: "Wisconsin" },
          { value: "wyoming", label: "Wyoming" },
          { value: "dc", label: "Washington D.C." },
        ],
      },
      {
        value: "canada",
        label: "Canada",
        states: [
          { value: "ontario", label: "Ontario" },
          { value: "quebec", label: "Quebec" },
          { value: "british_columbia", label: "British Columbia" },
          { value: "alberta", label: "Alberta" },
          { value: "manitoba", label: "Manitoba" },
          { value: "saskatchewan", label: "Saskatchewan" },
          { value: "nova_scotia", label: "Nova Scotia" },
          { value: "new_brunswick", label: "New Brunswick" },
          { value: "newfoundland", label: "Newfoundland and Labrador" },
          { value: "pei", label: "Prince Edward Island" },
          { value: "northwest_territories", label: "Northwest Territories" },
          { value: "yukon", label: "Yukon" },
          { value: "nunavut", label: "Nunavut" },
        ],
      },
      {
        value: "mexico",
        label: "Mexico",
        states: [
          { value: "cdmx", label: "Ciudad de México" },
          { value: "jalisco", label: "Jalisco" },
          { value: "nuevo_leon", label: "Nuevo León" },
          { value: "queretaro", label: "Querétaro" },
          { value: "puebla", label: "Puebla" },
          { value: "guanajuato", label: "Guanajuato" },
          { value: "chihuahua", label: "Chihuahua" },
          { value: "yucatan", label: "Yucatán" },
          { value: "baja_california", label: "Baja California" },
          { value: "sonora", label: "Sonora" },
          { value: "veracruz", label: "Veracruz" },
          { value: "mexico_state", label: "State of Mexico" },
        ],
      },
    ],
  },
  {
    value: "south_america",
    label: "South America",
    emoji: "🌎",
    countries: [
      {
        value: "brazil",
        label: "Brazil",
        states: [
          { value: "sao_paulo", label: "São Paulo" },
          { value: "rio_de_janeiro", label: "Rio de Janeiro" },
          { value: "minas_gerais", label: "Minas Gerais" },
          { value: "bahia", label: "Bahia" },
          { value: "parana", label: "Paraná" },
          { value: "rio_grande_do_sul", label: "Rio Grande do Sul" },
          { value: "pernambuco", label: "Pernambuco" },
          { value: "ceara", label: "Ceará" },
          { value: "goias", label: "Goiás" },
          { value: "distrito_federal", label: "Distrito Federal" },
          { value: "santa_catarina", label: "Santa Catarina" },
          { value: "amazonas", label: "Amazonas" },
        ],
      },
      {
        value: "argentina",
        label: "Argentina",
        states: [
          { value: "buenos_aires", label: "Buenos Aires" },
          { value: "cordoba", label: "Córdoba" },
          { value: "santa_fe", label: "Santa Fe" },
          { value: "mendoza", label: "Mendoza" },
          { value: "tucuman", label: "Tucumán" },
          { value: "rosario", label: "Rosario" },
        ],
      },
      {
        value: "colombia",
        label: "Colombia",
        states: [
          { value: "bogota", label: "Bogotá" },
          { value: "antioquia", label: "Antioquia" },
          { value: "valle_del_cauca", label: "Valle del Cauca" },
          { value: "cundinamarca", label: "Cundinamarca" },
          { value: "santander", label: "Santander" },
          { value: "atlantico", label: "Atlántico" },
        ],
      },
      {
        value: "chile",
        label: "Chile",
        states: [
          { value: "santiago", label: "Santiago" },
          { value: "valparaiso", label: "Valparaíso" },
          { value: "concepcion", label: "Concepción" },
          { value: "atacama", label: "Atacama" },
        ],
      },
      {
        value: "peru",
        label: "Peru",
        states: [
          { value: "lima", label: "Lima" },
          { value: "cusco", label: "Cusco" },
          { value: "arequipa", label: "Arequipa" },
          { value: "trujillo", label: "Trujillo" },
        ],
      },
    ],
  },
  {
    value: "europe",
    label: "Europe",
    emoji: "🇪🇺",
    countries: [
      {
        value: "uk",
        label: "United Kingdom",
        states: [
          { value: "england", label: "England" },
          { value: "scotland", label: "Scotland" },
          { value: "wales", label: "Wales" },
          { value: "northern_ireland", label: "Northern Ireland" },
          { value: "london", label: "Greater London" },
          { value: "manchester", label: "Greater Manchester" },
          { value: "birmingham", label: "West Midlands" },
          { value: "leeds", label: "West Yorkshire" },
          { value: "edinburgh", label: "Edinburgh" },
        ],
      },
      {
        value: "germany",
        label: "Germany",
        states: [
          { value: "bavaria", label: "Bavaria" },
          { value: "berlin", label: "Berlin" },
          { value: "hamburg", label: "Hamburg" },
          { value: "hesse", label: "Hesse" },
          { value: "north_rhine_westphalia", label: "North Rhine-Westphalia" },
          { value: "baden_wurttemberg", label: "Baden-Württemberg" },
          { value: "saxony", label: "Saxony" },
          { value: "lower_saxony", label: "Lower Saxony" },
          { value: "rhineland_palatinate", label: "Rhineland-Palatinate" },
          { value: "bremen", label: "Bremen" },
        ],
      },
      {
        value: "france",
        label: "France",
        states: [
          { value: "ile_de_france", label: "Île-de-France" },
          { value: "provence_alpes_cote_dazur", label: "Provence-Alpes-Côte d'Azur" },
          { value: "auvergne_rhone_alpes", label: "Auvergne-Rhône-Alpes" },
          { value: "occitanie", label: "Occitanie" },
          { value: "nouvelle_aquitaine", label: "Nouvelle-Aquitaine" },
          { value: "hauts_de_france", label: "Hauts-de-France" },
          { value: "brittany", label: "Brittany" },
          { value: "normandy", label: "Normandy" },
        ],
      },
      {
        value: "spain",
        label: "Spain",
        states: [
          { value: "madrid", label: "Madrid" },
          { value: "catalonia", label: "Catalonia" },
          { value: "andalusia", label: "Andalusia" },
          { value: "valencia", label: "Valencia" },
          { value: "basque_country", label: "Basque Country" },
          { value: "galicia", label: "Galicia" },
        ],
      },
      {
        value: "italy",
        label: "Italy",
        states: [
          { value: "lazio", label: "Lazio" },
          { value: "lombardy", label: "Lombardy" },
          { value: "campania", label: "Campania" },
          { value: "veneto", label: "Veneto" },
          { value: "emilia_romagna", label: "Emilia-Romagna" },
          { value: "tuscany", label: "Tuscany" },
          { value: "piedmont", label: "Piedmont" },
          { value: "sicily", label: "Sicily" },
        ],
      },
      {
        value: "netherlands",
        label: "Netherlands",
        states: [
          { value: "north_holland", label: "North Holland" },
          { value: "south_holland", label: "South Holland" },
          { value: "utrecht", label: "Utrecht" },
          { value: "north_brabant", label: "North Brabant" },
          { value: "gelderland", label: "Gelderland" },
        ],
      },
      {
        value: "sweden",
        label: "Sweden",
        states: [
          { value: "stockholm", label: "Stockholm" },
          { value: "vastra_gotaland", label: "Västra Götaland" },
          { value: "skane", label: "Skåne" },
          { value: "uppsala", label: "Uppsala" },
        ],
      },
      {
        value: "switzerland",
        label: "Switzerland",
        states: [
          { value: "zurich", label: "Zurich" },
          { value: "geneva", label: "Geneva" },
          { value: "bern", label: "Bern" },
          { value: "basel", label: "Basel" },
          { value: "lausanne", label: "Lausanne" },
        ],
      },
      {
        value: "ireland",
        label: "Ireland",
        states: [
          { value: "dublin", label: "Dublin" },
          { value: "cork", label: "Cork" },
          { value: "galway", label: "Galway" },
          { value: "limerick", label: "Limerick" },
        ],
      },
      {
        value: "portugal",
        label: "Portugal",
        states: [
          { value: "lisbon", label: "Lisbon" },
          { value: "porto", label: "Porto" },
          { value: "algarve", label: "Algarve" },
          { value: "madeira", label: "Madeira" },
        ],
      },
      {
        value: "poland",
        label: "Poland",
        states: [
          { value: "mazowieckie", label: "Masovian" },
          { value: "slaskie", label: "Silesian" },
          { value: "wielkopolskie", label: "Greater Poland" },
          { value: "malopolskie", label: "Lesser Poland" },
        ],
      },
    ],
  },
  {
    value: "asia",
    label: "Asia",
    emoji: "🌏",
    countries: [
      {
        value: "india",
        label: "India",
        states: [
          { value: "maharashtra", label: "Maharashtra" },
          { value: "karnataka", label: "Karnataka" },
          { value: "tamil_nadu", label: "Tamil Nadu" },
          { value: "telangana", label: "Telangana" },
          { value: "gujarat", label: "Gujarat" },
          { value: "delhi", label: "Delhi" },
          { value: "west_bengal", label: "West Bengal" },
          { value: "rajasthan", label: "Rajasthan" },
          { value: "kerala", label: "Kerala" },
          { value: "uttar_pradesh", label: "Uttar Pradesh" },
          { value: "madhya_pradesh", label: "Madhya Pradesh" },
          { value: "haryana", label: "Haryana" },
          { value: "punjab", label: "Punjab" },
          { value: "andhra_pradesh", label: "Andhra Pradesh" },
          { value: "odisha", label: "Odisha" },
          { value: "bihar", label: "Bihar" },
        ],
      },
      {
        value: "china",
        label: "China",
        states: [
          { value: "guangdong", label: "Guangdong" },
          { value: "shanghai", label: "Shanghai" },
          { value: "beijing", label: "Beijing" },
          { value: "zhejiang", label: "Zhejiang" },
          { value: "jiangsu", label: "Jiangsu" },
          { value: "sichuan", label: "Sichuan" },
          { value: "hubei", label: "Hubei" },
          { value: "fujian", label: "Fujian" },
          { value: "shandong", label: "Shandong" },
          { value: "henan", label: "Henan" },
        ],
      },
      {
        value: "japan",
        label: "Japan",
        states: [
          { value: "tokyo", label: "Tokyo" },
          { value: "osaka", label: "Osaka" },
          { value: "kanagawa", label: "Kanagawa" },
          { value: "aichi", label: "Aichi" },
          { value: "fukuoka", label: "Fukuoka" },
          { value: "hyogo", label: "Hyōgo" },
          { value: "hokkaido", label: "Hokkaido" },
          { value: "kyoto", label: "Kyoto" },
          { value: "saitama", label: "Saitama" },
          { value: "chiba", label: "Chiba" },
        ],
      },
      {
        value: "uae",
        label: "United Arab Emirates",
        states: [
          { value: "dubai", label: "Dubai" },
          { value: "abu_dhabi", label: "Abu Dhabi" },
          { value: "sharjah", label: "Sharjah" },
          { value: "ajman", label: "Ajman" },
          { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
          { value: "fujairah", label: "Fujairah" },
          { value: "umm_al_quwain", label: "Umm Al Quwain" },
        ],
      },
      {
        value: "singapore",
        label: "Singapore",
        states: [
          { value: "central_region", label: "Central Region" },
          { value: "east_region", label: "East Region" },
          { value: "north_region", label: "North Region" },
          { value: "north_east_region", label: "North-East Region" },
          { value: "west_region", label: "West Region" },
        ],
      },
      {
        value: "south_korea",
        label: "South Korea",
        states: [
          { value: "seoul", label: "Seoul" },
          { value: "busan", label: "Busan" },
          { value: "incheon", label: "Incheon" },
          { value: "daegu", label: "Daegu" },
          { value: "daejeon", label: "Daejeon" },
          { value: "gwangju", label: "Gwangju" },
        ],
      },
      {
        value: "saudi_arabia",
        label: "Saudi Arabia",
        states: [
          { value: "riyadh", label: "Riyadh" },
          { value: "jeddah", label: "Jeddah" },
          { value: "makkah", label: "Makkah" },
          { value: "dammam", label: "Dammam" },
          { value: "madinah", label: "Madinah" },
        ],
      },
      {
        value: "israel",
        label: "Israel",
        states: [
          { value: "tel_aviv", label: "Tel Aviv" },
          { value: "jerusalem", label: "Jerusalem" },
          { value: "haifa", label: "Haifa" },
          { value: "beersheva", label: "Be'er Sheva" },
        ],
      },
      {
        value: "thailand",
        label: "Thailand",
        states: [
          { value: "bangkok", label: "Bangkok" },
          { value: "chiang_mai", label: "Chiang Mai" },
          { value: "phuket", label: "Phuket" },
          { value: "pattaya", label: "Pattaya" },
        ],
      },
      {
        value: "indonesia",
        label: "Indonesia",
        states: [
          { value: "jakarta", label: "Jakarta" },
          { value: "bali", label: "Bali" },
          { value: "surabaya", label: "Surabaya" },
          { value: "bandung", label: "Bandung" },
          { value: "medan", label: "Medan" },
        ],
      },
      {
        value: "philippines",
        label: "Philippines",
        states: [
          { value: "metro_manila", label: "Metro Manila" },
          { value: "cebu", label: "Cebu" },
          { value: "davao", label: "Davao" },
          { value: "quezon_city", label: "Quezon City" },
        ],
      },
      {
        value: "malaysia",
        label: "Malaysia",
        states: [
          { value: "kuala_lumpur", label: "Kuala Lumpur" },
          { value: "selangor", label: "Selangor" },
          { value: "penang", label: "Penang" },
          { value: "johor", label: "Johor" },
        ],
      },
      {
        value: "turkey",
        label: "Turkey",
        states: [
          { value: "istanbul", label: "Istanbul" },
          { value: "ankara", label: "Ankara" },
          { value: "izmir", label: "Izmir" },
          { value: "antalya", label: "Antalya" },
          { value: "bursa", label: "Bursa" },
        ],
      },
    ],
  },
  {
    value: "oceania",
    label: "Oceania",
    emoji: "🌏",
    countries: [
      {
        value: "australia",
        label: "Australia",
        states: [
          { value: "new_south_wales", label: "New South Wales" },
          { value: "victoria", label: "Victoria" },
          { value: "queensland", label: "Queensland" },
          { value: "western_australia", label: "Western Australia" },
          { value: "south_australia", label: "South Australia" },
          { value: "tasmania", label: "Tasmania" },
          { value: "act", label: "Australian Capital Territory" },
          { value: "northern_territory", label: "Northern Territory" },
        ],
      },
      {
        value: "new_zealand",
        label: "New Zealand",
        states: [
          { value: "auckland", label: "Auckland" },
          { value: "wellington", label: "Wellington" },
          { value: "canterbury", label: "Canterbury" },
          { value: "otago", label: "Otago" },
          { value: "waikato", label: "Waikato" },
          { value: "bay_of_plenty", label: "Bay of Plenty" },
        ],
      },
    ],
  },
];

export function getCountriesForContinent(continentValue: string): CountryData[] {
  const continent = locationData.find((c) => c.value === continentValue);
  return continent?.countries || [];
}

export function getStatesForCountry(continentValue: string, countryValue: string): LocationOption[] {
  const countries = getCountriesForContinent(continentValue);
  const country = countries.find((c) => c.value === countryValue);
  return country?.states || [];
}

export function getContinentLabel(value: string): string {
  const c = locationData.find((c) => c.value === value);
  return c ? `${c.emoji} ${c.label}` : "";
}

export function getCountryLabel(continentValue: string, countryValue: string): string {
  const countries = getCountriesForContinent(continentValue);
  const country = countries.find((c) => c.value === countryValue);
  return country?.label || "";
}
