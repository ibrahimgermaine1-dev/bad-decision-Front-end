/**
 * Bad Decision AI — Location Data
 * 195 countries organized by continent with flags and state/region data.
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
// CONTINENTS
// ============================================================
export interface Continent {
  code: string
  name: string
}

export const CONTINENTS: Continent[] = [
  { code: 'AF', name: 'Africa' },
  { code: 'AM', name: 'Americas' },
  { code: 'AS', name: 'Asia' },
  { code: 'EU', name: 'Europe' },
  { code: 'OC', name: 'Oceania' },
]

// ============================================================
// COUNTRY DATA
// ============================================================
export interface Country {
  code: string
  name: string
  flag: string
  phoneCode: string
  continent: string
  popular?: boolean
}

export const COUNTRIES: Country[] = [
  // ====== AFRICA (54 countries) ======
  { code: 'DZ', name: 'Algeria', flag: countryCodeToFlag('DZ'), phoneCode: '+213', continent: 'AF' },
  { code: 'AO', name: 'Angola', flag: countryCodeToFlag('AO'), phoneCode: '+244', continent: 'AF' },
  { code: 'BJ', name: 'Benin', flag: countryCodeToFlag('BJ'), phoneCode: '+229', continent: 'AF' },
  { code: 'BW', name: 'Botswana', flag: countryCodeToFlag('BW'), phoneCode: '+267', continent: 'AF' },
  { code: 'BF', name: 'Burkina Faso', flag: countryCodeToFlag('BF'), phoneCode: '+226', continent: 'AF' },
  { code: 'BI', name: 'Burundi', flag: countryCodeToFlag('BI'), phoneCode: '+257', continent: 'AF' },
  { code: 'CV', name: 'Cape Verde', flag: countryCodeToFlag('CV'), phoneCode: '+238', continent: 'AF' },
  { code: 'CM', name: 'Cameroon', flag: countryCodeToFlag('CM'), phoneCode: '+237', continent: 'AF' },
  { code: 'CF', name: 'Central African Republic', flag: countryCodeToFlag('CF'), phoneCode: '+236', continent: 'AF' },
  { code: 'TD', name: 'Chad', flag: countryCodeToFlag('TD'), phoneCode: '+235', continent: 'AF' },
  { code: 'KM', name: 'Comoros', flag: countryCodeToFlag('KM'), phoneCode: '+269', continent: 'AF' },
  { code: 'CG', name: 'Congo', flag: countryCodeToFlag('CG'), phoneCode: '+242', continent: 'AF' },
  { code: 'CD', name: 'DR Congo', flag: countryCodeToFlag('CD'), phoneCode: '+243', continent: 'AF' },
  { code: 'CI', name: 'Ivory Coast', flag: countryCodeToFlag('CI'), phoneCode: '+225', continent: 'AF' },
  { code: 'DJ', name: 'Djibouti', flag: countryCodeToFlag('DJ'), phoneCode: '+253', continent: 'AF' },
  { code: 'EG', name: 'Egypt', flag: countryCodeToFlag('EG'), phoneCode: '+20', continent: 'AF', popular: true },
  { code: 'GQ', name: 'Equatorial Guinea', flag: countryCodeToFlag('GQ'), phoneCode: '+240', continent: 'AF' },
  { code: 'ER', name: 'Eritrea', flag: countryCodeToFlag('ER'), phoneCode: '+291', continent: 'AF' },
  { code: 'SZ', name: 'Eswatini', flag: countryCodeToFlag('SZ'), phoneCode: '+268', continent: 'AF' },
  { code: 'ET', name: 'Ethiopia', flag: countryCodeToFlag('ET'), phoneCode: '+251', continent: 'AF' },
  { code: 'GA', name: 'Gabon', flag: countryCodeToFlag('GA'), phoneCode: '+241', continent: 'AF' },
  { code: 'GM', name: 'Gambia', flag: countryCodeToFlag('GM'), phoneCode: '+220', continent: 'AF' },
  { code: 'GH', name: 'Ghana', flag: countryCodeToFlag('GH'), phoneCode: '+233', continent: 'AF', popular: true },
  { code: 'GN', name: 'Guinea', flag: countryCodeToFlag('GN'), phoneCode: '+224', continent: 'AF' },
  { code: 'GW', name: 'Guinea-Bissau', flag: countryCodeToFlag('GW'), phoneCode: '+245', continent: 'AF' },
  { code: 'KE', name: 'Kenya', flag: countryCodeToFlag('KE'), phoneCode: '+254', continent: 'AF', popular: true },
  { code: 'LS', name: 'Lesotho', flag: countryCodeToFlag('LS'), phoneCode: '+266', continent: 'AF' },
  { code: 'LR', name: 'Liberia', flag: countryCodeToFlag('LR'), phoneCode: '+231', continent: 'AF' },
  { code: 'LY', name: 'Libya', flag: countryCodeToFlag('LY'), phoneCode: '+218', continent: 'AF' },
  { code: 'MG', name: 'Madagascar', flag: countryCodeToFlag('MG'), phoneCode: '+261', continent: 'AF' },
  { code: 'MW', name: 'Malawi', flag: countryCodeToFlag('MW'), phoneCode: '+265', continent: 'AF' },
  { code: 'ML', name: 'Mali', flag: countryCodeToFlag('ML'), phoneCode: '+223', continent: 'AF' },
  { code: 'MR', name: 'Mauritania', flag: countryCodeToFlag('MR'), phoneCode: '+222', continent: 'AF' },
  { code: 'MU', name: 'Mauritius', flag: countryCodeToFlag('MU'), phoneCode: '+230', continent: 'AF' },
  { code: 'MA', name: 'Morocco', flag: countryCodeToFlag('MA'), phoneCode: '+212', continent: 'AF' },
  { code: 'MZ', name: 'Mozambique', flag: countryCodeToFlag('MZ'), phoneCode: '+258', continent: 'AF' },
  { code: 'NA', name: 'Namibia', flag: countryCodeToFlag('NA'), phoneCode: '+264', continent: 'AF' },
  { code: 'NE', name: 'Niger', flag: countryCodeToFlag('NE'), phoneCode: '+227', continent: 'AF' },
  { code: 'NG', name: 'Nigeria', flag: countryCodeToFlag('NG'), phoneCode: '+234', continent: 'AF', popular: true },
  { code: 'RW', name: 'Rwanda', flag: countryCodeToFlag('RW'), phoneCode: '+250', continent: 'AF' },
  { code: 'ST', name: 'Sao Tome and Principe', flag: countryCodeToFlag('ST'), phoneCode: '+239', continent: 'AF' },
  { code: 'SN', name: 'Senegal', flag: countryCodeToFlag('SN'), phoneCode: '+221', continent: 'AF' },
  { code: 'SC', name: 'Seychelles', flag: countryCodeToFlag('SC'), phoneCode: '+248', continent: 'AF' },
  { code: 'SL', name: 'Sierra Leone', flag: countryCodeToFlag('SL'), phoneCode: '+232', continent: 'AF' },
  { code: 'SO', name: 'Somalia', flag: countryCodeToFlag('SO'), phoneCode: '+252', continent: 'AF' },
  { code: 'ZA', name: 'South Africa', flag: countryCodeToFlag('ZA'), phoneCode: '+27', continent: 'AF', popular: true },
  { code: 'SS', name: 'South Sudan', flag: countryCodeToFlag('SS'), phoneCode: '+211', continent: 'AF' },
  { code: 'SD', name: 'Sudan', flag: countryCodeToFlag('SD'), phoneCode: '+249', continent: 'AF' },
  { code: 'TZ', name: 'Tanzania', flag: countryCodeToFlag('TZ'), phoneCode: '+255', continent: 'AF' },
  { code: 'TG', name: 'Togo', flag: countryCodeToFlag('TG'), phoneCode: '+228', continent: 'AF' },
  { code: 'TN', name: 'Tunisia', flag: countryCodeToFlag('TN'), phoneCode: '+216', continent: 'AF' },
  { code: 'UG', name: 'Uganda', flag: countryCodeToFlag('UG'), phoneCode: '+256', continent: 'AF' },
  { code: 'ZM', name: 'Zambia', flag: countryCodeToFlag('ZM'), phoneCode: '+260', continent: 'AF' },
  { code: 'ZW', name: 'Zimbabwe', flag: countryCodeToFlag('ZW'), phoneCode: '+263', continent: 'AF' },

  // ====== AMERICAS (35 countries) ======
  { code: 'AI', name: 'Anguilla', flag: countryCodeToFlag('AI'), phoneCode: '+1264', continent: 'AM' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: countryCodeToFlag('AG'), phoneCode: '+1268', continent: 'AM' },
  { code: 'AR', name: 'Argentina', flag: countryCodeToFlag('AR'), phoneCode: '+54', continent: 'AM' },
  { code: 'BS', name: 'Bahamas', flag: countryCodeToFlag('BS'), phoneCode: '+1242', continent: 'AM' },
  { code: 'BB', name: 'Barbados', flag: countryCodeToFlag('BB'), phoneCode: '+1246', continent: 'AM' },
  { code: 'BZ', name: 'Belize', flag: countryCodeToFlag('BZ'), phoneCode: '+501', continent: 'AM' },
  { code: 'BM', name: 'Bermuda', flag: countryCodeToFlag('BM'), phoneCode: '+1441', continent: 'AM' },
  { code: 'BO', name: 'Bolivia', flag: countryCodeToFlag('BO'), phoneCode: '+591', continent: 'AM' },
  { code: 'BR', name: 'Brazil', flag: countryCodeToFlag('BR'), phoneCode: '+55', continent: 'AM', popular: true },
  { code: 'CA', name: 'Canada', flag: countryCodeToFlag('CA'), phoneCode: '+1', continent: 'AM', popular: true },
  { code: 'CL', name: 'Chile', flag: countryCodeToFlag('CL'), phoneCode: '+56', continent: 'AM' },
  { code: 'CO', name: 'Colombia', flag: countryCodeToFlag('CO'), phoneCode: '+57', continent: 'AM' },
  { code: 'CR', name: 'Costa Rica', flag: countryCodeToFlag('CR'), phoneCode: '+506', continent: 'AM' },
  { code: 'CU', name: 'Cuba', flag: countryCodeToFlag('CU'), phoneCode: '+53', continent: 'AM' },
  { code: 'DM', name: 'Dominica', flag: countryCodeToFlag('DM'), phoneCode: '+1767', continent: 'AM' },
  { code: 'DO', name: 'Dominican Republic', flag: countryCodeToFlag('DO'), phoneCode: '+1849', continent: 'AM' },
  { code: 'EC', name: 'Ecuador', flag: countryCodeToFlag('EC'), phoneCode: '+593', continent: 'AM' },
  { code: 'SV', name: 'El Salvador', flag: countryCodeToFlag('SV'), phoneCode: '+503', continent: 'AM' },
  { code: 'GD', name: 'Grenada', flag: countryCodeToFlag('GD'), phoneCode: '+1473', continent: 'AM' },
  { code: 'GT', name: 'Guatemala', flag: countryCodeToFlag('GT'), phoneCode: '+502', continent: 'AM' },
  { code: 'GY', name: 'Guyana', flag: countryCodeToFlag('GY'), phoneCode: '+592', continent: 'AM' },
  { code: 'HT', name: 'Haiti', flag: countryCodeToFlag('HT'), phoneCode: '+509', continent: 'AM' },
  { code: 'HN', name: 'Honduras', flag: countryCodeToFlag('HN'), phoneCode: '+504', continent: 'AM' },
  { code: 'JM', name: 'Jamaica', flag: countryCodeToFlag('JM'), phoneCode: '+1876', continent: 'AM' },
  { code: 'MX', name: 'Mexico', flag: countryCodeToFlag('MX'), phoneCode: '+52', continent: 'AM', popular: true },
  { code: 'NI', name: 'Nicaragua', flag: countryCodeToFlag('NI'), phoneCode: '+505', continent: 'AM' },
  { code: 'PA', name: 'Panama', flag: countryCodeToFlag('PA'), phoneCode: '+507', continent: 'AM' },
  { code: 'PY', name: 'Paraguay', flag: countryCodeToFlag('PY'), phoneCode: '+595', continent: 'AM' },
  { code: 'PE', name: 'Peru', flag: countryCodeToFlag('PE'), phoneCode: '+51', continent: 'AM' },
  { code: 'PR', name: 'Puerto Rico', flag: countryCodeToFlag('PR'), phoneCode: '+1939', continent: 'AM' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: countryCodeToFlag('KN'), phoneCode: '+1869', continent: 'AM' },
  { code: 'LC', name: 'Saint Lucia', flag: countryCodeToFlag('LC'), phoneCode: '+1758', continent: 'AM' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: countryCodeToFlag('VC'), phoneCode: '+1784', continent: 'AM' },
  { code: 'SR', name: 'Suriname', flag: countryCodeToFlag('SR'), phoneCode: '+597', continent: 'AM' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: countryCodeToFlag('TT'), phoneCode: '+1868', continent: 'AM' },
  { code: 'US', name: 'United States', flag: countryCodeToFlag('US'), phoneCode: '+1', continent: 'AM', popular: true },
  { code: 'UY', name: 'Uruguay', flag: countryCodeToFlag('UY'), phoneCode: '+598', continent: 'AM' },
  { code: 'VE', name: 'Venezuela', flag: countryCodeToFlag('VE'), phoneCode: '+58', continent: 'AM' },

  // ====== ASIA (49 countries) ======
  { code: 'AF', name: 'Afghanistan', flag: countryCodeToFlag('AF'), phoneCode: '+93', continent: 'AS' },
  { code: 'AM', name: 'Armenia', flag: countryCodeToFlag('AM'), phoneCode: '+374', continent: 'AS' },
  { code: 'AZ', name: 'Azerbaijan', flag: countryCodeToFlag('AZ'), phoneCode: '+994', continent: 'AS' },
  { code: 'BH', name: 'Bahrain', flag: countryCodeToFlag('BH'), phoneCode: '+973', continent: 'AS' },
  { code: 'BD', name: 'Bangladesh', flag: countryCodeToFlag('BD'), phoneCode: '+880', continent: 'AS' },
  { code: 'BT', name: 'Bhutan', flag: countryCodeToFlag('BT'), phoneCode: '+975', continent: 'AS' },
  { code: 'BN', name: 'Brunei', flag: countryCodeToFlag('BN'), phoneCode: '+673', continent: 'AS' },
  { code: 'KH', name: 'Cambodia', flag: countryCodeToFlag('KH'), phoneCode: '+855', continent: 'AS' },
  { code: 'CN', name: 'China', flag: countryCodeToFlag('CN'), phoneCode: '+86', continent: 'AS', popular: true },
  { code: 'CY', name: 'Cyprus', flag: countryCodeToFlag('CY'), phoneCode: '+357', continent: 'AS' },
  { code: 'GE', name: 'Georgia', flag: countryCodeToFlag('GE'), phoneCode: '+995', continent: 'AS' },
  { code: 'IN', name: 'India', flag: countryCodeToFlag('IN'), phoneCode: '+91', continent: 'AS', popular: true },
  { code: 'ID', name: 'Indonesia', flag: countryCodeToFlag('ID'), phoneCode: '+62', continent: 'AS' },
  { code: 'IR', name: 'Iran', flag: countryCodeToFlag('IR'), phoneCode: '+98', continent: 'AS' },
  { code: 'IQ', name: 'Iraq', flag: countryCodeToFlag('IQ'), phoneCode: '+964', continent: 'AS' },
  { code: 'IL', name: 'Israel', flag: countryCodeToFlag('IL'), phoneCode: '+972', continent: 'AS' },
  { code: 'JP', name: 'Japan', flag: countryCodeToFlag('JP'), phoneCode: '+81', continent: 'AS', popular: true },
  { code: 'JO', name: 'Jordan', flag: countryCodeToFlag('JO'), phoneCode: '+962', continent: 'AS' },
  { code: 'KZ', name: 'Kazakhstan', flag: countryCodeToFlag('KZ'), phoneCode: '+7', continent: 'AS' },
  { code: 'KW', name: 'Kuwait', flag: countryCodeToFlag('KW'), phoneCode: '+965', continent: 'AS' },
  { code: 'KG', name: 'Kyrgyzstan', flag: countryCodeToFlag('KG'), phoneCode: '+996', continent: 'AS' },
  { code: 'LA', name: 'Laos', flag: countryCodeToFlag('LA'), phoneCode: '+856', continent: 'AS' },
  { code: 'LB', name: 'Lebanon', flag: countryCodeToFlag('LB'), phoneCode: '+961', continent: 'AS' },
  { code: 'MY', name: 'Malaysia', flag: countryCodeToFlag('MY'), phoneCode: '+60', continent: 'AS' },
  { code: 'MV', name: 'Maldives', flag: countryCodeToFlag('MV'), phoneCode: '+960', continent: 'AS' },
  { code: 'MN', name: 'Mongolia', flag: countryCodeToFlag('MN'), phoneCode: '+976', continent: 'AS' },
  { code: 'MM', name: 'Myanmar', flag: countryCodeToFlag('MM'), phoneCode: '+95', continent: 'AS' },
  { code: 'NP', name: 'Nepal', flag: countryCodeToFlag('NP'), phoneCode: '+977', continent: 'AS' },
  { code: 'KP', name: 'North Korea', flag: countryCodeToFlag('KP'), phoneCode: '+850', continent: 'AS' },
  { code: 'OM', name: 'Oman', flag: countryCodeToFlag('OM'), phoneCode: '+968', continent: 'AS' },
  { code: 'PK', name: 'Pakistan', flag: countryCodeToFlag('PK'), phoneCode: '+92', continent: 'AS' },
  { code: 'PS', name: 'Palestine', flag: countryCodeToFlag('PS'), phoneCode: '+970', continent: 'AS' },
  { code: 'PH', name: 'Philippines', flag: countryCodeToFlag('PH'), phoneCode: '+63', continent: 'AS' },
  { code: 'QA', name: 'Qatar', flag: countryCodeToFlag('QA'), phoneCode: '+974', continent: 'AS' },
  { code: 'SA', name: 'Saudi Arabia', flag: countryCodeToFlag('SA'), phoneCode: '+966', continent: 'AS', popular: true },
  { code: 'SG', name: 'Singapore', flag: countryCodeToFlag('SG'), phoneCode: '+65', continent: 'AS', popular: true },
  { code: 'KR', name: 'South Korea', flag: countryCodeToFlag('KR'), phoneCode: '+82', continent: 'AS', popular: true },
  { code: 'LK', name: 'Sri Lanka', flag: countryCodeToFlag('LK'), phoneCode: '+94', continent: 'AS' },
  { code: 'SY', name: 'Syria', flag: countryCodeToFlag('SY'), phoneCode: '+963', continent: 'AS' },
  { code: 'TW', name: 'Taiwan', flag: countryCodeToFlag('TW'), phoneCode: '+886', continent: 'AS' },
  { code: 'TJ', name: 'Tajikistan', flag: countryCodeToFlag('TJ'), phoneCode: '+992', continent: 'AS' },
  { code: 'TH', name: 'Thailand', flag: countryCodeToFlag('TH'), phoneCode: '+66', continent: 'AS' },
  { code: 'TL', name: 'Timor-Leste', flag: countryCodeToFlag('TL'), phoneCode: '+670', continent: 'AS' },
  { code: 'TR', name: 'Turkey', flag: countryCodeToFlag('TR'), phoneCode: '+90', continent: 'AS' },
  { code: 'TM', name: 'Turkmenistan', flag: countryCodeToFlag('TM'), phoneCode: '+993', continent: 'AS' },
  { code: 'AE', name: 'United Arab Emirates', flag: countryCodeToFlag('AE'), phoneCode: '+971', continent: 'AS', popular: true },
  { code: 'UZ', name: 'Uzbekistan', flag: countryCodeToFlag('UZ'), phoneCode: '+998', continent: 'AS' },
  { code: 'VN', name: 'Vietnam', flag: countryCodeToFlag('VN'), phoneCode: '+84', continent: 'AS' },
  { code: 'YE', name: 'Yemen', flag: countryCodeToFlag('YE'), phoneCode: '+967', continent: 'AS' },

  // ====== EUROPE (44 countries) ======
  { code: 'AL', name: 'Albania', flag: countryCodeToFlag('AL'), phoneCode: '+355', continent: 'EU' },
  { code: 'AD', name: 'Andorra', flag: countryCodeToFlag('AD'), phoneCode: '+376', continent: 'EU' },
  { code: 'AT', name: 'Austria', flag: countryCodeToFlag('AT'), phoneCode: '+43', continent: 'EU' },
  { code: 'BY', name: 'Belarus', flag: countryCodeToFlag('BY'), phoneCode: '+375', continent: 'EU' },
  { code: 'BE', name: 'Belgium', flag: countryCodeToFlag('BE'), phoneCode: '+32', continent: 'EU' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: countryCodeToFlag('BA'), phoneCode: '+387', continent: 'EU' },
  { code: 'BG', name: 'Bulgaria', flag: countryCodeToFlag('BG'), phoneCode: '+359', continent: 'EU' },
  { code: 'HR', name: 'Croatia', flag: countryCodeToFlag('HR'), phoneCode: '+385', continent: 'EU' },
  { code: 'CZ', name: 'Czech Republic', flag: countryCodeToFlag('CZ'), phoneCode: '+420', continent: 'EU' },
  { code: 'DK', name: 'Denmark', flag: countryCodeToFlag('DK'), phoneCode: '+45', continent: 'EU' },
  { code: 'EE', name: 'Estonia', flag: countryCodeToFlag('EE'), phoneCode: '+372', continent: 'EU' },
  { code: 'FI', name: 'Finland', flag: countryCodeToFlag('FI'), phoneCode: '+358', continent: 'EU' },
  { code: 'FR', name: 'France', flag: countryCodeToFlag('FR'), phoneCode: '+33', continent: 'EU', popular: true },
  { code: 'DE', name: 'Germany', flag: countryCodeToFlag('DE'), phoneCode: '+49', continent: 'EU', popular: true },
  { code: 'GR', name: 'Greece', flag: countryCodeToFlag('GR'), phoneCode: '+30', continent: 'EU' },
  { code: 'HU', name: 'Hungary', flag: countryCodeToFlag('HU'), phoneCode: '+36', continent: 'EU' },
  { code: 'IS', name: 'Iceland', flag: countryCodeToFlag('IS'), phoneCode: '+354', continent: 'EU' },
  { code: 'IE', name: 'Ireland', flag: countryCodeToFlag('IE'), phoneCode: '+353', continent: 'EU' },
  { code: 'IT', name: 'Italy', flag: countryCodeToFlag('IT'), phoneCode: '+39', continent: 'EU', popular: true },
  { code: 'XK', name: 'Kosovo', flag: countryCodeToFlag('XK'), phoneCode: '+383', continent: 'EU' },
  { code: 'LV', name: 'Latvia', flag: countryCodeToFlag('LV'), phoneCode: '+371', continent: 'EU' },
  { code: 'LI', name: 'Liechtenstein', flag: countryCodeToFlag('LI'), phoneCode: '+423', continent: 'EU' },
  { code: 'LT', name: 'Lithuania', flag: countryCodeToFlag('LT'), phoneCode: '+370', continent: 'EU' },
  { code: 'LU', name: 'Luxembourg', flag: countryCodeToFlag('LU'), phoneCode: '+352', continent: 'EU' },
  { code: 'MT', name: 'Malta', flag: countryCodeToFlag('MT'), phoneCode: '+356', continent: 'EU' },
  { code: 'MD', name: 'Moldova', flag: countryCodeToFlag('MD'), phoneCode: '+373', continent: 'EU' },
  { code: 'MC', name: 'Monaco', flag: countryCodeToFlag('MC'), phoneCode: '+377', continent: 'EU' },
  { code: 'ME', name: 'Montenegro', flag: countryCodeToFlag('ME'), phoneCode: '+382', continent: 'EU' },
  { code: 'NL', name: 'Netherlands', flag: countryCodeToFlag('NL'), phoneCode: '+31', continent: 'EU' },
  { code: 'MK', name: 'North Macedonia', flag: countryCodeToFlag('MK'), phoneCode: '+389', continent: 'EU' },
  { code: 'NO', name: 'Norway', flag: countryCodeToFlag('NO'), phoneCode: '+47', continent: 'EU' },
  { code: 'PL', name: 'Poland', flag: countryCodeToFlag('PL'), phoneCode: '+48', continent: 'EU' },
  { code: 'PT', name: 'Portugal', flag: countryCodeToFlag('PT'), phoneCode: '+351', continent: 'EU' },
  { code: 'RO', name: 'Romania', flag: countryCodeToFlag('RO'), phoneCode: '+40', continent: 'EU' },
  { code: 'RU', name: 'Russia', flag: countryCodeToFlag('RU'), phoneCode: '+7', continent: 'EU' },
  { code: 'SM', name: 'San Marino', flag: countryCodeToFlag('SM'), phoneCode: '+378', continent: 'EU' },
  { code: 'RS', name: 'Serbia', flag: countryCodeToFlag('RS'), phoneCode: '+381', continent: 'EU' },
  { code: 'SK', name: 'Slovakia', flag: countryCodeToFlag('SK'), phoneCode: '+421', continent: 'EU' },
  { code: 'SI', name: 'Slovenia', flag: countryCodeToFlag('SI'), phoneCode: '+386', continent: 'EU' },
  { code: 'ES', name: 'Spain', flag: countryCodeToFlag('ES'), phoneCode: '+34', continent: 'EU', popular: true },
  { code: 'SE', name: 'Sweden', flag: countryCodeToFlag('SE'), phoneCode: '+46', continent: 'EU' },
  { code: 'CH', name: 'Switzerland', flag: countryCodeToFlag('CH'), phoneCode: '+41', continent: 'EU' },
  { code: 'UA', name: 'Ukraine', flag: countryCodeToFlag('UA'), phoneCode: '+380', continent: 'EU' },
  { code: 'GB', name: 'United Kingdom', flag: countryCodeToFlag('GB'), phoneCode: '+44', continent: 'EU', popular: true },
  { code: 'VA', name: 'Vatican City', flag: countryCodeToFlag('VA'), phoneCode: '+379', continent: 'EU' },

  // ====== OCEANIA (14 countries) ======
  { code: 'AU', name: 'Australia', flag: countryCodeToFlag('AU'), phoneCode: '+61', continent: 'OC', popular: true },
  { code: 'FJ', name: 'Fiji', flag: countryCodeToFlag('FJ'), phoneCode: '+679', continent: 'OC' },
  { code: 'KI', name: 'Kiribati', flag: countryCodeToFlag('KI'), phoneCode: '+686', continent: 'OC' },
  { code: 'MH', name: 'Marshall Islands', flag: countryCodeToFlag('MH'), phoneCode: '+692', continent: 'OC' },
  { code: 'FM', name: 'Micronesia', flag: countryCodeToFlag('FM'), phoneCode: '+691', continent: 'OC' },
  { code: 'NR', name: 'Nauru', flag: countryCodeToFlag('NR'), phoneCode: '+674', continent: 'OC' },
  { code: 'NZ', name: 'New Zealand', flag: countryCodeToFlag('NZ'), phoneCode: '+64', continent: 'OC', popular: true },
  { code: 'PW', name: 'Palau', flag: countryCodeToFlag('PW'), phoneCode: '+680', continent: 'OC' },
  { code: 'PG', name: 'Papua New Guinea', flag: countryCodeToFlag('PG'), phoneCode: '+675', continent: 'OC' },
  { code: 'WS', name: 'Samoa', flag: countryCodeToFlag('WS'), phoneCode: '+685', continent: 'OC' },
  { code: 'SB', name: 'Solomon Islands', flag: countryCodeToFlag('SB'), phoneCode: '+677', continent: 'OC' },
  { code: 'TO', name: 'Tonga', flag: countryCodeToFlag('TO'), phoneCode: '+676', continent: 'OC' },
  { code: 'TV', name: 'Tuvalu', flag: countryCodeToFlag('TV'), phoneCode: '+688', continent: 'OC' },
  { code: 'VU', name: 'Vanuatu', flag: countryCodeToFlag('VU'), phoneCode: '+678', continent: 'OC' },
]

// ============================================================
// STATE/REGION DATA — Major countries with 18+ regions
// ============================================================
const STATES: Record<string, { code: string; name: string }[]> = {
  // ------ NIGERIA (37 states) ------
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

  // ------ UNITED STATES (51) ------
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

  // ------ CANADA (13) ------
  CA: [
    { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' }, { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' }, { code: 'NS', name: 'Nova Scotia' },
    { code: 'NT', name: 'Northwest Territories' }, { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' }, { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukon' },
  ],

  // ------ UNITED KINGDOM (regions) ------
  GB: [
    { code: 'BDG', name: 'Barking and Dagenham' }, { code: 'BNE', name: 'Barnet' },
    { code: 'BNS', name: 'Barnsley' }, { code: 'BAS', name: 'Bath and North East Somerset' },
    { code: 'BDF', name: 'Bedford' }, { code: 'BEX', name: 'Bexley' },
    { code: 'BIR', name: 'Birmingham' }, { code: 'BBD', name: 'Blackburn with Darwen' },
    { code: 'BPL', name: 'Blackpool' }, { code: 'BOL', name: 'Bolton' },
    { code: 'BRC', name: 'Bournemouth' }, { code: 'BRF', name: 'Bracknell Forest' },
    { code: 'BRD', name: 'Bradford' }, { code: 'BRE', name: 'Brent' },
    { code: 'BRY', name: 'Brighton and Hove' }, { code: 'BST', name: 'Bristol' },
    { code: 'BRO', name: 'Bromley' }, { code: 'BKM', name: 'Buckinghamshire' },
    { code: 'BUR', name: 'Bury' }, { code: 'CAL', name: 'Calderdale' },
    { code: 'CAM', name: 'Cambridgeshire' }, { code: 'CMD', name: 'Camden' },
    { code: 'CHS', name: 'Cheshire East' }, { code: 'CHW', name: 'Cheshire West and Chester' },
    { code: 'CON', name: 'Cornwall' }, { code: 'CRY', name: 'Croydon' },
    { code: 'CMA', name: 'Cumbria' }, { code: 'DAL', name: 'Darlington' },
    { code: 'DER', name: 'Derby' }, { code: 'DBY', name: 'Derbyshire' },
    { code: 'DEV', name: 'Devon' }, { code: 'DOR', name: 'Dorset' },
    { code: 'DUD', name: 'Dudley' }, { code: 'DUR', name: 'Durham' },
    { code: 'EAL', name: 'Ealing' }, { code: 'ENF', name: 'Enfield' },
    { code: 'ERY', name: 'East Riding of Yorkshire' }, { code: 'ESS', name: 'Essex' },
    { code: 'GLS', name: 'Gloucestershire' }, { code: 'GRE', name: 'Greenwich' },
    { code: 'HCK', name: 'Hackney' }, { code: 'HAL', name: 'Halton' },
    { code: 'HMF', name: 'Hammersmith and Fulham' }, { code: 'HRY', name: 'Haringey' },
    { code: 'HRW', name: 'Harrow' }, { code: 'HRT', name: 'Hartlepool' },
    { code: 'HAV', name: 'Havering' }, { code: 'HEF', name: 'Herefordshire' },
    { code: 'HRT2', name: 'Hertfordshire' }, { code: 'HIL', name: 'Hillingdon' },
    { code: 'HNS', name: 'Hounslow' }, { code: 'HWR', name: 'Howe of East Dunbarton' },
    { code: 'KHL', name: 'Kingston upon Hull' }, { code: 'KNT', name: 'Kent' },
    { code: 'KUT', name: 'Kingston upon Thames' }, { code: 'KIR', name: 'Kirklees' },
    { code: 'KNW', name: 'Knowsley' }, { code: 'LBH', name: 'Lambeth' },
    { code: 'LDS', name: 'Leeds' }, { code: 'LCE', name: 'Leicester' },
    { code: 'LEC', name: 'Leicestershire' }, { code: 'LEW', name: 'Lewisham' },
    { code: 'LIN', name: 'Lincolnshire' }, { code: 'LIV', name: 'Liverpool' },
    { code: 'LND', name: 'London (City)' }, { code: 'LUT', name: 'Luton' },
    { code: 'MAN', name: 'Manchester' }, { code: 'MDW', name: 'Medway' },
    { code: 'MRT', name: 'Merton' }, { code: 'MES', name: 'Middlesbrough' },
    { code: 'MIK', name: 'Milton Keynes' }, { code: 'NET', name: 'Newcastle upon Tyne' },
    { code: 'NWM', name: 'Newham' }, { code: 'NTY', name: 'North Tyneside' },
    { code: 'NLN', name: 'North Lincolnshire' }, { code: 'NEL', name: 'North East Lincolnshire' },
    { code: 'NSM', name: 'North Somerset' }, { code: 'NYK', name: 'North Yorkshire' },
    { code: 'NTH', name: 'Northampton' }, { code: 'NTT', name: 'Nottingham' },
    { code: 'NOR', name: 'Norfolk' }, { code: 'NBL', name: 'Northumberland' },
    { code: 'OLD', name: 'Oldham' }, { code: 'OXF', name: 'Oxfordshire' },
    { code: 'PTE', name: 'Peterborough' }, { code: 'PLY', name: 'Plymouth' },
    { code: 'POL', name: 'Poole' }, { code: 'POR', name: 'Portsmouth' },
    { code: 'RDB', name: 'Redbridge' }, { code: 'RCC', name: 'Redcar and Cleveland' },
    { code: 'RIC', name: 'Richmond upon Thames' }, { code: 'RCH', name: 'Rochdale' },
    { code: 'ROT', name: 'Rotherham' }, { code: 'RUT', name: 'Rutland' },
    { code: 'SHR', name: 'Shropshire' }, { code: 'SND', name: 'Sandwell' },
    { code: 'SFT', name: 'Sefton' }, { code: 'SHN', name: 'St. Helens' },
    { code: 'SAL', name: 'Solihull' }, { code: 'SOM', name: 'Somerset' },
    { code: 'SHL', name: 'Southampton' }, { code: 'SOS', name: 'Southend-on-Sea' },
    { code: 'STY', name: 'South Tyneside' }, { code: 'SKP', name: 'Stockport' },
    { code: 'STC', name: 'Stockton-on-Tees' }, { code: 'STE', name: 'Stoke-on-Trent' },
    { code: 'SFK', name: 'Suffolk' }, { code: 'SRY', name: 'Surrey' },
    { code: 'SWD', name: 'Swindon' }, { code: 'TAM', name: 'Tameside' },
    { code: 'TFW', name: 'Telford and Wrekin' }, { code: 'THR', name: 'Thurrock' },
    { code: 'TOB', name: 'Torbay' }, { code: 'TOF', name: 'Tower Hamlets' },
    { code: 'TRF', name: 'Trafford' }, { code: 'WKF', name: 'Wakefield' },
    { code: 'WLL', name: 'Walsall' }, { code: 'WFT', name: 'Waltham Forest' },
    { code: 'WND', name: 'Wandsworth' }, { code: 'WRL', name: 'Wirral' },
    { code: 'WMR', name: 'West Midlands' }, { code: 'WIL', name: 'Wiltshire' },
    { code: 'WNS', name: 'Winston' }, { code: 'WOK', name: 'Wokingham' },
    { code: 'WLV', name: 'Wolverhampton' }, { code: 'WOR', name: 'Worcestershire' },
    { code: 'YOR', name: 'York' },
  ],

  // ------ GERMANY (16) ------
  DE: [
    { code: 'BW', name: 'Baden-Wurttemberg' }, { code: 'BY', name: 'Bavaria' },
    { code: 'BE', name: 'Berlin' }, { code: 'BB', name: 'Brandenburg' },
    { code: 'HB', name: 'Bremen' }, { code: 'HH', name: 'Hamburg' },
    { code: 'HE', name: 'Hesse' }, { code: 'MV', name: 'Mecklenburg-Vorpommern' },
    { code: 'NI', name: 'Lower Saxony' }, { code: 'NW', name: 'North Rhine-Westphalia' },
    { code: 'RP', name: 'Rhineland-Palatinate' }, { code: 'SL', name: 'Saarland' },
    { code: 'SN', name: 'Saxony' }, { code: 'ST', name: 'Saxony-Anhalt' },
    { code: 'SH', name: 'Schleswig-Holstein' }, { code: 'TH', name: 'Thuringia' },
  ],

  // ------ FRANCE (18 regions) ------
  FR: [
    { code: 'ARA', name: 'Auvergne-Rhone-Alpes' }, { code: 'BFC', name: 'Bourgogne-Franche-Comte' },
    { code: 'BRE', name: 'Brittany' }, { code: 'CVL', name: 'Centre-Val de Loire' },
    { code: 'COR', name: 'Corsica' }, { code: 'GES', name: 'Grand Est' },
    { code: 'HDF', name: 'Hauts-de-France' }, { code: 'IDF', name: 'Ile-de-France' },
    { code: 'NOR', name: 'Normandy' }, { code: 'NAQ', name: 'Nouvelle-Aquitaine' },
    { code: 'OCC', name: 'Occitanie' }, { code: 'PDL', name: 'Pays de la Loire' },
    { code: 'PAC', name: "Provence-Alpes-Cote d'Azur" }, { code: '01', name: 'Ain' },
    { code: '75', name: 'Paris' }, { code: '13', name: 'Bouches-du-Rhone' },
    { code: '69', name: 'Rhone' }, { code: '33', name: 'Gironde' },
  ],

  // ------ INDIA (29 states) ------
  IN: [
    { code: 'AP', name: 'Andhra Pradesh' }, { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' }, { code: 'BR', name: 'Bihar' },
    { code: 'CT', name: 'Chhattisgarh' }, { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' }, { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' }, { code: 'JH', name: 'Jharkhand' },
    { code: 'KA', name: 'Karnataka' }, { code: 'KL', name: 'Kerala' },
    { code: 'MP', name: 'Madhya Pradesh' }, { code: 'MH', name: 'Maharashtra' },
    { code: 'MN', name: 'Manipur' }, { code: 'ML', name: 'Meghalaya' },
    { code: 'MZ', name: 'Mizoram' }, { code: 'NL', name: 'Nagaland' },
    { code: 'OD', name: 'Odisha' }, { code: 'PB', name: 'Punjab' },
    { code: 'RJ', name: 'Rajasthan' }, { code: 'SK', name: 'Sikkim' },
    { code: 'TN', name: 'Tamil Nadu' }, { code: 'TG', name: 'Telangana' },
    { code: 'TR', name: 'Tripura' }, { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'UK', name: 'Uttarakhand' }, { code: 'WB', name: 'West Bengal' },
    { code: 'DL', name: 'Delhi' },
  ],

  // ------ BRAZIL (27) ------
  BR: [
    { code: 'AC', name: 'Acre' }, { code: 'AL', name: 'Alagoas' },
    { code: 'AP', name: 'Amapa' }, { code: 'AM', name: 'Amazonas' },
    { code: 'BA', name: 'Bahia' }, { code: 'CE', name: 'Ceara' },
    { code: 'DF', name: 'Distrito Federal' }, { code: 'ES', name: 'Espirito Santo' },
    { code: 'GO', name: 'Goias' }, { code: 'MA', name: 'Maranhao' },
    { code: 'MT', name: 'Mato Grosso' }, { code: 'MS', name: 'Mato Grosso do Sul' },
    { code: 'MG', name: 'Minas Gerais' }, { code: 'PA', name: 'Para' },
    { code: 'PB', name: 'Paraiba' }, { code: 'PR', name: 'Parana' },
    { code: 'PE', name: 'Pernambuco' }, { code: 'PI', name: 'Piaui' },
    { code: 'RJ', name: 'Rio de Janeiro' }, { code: 'RN', name: 'Rio Grande do Norte' },
    { code: 'RS', name: 'Rio Grande do Sul' }, { code: 'RO', name: 'Rondonia' },
    { code: 'RR', name: 'Roraima' }, { code: 'SC', name: 'Santa Catarina' },
    { code: 'SP', name: 'Sao Paulo' }, { code: 'SE', name: 'Sergipe' },
    { code: 'TO', name: 'Tocantins' },
  ],

  // ------ CHINA (34) ------
  CN: [
    { code: 'AH', name: 'Anhui' }, { code: 'BJ', name: 'Beijing' },
    { code: 'CQ', name: 'Chongqing' }, { code: 'FJ', name: 'Fujian' },
    { code: 'GS', name: 'Gansu' }, { code: 'GD', name: 'Guangdong' },
    { code: 'GX', name: 'Guangxi' }, { code: 'GZ', name: 'Guizhou' },
    { code: 'HI', name: 'Hainan' }, { code: 'HE', name: 'Hebei' },
    { code: 'HL', name: 'Heilongjiang' }, { code: 'HA', name: 'Henan' },
    { code: 'HB', name: 'Hubei' }, { code: 'HN', name: 'Hunan' },
    { code: 'JS', name: 'Jiangsu' }, { code: 'JX', name: 'Jiangxi' },
    { code: 'JL', name: 'Jilin' }, { code: 'LN', name: 'Liaoning' },
    { code: 'NM', name: 'Inner Mongolia' }, { code: 'NX', name: 'Ningxia' },
    { code: 'QH', name: 'Qinghai' }, { code: 'SN', name: 'Shaanxi' },
    { code: 'SD', name: 'Shandong' }, { code: 'SH', name: 'Shanghai' },
    { code: 'SX', name: 'Shanxi' }, { code: 'SC', name: 'Sichuan' },
    { code: 'TJ', name: 'Tianjin' }, { code: 'TB', name: 'Tibet' },
    { code: 'XJ', name: 'Xinjiang' }, { code: 'YN', name: 'Yunnan' },
    { code: 'ZJ', name: 'Zhejiang' }, { code: 'HK', name: 'Hong Kong' },
    { code: 'MO', name: 'Macau' }, { code: 'TW', name: 'Taiwan' },
  ],

  // ------ JAPAN (47 prefectures) ------
  JP: [
    { code: '01', name: 'Hokkaido' }, { code: '02', name: 'Aomori' },
    { code: '03', name: 'Iwate' }, { code: '04', name: 'Miyagi' },
    { code: '05', name: 'Akita' }, { code: '06', name: 'Yamagata' },
    { code: '07', name: 'Fukushima' }, { code: '08', name: 'Ibaraki' },
    { code: '09', name: 'Tochigi' }, { code: '10', name: 'Gunma' },
    { code: '11', name: 'Saitama' }, { code: '12', name: 'Chiba' },
    { code: '13', name: 'Tokyo' }, { code: '14', name: 'Kanagawa' },
    { code: '15', name: 'Niigata' }, { code: '16', name: 'Toyama' },
    { code: '17', name: 'Ishikawa' }, { code: '18', name: 'Fukui' },
    { code: '19', name: 'Yamanashi' }, { code: '20', name: 'Nagano' },
    { code: '21', name: 'Gifu' }, { code: '22', name: 'Shizuoka' },
    { code: '23', name: 'Aichi' }, { code: '24', name: 'Mie' },
    { code: '25', name: 'Shiga' }, { code: '26', name: 'Kyoto' },
    { code: '27', name: 'Osaka' }, { code: '28', name: 'Hyogo' },
    { code: '29', name: 'Nara' }, { code: '30', name: 'Wakayama' },
    { code: '31', name: 'Tottori' }, { code: '32', name: 'Shimane' },
    { code: '33', name: 'Okayama' }, { code: '34', name: 'Hiroshima' },
    { code: '35', name: 'Yamaguchi' }, { code: '36', name: 'Tokushima' },
    { code: '37', name: 'Kagawa' }, { code: '38', name: 'Ehime' },
    { code: '39', name: 'Kochi' }, { code: '40', name: 'Fukuoka' },
    { code: '41', name: 'Saga' }, { code: '42', name: 'Nagasaki' },
    { code: '43', name: 'Kumamoto' }, { code: '44', name: 'Oita' },
    { code: '45', name: 'Miyazaki' }, { code: '46', name: 'Kagoshima' },
    { code: '47', name: 'Okinawa' },
  ],

  // ------ AUSTRALIA (8) ------
  AU: [
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NSW', name: 'New South Wales' }, { code: 'NT', name: 'Northern Territory' },
    { code: 'QLD', name: 'Queensland' }, { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' }, { code: 'VIC', name: 'Victoria' },
    { code: 'WA', name: 'Western Australia' },
  ],

  // ------ SOUTH AFRICA (9) ------
  ZA: [
    { code: 'EC', name: 'Eastern Cape' }, { code: 'FS', name: 'Free State' },
    { code: 'GP', name: 'Gauteng' }, { code: 'KZN', name: 'KwaZulu-Natal' },
    { code: 'LP', name: 'Limpopo' }, { code: 'MP', name: 'Mpumalanga' },
    { code: 'NC', name: 'Northern Cape' }, { code: 'NW', name: 'North West' },
    { code: 'WC', name: 'Western Cape' },
  ],

  // ------ MEXICO (32) ------
  MX: [
    { code: 'AGU', name: 'Aguascalientes' }, { code: 'BCN', name: 'Baja California' },
    { code: 'BCS', name: 'Baja California Sur' }, { code: 'CAM', name: 'Campeche' },
    { code: 'CHH', name: 'Chihuahua' }, { code: 'CHP', name: 'Chiapas' },
    { code: 'CMX', name: 'Ciudad de Mexico' }, { code: 'COA', name: 'Coahuila' },
    { code: 'COL', name: 'Colima' }, { code: 'DUR', name: 'Durango' },
    { code: 'GRO', name: 'Guerrero' }, { code: 'GUA', name: 'Guanajuato' },
    { code: 'HID', name: 'Hidalgo' }, { code: 'JAL', name: 'Jalisco' },
    { code: 'MEX', name: 'Estado de Mexico' }, { code: 'MIC', name: 'Michoacan' },
    { code: 'MOR', name: 'Morelos' }, { code: 'NAY', name: 'Nayarit' },
    { code: 'NLE', name: 'Nuevo Leon' }, { code: 'OAX', name: 'Oaxaca' },
    { code: 'PUE', name: 'Puebla' }, { code: 'QUE', name: 'Queretaro' },
    { code: 'ROO', name: 'Quintana Roo' }, { code: 'SLP', name: 'San Luis Potosi' },
    { code: 'SIN', name: 'Sinaloa' }, { code: 'SON', name: 'Sonora' },
    { code: 'TAB', name: 'Tabasco' }, { code: 'TAM', name: 'Tamaulipas' },
    { code: 'TLX', name: 'Tlaxcala' }, { code: 'VER', name: 'Veracruz' },
    { code: 'YUC', name: 'Yucatan' }, { code: 'ZAC', name: 'Zacatecas' },
  ],

  // ------ KENYA (47 counties) ------
  KE: [
    { code: '01', name: 'Mombasa' }, { code: '02', name: 'Kwale' },
    { code: '03', name: 'Kilifi' }, { code: '04', name: 'Tana River' },
    { code: '05', name: 'Lamu' }, { code: '06', name: 'Taita-Taveta' },
    { code: '07', name: 'Garissa' }, { code: '08', name: 'Wajir' },
    { code: '09', name: 'Mandera' }, { code: '10', name: 'Marsabit' },
    { code: '11', name: 'Isiolo' }, { code: '12', name: 'Meru' },
    { code: '13', name: 'Tharaka-Nithi' }, { code: '14', name: 'Embu' },
    { code: '15', name: 'Kitui' }, { code: '16', name: 'Machakos' },
    { code: '17', name: 'Makueni' }, { code: '18', name: 'Nyandarua' },
    { code: '19', name: 'Nyeri' }, { code: '20', name: 'Kirinyaga' },
    { code: '21', name: 'Muranga' }, { code: '22', name: 'Kiambu' },
    { code: '23', name: 'Turkana' }, { code: '24', name: 'West Pokot' },
    { code: '25', name: 'Samburu' }, { code: '26', name: 'Trans-Nzoia' },
    { code: '27', name: 'Uasin Gishu' }, { code: '28', name: 'Elgeyo-Marakwet' },
    { code: '29', name: 'Nandi' }, { code: '30', name: 'Baringo' },
    { code: '31', name: 'Laikipia' }, { code: '32', name: 'Nakuru' },
    { code: '33', name: 'Narok' }, { code: '34', name: 'Kajiado' },
    { code: '35', name: 'Kericho' }, { code: '36', name: 'Bomet' },
    { code: '37', name: 'Kakamega' }, { code: '38', name: 'Vihiga' },
    { code: '39', name: 'Bungoma' }, { code: '40', name: 'Busia' },
    { code: '41', name: 'Siaya' }, { code: '42', name: 'Kisumu' },
    { code: '43', name: 'Homa Bay' }, { code: '44', name: 'Migori' },
    { code: '45', name: 'Kisii' }, { code: '46', name: 'Nyamira' },
    { code: '47', name: 'Nairobi' },
  ],

  // ------ GHANA (16) ------
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

  // ------ EGYPT (27 governorates) ------
  EG: [
    { code: 'DN', name: 'Alexandria' }, { code: 'ASU', name: 'Aswan' },
    { code: 'ASY', name: 'Asyut' }, { code: 'BH', name: 'Beheira' },
    { code: 'BN', name: 'Beni Suef' }, { code: 'C', name: 'Cairo' },
    { code: 'DK', name: 'Dakahlia' }, { code: 'DT', name: 'Damietta' },
    { code: 'FYM', name: 'Faiyum' }, { code: 'GH', name: 'Gharbia' },
    { code: 'GZ', name: 'Giza' }, { code: 'IS', name: 'Ismailia' },
    { code: 'KFS', name: 'Kafr El Sheikh' }, { code: 'LX', name: 'Luxor' },
    { code: 'MN', name: 'Minya' }, { code: 'MNF', name: 'Monufia' },
    { code: 'MT', name: 'Matrouh' }, { code: 'QS', name: 'Qena' },
    { code: 'KB', name: 'Qalyubia' }, { code: 'SHR', name: 'Sharqia' },
    { code: 'SH', name: 'Sohag' }, { code: 'JS', name: 'South Sinai' },
    { code: 'JN', name: 'North Sinai' }, { code: 'SUZ', name: 'Suez' },
    { code: 'PT', name: 'Port Said' }, { code: 'RS', name: 'Red Sea' },
    { code: 'WAD', name: 'New Valley' },
  ],

  // ------ SAUDI ARABIA (13) ------
  SA: [
    { code: '01', name: 'Riyadh' }, { code: '02', name: 'Makkah' },
    { code: '03', name: 'Madinah' }, { code: '04', name: 'Eastern Province' },
    { code: '05', name: 'Asir' }, { code: '06', name: 'Tabuk' },
    { code: '07', name: "Ha'il" }, { code: '08', name: 'Northern Borders' },
    { code: '09', name: 'Jawf' }, { code: '10', name: 'Najran' },
    { code: '11', name: 'Al Bahah' }, { code: '12', name: 'Jizan' },
    { code: '14', name: 'Al Qassim' },
  ],

  // ------ UAE (7) ------
  AE: [
    { code: 'AZ', name: 'Abu Dhabi' }, { code: 'AJ', name: 'Ajman' },
    { code: 'DX', name: 'Dubai' }, { code: 'FU', name: 'Fujairah' },
    { code: 'RA', name: 'Ras Al Khaimah' }, { code: 'SH', name: 'Sharjah' },
    { code: 'UQ', name: 'Umm Al Quwain' },
  ],

  // ------ PAKISTAN (8) ------
  PK: [
    { code: 'BA', name: 'Balochistan' }, { code: 'GB', name: 'Gilgit-Baltistan' },
    { code: 'IS', name: 'Islamabad Capital' }, { code: 'AJ', name: 'Azad Kashmir' },
    { code: 'KP', name: 'Khyber Pakhtunkhwa' }, { code: 'PB', name: 'Punjab' },
    { code: 'SD', name: 'Sindh' }, { code: 'TM', name: 'Tribal Areas' },
  ],

  // ------ BANGLADESH (8) ------
  BD: [
    { code: 'A', name: 'Barisal' }, { code: 'B', name: 'Chittagong' },
    { code: 'C', name: 'Dhaka' }, { code: 'D', name: 'Khulna' },
    { code: 'E', name: 'Rajshahi' }, { code: 'F', name: 'Rangpur' },
    { code: 'G', name: 'Sylhet' }, { code: 'H', name: 'Mymensingh' },
  ],

  // ------ INDONESIA (34) ------
  ID: [
    { code: 'AC', name: 'Aceh' }, { code: 'BA', name: 'Bali' },
    { code: 'BB', name: 'Bangka Belitung' }, { code: 'BE', name: 'Bengkulu' },
    { code: 'BT', name: 'Banten' }, { code: 'BJ', name: 'Central Java' },
    { code: 'KT', name: 'Central Kalimantan' }, { code: 'ST', name: 'Central Sulawesi' },
    { code: 'JI', name: 'East Java' }, { code: 'KI', name: 'East Kalimantan' },
    { code: 'NT', name: 'East Nusa Tenggara' }, { code: 'GO', name: 'Gorontalo' },
    { code: 'JK', name: 'Jakarta' }, { code: 'JA', name: 'Jambi' },
    { code: 'LA', name: 'Lampung' }, { code: 'MA', name: 'Maluku' },
    { code: 'MU', name: 'North Maluku' }, { code: 'NB', name: 'North Kalimantan' },
    { code: 'NS', name: 'North Sulawesi' }, { code: 'NT2', name: 'North Sumatra' },
    { code: 'PA', name: 'Papua' }, { code: 'PB', name: 'West Papua' },
    { code: 'PE', name: 'Riau' }, { code: 'PR', name: 'Riau Islands' },
    { code: 'SS', name: 'South Kalimantan' }, { code: 'SG', name: 'South Sulawesi' },
    { code: 'SR', name: 'South Sumatra' }, { code: 'PS', name: 'Southeast Sulawesi' },
    { code: 'JB', name: 'West Java' }, { code: 'KB', name: 'West Kalimantan' },
    { code: 'NB2', name: 'West Nusa Tenggara' }, { code: 'SB', name: 'West Sulawesi' },
    { code: 'SU', name: 'West Sumatra' }, { code: 'YO', name: 'Yogyakarta' },
  ],

  // ------ PHILIPPINES (17) ------
  PH: [
    { code: 'NCR', name: 'National Capital Region' }, { code: 'CAR', name: 'Cordillera' },
    { code: 'I', name: 'Ilocos Region' }, { code: 'II', name: 'Cagayan Valley' },
    { code: 'III', name: 'Central Luzon' }, { code: 'IV-A', name: 'CALABARZON' },
    { code: 'IV-B', name: 'MIMAROPA' }, { code: 'V', name: 'Bicol Region' },
    { code: 'VI', name: 'Western Visayas' }, { code: 'VII', name: 'Central Visayas' },
    { code: 'VIII', name: 'Eastern Visayas' }, { code: 'IX', name: 'Zamboanga Peninsula' },
    { code: 'X', name: 'Northern Mindanao' }, { code: 'XI', name: 'Davao Region' },
    { code: 'XII', name: 'SOCCSKSARGEN' }, { code: 'XIII', name: 'Caraga' },
    { code: 'BARMM', name: 'Bangsamoro' },
  ],

  // ------ TURKEY (81) ------
  TR: [
    { code: '01', name: 'Adana' }, { code: '02', name: 'Adiyaman' },
    { code: '03', name: 'Afyonkarahisar' }, { code: '04', name: 'Agri' },
    { code: '05', name: 'Amasya' }, { code: '06', name: 'Ankara' },
    { code: '07', name: 'Antalya' }, { code: '08', name: 'Artvin' },
    { code: '09', name: 'Aydin' }, { code: '10', name: 'Balikesir' },
    { code: '11', name: 'Bilecik' }, { code: '12', name: 'Bingol' },
    { code: '13', name: 'Bitlis' }, { code: '14', name: 'Bolu' },
    { code: '15', name: 'Burdur' }, { code: '16', name: 'Bursa' },
    { code: '17', name: 'Canakkale' }, { code: '18', name: 'Cankiri' },
    { code: '19', name: 'Corum' }, { code: '20', name: 'Denizli' },
    { code: '21', name: 'Diyarbakir' }, { code: '22', name: 'Edirne' },
    { code: '23', name: 'Elazig' }, { code: '24', name: 'Erzincan' },
    { code: '25', name: 'Erzurum' }, { code: '26', name: 'Eskisehir' },
    { code: '27', name: 'Gaziantep' }, { code: '28', name: 'Giresun' },
    { code: '29', name: 'Gumushane' }, { code: '30', name: 'Hakkari' },
    { code: '31', name: 'Hatay' }, { code: '32', name: 'Igdir' },
    { code: '33', name: 'Isparta' }, { code: '34', name: 'Istanbul' },
    { code: '35', name: 'Izmir' }, { code: '36', name: 'Kahramanmaras' },
    { code: '37', name: 'Karabuk' }, { code: '38', name: 'Karaman' },
    { code: '39', name: 'Kars' }, { code: '40', name: 'Kastamonu' },
    { code: '41', name: 'Kayseri' }, { code: '42', name: 'Kirikkale' },
    { code: '43', name: 'Kirklareli' }, { code: '44', name: 'Kirsehir' },
    { code: '45', name: 'Kilis' }, { code: '46', name: 'Konya' },
    { code: '47', name: 'Kutahya' }, { code: '48', name: 'Malatya' },
    { code: '49', name: 'Manisa' }, { code: '50', name: 'Mardin' },
    { code: '51', name: 'Mersin' }, { code: '52', name: 'Mugla' },
    { code: '53', name: 'Mus' }, { code: '54', name: 'Nevsehir' },
    { code: '55', name: 'Nigde' }, { code: '56', name: 'Ordu' },
    { code: '57', name: 'Osmaniye' }, { code: '58', name: 'Rize' },
    { code: '59', name: 'Sakarya' }, { code: '60', name: 'Samsun' },
    { code: '61', name: 'Sanliurfa' }, { code: '62', name: 'Siirt' },
    { code: '63', name: 'Sinop' }, { code: '64', name: 'Sirnak' },
    { code: '65', name: 'Sivas' }, { code: '66', name: 'Tekirdag' },
    { code: '67', name: 'Tokat' }, { code: '68', name: 'Trabzon' },
    { code: '69', name: 'Tunceli' }, { code: '70', name: 'Usak' },
    { code: '71', name: 'Van' }, { code: '72', name: 'Yalova' },
    { code: '73', name: 'Yozgat' }, { code: '74', name: 'Zonguldak' },
    { code: '75', name: 'Aksaray' }, { code: '76', name: 'Bayburt' },
    { code: '77', name: 'Karaman' }, { code: '78', name: 'Kirikkale' },
    { code: '79', name: 'Batman' }, { code: '80', name: 'Sirnak' },
    { code: '81', name: 'Duzce' },
  ],

  // ------ ITALY (20) ------
  IT: [
    { code: 'ABR', name: 'Abruzzo' }, { code: 'BAS', name: 'Basilicata' },
    { code: 'CAL', name: 'Calabria' }, { code: 'CAM', name: 'Campania' },
    { code: 'EMR', name: 'Emilia-Romagna' }, { code: 'FVG', name: 'Friuli-Venezia Giulia' },
    { code: 'LAZ', name: 'Lazio' }, { code: 'LIG', name: 'Liguria' },
    { code: 'LOM', name: 'Lombardy' }, { code: 'MAR', name: 'Marche' },
    { code: 'MOL', name: 'Molise' }, { code: 'PIE', name: 'Piedmont' },
    { code: 'PUG', name: 'Puglia' }, { code: 'SAR', name: 'Sardinia' },
    { code: 'SIC', name: 'Sicily' }, { code: 'TOS', name: 'Tuscany' },
    { code: 'TAA', name: 'Trentino-Alto Adige' }, { code: 'UMB', name: 'Umbria' },
    { code: 'VAO', name: "Valle d'Aosta" }, { code: 'VEN', name: 'Veneto' },
  ],

  // ------ SPAIN (17) ------
  ES: [
    { code: 'AN', name: 'Andalusia' }, { code: 'AR', name: 'Aragon' },
    { code: 'AS', name: 'Asturias' }, { code: 'CB', name: 'Cantabria' },
    { code: 'CE', name: 'Ceuta' }, { code: 'CL', name: 'Castile and Leon' },
    { code: 'CM', name: 'Castile-La Mancha' }, { code: 'CN', name: 'Canary Islands' },
    { code: 'CT', name: 'Catalonia' }, { code: 'EX', name: 'Extremadura' },
    { code: 'GA', name: 'Galicia' }, { code: 'IB', name: 'Balearic Islands' },
    { code: 'MC', name: 'Murcia' }, { code: 'MD', name: 'Madrid' },
    { code: 'ML', name: 'Melilla' }, { code: 'NC', name: 'Navarre' },
    { code: 'PV', name: 'Basque Country' }, { code: 'RI', name: 'La Rioja' },
  ],

  // ------ RUSSIA (30+) ------
  RU: [
    { code: 'MOW', name: 'Moscow' }, { code: 'SPE', name: 'Saint Petersburg' },
    { code: 'KDA', name: 'Krasnodar Krai' }, { code: 'SVE', name: 'Sverdlovsk Oblast' },
    { code: 'ROS', name: 'Rostov Oblast' }, { code: 'NIZ', name: 'Nizhny Novgorod Oblast' },
    { code: 'SAM', name: 'Samara Oblast' }, { code: 'KEM', name: 'Kemerovo Oblast' },
    { code: 'NVS', name: 'Novosibirsk Oblast' }, { code: 'PER', name: 'Perm Krai' },
    { code: 'TAT', name: 'Tatarstan' }, { code: 'CHE', name: 'Chelyabinsk Oblast' },
    { code: 'OMS', name: 'Omsk Oblast' }, { code: 'VGG', name: 'Volgograd Oblast' },
    { code: 'KHA', name: 'Khabarovsk Krai' }, { code: 'PRI', name: 'Primorsky Krai' },
    { code: 'VLG', name: 'Vologda Oblast' }, { code: 'TUL', name: 'Tula Oblast' },
    { code: 'YAR', name: 'Yaroslavl Oblast' }, { code: 'IRK', name: 'Irkutsk Oblast' },
    { code: 'BEL', name: 'Belgorod Oblast' }, { code: 'KLU', name: 'Kaluga Oblast' },
    { code: 'LEN', name: 'Leningrad Oblast' }, { code: 'MOS', name: 'Moscow Oblast' },
    { code: 'UD', name: 'Udmurtia' }, { code: 'BA', name: 'Bashkortostan' },
    { code: 'DA', name: 'Dagestan' }, { code: 'KR', name: 'Krasnoyarsk Krai' },
    { code: 'AL', name: 'Altai Krai' }, { code: 'ST', name: 'Stavropol Krai' },
    { code: 'AMU', name: 'Amur Oblast' }, { code: 'ARK', name: 'Arkhangelsk Oblast' },
    { code: 'AST', name: 'Astrakhan Oblast' }, { code: 'BRY', name: 'Bryansk Oblast' },
    { code: 'VLA', name: 'Vladimir Oblast' }, { code: 'VOR', name: 'Voronezh Oblast' },
    { code: 'IVA', name: 'Ivanovo Oblast' }, { code: 'KIR', name: 'Kirov Oblast' },
    { code: 'KOS', name: 'Kostroma Oblast' }, { code: 'KUR', name: 'Kursk Oblast' },
    { code: 'LIP', name: 'Lipetsk Oblast' }, { code: 'MAG', name: 'Magadan Oblast' },
    { code: 'MUR', name: 'Murmansk Oblast' }, { code: 'NIZ2', name: 'Nizhny Novgorod' },
    { code: 'NGR', name: 'Novgorod Oblast' }, { code: 'PSK', name: 'Pskov Oblast' },
    { code: 'RYA', name: 'Ryazan Oblast' }, { code: 'SAK', name: 'Sakhalin Oblast' },
    { code: 'SMO', name: 'Smolensk Oblast' }, { code: 'TMB', name: 'Tambov Oblast' },
    { code: 'TOM', name: 'Tomsk Oblast' }, { code: 'TYU', name: 'Tyumen Oblast' },
    { code: 'ULY', name: 'Ulyanovsk Oblast' }, { code: 'CHE2', name: 'Chelyabinsk' },
  ],

  // ------ ARGENTINA (24) ------
  AR: [
    { code: 'A', name: 'Salta' }, { code: 'B', name: 'Buenos Aires' },
    { code: 'C', name: 'Ciudad de Buenos Aires' }, { code: 'D', name: 'San Luis' },
    { code: 'E', name: 'Entre Rios' }, { code: 'F', name: 'La Rioja' },
    { code: 'G', name: 'Santiago del Estero' }, { code: 'H', name: 'Chaco' },
    { code: 'J', name: 'San Juan' }, { code: 'K', name: 'Catamarca' },
    { code: 'L', name: 'La Pampa' }, { code: 'M', name: 'Mendoza' },
    { code: 'N', name: 'Misiones' }, { code: 'P', name: 'Formosa' },
    { code: 'Q', name: 'Neuquen' }, { code: 'R', name: 'Rio Negro' },
    { code: 'S', name: 'Santa Fe' }, { code: 'T', name: 'Tucuman' },
    { code: 'U', name: 'Chubut' }, { code: 'V', name: 'Tierra del Fuego' },
    { code: 'W', name: 'Corrientes' }, { code: 'X', name: 'Cordoba' },
    { code: 'Y', name: 'Jujuy' }, { code: 'Z', name: 'Santa Cruz' },
  ],

  // ------ COLOMBIA (32) ------
  CO: [
    { code: 'AMA', name: 'Amazonas' }, { code: 'ANT', name: 'Antioquia' },
    { code: 'ARA', name: 'Arauca' }, { code: 'ATL', name: 'Atlantico' },
    { code: 'BOL', name: 'Bolivar' }, { code: 'BOY', name: 'Boyaca' },
    { code: 'CAL', name: 'Caldas' }, { code: 'CAQ', name: 'Caqueta' },
    { code: 'CAS', name: 'Casanare' }, { code: 'CAU', name: 'Cauca' },
    { code: 'CES', name: 'Cesar' }, { code: 'CHO', name: 'Choco' },
    { code: 'COR', name: 'Cordoba' }, { code: 'CUN', name: 'Cundinamarca' },
    { code: 'GUA', name: 'Guainia' }, { code: 'GUV', name: 'Guaviare' },
    { code: 'HUI', name: 'Huila' }, { code: 'LAG', name: 'La Guajira' },
    { code: 'MAG', name: 'Magdalena' }, { code: 'MET', name: 'Meta' },
    { code: 'NAR', name: 'Narino' }, { code: 'NSA', name: 'Norte de Santander' },
    { code: 'PUT', name: 'Putumayo' }, { code: 'QUI', name: 'Quindio' },
    { code: 'RIS', name: 'Risaralda' }, { code: 'SAP', name: 'San Andres' },
    { code: 'SAN', name: 'Santander' }, { code: 'SUC', name: 'Sucre' },
    { code: 'TOL', name: 'Tolima' }, { code: 'VAC', name: 'Valle del Cauca' },
    { code: 'VAU', name: 'Vaupes' }, { code: 'VID', name: 'Vichada' },
    { code: 'DC', name: 'Bogota D.C.' },
  ],

  // ------ THAILAND (77) ------
  TH: [
    { code: '10', name: 'Bangkok' }, { code: '11', name: 'Samut Prakan' },
    { code: '12', name: 'Nonthaburi' }, { code: '13', name: 'Pathum Thani' },
    { code: '14', name: 'Phra Nakhon Si Ayutthaya' }, { code: '15', name: 'Ang Thong' },
    { code: '16', name: 'Lop Buri' }, { code: '17', name: 'Sing Buri' },
    { code: '18', name: 'Chai Nat' }, { code: '19', name: 'Saraburi' },
    { code: '20', name: 'Chon Buri' }, { code: '21', name: 'Rayong' },
    { code: '22', name: 'Chachoengsao' }, { code: '23', name: 'Prachin Buri' },
    { code: '24', name: 'Nakhon Nayok' }, { code: '25', name: 'Sa Kaeo' },
    { code: '26', name: 'Prachuap Khiri Khan' }, { code: '27', name: 'Phetchaburi' },
    { code: '30', name: 'Nakhon Ratchasima' }, { code: '31', name: 'Buri Ram' },
    { code: '32', name: 'Surin' }, { code: '33', name: 'Si Sa Ket' },
    { code: '34', name: 'Ubon Ratchathani' }, { code: '35', name: 'Yasothon' },
    { code: '36', name: 'Chaiyaphum' }, { code: '37', name: 'Amnat Charoen' },
    { code: '38', name: 'Nong Bua Lam Phu' }, { code: '39', name: 'Khon Kaen' },
    { code: '40', name: 'Udon Thani' }, { code: '41', name: 'Loei' },
    { code: '42', name: 'Nong Khai' }, { code: '43', name: 'Maha Sarakham' },
    { code: '44', name: 'Roi Et' }, { code: '45', name: 'Kalasin' },
    { code: '46', name: 'Sakon Nakhon' }, { code: '47', name: 'Nakhon Phanom' },
    { code: '48', name: 'Mukdahan' }, { code: '49', name: 'Chiang Mai' },
    { code: '50', name: 'Lamphun' }, { code: '51', name: 'Lampang' },
    { code: '52', name: 'Uttaradit' }, { code: '53', name: 'Phrae' },
    { code: '54', name: 'Nan' }, { code: '55', name: 'Phayao' },
    { code: '56', name: 'Chiang Rai' }, { code: '57', name: 'Mae Hong Son' },
    { code: '58', name: 'Nakhon Sawan' }, { code: '59', name: 'Uthai Thani' },
    { code: '60', name: 'Kamphaeng Phet' }, { code: '61', name: 'Tak' },
    { code: '62', name: 'Sukhothai' }, { code: '63', name: 'Phitsanulok' },
    { code: '64', name: 'Phichit' }, { code: '65', name: 'Phetchabun' },
    { code: '66', name: 'Ratchaburi' }, { code: '67', name: 'Kanchanaburi' },
    { code: '68', name: 'Suphan Buri' }, { code: '69', name: 'Nakhon Pathom' },
    { code: '70', name: 'Samut Sakhon' }, { code: '71', name: 'Samut Songkhram' },
    { code: '72', name: 'Phuket' }, { code: '73', name: 'Surat Thani' },
    { code: '74', name: 'Ranong' }, { code: '75', name: 'Chumphon' },
    { code: '76', name: 'Nakhon Si Thammarat' }, { code: '77', name: 'Krabi' },
    { code: '80', name: 'Phang Nga' }, { code: '81', name: 'Phatthalung' },
    { code: '82', name: 'Satun' }, { code: '83', name: 'Trang' },
    { code: '84', name: 'Phuket' }, { code: '85', name: 'Narathiwat' },
    { code: '86', name: 'Pattani' }, { code: '90', name: 'Songkhla' },
    { code: '91', name: 'Yala' }, { code: '92', name: 'Chumphon' },
  ],

  // ------ VIETNAM (63) ------
  VN: [
    { code: '01', name: 'Ha Noi' }, { code: '02', name: 'Ha Giang' },
    { code: '04', name: 'Cao Bang' }, { code: '06', name: 'Bac Kan' },
    { code: '08', name: 'Tuyen Quang' }, { code: '10', name: 'Lao Cai' },
    { code: '11', name: 'Dien Bien' }, { code: '12', name: 'Lai Chau' },
    { code: '14', name: 'Son La' }, { code: '15', name: 'Yen Bai' },
    { code: '17', name: 'Hoa Binh' }, { code: '19', name: 'Thai Nguyen' },
    { code: '20', name: 'Lang Son' }, { code: '22', name: 'Quang Ninh' },
    { code: '24', name: 'Bac Giang' }, { code: '25', name: 'Phu Tho' },
    { code: '26', name: 'Vinh Phuc' }, { code: '27', name: 'Bac Ninh' },
    { code: '30', name: 'Hai Phong' }, { code: '31', name: 'Hai Duong' },
    { code: '33', name: 'Hung Yen' }, { code: '34', name: 'Thai Binh' },
    { code: '35', name: 'Ha Nam' }, { code: '36', name: 'Nam Dinh' },
    { code: '37', name: 'Ninh Binh' }, { code: '38', name: 'Thanh Hoa' },
    { code: '40', name: 'Nghe An' }, { code: '42', name: 'Ha Tinh' },
    { code: '44', name: 'Quang Binh' }, { code: '45', name: 'Quang Tri' },
    { code: '46', name: 'Thua Thien Hue' }, { code: '48', name: 'Da Nang' },
    { code: '49', name: 'Quang Nam' }, { code: '51', name: 'Quang Ngai' },
    { code: '52', name: 'Binh Dinh' }, { code: '53', name: 'Phu Yen' },
    { code: '54', name: 'Khanh Hoa' }, { code: '56', name: 'Ninh Thuan' },
    { code: '58', name: 'Binh Thuan' }, { code: '60', name: 'Kon Tum' },
    { code: '61', name: 'Gia Lai' }, { code: '62', name: 'Dak Lak' },
    { code: '64', name: 'Lam Dong' }, { code: '66', name: 'Binh Phuoc' },
    { code: '67', name: 'Binh Duong' }, { code: '68', name: 'Dong Nai' },
    { code: '70', name: 'Vung Tau' }, { code: '72', name: 'Tay Ninh' },
    { code: '73', name: 'Binh Duong' }, { code: '74', name: 'Dong Thap' },
    { code: '75', name: 'An Giang' }, { code: '77', name: 'Tien Giang' },
    { code: '78', name: 'Vinh Long' }, { code: '79', name: 'Ben Tre' },
    { code: '80', name: 'Tra Vinh' }, { code: '82', name: 'Soc Trang' },
    { code: '83', name: 'Bac Lieu' }, { code: '84', name: 'Ca Mau' },
    { code: '86', name: 'Kien Giang' }, { code: '87', name: 'Can Tho' },
    { code: '89', name: 'Hau Giang' }, { code: '90', name: 'Dak Nong' },
    { code: '91', name: 'Dien Bien' },
  ],

  // ------ SOUTH KOREA (17) ------
  KR: [
    { code: '11', name: 'Seoul' }, { code: '26', name: 'Busan' },
    { code: '27', name: 'Daegu' }, { code: '28', name: 'Incheon' },
    { code: '29', name: 'Gwangju' }, { code: '30', name: 'Daejeon' },
    { code: '31', name: 'Ulsan' }, { code: '41', name: 'Gyeonggi' },
    { code: '42', name: 'Gangwon' }, { code: '43', name: 'Chungbuk' },
    { code: '44', name: 'Chungnam' }, { code: '45', name: 'Jeonbuk' },
    { code: '46', name: 'Jeonnam' }, { code: '47', name: 'Gyeongbuk' },
    { code: '48', name: 'Gyeongnam' }, { code: '49', name: 'Jeju' },
    { code: '50', name: 'Sejong' },
  ],

  // ------ SWEDEN (21) ------
  SE: [
    { code: 'AB', name: 'Stockholm' }, { code: 'AC', name: 'Vasterbotten' },
    { code: 'BD', name: 'Norrbotten' }, { code: 'C', name: 'Uppsala' },
    { code: 'D', name: 'Sodermanland' }, { code: 'E', name: 'Ostergotland' },
    { code: 'F', name: 'Jonkoping' }, { code: 'G', name: 'Kronoberg' },
    { code: 'H', name: 'Kalmar' }, { code: 'I', name: 'Gotland' },
    { code: 'K', name: 'Blekinge' }, { code: 'M', name: 'Skane' },
    { code: 'N', name: 'Halland' }, { code: 'O', name: 'Vastra Gotaland' },
    { code: 'S', name: 'Varmland' }, { code: 'T', name: 'Orebro' },
    { code: 'U', name: 'Vastmanland' }, { code: 'W', name: 'Dalarna' },
    { code: 'X', name: 'Gavleborg' }, { code: 'Y', name: 'Vasternorrland' },
    { code: 'Z', name: 'Jamtland' },
  ],

  // ------ SWITZERLAND (26 cantons) ------
  CH: [
    { code: 'AG', name: 'Aargau' }, { code: 'AI', name: 'Appenzell Innerrhoden' },
    { code: 'AR', name: 'Appenzell Ausserrhoden' }, { code: 'BE', name: 'Bern' },
    { code: 'BL', name: 'Basel-Landschaft' }, { code: 'BS', name: 'Basel-Stadt' },
    { code: 'FR', name: 'Fribourg' }, { code: 'GE', name: 'Geneva' },
    { code: 'GL', name: 'Glarus' }, { code: 'GR', name: 'Graubunden' },
    { code: 'JU', name: 'Jura' }, { code: 'LU', name: 'Lucerne' },
    { code: 'NE', name: 'Neuchatel' }, { code: 'NW', name: 'Nidwalden' },
    { code: 'OW', name: 'Obwalden' }, { code: 'SG', name: 'St. Gallen' },
    { code: 'SH', name: 'Schaffhausen' }, { code: 'SO', name: 'Solothurn' },
    { code: 'SZ', name: 'Schwyz' }, { code: 'TG', name: 'Thurgau' },
    { code: 'TI', name: 'Ticino' }, { code: 'UR', name: 'Uri' },
    { code: 'VD', name: 'Vaud' }, { code: 'VS', name: 'Valais' },
    { code: 'ZG', name: 'Zug' }, { code: 'ZH', name: 'Zurich' },
  ],

  // ------ NETHERLANDS (12) ------
  NL: [
    { code: 'DR', name: 'Drenthe' }, { code: 'FL', name: 'Flevoland' },
    { code: 'FR', name: 'Friesland' }, { code: 'GE', name: 'Gelderland' },
    { code: 'GR', name: 'Groningen' }, { code: 'LI', name: 'Limburg' },
    { code: 'NB', name: 'North Brabant' }, { code: 'NH', name: 'North Holland' },
    { code: 'OV', name: 'Overijssel' }, { code: 'UT', name: 'Utrecht' },
    { code: 'ZE', name: 'Zeeland' }, { code: 'ZH', name: 'South Holland' },
  ],

  // ------ BELGIUM (10+) ------
  BE: [
    { code: 'VAN', name: 'Antwerp' }, { code: 'VBR', name: 'Flemish Brabant' },
    { code: 'WBR', name: 'Walloon Brabant' }, { code: 'VLI', name: 'Limburg' },
    { code: 'VOV', name: 'East Flanders' }, { code: 'VWV', name: 'West Flanders' },
    { code: 'WHT', name: 'Hainaut' }, { code: 'WLG', name: 'Liege' },
    { code: 'WLX', name: 'Luxembourg' }, { code: 'WNA', name: 'Namur' },
    { code: 'BRU', name: 'Brussels-Capital' },
  ],

  // ------ NORWAY (11) ------
  NO: [
    { code: '03', name: 'Oslo' }, { code: '11', name: 'Rogaland' },
    { code: '15', name: 'More og Romsdal' }, { code: '18', name: 'Nordland' },
    { code: '21', name: 'Svalbard' }, { code: '22', name: 'Jan Mayen' },
    { code: '30', name: 'Viken' }, { code: '34', name: 'Innlandet' },
    { code: '38', name: 'Vestfold og Telemark' }, { code: '42', name: 'Agder' },
    { code: '46', name: 'Vestland' }, { code: '50', name: 'Troms og Finnmark' },
  ],

  // ------ FINLAND (19) ------
  FI: [
    { code: '01', name: 'Uusimaa' }, { code: '02', name: 'Varsinais-Suomi' },
    { code: '03', name: 'Satakunta' }, { code: '04', name: 'Kanta-Hame' },
    { code: '05', name: 'Pirkanmaa' }, { code: '06', name: 'Paijat-Hame' },
    { code: '07', name: 'Kymenlaakso' }, { code: '08', name: 'South Karelia' },
    { code: '09', name: 'Etelä-Savo' }, { code: '10', name: 'Pohjois-Savo' },
    { code: '11', name: 'North Karelia' }, { code: '12', name: 'Central Finland' },
    { code: '13', name: 'South Ostrobothnia' }, { code: '14', name: 'Ostrobothnia' },
    { code: '15', name: 'Central Ostrobothnia' }, { code: '16', name: 'North Ostrobothnia' },
    { code: '17', name: 'Kainuu' }, { code: '18', name: 'Lapland' },
    { code: '19', name: 'Aland' },
  ],

  // ------ NEW ZEALAND (17) ------
  NZ: [
    { code: 'AUK', name: 'Auckland' }, { code: 'BOP', name: 'Bay of Plenty' },
    { code: 'CAN', name: 'Canterbury' }, { code: 'GIS', name: 'Gisborne' },
    { code: 'HKB', name: "Hawke's Bay" }, { code: 'MBH', name: 'Marlborough' },
    { code: 'MWT', name: 'Manawatu-Whanganui' }, { code: 'NSN', name: 'Nelson' },
    { code: 'NTL', name: 'Northland' }, { code: 'OTA', name: 'Otago' },
    { code: 'STL', name: 'Southland' }, { code: 'TKI', name: 'Taranaki' },
    { code: 'TAS', name: 'Tasman' }, { code: 'WGN', name: 'Wellington' },
    { code: 'WKO', name: 'Waikato' }, { code: 'WTC', name: 'West Coast' },
    { code: 'CIT', name: 'Chatham Islands' },
  ],

  // ------ POLAND (16) ------
  PL: [
    { code: '02', name: 'Lower Silesia' }, { code: '04', name: 'Kuyavia-Pomerania' },
    { code: '06', name: 'Lublin' }, { code: '08', name: 'Lubusz' },
    { code: '10', name: 'Lodz' }, { code: '12', name: 'Lesser Poland' },
    { code: '14', name: 'Mazovia' }, { code: '16', name: 'Opole' },
    { code: '18', name: 'Subcarpathia' }, { code: '20', name: 'Podlasie' },
    { code: '22', name: 'Pomerania' }, { code: '24', name: 'Silesia' },
    { code: '26', name: 'Swietokrzyskie' }, { code: '28', name: 'Warmia-Masuria' },
    { code: '30', name: 'Greater Poland' }, { code: '32', name: 'West Pomerania' },
  ],

  // ------ PORTUGAL (7+) ------
  PT: [
    { code: '01', name: 'Aveiro' }, { code: '02', name: 'Beja' },
    { code: '03', name: 'Braga' }, { code: '04', name: 'Braganca' },
    { code: '05', name: 'Castelo Branco' }, { code: '06', name: 'Coimbra' },
    { code: '07', name: 'Evora' }, { code: '08', name: 'Faro' },
    { code: '09', name: 'Guarda' }, { code: '10', name: 'Leiria' },
    { code: '11', name: 'Lisbon' }, { code: '12', name: 'Portalegre' },
    { code: '13', name: 'Porto' }, { code: '14', name: 'Santarem' },
    { code: '15', name: 'Setubal' }, { code: '16', name: 'Viana do Castelo' },
    { code: '17', name: 'Vila Real' }, { code: '18', name: 'Viseu' },
    { code: '20', name: 'Azores' }, { code: '30', name: 'Madeira' },
  ],

  // ------ MOROCCO (12) ------
  MA: [
    { code: '01', name: 'Tanger-Tetouan-Al Hoceima' }, { code: '02', name: 'Oriental' },
    { code: '03', name: 'Fes-Meknes' }, { code: '04', name: 'Rabat-Sale-Kenitra' },
    { code: '05', name: 'Beni Mellal-Khenifra' }, { code: '06', name: 'Casablanca-Settat' },
    { code: '07', name: 'Marrakech-Safi' }, { code: '08', name: 'Draa-Tafilalet' },
    { code: '09', name: 'Souss-Massa' }, { code: '10', name: 'Guelmim-Oued Noun' },
    { code: '11', name: 'Laayoune-Sakia El Hamra' }, { code: '12', name: 'Dakhla-Oued Ed-Dahab' },
  ],

  // ------ ALGERIA (58) ------
  DZ: [
    { code: '01', name: 'Adrar' }, { code: '02', name: 'Chlef' },
    { code: '03', name: 'Laghouat' }, { code: '04', name: 'Oum El Bouaghi' },
    { code: '05', name: 'Batna' }, { code: '06', name: 'Bejaia' },
    { code: '07', name: 'Biskra' }, { code: '08', name: 'Bechar' },
    { code: '09', name: 'Blida' }, { code: '10', name: 'Bouira' },
    { code: '11', name: 'Tamanrasset' }, { code: '12', name: 'Tebessa' },
    { code: '13', name: 'Tlemcen' }, { code: '14', name: 'Tiaret' },
    { code: '15', name: 'Tizi Ouzou' }, { code: '16', name: 'Alger' },
    { code: '17', name: 'Djelfa' }, { code: '18', name: 'Jijel' },
    { code: '19', name: 'Setif' }, { code: '20', name: 'Saida' },
    { code: '21', name: 'Skikda' }, { code: '22', name: 'Sidi Bel Abbes' },
    { code: '23', name: 'Annaba' }, { code: '24', name: 'Guelma' },
    { code: '25', name: 'Constantine' }, { code: '26', name: 'Medea' },
    { code: '27', name: 'Mostaganem' }, { code: '28', name: 'MSila' },
    { code: '29', name: 'Mascara' }, { code: '30', name: 'Ouargla' },
    { code: '31', name: 'Oran' }, { code: '32', name: 'El Bayadh' },
    { code: '33', name: 'Illizi' }, { code: '34', name: 'Bordj Bou Arreridj' },
    { code: '35', name: 'Boumerdes' }, { code: '36', name: 'El Tarf' },
    { code: '37', name: 'Tindouf' }, { code: '38', name: 'Tissemsilt' },
    { code: '39', name: 'El Oued' }, { code: '40', name: 'Khenchela' },
    { code: '41', name: 'Souk Ahras' }, { code: '42', name: 'Tipaza' },
    { code: '43', name: 'Mila' }, { code: '44', name: 'Ain Defla' },
    { code: '45', name: 'Naama' }, { code: '46', name: 'Ain Temouchent' },
    { code: '47', name: 'Ghardaia' }, { code: '48', name: 'Relizane' },
    { code: '49', name: 'El Mughair' }, { code: '50', name: 'El Meniaa' },
    { code: '51', name: 'Ouled Djellal' }, { code: '52', name: 'Bordj Badji Mokhtar' },
    { code: '53', name: 'Beni Abbes' }, { code: '54', name: 'Timimoun' },
    { code: '55', name: 'Touggourt' }, { code: '56', name: 'Djanet' },
    { code: '57', name: 'In Salah' }, { code: '58', name: 'In Guezzam' },
  ],

  // ------ TUNISIA (24) ------
  TN: [
    { code: '11', name: 'Tunis' }, { code: '12', name: 'Ariana' },
    { code: '13', name: 'Ben Arous' }, { code: '14', name: 'Manouba' },
    { code: '21', name: 'Nabeul' }, { code: '22', name: 'Zaghouan' },
    { code: '23', name: 'Bizerte' }, { code: '31', name: 'Beja' },
    { code: '32', name: 'Jendouba' }, { code: '33', name: 'Le Kef' },
    { code: '34', name: 'Siliana' }, { code: '41', name: 'Sousse' },
    { code: '42', name: 'Monastir' }, { code: '43', name: 'Mahdia' },
    { code: '44', name: 'Sfax' }, { code: '51', name: 'Kairouan' },
    { code: '52', name: 'Kasserine' }, { code: '53', name: 'Sidi Bouzid' },
    { code: '61', name: 'Gabes' }, { code: '62', name: 'Medenine' },
    { code: '63', name: 'Tataouine' }, { code: '71', name: 'Gafsa' },
    { code: '72', name: 'Tozeur' }, { code: '73', name: 'Kebili' },
  ],

  // ------ SINGAPORE (5 districts) ------
  SG: [
    { code: '01', name: 'Central Region' }, { code: '02', name: 'East Region' },
    { code: '03', name: 'North Region' }, { code: '04', name: 'North-East Region' },
    { code: '05', name: 'West Region' },
  ],

  // ------ MALAYSIA (16) ------
  MY: [
    { code: '01', name: 'Johor' }, { code: '02', name: 'Kedah' },
    { code: '03', name: 'Kelantan' }, { code: '04', name: 'Kuala Lumpur' },
    { code: '05', name: 'Labuan' }, { code: '06', name: 'Malacca' },
    { code: '07', name: 'Negeri Sembilan' }, { code: '08', name: 'Pahang' },
    { code: '09', name: 'Penang' }, { code: '10', name: 'Perak' },
    { code: '11', name: 'Perlis' }, { code: '12', name: 'Putrajaya' },
    { code: '13', name: 'Sabah' }, { code: '14', name: 'Sarawak' },
    { code: '15', name: 'Selangor' }, { code: '16', name: 'Terengganu' },
  ],

  // ------ RWANDA (5) ------
  RW: [
    { code: '01', name: 'Kigali City' }, { code: '02', name: 'Northern Province' },
    { code: '03', name: 'Southern Province' }, { code: '04', name: 'Eastern Province' },
    { code: '05', name: 'Western Province' },
  ],

  // ------ TANZANIA (31) ------
  TZ: [
    { code: '01', name: 'Arusha' }, { code: '02', name: 'Dar es Salaam' },
    { code: '03', name: 'Dodoma' }, { code: '04', name: 'Iringa' },
    { code: '05', name: 'Kagera' }, { code: '06', name: 'Kigoma' },
    { code: '07', name: 'Kilimanjaro' }, { code: '08', name: 'Lindi' },
    { code: '09', name: 'Mara' }, { code: '10', name: 'Mbeya' },
    { code: '11', name: 'Morogoro' }, { code: '12', name: 'Mtwara' },
    { code: '13', name: 'Mwanza' }, { code: '14', name: 'Pemba North' },
    { code: '15', name: 'Pemba South' }, { code: '16', name: 'Pwani' },
    { code: '17', name: 'Rukwa' }, { code: '18', name: 'Ruvuma' },
    { code: '19', name: 'Shinyanga' }, { code: '20', name: 'Singida' },
    { code: '21', name: 'Tabora' }, { code: '22', name: 'Tanga' },
    { code: '23', name: 'Zanzibar North' }, { code: '24', name: 'Zanzibar Urban' },
    { code: '25', name: 'Zanzibar West' }, { code: '26', name: 'Geita' },
    { code: '27', name: 'Katavi' }, { code: '28', name: 'Njombe' },
    { code: '29', name: 'Simiyu' }, { code: '30', name: 'Songwe' },
    { code: '31', name: 'Kusini Pemba' },
  ],

  // ------ UGANDA (major districts) ------
  UG: [
    { code: '101', name: 'Kampala' }, { code: '102', name: 'Wakiso' },
    { code: '103', name: 'Mukono' }, { code: '104', name: 'Jinja' },
    { code: '105', name: 'Entebbe' }, { code: '106', name: 'Gulu' },
    { code: '107', name: 'Lira' }, { code: '108', name: 'Mbale' },
    { code: '109', name: 'Mbarara' }, { code: '110', name: 'Fort Portal' },
    { code: '111', name: 'Masaka' }, { code: '112', name: 'Arua' },
    { code: '113', name: 'Soroti' }, { code: '114', name: 'Hoima' },
    { code: '115', name: 'Masindi' }, { code: '116', name: 'Kabale' },
    { code: '117', name: 'Tororo' }, { code: '118', name: 'Pallisa' },
    { code: '119', name: 'Kasese' }, { code: '120', name: 'Iganga' },
    { code: '121', name: 'Luweero' }, { code: '122', name: 'Kabarole' },
    { code: '123', name: 'Ntungamo' }, { code: '124', name: 'Bushenyi' },
    { code: '125', name: 'Kamuli' }, { code: '126', name: 'Kumi' },
    { code: '127', name: 'Mpigi' }, { code: '128', name: 'Rakai' },
    { code: '129', name: 'Ssembabule' }, { code: '130', name: 'Kalangala' },
  ],

  // ------ ETHIOPIA (11 regions) ------
  ET: [
    { code: 'AA', name: 'Addis Ababa' }, { code: 'AF', name: 'Afar' },
    { code: 'AM', name: 'Amhara' }, { code: 'BE', name: 'Benishangul-Gumuz' },
    { code: 'DD', name: 'Dire Dawa' }, { code: 'GA', name: 'Gambela' },
    { code: 'HA', name: 'Harari' }, { code: 'OR', name: 'Oromia' },
    { code: 'SO', name: 'Somali' }, { code: 'SN', name: 'Southern Nations' },
    { code: 'TI', name: 'Tigray' },
  ],

  // ------ IRELAND (26+ counties) ------
  IE: [
    { code: 'C', name: 'Cork' }, { code: 'D', name: 'Dublin' },
    { code: 'G', name: 'Galway' }, { code: 'L', name: 'Limerick' },
    { code: 'W', name: 'Waterford' }, { code: 'CE', name: 'Clare' },
    { code: 'CN', name: 'Cavan' }, { code: 'CW', name: 'Carlow' },
    { code: 'DL', name: 'Donegal' }, { code: 'KE', name: 'Kildare' },
    { code: 'KK', name: 'Kilkenny' }, { code: 'LS', name: 'Laois' },
    { code: 'LD', name: 'Longford' }, { code: 'LH', name: 'Louth' },
    { code: 'MO', name: 'Mayo' }, { code: 'MH', name: 'Meath' },
    { code: 'MN', name: 'Monaghan' }, { code: 'OY', name: 'Offaly' },
    { code: 'RN', name: 'Roscommon' }, { code: 'SO', name: 'Sligo' },
    { code: 'T', name: 'Tipperary' }, { code: 'WD', name: 'Westmeath' },
    { code: 'WX', name: 'Wexford' }, { code: 'WH', name: 'Wicklow' },
    { code: 'KY', name: 'Kerry' }, { code: 'LM', name: 'Leitrim' },
  ],

  // ------ AUSTRIA (9) ------
  AT: [
    { code: '1', name: 'Burgenland' }, { code: '2', name: 'Carinthia' },
    { code: '3', name: 'Lower Austria' }, { code: '4', name: 'Upper Austria' },
    { code: '5', name: 'Salzburg' }, { code: '6', name: 'Styria' },
    { code: '7', name: 'Tyrol' }, { code: '8', name: 'Vorarlberg' },
    { code: '9', name: 'Vienna' },
  ],

  // ------ DENMARK (5) ------
  DK: [
    { code: '81', name: 'Capital Region' }, { code: '82', name: 'Central Jutland' },
    { code: '83', name: 'North Jutland' }, { code: '84', name: 'South Denmark' },
    { code: '85', name: 'Zealand' },
  ],
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Get states/regions for a given country code. */
export function getStates(countryCode: string): { code: string; name: string }[] {
  return STATES[countryCode] || []
}

/** Get countries filtered by continent code. */
export function getCountriesByContinent(continentCode: string): Country[] {
  return COUNTRIES.filter(c => c.continent === continentCode)
}

/** Search countries by name or code. */
export function searchCountries(query: string): Country[] {
  const q = query.toLowerCase().trim()
  if (!q) return COUNTRIES
  return COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  )
}

/** Get popular countries (for the top section of the dropdown). */
export function getPopularCountries(): Country[] {
  return COUNTRIES.filter(c => c.popular)
}

/** Get all 195 countries. */
export function getAllCountries(): Country[] {
  return COUNTRIES
}

/** Find a country by its ISO code. */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code)
}

/** Get the continent code for a country. */
export function getContinentForCountry(code: string): string {
  return COUNTRIES.find(c => c.code === code)?.continent || ''
}
