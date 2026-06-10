/**
 * Bad Decision AI — Location Data
 * Extensive country/state data for the location selector.
 * Country flags use emoji from country code conversion.
 */

// ============================================================
// COUNTRY CODE TO EMOJI FLAG
// ============================================================
export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return ''
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  )
}

// ============================================================
// COUNTRY DATA
// ============================================================
export interface Country {
  code: string
  name: string
  flag: string
  phoneCode: string
  popular?: boolean
}

export const COUNTRIES: Country[] = [
  // Africa - Popular
  { code: 'NG', name: 'Nigeria', flag: countryCodeToFlag('NG'), phoneCode: '+234', popular: true },
  { code: 'ZA', name: 'South Africa', flag: countryCodeToFlag('ZA'), phoneCode: '+27', popular: true },
  { code: 'GH', name: 'Ghana', flag: countryCodeToFlag('GH'), phoneCode: '+233', popular: true },
  { code: 'KE', name: 'Kenya', flag: countryCodeToFlag('KE'), phoneCode: '+254', popular: true },
  { code: 'EG', name: 'Egypt', flag: countryCodeToFlag('EG'), phoneCode: '+20', popular: true },
  // Africa - Other
  { code: 'DZ', name: 'Algeria', flag: countryCodeToFlag('DZ'), phoneCode: '+213' },
  { code: 'AO', name: 'Angola', flag: countryCodeToFlag('AO'), phoneCode: '+244' },
  { code: 'BJ', name: 'Benin', flag: countryCodeToFlag('BJ'), phoneCode: '+229' },
  { code: 'BW', name: 'Botswana', flag: countryCodeToFlag('BW'), phoneCode: '+267' },
  { code: 'BF', name: 'Burkina Faso', flag: countryCodeToFlag('BF'), phoneCode: '+226' },
  { code: 'BI', name: 'Burundi', flag: countryCodeToFlag('BI'), phoneCode: '+257' },
  { code: 'CM', name: 'Cameroon', flag: countryCodeToFlag('CM'), phoneCode: '+237' },
  { code: 'CV', name: 'Cape Verde', flag: countryCodeToFlag('CV'), phoneCode: '+238' },
  { code: 'CF', name: 'Central African Republic', flag: countryCodeToFlag('CF'), phoneCode: '+236' },
  { code: 'TD', name: 'Chad', flag: countryCodeToFlag('TD'), phoneCode: '+235' },
  { code: 'CG', name: 'Congo', flag: countryCodeToFlag('CG'), phoneCode: '+242' },
  { code: 'CD', name: 'DR Congo', flag: countryCodeToFlag('CD'), phoneCode: '+243' },
  { code: 'CI', name: 'Ivory Coast', flag: countryCodeToFlag('CI'), phoneCode: '+225' },
  { code: 'DJ', name: 'Djibouti', flag: countryCodeToFlag('DJ'), phoneCode: '+253' },
  { code: 'ET', name: 'Ethiopia', flag: countryCodeToFlag('ET'), phoneCode: '+251' },
  { code: 'GA', name: 'Gabon', flag: countryCodeToFlag('GA'), phoneCode: '+241' },
  { code: 'GM', name: 'Gambia', flag: countryCodeToFlag('GM'), phoneCode: '+220' },
  { code: 'GN', name: 'Guinea', flag: countryCodeToFlag('GN'), phoneCode: '+224' },
  { code: 'GW', name: 'Guinea-Bissau', flag: countryCodeToFlag('GW'), phoneCode: '+245' },
  { code: 'LS', name: 'Lesotho', flag: countryCodeToFlag('LS'), phoneCode: '+266' },
  { code: 'LR', name: 'Liberia', flag: countryCodeToFlag('LR'), phoneCode: '+231' },
  { code: 'LY', name: 'Libya', flag: countryCodeToFlag('LY'), phoneCode: '+218' },
  { code: 'MG', name: 'Madagascar', flag: countryCodeToFlag('MG'), phoneCode: '+261' },
  { code: 'MW', name: 'Malawi', flag: countryCodeToFlag('MW'), phoneCode: '+265' },
  { code: 'ML', name: 'Mali', flag: countryCodeToFlag('ML'), phoneCode: '+223' },
  { code: 'MR', name: 'Mauritania', flag: countryCodeToFlag('MR'), phoneCode: '+222' },
  { code: 'MU', name: 'Mauritius', flag: countryCodeToFlag('MU'), phoneCode: '+230' },
  { code: 'MA', name: 'Morocco', flag: countryCodeToFlag('MA'), phoneCode: '+212' },
  { code: 'MZ', name: 'Mozambique', flag: countryCodeToFlag('MZ'), phoneCode: '+258' },
  { code: 'NA', name: 'Namibia', flag: countryCodeToFlag('NA'), phoneCode: '+264' },
  { code: 'NE', name: 'Niger', flag: countryCodeToFlag('NE'), phoneCode: '+227' },
  { code: 'RW', name: 'Rwanda', flag: countryCodeToFlag('RW'), phoneCode: '+250' },
  { code: 'SN', name: 'Senegal', flag: countryCodeToFlag('SN'), phoneCode: '+221' },
  { code: 'SL', name: 'Sierra Leone', flag: countryCodeToFlag('SL'), phoneCode: '+232' },
  { code: 'SO', name: 'Somalia', flag: countryCodeToFlag('SO'), phoneCode: '+252' },
  { code: 'SS', name: 'South Sudan', flag: countryCodeToFlag('SS'), phoneCode: '+211' },
  { code: 'SD', name: 'Sudan', flag: countryCodeToFlag('SD'), phoneCode: '+249' },
  { code: 'TZ', name: 'Tanzania', flag: countryCodeToFlag('TZ'), phoneCode: '+255' },
  { code: 'TG', name: 'Togo', flag: countryCodeToFlag('TG'), phoneCode: '+228' },
  { code: 'TN', name: 'Tunisia', flag: countryCodeToFlag('TN'), phoneCode: '+216' },
  { code: 'UG', name: 'Uganda', flag: countryCodeToFlag('UG'), phoneCode: '+256' },
  { code: 'ZM', name: 'Zambia', flag: countryCodeToFlag('ZM'), phoneCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', flag: countryCodeToFlag('ZW'), phoneCode: '+263' },
  // Americas - Popular
  { code: 'US', name: 'United States', flag: countryCodeToFlag('US'), phoneCode: '+1', popular: true },
  { code: 'CA', name: 'Canada', flag: countryCodeToFlag('CA'), phoneCode: '+1', popular: true },
  { code: 'BR', name: 'Brazil', flag: countryCodeToFlag('BR'), phoneCode: '+55', popular: true },
  { code: 'MX', name: 'Mexico', flag: countryCodeToFlag('MX'), phoneCode: '+52', popular: true },
  // Americas - Other
  { code: 'AR', name: 'Argentina', flag: countryCodeToFlag('AR'), phoneCode: '+54' },
  { code: 'CL', name: 'Chile', flag: countryCodeToFlag('CL'), phoneCode: '+56' },
  { code: 'CO', name: 'Colombia', flag: countryCodeToFlag('CO'), phoneCode: '+57' },
  { code: 'CR', name: 'Costa Rica', flag: countryCodeToFlag('CR'), phoneCode: '+506' },
  { code: 'CU', name: 'Cuba', flag: countryCodeToFlag('CU'), phoneCode: '+53' },
  { code: 'DO', name: 'Dominican Republic', flag: countryCodeToFlag('DO'), phoneCode: '+1' },
  { code: 'EC', name: 'Ecuador', flag: countryCodeToFlag('EC'), phoneCode: '+593' },
  { code: 'SV', name: 'El Salvador', flag: countryCodeToFlag('SV'), phoneCode: '+503' },
  { code: 'GT', name: 'Guatemala', flag: countryCodeToFlag('GT'), phoneCode: '+502' },
  { code: 'HT', name: 'Haiti', flag: countryCodeToFlag('HT'), phoneCode: '+509' },
  { code: 'HN', name: 'Honduras', flag: countryCodeToFlag('HN'), phoneCode: '+504' },
  { code: 'JM', name: 'Jamaica', flag: countryCodeToFlag('JM'), phoneCode: '+1' },
  { code: 'NI', name: 'Nicaragua', flag: countryCodeToFlag('NI'), phoneCode: '+505' },
  { code: 'PA', name: 'Panama', flag: countryCodeToFlag('PA'), phoneCode: '+507' },
  { code: 'PY', name: 'Paraguay', flag: countryCodeToFlag('PY'), phoneCode: '+595' },
  { code: 'PE', name: 'Peru', flag: countryCodeToFlag('PE'), phoneCode: '+51' },
  { code: 'PR', name: 'Puerto Rico', flag: countryCodeToFlag('PR'), phoneCode: '+1' },
  { code: 'UY', name: 'Uruguay', flag: countryCodeToFlag('UY'), phoneCode: '+598' },
  { code: 'VE', name: 'Venezuela', flag: countryCodeToFlag('VE'), phoneCode: '+58' },
  // Europe - Popular
  { code: 'GB', name: 'United Kingdom', flag: countryCodeToFlag('GB'), phoneCode: '+44', popular: true },
  { code: 'DE', name: 'Germany', flag: countryCodeToFlag('DE'), phoneCode: '+49', popular: true },
  { code: 'FR', name: 'France', flag: countryCodeToFlag('FR'), phoneCode: '+33', popular: true },
  // Europe - Other
  { code: 'AL', name: 'Albania', flag: countryCodeToFlag('AL'), phoneCode: '+355' },
  { code: 'AT', name: 'Austria', flag: countryCodeToFlag('AT'), phoneCode: '+43' },
  { code: 'BE', name: 'Belgium', flag: countryCodeToFlag('BE'), phoneCode: '+32' },
  { code: 'BG', name: 'Bulgaria', flag: countryCodeToFlag('BG'), phoneCode: '+359' },
  { code: 'HR', name: 'Croatia', flag: countryCodeToFlag('HR'), phoneCode: '+385' },
  { code: 'CZ', name: 'Czech Republic', flag: countryCodeToFlag('CZ'), phoneCode: '+420' },
  { code: 'DK', name: 'Denmark', flag: countryCodeToFlag('DK'), phoneCode: '+45' },
  { code: 'EE', name: 'Estonia', flag: countryCodeToFlag('EE'), phoneCode: '+372' },
  { code: 'FI', name: 'Finland', flag: countryCodeToFlag('FI'), phoneCode: '+358' },
  { code: 'GR', name: 'Greece', flag: countryCodeToFlag('GR'), phoneCode: '+30' },
  { code: 'HU', name: 'Hungary', flag: countryCodeToFlag('HU'), phoneCode: '+36' },
  { code: 'IS', name: 'Iceland', flag: countryCodeToFlag('IS'), phoneCode: '+354' },
  { code: 'IE', name: 'Ireland', flag: countryCodeToFlag('IE'), phoneCode: '+353' },
  { code: 'IT', name: 'Italy', flag: countryCodeToFlag('IT'), phoneCode: '+39' },
  { code: 'LV', name: 'Latvia', flag: countryCodeToFlag('LV'), phoneCode: '+371' },
  { code: 'LT', name: 'Lithuania', flag: countryCodeToFlag('LT'), phoneCode: '+370' },
  { code: 'LU', name: 'Luxembourg', flag: countryCodeToFlag('LU'), phoneCode: '+352' },
  { code: 'MT', name: 'Malta', flag: countryCodeToFlag('MT'), phoneCode: '+356' },
  { code: 'NL', name: 'Netherlands', flag: countryCodeToFlag('NL'), phoneCode: '+31' },
  { code: 'NO', name: 'Norway', flag: countryCodeToFlag('NO'), phoneCode: '+47' },
  { code: 'PL', name: 'Poland', flag: countryCodeToFlag('PL'), phoneCode: '+48' },
  { code: 'PT', name: 'Portugal', flag: countryCodeToFlag('PT'), phoneCode: '+351' },
  { code: 'RO', name: 'Romania', flag: countryCodeToFlag('RO'), phoneCode: '+40' },
  { code: 'RU', name: 'Russia', flag: countryCodeToFlag('RU'), phoneCode: '+7' },
  { code: 'RS', name: 'Serbia', flag: countryCodeToFlag('RS'), phoneCode: '+381' },
  { code: 'SK', name: 'Slovakia', flag: countryCodeToFlag('SK'), phoneCode: '+421' },
  { code: 'SI', name: 'Slovenia', flag: countryCodeToFlag('SI'), phoneCode: '+386' },
  { code: 'ES', name: 'Spain', flag: countryCodeToFlag('ES'), phoneCode: '+34' },
  { code: 'SE', name: 'Sweden', flag: countryCodeToFlag('SE'), phoneCode: '+46' },
  { code: 'CH', name: 'Switzerland', flag: countryCodeToFlag('CH'), phoneCode: '+41' },
  { code: 'UA', name: 'Ukraine', flag: countryCodeToFlag('UA'), phoneCode: '+380' },
  // Asia - Popular
  { code: 'IN', name: 'India', flag: countryCodeToFlag('IN'), phoneCode: '+91', popular: true },
  { code: 'CN', name: 'China', flag: countryCodeToFlag('CN'), phoneCode: '+86', popular: true },
  { code: 'JP', name: 'Japan', flag: countryCodeToFlag('JP'), phoneCode: '+81', popular: true },
  { code: 'SG', name: 'Singapore', flag: countryCodeToFlag('SG'), phoneCode: '+65', popular: true },
  { code: 'AE', name: 'United Arab Emirates', flag: countryCodeToFlag('AE'), phoneCode: '+971', popular: true },
  { code: 'SA', name: 'Saudi Arabia', flag: countryCodeToFlag('SA'), phoneCode: '+966', popular: true },
  // Asia - Other
  { code: 'BD', name: 'Bangladesh', flag: countryCodeToFlag('BD'), phoneCode: '+880' },
  { code: 'KH', name: 'Cambodia', flag: countryCodeToFlag('KH'), phoneCode: '+855' },
  { code: 'HK', name: 'Hong Kong', flag: countryCodeToFlag('HK'), phoneCode: '+852' },
  { code: 'ID', name: 'Indonesia', flag: countryCodeToFlag('ID'), phoneCode: '+62' },
  { code: 'IR', name: 'Iran', flag: countryCodeToFlag('IR'), phoneCode: '+98' },
  { code: 'IQ', name: 'Iraq', flag: countryCodeToFlag('IQ'), phoneCode: '+964' },
  { code: 'IL', name: 'Israel', flag: countryCodeToFlag('IL'), phoneCode: '+972' },
  { code: 'JO', name: 'Jordan', flag: countryCodeToFlag('JO'), phoneCode: '+962' },
  { code: 'KZ', name: 'Kazakhstan', flag: countryCodeToFlag('KZ'), phoneCode: '+7' },
  { code: 'KW', name: 'Kuwait', flag: countryCodeToFlag('KW'), phoneCode: '+965' },
  { code: 'LB', name: 'Lebanon', flag: countryCodeToFlag('LB'), phoneCode: '+961' },
  { code: 'MY', name: 'Malaysia', flag: countryCodeToFlag('MY'), phoneCode: '+60' },
  { code: 'MN', name: 'Mongolia', flag: countryCodeToFlag('MN'), phoneCode: '+976' },
  { code: 'MM', name: 'Myanmar', flag: countryCodeToFlag('MM'), phoneCode: '+95' },
  { code: 'NP', name: 'Nepal', flag: countryCodeToFlag('NP'), phoneCode: '+977' },
  { code: 'PK', name: 'Pakistan', flag: countryCodeToFlag('PK'), phoneCode: '+92' },
  { code: 'PH', name: 'Philippines', flag: countryCodeToFlag('PH'), phoneCode: '+63' },
  { code: 'QA', name: 'Qatar', flag: countryCodeToFlag('QA'), phoneCode: '+974' },
  { code: 'KR', name: 'South Korea', flag: countryCodeToFlag('KR'), phoneCode: '+82' },
  { code: 'LK', name: 'Sri Lanka', flag: countryCodeToFlag('LK'), phoneCode: '+94' },
  { code: 'TW', name: 'Taiwan', flag: countryCodeToFlag('TW'), phoneCode: '+886' },
  { code: 'TH', name: 'Thailand', flag: countryCodeToFlag('TH'), phoneCode: '+66' },
  { code: 'TR', name: 'Turkey', flag: countryCodeToFlag('TR'), phoneCode: '+90' },
  { code: 'VN', name: 'Vietnam', flag: countryCodeToFlag('VN'), phoneCode: '+84' },
  // Oceania
  { code: 'AU', name: 'Australia', flag: countryCodeToFlag('AU'), phoneCode: '+61', popular: true },
  { code: 'NZ', name: 'New Zealand', flag: countryCodeToFlag('NZ'), phoneCode: '+64' },
  { code: 'FJ', name: 'Fiji', flag: countryCodeToFlag('FJ'), phoneCode: '+679' },
  { code: 'PG', name: 'Papua New Guinea', flag: countryCodeToFlag('PG'), phoneCode: '+675' },
]

// ============================================================
// STATE/REGION DATA
// ============================================================
const STATES: Record<string, { code: string; name: string }[]> = {
  NG: [
    { code: 'AB', name: 'Abia' }, { code: 'AD', name: 'Adamawa' },
    { code: 'AK', name: 'Akwa Ibom' }, { code: 'AN', name: 'Anambra' },
    { code: 'BA', name: 'Bauchi' }, { code: 'BY', name: 'Bayelsa' },
    { code: 'BE', name: 'Benue' }, { code: 'BO', name: 'Borno' },
    { code: 'CR', name: 'Cross River' }, { code: 'DE', name: 'Delta' },
    { code: 'EB', name: 'Ebonyi' }, { code: 'ED', name: 'Edo' },
    { code: 'EK', name: 'Ekiti' }, { code: 'EN', name: 'Enugu' },
    { code: 'FC', name: 'FCT (Abuja)' }, { code: 'GO', name: 'Gombe' },
    { code: 'IM', name: 'Imo' }, { code: 'JI', name: 'Jigawa' },
    { code: 'KD', name: 'Kaduna' }, { code: 'KN', name: 'Kano' },
    { code: 'KT', name: 'Katsina' }, { code: 'KE', name: 'Kebbi' },
    { code: 'KO', name: 'Kogi' }, { code: 'KW', name: 'Kwara' },
    { code: 'LA', name: 'Lagos' }, { code: 'NA', name: 'Nasarawa' },
    { code: 'NI', name: 'Niger' }, { code: 'OG', name: 'Ogun' },
    { code: 'ON', name: 'Ondo' }, { code: 'OS', name: 'Osun' },
    { code: 'OY', name: 'Oyo' }, { code: 'PL', name: 'Plateau' },
    { code: 'RI', name: 'Rivers' }, { code: 'SO', name: 'Sokoto' },
    { code: 'TA', name: 'Taraba' }, { code: 'YO', name: 'Yobe' },
    { code: 'ZA', name: 'Zamfara' },
  ],
  US: [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ],
  GB: [
    { code: 'ENG', name: 'England' }, { code: 'SCT', name: 'Scotland' },
    { code: 'WLS', name: 'Wales' }, { code: 'NIR', name: 'Northern Ireland' },
    { code: 'LON', name: 'London' }, { code: 'MAN', name: 'Manchester' },
    { code: 'BIR', name: 'Birmingham' }, { code: 'LIV', name: 'Liverpool' },
    { code: 'LEE', name: 'Leeds' }, { code: 'BRI', name: 'Bristol' },
    { code: 'EDI', name: 'Edinburgh' }, { code: 'GLA', name: 'Glasgow' },
    { code: 'CAR', name: 'Cardiff' }, { code: 'BEL', name: 'Belfast' },
  ],
  GH: [
    { code: 'AA', name: 'Greater Accra' }, { code: 'AH', name: 'Ashanti' },
    { code: 'WE', name: 'Western' }, { code: 'CE', name: 'Central' },
    { code: 'EA', name: 'Eastern' }, { code: 'NO', name: 'Northern' },
    { code: 'UE', name: 'Upper East' }, { code: 'UW', name: 'Upper West' },
    { code: 'VO', name: 'Volta' }, { code: 'BO', name: 'Brong-Ahafo' },
    { code: 'OT', name: 'Oti' }, { code: 'NE', name: 'North East' },
    { code: 'SA', name: 'Savannah' }, { code: 'WN', name: 'Western North' },
    { code: 'AF', name: 'Ahafo' }, { code: 'BZ', name: 'Bono East' },
  ],
  ZA: [
    { code: 'GP', name: 'Gauteng' }, { code: 'WC', name: 'Western Cape' },
    { code: 'KZN', name: 'KwaZulu-Natal' }, { code: 'EC', name: 'Eastern Cape' },
    { code: 'FS', name: 'Free State' }, { code: 'LP', name: 'Limpopo' },
    { code: 'MP', name: 'Mpumalanga' }, { code: 'NW', name: 'North West' },
    { code: 'NC', name: 'Northern Cape' },
  ],
  KE: [
    { code: 'NB', name: 'Nairobi' }, { code: 'KV', name: 'Kiambu' },
    { code: 'MK', name: 'Mombasa' }, { code: 'KM', name: 'Kisumu' },
    { code: 'NK', name: 'Nakuru' }, { code: 'EU', name: 'Eldoret' },
    { code: 'NY', name: 'Nyeri' }, { code: 'ML', name: 'Machakos' },
    { code: 'KR', name: 'Kericho' }, { code: 'NR', name: 'Narok' },
    { code: 'TR', name: 'Turkana' }, { code: 'GM', name: 'Garissa' },
    { code: 'KM', name: 'Kilifi' }, { code: 'KW', name: 'Kwale' },
    { code: 'LM', name: 'Lamu' }, { code: 'MN', name: 'Mandera' },
    { code: 'MS', name: 'Marsabit' }, { code: 'TT', name: 'Taita-Taveta' },
    { code: 'WT', name: 'Wajir' }, { code: 'SB', name: 'Samburu' },
    { code: 'IS', name: 'Isiolo' }, { code: 'BN', name: 'Bungoma' },
    { code: 'BS', name: 'Busia' }, { code: 'KG', name: 'Kakamega' },
    { code: 'VN', name: 'Vihiga' }, { code: 'TR', name: 'Trans-Nzoia' },
    { code: 'WG', name: 'West Pokot' }, { code: 'EL', name: 'Elgeyo-Marakwet' },
    { code: 'BT', name: 'Bomet' }, { code: 'KN', name: 'Kericho' },
    { code: 'NY', name: 'Nyamira' }, { code: 'HM', name: 'Homa Bay' },
    { code: 'KG', name: 'Kisii' }, { code: 'MI', name: 'Migori' },
    { code: 'SM', name: 'Siaya' }, { code: 'HD', name: 'Homa Bay' },
  ],
  CA: [
    { code: 'ON', name: 'Ontario' }, { code: 'QC', name: 'Quebec' },
    { code: 'BC', name: 'British Columbia' }, { code: 'AB', name: 'Alberta' },
    { code: 'MB', name: 'Manitoba' }, { code: 'SK', name: 'Saskatchewan' },
    { code: 'NS', name: 'Nova Scotia' }, { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' }, { code: 'PE', name: 'Prince Edward Island' },
    { code: 'NT', name: 'Northwest Territories' }, { code: 'YT', name: 'Yukon' },
    { code: 'NU', name: 'Nunavut' },
  ],
  IN: [
    { code: 'MH', name: 'Maharashtra' }, { code: 'KA', name: 'Karnataka' },
    { code: 'TN', name: 'Tamil Nadu' }, { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'DL', name: 'Delhi' }, { code: 'GJ', name: 'Gujarat' },
    { code: 'RJ', name: 'Rajasthan' }, { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'KL', name: 'Kerala' }, { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'TG', name: 'Telangana' }, { code: 'WB', name: 'West Bengal' },
    { code: 'HR', name: 'Haryana' }, { code: 'PB', name: 'Punjab' },
    { code: 'BR', name: 'Bihar' }, { code: 'OD', name: 'Odisha' },
    { code: 'JH', name: 'Jharkhand' }, { code: 'CT', name: 'Chhattisgarh' },
    { code: 'AS', name: 'Assam' }, { code: 'UK', name: 'Uttarakhand' },
    { code: 'HP', name: 'Himachal Pradesh' }, { code: 'GA', name: 'Goa' },
    { code: 'MN', name: 'Manipur' }, { code: 'ML', name: 'Meghalaya' },
    { code: 'NL', name: 'Nagaland' }, { code: 'TR', name: 'Tripura' },
    { code: 'MZ', name: 'Mizoram' }, { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'SK', name: 'Sikkim' },
  ],
  AU: [
    { code: 'NSW', name: 'New South Wales' }, { code: 'VIC', name: 'Victoria' },
    { code: 'QLD', name: 'Queensland' }, { code: 'WA', name: 'Western Australia' },
    { code: 'SA', name: 'South Australia' }, { code: 'TAS', name: 'Tasmania' },
    { code: 'ACT', name: 'Australian Capital Territory' }, { code: 'NT', name: 'Northern Territory' },
  ],
  DE: [
    { code: 'BY', name: 'Bavaria' }, { code: 'NW', name: 'North Rhine-Westphalia' },
    { code: 'BW', name: 'Baden-Wurttemberg' }, { code: 'HE', name: 'Hesse' },
    { code: 'NI', name: 'Lower Saxony' }, { code: 'RP', name: 'Rhineland-Palatinate' },
    { code: 'BE', name: 'Berlin' }, { code: 'HH', name: 'Hamburg' },
    { code: 'SN', name: 'Saxony' }, { code: 'SH', name: 'Schleswig-Holstein' },
    { code: 'BR', name: 'Brandenburg' }, { code: 'SA', name: 'Saxony-Anhalt' },
    { code: 'TH', name: 'Thuringia' }, { code: 'MV', name: 'Mecklenburg-Vorpommern' },
    { code: 'SL', name: 'Saarland' }, { code: 'HB', name: 'Bremen' },
  ],
  FR: [
    { code: 'IDF', name: 'Ile-de-France' }, { code: 'PAC', name: 'Provence-Alpes-Cote d\'Azur' },
    { code: 'ARA', name: 'Auvergne-Rhone-Alpes' }, { code: 'OCC', name: 'Occitanie' },
    { code: 'NAQ', name: 'Nouvelle-Aquitaine' }, { code: 'BRE', name: 'Brittany' },
    { code: 'NOR', name: 'Normandy' }, { code: 'HDF', name: 'Hauts-de-France' },
    { code: 'GES', name: 'Grand Est' }, { code: 'PDL', name: 'Pays de la Loire' },
    { code: 'BFC', name: 'Bourgogne-Franche-Comte' }, { code: 'CVL', name: 'Centre-Val de Loire' },
    { code: 'COR', name: 'Corsica' },
  ],
}

/**
 * Get states/regions for a given country code.
 * Returns an empty array if no data is available.
 */
export function getStates(countryCode: string): { code: string; name: string }[] {
  return STATES[countryCode] || []
}

/**
 * Get popular countries (for the top section of the dropdown).
 */
export function getPopularCountries(): Country[] {
  return COUNTRIES.filter(c => c.popular)
}

/**
 * Search countries by name.
 */
export function searchCountries(query: string): Country[] {
  const q = query.toLowerCase().trim()
  if (!q) return COUNTRIES
  return COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  )
}
