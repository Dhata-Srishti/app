import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ColorValue,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const TEAL = '#6ec3c1';
const CREAM = '#fff6e6';
const DARK = '#1a2a36';
const CARD_GRADIENT: readonly [ColorValue, ColorValue] = ['#a8e6e6', '#6ec3c1'];

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  benefits: string;
  applicationProcess: string;
  requiredDocuments: string[];
  icon: string;
  category: 'education' | 'health' | 'agriculture' | 'employment' | 'housing' | 'social' | 'women_empowerment' | 'food_security' | 'transport' | 'skill_development_entrepreneurship' | 'utilities' | 'social_welfare' | 'agriculture_environment' | 'environment' | 'financial_inclusion';
  ageRange?: { min: number; max: number };
  genderEligible?: ('male' | 'female' | 'all')[];
  occupationEligible?: string[];
  casteEligible?: ('SC' | 'ST' | 'OBC' | 'General' | 'all')[];
  incomeLimit?: number;
}

interface UserProfile {
  age: string;
  gender: string;
  occupation: string;
  caste: string;
}

const GOVERNMENT_SCHEMES: Scheme[] = [
  {
    id: '1',
    name: 'Pradhan Mantri Jan Arogya Yojana (Ayushman Bharat)',
    description: 'Healthcare scheme providing insurance coverage up to ₹5 lakh per family per year',
    eligibility: ['BPL families', 'Annual income below ₹2.5 lakh', 'Socio-economic caste census inclusion'],
    benefits: 'Free treatment up to ₹5 lakh annually for secondary and tertiary care',
    applicationProcess: 'Apply through Common Service Centers or empaneled hospitals',
    requiredDocuments: ['Aadhaar Card', 'Ration Card', 'Income Certificate', 'Caste Certificate'],
    icon: 'medical-outline',
    category: 'health',
    ageRange: { min: 0, max: 100 },
    genderEligible: ['male', 'female', 'all'],
    occupationEligible: ['farmer', 'laborer', 'unemployed', 'student', 'other'],
    casteEligible: ['all'],
    incomeLimit: 250000
  },
  {
    id: '2',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description: 'Income support to farmers providing ₹6000 per year in three installments',
    eligibility: ['Small and marginal farmers', 'Land holding up to 2 hectares', 'Valid land records'],
    benefits: '₹2000 every 4 months directly to bank account',
    applicationProcess: 'Online registration through PM-KISAN portal or Common Service Centers',
    requiredDocuments: ['Aadhaar Card', 'Bank Account Details', 'Land Records', 'Passport Size Photo'],
    icon: 'leaf-outline',
    category: 'agriculture',
    ageRange: { min: 18, max: 100 },
    genderEligible: ['male', 'female', 'all'],
    occupationEligible: ['farmer'],
    casteEligible: ['all'],
    incomeLimit: 1000000
  },
  {
    id: '3',
    name: 'Pradhan Mantri Awas Yojana (PMAY)',
    description: 'Housing scheme for urban and rural poor to provide affordable housing',
    eligibility: ['EWS/LIG families', 'No pucca house owned', 'Annual income criteria met'],
    benefits: 'Subsidy on home loans, construction assistance up to ₹2.5 lakh',
    applicationProcess: 'Apply online through PMAY portal or nearest CSC',
    requiredDocuments: ['Aadhaar Card', 'Income Certificate', 'Property Documents', 'Bank Statement'],
    icon: 'home-outline',
    category: 'housing',
    ageRange: { min: 21, max: 70 },
    genderEligible: ['male', 'female', 'all'],
    occupationEligible: ['laborer', 'unemployed', 'other', 'employed'],
    casteEligible: ['all'],
    incomeLimit: 1800000
  },
  {
    id: '4',
    name: 'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)',
    description: 'Guaranteed 100 days of employment per year to rural households',
    eligibility: ['Rural households', 'Adult members willing to do unskilled manual work', 'Valid job card'],
    benefits: 'Guaranteed employment for 100 days with minimum wages',
    applicationProcess: 'Apply for job card at Gram Panchayat office',
    requiredDocuments: ['Aadhaar Card', 'Passport Size Photo', 'Bank Account Details', 'Address Proof'],
    icon: 'people-outline',
    category: 'employment',
    ageRange: { min: 18, max: 65 },
    genderEligible: ['male', 'female', 'all'],
    occupationEligible: ['laborer', 'unemployed', 'farmer'],
    casteEligible: ['all'],
    incomeLimit: 500000
  },
  {
    id: '5',
    name: 'Beti Bachao Beti Padhao',
    description: 'Scheme to address declining child sex ratio and promote girls education',
    eligibility: ['Girl child', 'Age 0-18 years', 'Regular school attendance for older girls'],
    benefits: 'Educational support, healthcare benefits, awareness programs',
    applicationProcess: 'Enroll through schools, anganwadi centers, or district offices',
    requiredDocuments: ['Birth Certificate', 'Aadhaar Card', 'School Enrollment Certificate', 'Bank Account'],
    icon: 'school-outline',
    category: 'education',
    ageRange: { min: 0, max: 18 },
    genderEligible: ['female'],
    occupationEligible: ['student'],
    casteEligible: ['all'],
    incomeLimit: 800000
  },
  {
    id: '6',
    name: 'Pradhan Mantri Mudra Yojana',
    description: 'Micro-finance scheme providing loans up to ₹10 lakh for small businesses',
    eligibility: ['Small entrepreneurs', 'Micro enterprises', 'Self-employed individuals'],
    benefits: 'Collateral-free loans up to ₹10 lakh with lower interest rates',
    applicationProcess: 'Apply through participating banks and financial institutions',
    requiredDocuments: ['Business Plan', 'Aadhaar Card', 'Bank Statements', 'Identity & Address Proof'],
    icon: 'card-outline',
    category: 'employment',
    ageRange: { min: 18, max: 65 },
    genderEligible: ['male', 'female', 'all'],
    occupationEligible: ['business', 'self-employed', 'entrepreneur'],
    casteEligible: ['all'],
    incomeLimit: 2000000
  },
  {
    id: '7',
    name: 'Pradhan Mantri Scholarship Scheme',
    description: 'Merit-based scholarship for students pursuing higher education',
    eligibility: ['Students with 60%+ marks', 'Family income below ₹6 lakh', 'Regular attendance'],
    benefits: 'Financial assistance up to ₹50,000 per year for education',
    applicationProcess: 'Apply online through National Scholarship Portal',
    requiredDocuments: ['Mark Sheets', 'Income Certificate', 'Aadhaar Card', 'Bank Details'],
    icon: 'school-outline',
    category: 'education',
    ageRange: { min: 16, max: 30 },
    genderEligible: ['male', 'female', 'all'],
    occupationEligible: ['student'],
    casteEligible: ['all'],
    incomeLimit: 600000
  },
  {
    id: '8',
    name: 'Pradhan Mantri Matru Vandana Yojana',
    description: 'Maternity benefit scheme providing cash incentives for pregnant women',
    eligibility: ['Pregnant women', 'First live birth', 'Age 19 years or above'],
    benefits: 'Cash incentive of ₹5,000 in three installments',
    applicationProcess: 'Register at Anganwadi Centre or approved health facility',
    requiredDocuments: ['Pregnancy Certificate', 'Aadhaar Card', 'Bank Account', 'JSY Card'],
    icon: 'heart-outline',
    category: 'health',
    ageRange: { min: 19, max: 45 },
    genderEligible: ['female'],
    occupationEligible: ['all'],
    casteEligible: ['all'],
    incomeLimit: 1000000
  },
    {
      id: '9',
      name: 'Gruha Jyothi Scheme',
      description: 'Provides free electricity up to 200 units for residential households in Karnataka to reduce electricity expenses.',
      eligibility: [
        'Residential household in Karnataka',
        'Average monthly electricity consumption for FY 2022-23 must be less than 200 units (plus a 10% increase or specific rules for <90 units consumption)',
        'Applicable to tenants with relevant documents (e.g., rental agreement, Aadhaar linked to RR number)',
        'Merged Kuteera Jyothi, Amrutha Jyothi, Bhagya Jyothi schemes.'
      ],
      benefits: 'Free electricity up to 200 units per month.',
      applicationProcess: 'Apply online via the Seva Sindhu portal: https://sevasindhugs.karnataka.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Electricity Bill (Consumer ID/Account ID)', 'Rental agreement (if tenant)', 'Mobile number for OTP'],
      icon: 'bulb-outline',
      category: 'utilities',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '10',
      name: 'Gruhalakshmi Scheme',
      description: 'Provides monthly financial assistance to women heads of Antyodaya, BPL, and APL families in Karnataka.',
      eligibility: [
        'Woman head of household (as per ration card)',
        'Resident of Karnataka',
        'Belongs to Antyodaya, BPL, or APL family',
        'Woman or her husband should not be a government employee or taxpayer (GST filer for non-government employees)',
        'One woman per family.'
      ],
      benefits: 'Financial assistance of ₹2,000 per month.',
      applicationProcess: 'Apply online via Seva Sindhu portal or at designated centers (e.g., BangaloreOne, GramaOne): https://gruhalakshmischeme.in/',
      requiredDocuments: ['Aadhaar Card of woman head', 'Aadhaar Card of husband', 'Ration Card (APL/BPL/Antyodaya)', 'Bank account passbook linked with Aadhaar'],
      icon: 'woman-outline',
      category: 'women_empowerment',
      ageRange: { min: 18, max: 100 },
      genderEligible: ['female'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null // Eligibility based on family type (Antyodaya, BPL, APL)
    },
    {
      id: '11',
      name: 'Anna Bhagya Scheme',
      description: 'Provides free rice to BPL families and Antyodaya Anna Yojana (AAY) cardholders in Karnataka.',
      eligibility: [
        'BPL family or AAY cardholder',
        'Resident of Karnataka',
        'Age >18 years for the primary applicant (typically head of family on ration card).'
      ],
      benefits: '10kg of rice per person per month (initially 5kg rice + ₹170 cash per person for the remaining 5kg, transitioning to full 10kg rice from Feb 2025).',
      applicationProcess: 'Scheme is generally linked to existing BPL/AAY ration cards. Verify details with the Food, Civil Supplies & Consumer Affairs Department: https://ahara.karnataka.gov.in/',
      requiredDocuments: ['BPL Ration Card or Antyodaya Anna Yojana (AAY) Card', 'Aadhaar Card'],
      icon: 'fast-food-outline',
      category: 'food_security',
      ageRange: { min: 19, max: 100 }, // Original criteria minAge: 19
      genderEligible: ['all'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null // Eligibility based on BPL/AAY card
    },
    {
      id: '12',
      name: 'Shakti Scheme',
      description: 'Offers free travel in non-luxury government-run buses for women residents of Karnataka.',
      eligibility: [
        'Women of Karnataka (including girls aged 6-12)',
        'Permanent resident of Karnataka',
        'Transgender individuals are also eligible.'
      ],
      benefits: 'Free travel in ordinary, express, non-AC sleeper, and city buses operated by KSRTC, BMTC, KKRTC, and NWKRTC within Karnataka state borders.',
      applicationProcess: 'Initially, travel with any Government-issued photo ID showing Karnataka address. Eventually, apply for Shakti Smart Card via Seva Sindhu portal: https://sevasindhu.karnataka.gov.in/',
      requiredDocuments: ['Karnataka residential proof (Aadhaar Card, Voter ID, etc.) for Shakti Smart Card application.'],
      icon: 'bus-outline',
      category: 'transport',
      ageRange: { min: 6, max: 100 },
      genderEligible: ['female'], // Includes transgender women
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '13',
      name: 'Yuvanidhi Scheme',
      description: 'Provides monthly financial assistance to unemployed graduates and diploma holders of the 2022-23 academic year in Karnataka for up to 2 years or until employment.',
      eligibility: [
        'Unemployed graduate or diploma holder (passed in academic year 2022-23)',
        'Resident of Karnataka (domicile for at least 6 years)',
        'Age 18-40 years',
        'Not pursuing higher studies',
        'Not secured a job (government or private) or self-employed within six months of passing',
        'Not a beneficiary of other similar state/central government schemes.'
      ],
      benefits: '₹3,000 per month for graduates, ₹1,500 per month for diploma holders for a maximum of 2 years or until employment.',
      applicationProcess: 'Apply online via Seva Sindhu portal: https://sevasindhuservices.karnataka.gov.in/',
      requiredDocuments: ['Degree/Diploma certificate (2022-23 batch)', 'Marks cards', 'Aadhaar Card', 'Bank passbook', 'Residential proof (Karnataka domicile)', 'Self-declaration of unemployment'],
      icon: 'school-outline',
      category: 'employment',
      ageRange: { min: 18, max: 40 },
      genderEligible: ['all'],
      occupationEligible: ['unemployed_graduate', 'unemployed_diploma_holder'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '14',
      name: 'Airavata Scheme',
      description: 'Provides subsidy for vehicle purchase to rural SC/ST youth in Karnataka for self-employment with taxi aggregators.',
      eligibility: [
        'Rural youth from SC/ST communities',
        'Resident of Karnataka',
        'Age > 21 years (i.e., 22 and above)',
        'Valid driving license & cab badge',
        'Family annual income < ₹5,00,000.'
      ],
      benefits: 'Subsidy up to ₹5,00,000 for vehicle purchase to operate as a taxi with aggregators like Ola/Uber.',
      applicationProcess: 'Apply through Dr. B.R. Ambedkar Development Corporation or similar SC/ST welfare departments. Check official portal: https://www.egovtschemes.com/airavata-scheme/',
      requiredDocuments: ['Caste Certificate (SC/ST)', 'Income Certificate (Family annual income < ₹5,00,000)', 'Aadhaar Card', 'Driving License', 'Cab Badge', 'Residential Proof (Rural)', 'Project report/vehicle quotation'],
      icon: 'car-sport-outline',
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 22, max: 100 }, // Original criteria minAge: 22
      genderEligible: ['all'],
      occupationEligible: ['rural_youth', 'driver'],
      casteEligible: ['all'],
      incomeLimit: 500000
    },
    {
      id: '15',
      name: 'Unnati Scheme',
      description: 'A comprehensive entrepreneurship platform by the Department of Social Welfare, Govt of Karnataka, to support startups from end-to-end, with a focus on SC/ST entrepreneurs.',
      eligibility: [
        'Startups and entrepreneurs, initiated by the Department of Social Welfare',
        'Aims to cater to end-to-end requirements of a startup',
        'Often emphasizes support for SC/ST entrepreneurs.'
      ],
      benefits: 'Seed funding, incubation support, mentorship, market access, and other assistance for startups.',
      applicationProcess: 'Apply through the Department of Social Welfare or Karnataka Innovation and Technology Society (KITS) portals. Check official portal: https://socialwelfare.karnataka.gov.in/',
      requiredDocuments: ['Detailed Project Report (DPR)', 'Business Plan', 'Caste Certificate (if SC/ST for specific benefits)', 'Company registration documents (if applicable)', 'Aadhaar Card'],
      icon: 'rocket-outline',
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 0, max: 100 }, // Typically adult entrepreneurs
      genderEligible: ['all'],
      occupationEligible: ['entrepreneur', 'startup_founder'],
      casteEligible: ['all'],
      incomeLimit: null // May vary by sub-component or focus group
    },
    {
      id: '16',
      name: 'Prabuddha Overseas Scholarship',
      description: 'Provides financial assistance to meritorious SC/ST students from Karnataka for pursuing higher education (UG, PG, PhD) abroad in specified universities/fields.',
      eligibility: [
        'SC/ST students',
        'Permanent residents of Karnataka',
        'Pursuing full-time UG, PG, or PhD programs abroad in specified universities/fields',
        'Income-based scholarship percentage (e.g., 100% aid for family income < ₹8 lakh)',
        'Age limits: UG up to 21 years, PG/PhD up to 35 years',
        'Standardized tests (GRE, GMAT, TOEFL, IELTS) required.'
      ],
      benefits: 'Scholarship covering tuition fees, living expenses, and other allowances, based on income and course.',
      applicationProcess: 'Apply online through the Social Welfare Department portal: https://sw.kar.nic.in/',
      requiredDocuments: ['Caste Certificate (SC/ST)', 'Income Certificate (Family income)', 'Aadhaar Card', 'Academic transcripts', 'Admission letter from foreign university', 'Standardized test scores (GRE, GMAT, TOEFL, IELTS)', 'Passport copy', 'Residential Proof (Karnataka)'],
      icon: 'earth-outline',
      category: 'education',
      ageRange: { min: 0, max: 35 }, // UG up to 21, PG/PhD up to 35
      genderEligible: ['all'],
      occupationEligible: ['student'],
      casteEligible: ['all'],
      incomeLimit: 800000 // For 100% aid, income-based otherwise
    },
    {
      id: '17',
      name: "Incentive For The Devadasi Children's Marriage to Schedule Tribe",
      description: 'Provides financial incentives for the marriage of Devadasi\'s children where one of the spouses is from the Schedule Tribe community.',
      eligibility: [
        'Children of Devadasis',
        'One spouse must belong to the Scheduled Tribe (ST) community',
        'Couple married on or after 01-04-2019.'
      ],
      benefits: 'Incentive of ₹8 Lakh per eligible couple (₹3 Lakh for the groom, ₹5 Lakh for the bride).',
      applicationProcess: 'Apply through the Social Welfare Department: https://socialwelfare.karnataka.gov.in/',
      requiredDocuments: ['Marriage Certificate', 'Caste Certificate of ST spouse', 'Certificate identifying parent as Devadasi', 'Aadhaar Cards of bride and groom', 'Bank account details of bride and groom', 'Age proof'],
      icon: 'heart-circle-outline',
      category: 'social_welfare',
      ageRange: { min: 0, max: 100 }, // Legal marriage ages apply (Bride >=18, Groom >=21)
      genderEligible: ['all'], // Applicable to the couple
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '18',
      name: 'Thayi Bhagya Scheme (Comprehensive Maternal Healthcare)',
      description: 'Provides free delivery services and maternal healthcare for pregnant women from BPL families in Karnataka at registered private hospitals.',
      eligibility: [
        'Pregnant women from Below Poverty Line (BPL) families',
        'Resident of Karnataka',
        'Applicable for the first two live deliveries',
        'Launched in 2009.'
      ],
      benefits: 'Free delivery services, medicines, and other facilities from admission to discharge in empanelled private hospitals.',
      applicationProcess: 'Register at local ASHA worker, Anganwadi center, or PHC. Scheme is facilitated through empanelled private hospitals. More info: https://karhfw.gov.in/',
      requiredDocuments: ['BPL Card', 'Aadhaar Card', 'Pregnancy confirmation record (Thayi card)', 'Bank account details (if any direct benefit component)'],
      icon: 'pulse-outline',
      category: 'health',
      ageRange: { min: 18, max: 100 }, // Reproductive age
      genderEligible: ['female'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null // BPL criteria implies income limit
    },
    {
      id: '19',
      name: 'Thayi Bhagya Plus Scheme',
      description: 'Provides financial assistance to pregnant women from BPL, SC/ST categories in Karnataka who deliver in a non-empanelled private hospital.',
      eligibility: [
        'Pregnant women from BPL, SC/ST categories',
        'Resident of Karnataka',
        'Delivers in a non-empanelled private hospital (often in emergency situations).'
      ],
      benefits: 'Financial assistance of ₹1,000.',
      applicationProcess: 'Apply through the Department of Health and Family Welfare, typically post-delivery with required proofs. More info: https://karhfw.gov.in/',
      requiredDocuments: ['BPL Card or SC/ST Caste Certificate', 'Aadhaar Card', 'Hospital discharge summary from non-empanelled private hospital', 'Birth certificate of child', 'Bank account details'],
      icon: 'medkit-outline',
      category: 'health',
      ageRange: { min: 18, max: 100 }, // Reproductive age
      genderEligible: ['female'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null // BPL/SC/ST criteria implies income considerations
    },
    {
      id: '20',
      name: 'Madilu Kit / Madilu Programme',
      description: 'Provides a kit with essential items for the mother and newborn, and the broader Madilu Programme supports rural communities through skill development and entrepreneurship.',
      eligibility: [
        'Post-natal mothers delivering in government health facilities',
        'BPL/SC/ST mothers delivering in empanelled private hospitals may also be eligible for the kit',
        'The broader Madilu Programme focuses on empowering rural communities through skill development and entrepreneurship.'
      ],
      benefits: 'Madilu Kit containing essential items for mother and child care (e.g., baby clothes, mosquito net, soap, oil). The broader programme aims to create sustainable livelihoods in rural areas.',
      applicationProcess: 'Kit is usually provided at the hospital post-delivery. For skill development aspects, refer to Department of Women and Child Development (DWCD): https://dwcd.karnataka.gov.in/',
      requiredDocuments: ['Thayi Card (Mother and Child Health Card)', 'Aadhaar Card', 'Delivery proof from eligible hospital', 'BPL/SC/ST certificate if applicable for private hospital delivery'],
      icon: 'gift-outline',
      category: 'women_empowerment',
      ageRange: { min: 0, max: 100 }, // Mothers of reproductive age for kit; general rural population for skill aspects
      genderEligible: ['all'], // Kit for mothers; broader program for rural communities
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null // BPL/SC/ST criteria for kit in some cases
    },
    {
      id: '21',
      name: 'Bhagyalakshmi Scheme',
      description: 'Promotes the education and welfare of girl children in BPL families by providing financial assistance at various stages.',
      eligibility: [
        'Girl child born in a BPL family in Karnataka',
        'Up to two girl children per BPL family',
        'Child must be born after March 31, 2006',
        'Family should not have more than two children in total (unless subsequent births are twins/triplets)',
        'Parents should have undergone family planning operation after the birth of the beneficiary child/children.'
      ],
      benefits: 'Financial assistance at various educational stages (₹300 to ₹1,000 annually up to 10th standard), health check-ups, nutritional support, and a lump sum maturity amount (e.g., ₹1,00,000 for a girl child enrolled at birth) upon completion of 18 years if conditions like being unmarried and completing 8th std/SSLC are met.',
      applicationProcess: 'Register through Anganwadi centers or the Department of Women and Child Development: https://dwcd.karnataka.gov.in/',
      requiredDocuments: ['Birth certificate of the girl child', 'BPL card of the family', 'Aadhaar card of parents and child', 'Bank account details (joint account with mother)', 'Family planning certificate'],
      icon: 'happy-outline',
      category: 'women_empowerment',
      ageRange: { min: 0, max: 18 },
      genderEligible: ['female'],
      occupationEligible: ['student'], // Implied for girl child
      casteEligible: ['all'],
      incomeLimit: null // BPL criteria implies income limit
    },
    {
      id: '22',
      name: 'Mathrushree Scheme',
      description: 'Provides cash incentive to BPL pregnant/lactating mothers for childbirth and nutritional support (also referred to as Mathrupoorna Programme providing hot cooked meals).',
      eligibility: [
        'Pregnant and lactating women from BPL families in Karnataka',
        'For the first two live births.'
      ],
      benefits: 'Total cash incentive of ₹6,000 in installments for childbirth. Mathrupoorna component provides one hot cooked meal daily at Anganwadi centers for specified period during pregnancy and post-delivery.',
      applicationProcess: 'Register at Anganwadi Centers. More info: https://dwcd.karnataka.gov.in/',
      requiredDocuments: ['BPL Card', 'Aadhaar Card', 'Thayi Card (Mother and Child Health Card)', 'Bank account details'],
      icon: 'restaurant-outline',
      category: 'women_empowerment',
      ageRange: { min: 18, max: 100 }, // Reproductive age
      genderEligible: ['female'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null // BPL criteria implies income limit
    },
    {
      id: '23',
      name: 'Krushy Aranya Protsaha Yojane (KAPY)',
      description: 'Encourages farmers and the general public to increase forest and tree cover by providing subsidized seedlings and monetary incentives for nurturing them.',
      eligibility: [
        'Farmers and general public in Karnataka',
        'Pahani (land ownership document) required for incentives on private land',
        'Registration typically before the rainy season.'
      ],
      benefits: 'Subsidized seedlings. Monetary incentives for surviving seedlings planted on private land (e.g., ₹35 in 1st year, ₹40 in 2nd year, ₹50 in 3rd year per seedling).',
      applicationProcess: 'Contact local Forest Department offices for registration and seedling distribution: https://aranya.gov.in/',
      requiredDocuments: ['Pahani (RTC) for claiming incentives on private land', 'Aadhaar Card', 'Bank account details'],
      icon: 'leaf-outline',
      category: 'agriculture_environment',
      ageRange: { min: 0, max: 100 }, // Landowners of any age
      genderEligible: ['all'],
      occupationEligible: ['farmer', 'all'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '24',
      name: 'Continuation of Pension (K.B.O.C.W.W.B)',
      description: 'Provides a monthly pension to registered construction workers who have completed 60 years of age and meet contribution criteria.',
      eligibility: [
        'Registered construction worker with Karnataka Building and Other Construction Workers Welfare Board (KBOCWWB)',
        'Paid subscriptions for at least three (3) years',
        'Worked actively as a construction worker until age 60',
        'Must not be receiving pension from other government schemes.'
      ],
      benefits: 'Monthly pension after attaining 60 years of age.',
      applicationProcess: 'Apply through the KBOCWWB portal or offices: https://kbocwwb.karnataka.gov.in/',
      requiredDocuments: ['KBOCWWB Registration Card', 'Aadhaar Card', 'Age proof', 'Bank account details', 'Proof of subscription payment', 'Self-declaration of not receiving other pensions'],
      icon: 'walk-outline',
      category: 'social_welfare',
      ageRange: { min: 0, max: 60 }, // Refers to active work period for eligibility; pension is post-60
      genderEligible: ['all'],
      occupationEligible: ['construction_worker'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '25',
      name: 'Marriage Assistance (KBOCWWB)',
      description: 'Financial assistance for the marriage of registered construction workers or their dependent children.',
      eligibility: [
        'Registered construction worker (member for at least 1 year prior to marriage)',
        'For their own first marriage or the first marriage of up to two dependent children',
        'Application within 6 months of marriage.'
      ],
      benefits: 'Financial assistance of ₹60,000 per claim.',
      applicationProcess: 'Apply through the KBOCWWB portal or offices: https://kbocwwb.karnataka.gov.in/',
      requiredDocuments: ['KBOCWWB Registration Card of worker', 'Marriage Certificate', 'Aadhaar Card of worker and couple', 'Age proof of couple', 'Proof of dependency (for children\'s marriage)', 'Bank account details'],
      icon: 'heart-half-outline',
      category: 'social_welfare',
      ageRange: { min: 0, max: 100 }, // Legal marriage ages apply for couple
      genderEligible: ['all'],
      occupationEligible: ['construction_worker'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '26',
      name: 'Accident Assistance (KBOCWWB)',
      description: 'Financial assistance to registered construction workers in case of accidents leading to death or disablement.',
      eligibility: [
        'Registered construction worker',
        'Injury during employment or outside work.'
      ],
      benefits: 'Death Benefit: ₹5,00,000; Permanent Total Disablement: ₹2,00,000; Permanent Partial Disablement: ₹1,00,000 (proportionally).',
      applicationProcess: 'Apply through the KBOCWWB portal or offices: https://kbocwwb.karnataka.gov.in/',
      requiredDocuments: ['KBOCWWB Registration Card', 'Aadhaar Card', 'Medical certificate detailing injury/disability', 'FIR copy (if applicable)', 'Death certificate (for death benefit)', 'Nominee details/legal heir certificate'],
      icon: 'medkit-outline',
      category: 'social_welfare',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['construction_worker'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '27',
      name: 'Assistance For Major Ailments (Karmika Chikitsa Bhagya) (KBOCWWB)',
      description: 'Financial assistance for treatment of major ailments for registered construction workers and their dependents.',
      eligibility: [
        'Registered construction worker or their dependents',
        'Application within 6 months of hospitalization.'
      ],
      benefits: 'Financial assistance up to ₹2,00,000 for treatment of major ailments.',
      applicationProcess: 'Apply through the KBOCWWB portal or offices: https://kbocwwb.karnataka.gov.in/',
      requiredDocuments: ['KBOCWWB Registration Card', 'Aadhaar Card of worker and patient', 'Medical bills and hospital records', 'Doctor\'s certificate for major ailment', 'Proof of dependency (if for dependent)'],
      icon: 'heart-outline',
      category: 'health',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['construction_worker', 'dependent_of_construction_worker'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '28',
      name: 'Supply of Tool Kits to their Trained Workers (KBOCWWB)',
      description: 'Provides toolkits to construction workers who have undergone skill upgradation training.',
      eligibility: [
        'Registered construction worker',
        'Undergone skill upgradation training in trades such as masonry, electrical, and plumbing, recognized by KBOCWWB.'
      ],
      benefits: 'Free toolkits relevant to the trained trade.',
      applicationProcess: 'Usually facilitated through training centers or KBOCWWB after completion of training: https://kbocwwb.karnataka.gov.in/',
      requiredDocuments: ['KBOCWWB Registration Card', 'Aadhaar Card', 'Certificate of skill upgradation training'],
      icon: 'build-outline',
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['construction_worker'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '29',
      name: 'Shrama Shakthi Scheme / Shrama Shakthi Loan Scheme',
      description: 'Provides loans at subsidized interest rates to entrepreneurs from religious minority communities for training and self-employment.',
      eligibility: [
        'Entrepreneurs from religious minority communities (Muslim, Christian, Jain, Buddhist, Sikh, Parsi)',
        'Age 18-55 years',
        'Permanent resident of Karnataka',
        'Family annual income should not exceed ₹3.50 lakh',
        'No family member in Govt/PSU employment',
        'Not a loan defaulter with KMDC (Karnataka Minorities Development Corporation).'
      ],
      benefits: 'Loan of ₹50,000 at 4% rate of interest (repayable in 36 installments) for training in artistic and technical skills or for small businesses.',
      applicationProcess: 'Apply through Karnataka Minorities Development Corporation (KMDC): https://kmdc.karnataka.gov.in/',
      requiredDocuments: ['Minority Community Certificate', 'Income Certificate (Family annual income <= ₹3.50 lakh)', 'Aadhaar Card', 'Residential Proof (Karnataka)', 'Age proof', 'Project report/Business plan', 'Self-declaration for other conditions'],
      icon: 'cash-outline',
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 18, max: 55 },
      genderEligible: ['all'],
      occupationEligible: ['entrepreneur', 'minority_community_member'],
      casteEligible: ['all'],
      incomeLimit: 350000
    },
    {
      id: '30',
      name: 'Skill Development Training (Footwear and Leather Goods)',
      description: 'Equips artisans from Scheduled Caste communities with skills for manufacturing footwear and leather goods, providing a stipend.',
      eligibility: [
        'Artisans from Scheduled Caste (SC) communities',
        'Resident of Karnataka.'
      ],
      benefits: 'Skill training in footwear and leather goods manufacturing. Stipend provided during training. Promotes the leather industry and enhances artisan livelihoods.',
      applicationProcess: 'Apply through the Department of Social Welfare or associated corporations like LIDKAR: https://socialwelfare.karnataka.gov.in/',
      requiredDocuments: ['Caste Certificate (SC)', 'Aadhaar Card', 'Residential Proof (Karnataka)', 'Educational qualification (if any specified)'],
      icon: 'footsteps-outline',
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 0, max: 100 }, // Typically working age
      genderEligible: ['all'],
      occupationEligible: ['artisan', 'scheduled_caste_member'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '31',
      name: 'Udyogini Scheme',
      description: 'Empowers women entrepreneurs through financial aid (loans at subsidized rates), skill development training, and networking opportunities.',
      eligibility: [
        'Women entrepreneurs in Karnataka',
        'Age typically 18-55 years (may vary by specific loan component)',
        'Family income limits may apply for certain subsidies (e.g., up to ₹1.5 lakh for some categories).'
      ],
      benefits: 'Loans up to ₹3 lakh (interest-free for SC/ST/disabled women with income < ₹2 lakh, otherwise subsidized rates) for business activities. Skill development training and support.',
      applicationProcess: 'Apply through Karnataka State Women\'s Development Corporation (KSWDC) or participating banks: https://kswdc.karnataka.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Residential Proof (Karnataka)', 'Income Certificate (if applicable)', 'Caste Certificate (for special subsidies)', 'Business plan/Project report', 'Bank account details'],
      icon: 'briefcase-outline',
      category: 'women_empowerment',
      ageRange: { min: 0, max: 100 }, // Typically 18-55 for loan eligibility
      genderEligible: ['female'],
      occupationEligible: ['entrepreneur'],
      casteEligible: ['all'],
      incomeLimit: null // Varies, e.g. 150000 for some subsidies, or 200000 for SC/ST interest-free
    },
    {
      id: '32',
      name: 'Arivu Education Loan Scheme',
      description: 'Offers education loans at low-interest rates for students from religious minority communities pursuing higher education.',
      eligibility: [
        'Students from religious minority communities in Karnataka',
        'Pursuing professional/technical courses (e.g., Medical, Engineering, Dental, MBA, MCA, LLB, B.Ed, D.Ed, Nursing, PhD etc.)',
        'Family annual income limits may apply (e.g., up to ₹8 lakh for some courses).'
      ],
      benefits: 'Education loans with low-interest rates (e.g., 2% per annum). Loan amount varies by course. Flexible repayment options.',
      applicationProcess: 'Apply online through Karnataka Minorities Development Corporation (KMDC): https://kmdc.karnataka.gov.in/',
      requiredDocuments: ['Minority Community Certificate', 'Income Certificate', 'Aadhaar Card', 'Marks cards (SSLC, PUC, previous exams)', 'Admission letter/fee structure from college', 'Residential Proof (Karnataka)'],
      icon: 'library-outline',
      category: 'education',
      ageRange: { min: 0, max: 100 }, // Student age
      genderEligible: ['all'],
      occupationEligible: ['student', 'minority_community_member'],
      casteEligible: ['all'],
      incomeLimit: null // Varies, e.g. 800000 for some courses
    },
    {
      id: '33',
      name: 'Mahatma Gandhi National Rural Employment Guarantee Act Scheme (MGNREGS)',
      description: 'Provides a legal guarantee of 100 days of employment per financial year to adult members of any rural household willing to do unskilled manual work.',
      eligibility: [
        'Adult members of any rural household in Karnataka',
        'Willing to do unskilled manual work.'
      ],
      benefits: 'Guaranteed 100 days of wage employment in a financial year. Creation of durable assets and strengthening livelihood resource base of the rural poor.',
      applicationProcess: 'Register with the local Gram Panchayat to obtain a Job Card: https://nrega.nic.in/ (National Portal)',
      requiredDocuments: ['Aadhaar Card', 'Bank account details', 'Photographs', 'Application form for Job Card'],
      icon: 'people-outline',
      category: 'employment',
      ageRange: { min: 18, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['rural_household_member', 'unskilled_manual_worker'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '34',
      name: 'Pradhan Mantri Awas Yojana – Gramin (PMAY-G)',
      description: 'Provides financial assistance to houseless households and those living in kutcha/dilapidated houses in rural areas for construction of a pucca house.',
      eligibility: [
        'Houseless households and those living in kutcha/dilapidated houses in rural areas of Karnataka',
        'Identified based on SECC 2011 data and Awasplus survey',
        'Prioritization based on deprivation scores.'
      ],
      benefits: 'Financial assistance for construction of a pucca house with a minimum size of 25 sq.m. Assistance amount varies by state/region.',
      applicationProcess: 'Beneficiaries identified through Gram Sabha based on SECC 2011 and AwasPlus data. Contact Gram Panchayat. National Portal: https://pmayg.nic.in/',
      requiredDocuments: ['Aadhaar Card', 'Bank account details', 'SECC 2011/AwasPlus identification proof', 'Land ownership documents (if applicable)', 'Job Card (MGNREGS) if availing convergence benefits'],
      icon: 'home-outline',
      category: 'housing',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['all'], // Based on housing need
      casteEligible: ['all'], // Based on SECC deprivation criteria
      incomeLimit: null // Based on SECC deprivation criteria
    },
    {
      id: '35',
      name: 'Deendayal Antyodaya Yojana - National Rural Livelihoods Mission (DAY-NRLM) / Aajeevika (Implemented as "Sanjeevini" in Karnataka)',
      description: 'Aims to reduce poverty by enabling rural poor households, especially women, to access gainful self-employment and skilled wage employment opportunities through Self-Help Groups (SHGs).',
      eligibility: [
        'Rural poor households in Karnataka',
        'Special focus on women and mobilizing them into Self-Help Groups (SHGs).'
      ],
      benefits: 'Formation of SHGs, financial assistance (Revolving Fund, Community Investment Fund), capacity building, market linkages, and access to credit.',
      applicationProcess: 'Mobilization through community resource persons and existing SHGs at village level. Contact local NRLM/Sanjeevini officials or Gram Panchayat. National Portal: https://aajeevika.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Bank account details (for SHG)', 'Identification as rural poor household'],
      icon: 'people-circle-outline',
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 0, max: 100 }, // Typically adult members
      genderEligible: ['female', 'all'], // Strong focus on women
      occupationEligible: ['rural_poor', 'shg_member'],
      casteEligible: ['all'],
      incomeLimit: null // Targets poor households
    },
    {
      id: '36',
      name: 'Atal Pension Yojana (APY)',
      description: 'A pension scheme for citizens in the unorganized sector, providing a guaranteed minimum monthly pension after age 60.',
      eligibility: [
        'All savings bank/post office savings bank account holders',
        'Age group of 18 to 40 years',
        'Income tax payers are not eligible to join from October 1, 2022.'
      ],
      benefits: 'Guaranteed minimum monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000 or ₹5,000 after attaining age 60, based on contribution amount.',
      applicationProcess: 'Subscribe through bank branch or post office where savings account is held. Online via: https://enps.nsdl.com/eNPS/NationalPensionSystem.html',
      requiredDocuments: ['Aadhaar Card', 'Active savings bank account number', 'Mobile number'],
      icon: 'trending-up-outline',
      category: 'social_welfare',
      ageRange: { min: 18, max: 40 }, // Entry age
      genderEligible: ['all'],
      occupationEligible: ['all'], // Primarily for unorganized sector
      casteEligible: ['all'],
      incomeLimit: null // Exclusion for income tax payers from Oct 2022
    },
    {
      id: '37',
      name: 'Stand Up India Scheme',
      description: 'Facilitates bank loans to SC/ST borrowers and women entrepreneurs for setting up a greenfield enterprise.',
      eligibility: [
        'At least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower AND at least one woman borrower per bank branch',
        'For setting up a greenfield enterprise (manufacturing, services, trading, or agri-allied sectors)',
        'Applicant age >18 years',
        'For non-individual enterprises, 51% stake must be held by SC/ST/Woman entrepreneur.'
      ],
      benefits: 'Bank loans between ₹10 lakh and ₹1 crore.',
      applicationProcess: 'Apply through participating banks or the Stand-Up India portal: https://www.standupmitra.in/',
      requiredDocuments: ['Caste Certificate (SC/ST if applicable)', 'Aadhaar Card', 'Business plan/Project report', 'Proof of 51% stake by SC/ST/Woman (for non-individual)', 'Bank account details'],
      icon: 'business-outline',
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 19, max: 100 }, // Original criteria minAge: 19
      genderEligible: ['female', 'all'], // Specifically targets SC/ST and Women
      occupationEligible: ['entrepreneur', 'scheduled_caste_member', 'scheduled_tribe_member'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '38',
      name: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
      description: 'Aims for universal access to banking facilities with at least one basic banking account for every household, financial literacy, access to credit, insurance, and pension.',
      eligibility: [
        'Any individual above 10 years of age who does not have a bank account.',
        'Focus on every household having at least one basic banking account.'
      ],
      benefits: 'Basic savings bank deposit account with RuPay debit card, overdraft facility (up to ₹10,000), accident insurance cover (₹1 lakh, enhanced to ₹2 lakh for new accounts after 28.8.18), life cover.',
      applicationProcess: 'Open an account at any bank branch or Bank Mitra outlet: https://www.pmjdy.gov.in/',
      requiredDocuments: ['Aadhaar Card (preferred) or other officially valid documents (OVDs) like Voter ID, Driving License, PAN Card, Passport, NREGA Job Card. Simplified KYC for low-risk customers.'],
      icon: 'card-outline',
      category: 'financial_inclusion',
      ageRange: { min: 0, max: 100 }, // Minors above 10 can open accounts
      genderEligible: ['all'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '39',
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      description: 'Provides income support to all landholding farmer families across the country.',
      eligibility: [
        'All landholding farmer families (husband, wife, minor children owning cultivable land as per land records of concerned State/UT)',
        'Subject to certain exclusion criteria (e.g., higher economic status, institutional landholders, professionals like doctors/lawyers, retired pensioners with >₹10k/month pension).'
      ],
      benefits: 'Financial benefit of ₹6,000 per year per family in three equal installments of ₹2,000 each.',
      applicationProcess: 'Register through PM-KISAN portal, Common Service Centers (CSCs), or state-nominated nodal officers: https://pmkisan.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Landholding documents (RTC/Pahani)', 'Bank account details', 'Citizenship certificate'],
      icon: 'leaf-outline',
      category: 'agriculture',
      ageRange: { min: 0, max: 100 }, // Farmer family head
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null // Exclusion criteria based on economic status, not direct income limit
    },
    {
      id: '40',
      name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)',
      description: 'Provides health coverage to poor and vulnerable families for secondary and tertiary care hospitalization. (Integrated with Arogya Karnataka scheme as AB-ArK in Karnataka).',
      eligibility: [
        'Poor and vulnerable families identified from Socio-Economic Caste Census (SECC) 2011 database (based on deprivation and occupational criteria for rural; specific occupational categories for urban)',
        'RSBY beneficiaries (if any)',
        'In Karnataka, integrated as AB-ArK, extending benefits to other eligible state residents too.'
      ],
      benefits: 'Health coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization at empanelled public and private hospitals. Cashless and paperless access to services.',
      applicationProcess: 'No specific enrollment. Eligibility checked via SECC data or AB-ArK criteria at empanelled hospitals or by visiting https://pmjay.gov.in/ and checking eligibility.',
      requiredDocuments: ['Aadhaar Card or other government ID', 'Ration Card (for AB-ArK state component)', 'PMJAY e-card (if issued)'],
      icon: 'shield-checkmark-outline',
      category: 'health',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['all'], // Based on SECC criteria
      casteEligible: ['all'],
      incomeLimit: null // Based on SECC deprivation criteria
    },
    {
      id: '41',
      name: 'Pradhan Mantri Awas Yojana – Urban (PMAY-U)',
      description: 'Addresses urban housing shortage among Economically Weaker Section (EWS), Low Income Group (LIG), and Middle Income Group (MIG) categories, including slum dwellers, by providing a "pucca" house.',
      eligibility: [
        'Urban residents belonging to EWS (annual income up to ₹3 lakh), LIG (₹3-₹6 lakh), MIG-I (₹6-₹12 lakh), MIG-II (₹12-₹18 lakh) categories',
        'Beneficiary family should not own a pucca house in any part of India',
        'Mandatory provision for female head of family to be owner/co-owner of the house.'
      ],
      benefits: 'Financial assistance/subsidy for house construction, purchase, or enhancement, or credit-linked subsidy for home loans.',
      applicationProcess: 'Apply online through PMAY-U portal or Common Service Centers (CSCs). Contact Urban Local Bodies. National Portal: https://pmaymis.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Income proof/certificate (EWS/LIG/MIG)', 'Bank account details', 'Affidavit stating no pucca house ownership', 'Property documents (if applicable)'],
      icon: 'city-outline',
      category: 'housing',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['female', 'all'], // Female ownership/co-ownership mandatory
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: 1800000 // Upper limit for MIG-II
    },
    {
      id: '42',
      name: 'National Biogas Manure and Management Programme (NBMMP) (Locally known as "Anila Yojane" in Karnataka)',
      description: 'Promotes setting up of biogas plants for clean cooking fuel and organic manure, primarily targeting women beneficiaries.',
      eligibility: [
        'Individuals, farmers, SHGs, especially women',
        'Ownership of cattle/livestock for dung supply',
        'Space for biogas plant construction.'
      ],
      benefits: 'Subsidy for construction of biogas plants. Provides clean cooking fuel (biogas) and nutrient-rich organic manure.',
      applicationProcess: 'Contact Rural Development and Panchayat Raj Department or local Gram Panchayat. State Portal: http://rdpr.kar.nic.in/English/AnilaYojane.asp',
      requiredDocuments: ['Aadhaar Card', 'Land ownership documents (for plant location)', 'Proof of cattle ownership (may be required)', 'Bank account details'],
      icon: 'flame-outline',
      category: 'environment',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['female'], // "Primarily a 100% women program"
      occupationEligible: ['farmer', 'all'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '43',
      name: 'National Handloom Development Programme (NHDP)',
      description: 'Supports the handloom sector, which employs a large number of people, particularly women, and thrives on inherited skills.',
      eligibility: [
        'Handloom weavers, cooperative societies, self-help groups, and other organizations involved in the handloom sector.'
      ],
      benefits: 'Financial assistance for skill upgradation, loom upgradation, design development, marketing support, subsidized yarn, and welfare measures for weavers.',
      applicationProcess: 'Apply through Weavers Service Centres, State Handloom Departments, or the Office of Development Commissioner (Handlooms): https://texmin.nic.in/schemes-programmes/handloom',
      requiredDocuments: ['Weaver ID card (if available)', 'Aadhaar Card', 'Bank account details', 'Membership details of cooperative/SHG (if applicable)', 'Project proposal for specific components'],
      icon: 'color-palette-outline',
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['female', 'all'], // Large number of women employed
      occupationEligible: ['handloom_weaver', 'artisan'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '44',
      name: 'Rashtriya Krishi Vikas Yojana (RKVY)',
      description: 'Provides funds to states for various agricultural development activities, including infrastructure, machinery, integrated farming, and soil health.',
      eligibility: [
        'Farmers, farmer groups, agricultural universities, research institutions, and state departments',
        'Eligibility varies by sub-component and project proposals submitted by states.'
      ],
      benefits: 'Funding for agricultural infrastructure (godowns, water harvesting), procurement of machinery (tractors, power tillers, drones), promotion of integrated farming, soil health initiatives, and other state-specific agricultural projects.',
      applicationProcess: 'Proposals submitted by State Agriculture Departments. Farmers can benefit through state-implemented sub-schemes. National Portal: https://rkvy.nic.in/',
      requiredDocuments: ['Varies by sub-scheme. Typically Aadhaar Card, land records, bank details for individual farmer benefits.'],
      icon: 'stats-chart-outline',
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer', 'agricultural_stakeholder'],
      casteEligible: ['all'],
      incomeLimit: null // Project-based eligibility
    },
    {
      id: '45',
      name: 'Price Support Scheme (PSS) for Bengal Gram (Channa)',
      description: 'Provides procurement of Bengal Gram (Channa) from farmers at the Minimum Support Price (MSP).',
      eligibility: [
        'Farmers growing Bengal Gram (Channa) in Karnataka',
        'Crops meeting specified quality standards.'
      ],
      benefits: 'Procurement of Bengal Gram at MSP (e.g., ₹5440 per quintal for Rabi 2023-24 season), ensuring remunerative prices for farmers.',
      applicationProcess: 'Register at designated procurement centers. Information available through State Agriculture Department: https://www.karnataka.gov.in/agriculture',
      requiredDocuments: ['Aadhaar Card', 'Land records (Pahani/RTC) showing cultivation of Bengal Gram', 'Bank account details', 'Quantity of produce for sale'],
      icon: 'logo-yen', // Placeholder, consider 'nutrition-outline' or 'cash-outline'
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '46',
      name: 'Karnataka Raitha Samruddhi Yojana',
      description: 'A new scheme to promote integrated farming practices by consolidating various pro-farmer initiatives for comprehensive support.',
      eligibility: [
        'Farmers in Karnataka',
        'Engaged in or willing to adopt integrated farming practices.'
      ],
      benefits: 'Comprehensive support to improve farmers\' livelihoods through integrated farming, consolidating benefits from various initiatives.',
      applicationProcess: 'Details to be announced by State Agriculture Department. Check: https://www.karnataka.gov.in/agriculture',
      requiredDocuments: ['Aadhaar Card', 'Land records (Pahani/RTC)', 'Bank account details', 'Details of existing farming practices'],
      icon: 'sync-circle-outline',
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '47',
      name: 'Krishi Bhagya',
      description: 'Focuses on converting rainfed agriculture into sustainable agriculture by harvesting rainwater in farm ponds and using it for protective irrigation.',
      eligibility: [
        'Farmers in rainfed areas of Karnataka',
        'Willing to adopt rainwater harvesting and protective irrigation techniques.'
      ],
      benefits: 'Subsidy for construction of farm ponds with poly-lining, distribution of diesel pump sets, and sprinkler irrigation sets.',
      applicationProcess: 'Apply through State Agriculture Department or local Raitha Samparka Kendras. Check: https://www.karnataka.gov.in/agriculture',
      requiredDocuments: ['Aadhaar Card', 'Land records (Pahani/RTC) for rainfed land', 'Bank account details', 'Application form detailing proposed works'],
      icon: 'water-outline',
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '48',
      name: 'Customized Hiring Service Centre (Krishi Yantra Dhare)',
      description: 'Makes high-cost agriculture implements available to farmers at a cheaper rental basis.',
      eligibility: [
        'Farmers in Karnataka requiring agricultural implements on a rental basis.'
      ],
      benefits: 'Access to high-cost agricultural machinery (tractors, tillers, harvesters etc.) at subsidized rental rates, reducing capital investment for farmers.',
      applicationProcess: 'Contact local Krishi Yantra Dhare centers or State Agriculture Department. Check: https://www.karnataka.gov.in/agriculture',
      requiredDocuments: ['Aadhaar Card', 'Farmer identification (e.g., land records)', 'Details of implements required'],
      icon: 'construct-outline',
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '49',
      name: 'Distribution of Quality Seeds on Subsidy',
      description: 'Provides good quality seeds of various crops to farmers at subsidized rates.',
      eligibility: [
        'General, SC, and ST farmers in Karnataka requiring quality seeds.'
      ],
      benefits: 'Access to high-quality, certified seeds at subsidized prices, improving crop yield and quality. Subsidy levels may vary for General and SC/ST farmers.',
      applicationProcess: 'Contact local Raitha Samparka Kendras or State Agriculture Department. Check: https://www.karnataka.gov.in/agriculture',
      requiredDocuments: ['Aadhaar Card', 'Land records (Pahani/RTC)', 'Caste Certificate (for higher subsidy for SC/ST)'],
      icon: 'leaf-outline', // Reusing, could be 'seedling-outline' if available
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '50',
      name: 'Karnataka Raita Suraksha Prime Minister Fasal Bhīma Yojane (KRSPMFBY)',
      description: 'Provides insurance coverage and financial support to farmers in case of crop failure due to natural calamities, pests, or diseases.',
      eligibility: [
        'Farmers (loanee and non-loanee) who cultivate notified crops in notified areas of Karnataka.'
      ],
      benefits: 'Financial support in case of crop loss due to non-preventable risks like drought, flood, pests, diseases. Premium subsidized by government.',
      applicationProcess: 'Enroll through banks (for loanee farmers), Common Service Centers (CSCs), or PMFBY portal. Check: https://www.karnataka.gov.in/agriculture or https://pmfby.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Land records (Pahani/RTC)', 'Bank account details', 'Crop sowing certificate'],
      icon: 'umbrella-outline',
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '51',
      name: 'Distribution of Agriculture Implements, Agro-processing Equipment, Drip & Sprinkler Sets on Subsidy',
      description: 'Offers substantial subsidies on various agricultural inputs like implements, processing equipment, and micro-irrigation systems.',
      eligibility: [
        'Farmers in Karnataka requiring agricultural implements, agro-processing equipment, or micro-irrigation (drip/sprinkler) sets.'
      ],
      benefits: 'Subsidies on agricultural inputs (e.g., 50% for General farmers, 90% for SC & ST farmers on certain items). Promotes mechanization, value addition, and water use efficiency.',
      applicationProcess: 'Apply through State Agriculture Department or Horticulture Department. Check: https://www.karnataka.gov.in/agriculture',
      requiredDocuments: ['Aadhaar Card', 'Land records (Pahani/RTC)', 'Caste Certificate (for higher subsidy for SC/ST)', 'Quotation for equipment/system', 'Bank account details'],
      icon: 'settings-outline',
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '52',
      name: 'Pradhana Mantri Krishi Sinchayi Yojane (PMKSY)',
      description: 'Aims to enhance water use efficiency ("Per Drop More Crop") through various water conservation and irrigation management activities.',
      eligibility: [
        'Farmers, water user associations, and other stakeholders interested in water conservation and irrigation infrastructure.'
      ],
      benefits: 'Financial and technical support for micro-irrigation (drip/sprinkler), water harvesting structures (check dams, farm ponds), watershed development, and other water management practices.',
      applicationProcess: 'Apply through State Agriculture/Horticulture/Watershed Departments. National Portal: https://pmksy.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Land records', 'Bank account details', 'Project proposal for community projects'],
      icon: 'water-outline', // Reusing, appropriate
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '53',
      name: 'Soil Health Mission',
      description: 'Distributes Soil Health Cards to farmers to promote balanced fertilizer application based on soil nutrient status.',
      eligibility: [
        'All farmers in Karnataka seeking soil health analysis and recommendations.'
      ],
      benefits: 'Free soil testing and Soil Health Card providing crop-wise recommendations for nutrients and fertilizers, leading to improved soil health and productivity.',
      applicationProcess: 'Soil samples collected by Agriculture Department officials. Farmers receive cards through local agricultural offices. National Portal: https://soilhealth.dac.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Land records (for linking soil sample to farm)'],
      icon: 'flask-outline',
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '54',
      name: 'Bhoochetna Scheme',
      description: 'Aims to increase the productivity of rainfed agriculture crops by at least 20% through science-led interventions.',
      eligibility: [
        'Farmers in rainfed agriculture regions of Karnataka.'
      ],
      benefits: 'Improved crop varieties, soil nutrient management, pest management, and other technical support to enhance productivity in rainfed areas.',
      applicationProcess: 'Implemented through State Agriculture Department and local Raitha Samparka Kendras. Check: https://www.karnataka.gov.in/agriculture',
      requiredDocuments: ['Aadhaar Card', 'Land records for rainfed area'],
      icon: 'trending-up-outline', // Reusing, appropriate
      category: 'agriculture',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '55',
      name: 'Relief to Farmer Suicide/Snake Bite Victims',
      description: 'Provides financial relief to families of farmers who commit suicide or to victims of snake bite/accidental death during agriculture activities.',
      eligibility: [
        'Families of farmers in Karnataka who commit suicide due to agrarian distress',
        'Farmers or their family members who are victims of snake bite or accidental death during agricultural activities.'
      ],
      benefits: 'Financial relief (e.g., ₹5 Lakhs for farmer suicide, ₹2 Lakhs for snake bite/accidental death during agriculture activities).',
      applicationProcess: 'Apply through District Administration or State Agriculture Department. Check: https://www.karnataka.gov.in/agriculture',
      requiredDocuments: ['Death Certificate', 'FIR copy (if applicable)', 'Post-mortem report (if applicable)', 'Land records (for farmer suicide)', 'Aadhaar Card of victim and claimant', 'Bank account details of claimant', 'Proof of agricultural activity (for accidental death)'],
      icon: 'sad-outline',
      category: 'social_welfare',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer', 'family_member_of_farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '56',
      name: 'Organic Farming Scheme',
      description: 'Promotes sustainable agriculture through adoption of organic farming practices, often involving NGO-implemented training and demonstrations.',
      eligibility: [
        'Farmers in Karnataka willing to practice or convert to organic farming.'
      ],
      benefits: 'Financial assistance for organic inputs, certification, training, and market linkages. Promotes soil health and environmentally friendly agriculture.',
      applicationProcess: 'Apply through State Agriculture/Horticulture Department or designated organic farming cells/NGOs. Check: https://www.karnataka.gov.in/agriculture',
      requiredDocuments: ['Aadhaar Card', 'Land records', 'Application for organic certification (if applicable)', 'Details of current farming practices'],
      icon: 'leaf-outline', // Reusing, very appropriate
      category: 'agriculture_environment',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['farmer'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '57',
      name: 'Karnataka Housing Board (KHB) Schemes',
      description: 'Provides affordable housing options (sites, flats, houses) to residents of Karnataka, with a focus on various income groups.',
      eligibility: [
        'Residents of Karnataka (domicile requirements usually apply)',
        'Specific schemes may target EWS, LIG, MIG, HIG income groups',
        'Age >18 years',
        'Applicant should not own a house/site from KHB or other urban development authorities in that city/region (may vary).'
      ],
      benefits: 'Affordable housing units (urban and rural planned for 2024). Flexible payment plans. Emphasis on sustainable design.',
      applicationProcess: 'Apply when KHB announces new projects/schemes. Check KHB website: https://karnatakahousing.com/',
      requiredDocuments: ['Aadhaar Card', 'Residential Proof (Karnataka)', 'Income Certificate (for specific income group schemes)', 'Age proof', 'Affidavit of no prior KHB property ownership (as per scheme)', 'Bank account details'],
      icon: 'home-outline', // Reusing, appropriate
      category: 'housing',
      ageRange: { min: 18, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null // Varies by specific scheme (EWS, LIG, MIG, HIG)
    },
    {
      id: '58',
      name: 'Basava Vasati Yojana (Ashraya Yojana)',
      description: 'Provides pucca houses at discounted rates or funds for construction materials to homeless BPL, SC/ST/OBC families in Karnataka.',
      eligibility: [
        'Permanent residents of Karnataka from BPL, SC/ST/OBC categories',
        'Annual household income not exceeding ₹32,000',
        'Do not own a pucca house elsewhere in India',
        'Beneficiary should own land for construction (for fund assistance component).'
      ],
      benefits: 'Financial assistance for construction of a new house (e.g., ₹1.2 to ₹1.5 lakh subsidy) or provision of a pucca house at discounted rates.',
      applicationProcess: 'Apply through local Gram Panchayat or Urban Local Body. Selection by Gram Sabha. Portal: https://ashraya.karnataka.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'BPL Card', 'Caste Certificate (SC/ST/OBC)', 'Income Certificate (Annual household income <= ₹32,000)', 'Residential Proof (Karnataka)', 'Land ownership documents (if applying for construction fund)', 'Affidavit of no pucca house ownership'],
      icon: 'home-outline', // Reusing
      category: 'housing',
      ageRange: { min: 18, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['all'], // Based on housing need and income
      casteEligible: ['all'],
      incomeLimit: 32000
    },
    {
      id: '59',
      name: 'Navu Manujaru Program',
      description: 'A weekly session in government schools and PU colleges to foster social harmony and scientific temper among students.',
      eligibility: [
        'Students in government schools and Pre-University (PU) colleges in Karnataka.'
      ],
      benefits: 'Two-hour weekly sessions aimed at promoting values of social harmony, critical thinking, and scientific temperament.',
      applicationProcess: 'Implemented through the Department of Education in schools/colleges. Check: https://www.karnataka.gov.in/education',
      requiredDocuments: ['Not an application-based scheme for individuals; part of curriculum/school activity.'],
      icon: 'people-outline', // Reusing
      category: 'education',
      ageRange: { min: 0, max: 100 }, // School/college going age
      genderEligible: ['all'],
      occupationEligible: ['student'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '60',
      name: 'Ganitha-Ganaka',
      description: 'A proposed initiative to help children improve mathematical skills.',
      eligibility: [
        'Children in Karnataka needing mathematical skill improvement.'
      ],
      benefits: 'Programs and resources to enhance mathematical abilities among children.',
      applicationProcess: 'Details of implementation to be provided by Department of Education. Check: https://www.karnataka.gov.in/education',
      requiredDocuments: ['Likely school-based; individual application details not yet specified.'],
      icon: 'calculator-outline',
      category: 'education',
      ageRange: { min: 0, max: 100 }, // School-going children
      genderEligible: ['all'],
      occupationEligible: ['student'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '61',
      name: 'Post-Matric Scholarship for Minorities',
      description: 'Provides financial assistance to minority community students pursuing post-matriculation studies (Class XI to PhD).',
      eligibility: [
        'Students from religious minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)',
        'Studying in Class XI, XII, UG, PG, Technical/Vocational courses, M.Phil, PhD',
        'Secured not less than 50% marks in previous final examination',
        'Annual family income not exceeding ₹2 lakh.'
      ],
      benefits: 'Scholarship covering admission and tuition fees, and maintenance allowance.',
      applicationProcess: 'Apply online through National Scholarship Portal (NSP): https://scholarships.gov.in/',
      requiredDocuments: ['Minority Community Certificate', 'Income Certificate (Family annual income <= ₹2 lakh)', 'Aadhaar Card', 'Marksheet of previous qualifying exam', 'Fee receipt of current course', 'Bank account details', 'Domicile certificate'],
      icon: 'school-outline', // Reusing
      category: 'education',
      ageRange: { min: 0, max: 100 }, // Post-matriculation students
      genderEligible: ['all'],
      occupationEligible: ['student', 'minority_community_member'],
      casteEligible: ['all'],
      incomeLimit: 200000
    },
    {
      id: '62',
      name: 'Merit-Cum-Means Scholarship for Minorities',
      description: 'Provides financial assistance to poor and meritorious minority community students pursuing professional and technical courses at undergraduate and postgraduate levels.',
      eligibility: [
        'Students from religious minority communities',
        'Pursuing technical or professional courses at UG or PG level',
        'Secured not less than 50% marks in previous final examination',
        'Annual family income not exceeding ₹2.5 lakh.'
      ],
      benefits: 'Scholarship covering course fees and maintenance allowance.',
      applicationProcess: 'Apply online through National Scholarship Portal (NSP): https://scholarships.gov.in/',
      requiredDocuments: ['Minority Community Certificate', 'Income Certificate (Family annual income <= ₹2.5 lakh)', 'Aadhaar Card', 'Marksheet of previous qualifying exam / competitive exam', 'Fee receipt of current course', 'Bank account details', 'Domicile certificate'],
      icon: 'medal-outline',
      category: 'education',
      ageRange: { min: 0, max: 100 }, // UG/PG students
      genderEligible: ['all'],
      occupationEligible: ['student', 'minority_community_member'],
      casteEligible: ['all'],
      incomeLimit: 250000
    },
    {
      id: '63',
      name: 'MPhil and PhD Fellowship for Minority Students',
      description: 'Provides fellowships to minority community students pursuing MPhil and PhD programs (often through UGC).',
      eligibility: [
        'Minority community students pursuing MPhil and PhD programs in recognized universities.',
        'Eligibility criteria set by UGC or funding agency (e.g., Maulana Azad National Fellowship).'
      ],
      benefits: 'Financial support for research, including fellowship amount, contingency grants.',
      applicationProcess: 'Apply through University Grants Commission (UGC) portal or National Scholarship Portal (NSP) when announced: https://scholarships.gov.in/ or UGC website.',
      requiredDocuments: ['Minority Community Certificate', 'Aadhaar Card', 'Admission proof for MPhil/PhD', 'Academic records', 'Research proposal (sometimes)', 'Income certificate (if applicable)'],
      icon: 'library-outline', // Reusing
      category: 'education',
      ageRange: { min: 0, max: 100 }, // Research scholars
      genderEligible: ['all'],
      occupationEligible: ['student', 'research_scholar', 'minority_community_member'],
      casteEligible: ['all'],
      incomeLimit: null // May vary by specific fellowship
    },
    {
      id: '64',
      name: 'National Overseas Scholarship for Minority Community Students',
      description: 'Provides financial assistance to minority community students for pursuing higher studies (Masters, PhD) abroad.',
      eligibility: [
        'Minority community students',
        'Seeking to pursue Masters or PhD level courses in specified fields abroad',
        'Age and income criteria apply (e.g., family income < ₹6 lakh per annum, age < 35 years).',
        'Minimum 60% marks in qualifying exam.'
      ],
      benefits: 'Covers tuition fees, maintenance allowance, travel expenses, and other costs.',
      applicationProcess: 'Apply online through Ministry of Minority Affairs portal or National Scholarship Portal when announced: https://scholarships.gov.in/',
      requiredDocuments: ['Minority Community Certificate', 'Income Certificate (Family annual income < ₹6 lakh)', 'Aadhaar Card', 'Academic transcripts', 'Admission letter from foreign university', 'Passport copy', 'Score reports (GRE, GMAT, TOEFL, IELTS if applicable)'],
      icon: 'airplane-outline',
      category: 'education',
      ageRange: { min: 0, max: 100 }, // Typically up to 35 years
      genderEligible: ['all'],
      occupationEligible: ['student', 'minority_community_member'],
      casteEligible: ['all'],
      incomeLimit: 600000
    },
    {
      id: '65',
      name: 'Scheme of Overseas Scholarships for SC/ST Students',
      description: 'Provides financial assistance to SC/ST students for pursuing higher studies (Masters, PhD) abroad.',
      eligibility: [
        'SC/ST students',
        'Seeking to pursue Masters or PhD level courses in specified fields abroad',
        'Age and income criteria apply (similar to Prabuddha scheme, may vary by specific notification).',
        'Minimum percentage in qualifying exam.'
      ],
      benefits: 'Covers tuition fees, maintenance allowance, travel expenses, and other costs.',
      applicationProcess: 'Apply through Ministry of Social Justice & Empowerment or State Social Welfare Departments (like Karnataka\'s Prabuddha scheme): https://sw.kar.nic.in/ or National Overseas Scholarship portal.',
      requiredDocuments: ['Caste Certificate (SC/ST)', 'Income Certificate', 'Aadhaar Card', 'Academic transcripts', 'Admission letter from foreign university', 'Passport copy', 'Score reports (GRE, GMAT, TOEFL, IELTS if applicable)'],
      icon: 'earth-outline', // Reusing
      category: 'education',
      ageRange: { min: 0, max: 100 }, // Typically up to 35 years
      genderEligible: ['all'],
      occupationEligible: ['student', 'scheduled_caste_member', 'scheduled_tribe_member'],
      casteEligible: ['all'],
      incomeLimit: null // Varies, e.g. Prabuddha has < ₹8 lakh for 100%
    },
    {
      id: '66',
      name: 'Research Guidance PhD Fellowship for Backward Classes',
      description: 'Provides fellowships to students from Backward Classes pursuing PhD research in Karnataka.',
      eligibility: [
        'Students belonging to Backward Classes (Category I, IIA, IIB, IIIA, IIIB) in Karnataka',
        'Pursuing PhD research in recognized universities within Karnataka.'
      ],
      benefits: 'Monthly fellowship amount and contingency grant to support PhD research.',
      applicationProcess: 'Apply through the Department of Backward Classes Welfare, Government of Karnataka: https://www.karnataka.gov.in/backwardclasses',
      requiredDocuments: ['Backward Class Caste Certificate', 'Income Certificate (income limits may apply)', 'Aadhaar Card', 'PhD registration/admission proof', 'Academic records', 'Research proposal'],
      icon: 'book-outline',
      category: 'education',
      ageRange: { min: 0, max: 100 }, // PhD scholars
      genderEligible: ['all'],
      occupationEligible: ['student', 'research_scholar', 'backward_class_member'],
      casteEligible: ['all'],
      incomeLimit: null // Income limits usually apply for BC scholarships
    },
    {
      id: '67',
      name: 'Incentive For SSLC & 2nd PUC Students',
      description: 'Provides cash incentives to minority community students who score 85% or above marks in SSLC (10th) and 2nd PUC (12th) exams.',
      eligibility: [
        'Minority community students in Karnataka',
        'Scored 85% or above marks in SSLC or 2nd PUC board examinations.'
      ],
      benefits: 'One-time cash incentive (amount varies, e.g., ₹10,000 for SSLC, ₹20,000 for 2nd PUC in some announcements).',
      applicationProcess: 'Apply online through the Directorate of Minorities Welfare, Karnataka portal: https://www.karnataka.gov.in/minoritywelfare',
      requiredDocuments: ['Minority Community Certificate', 'Aadhaar Card', 'SSLC/2nd PUC marks card (showing >=85%)', 'Bank account details'],
      icon: 'ribbon-outline',
      category: 'education',
      ageRange: { min: 0, max: 100 }, // SSLC/PUC students
      genderEligible: ['all'],
      occupationEligible: ['student', 'minority_community_member'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '68',
      name: 'Pre-Matric Scholarship for Minorities',
      description: 'Provides financial assistance to minority community students studying at the pre-matriculation level (Class I to X).',
      eligibility: [
        'Students from religious minority communities',
        'Studying in Class I to X in government or recognized private schools',
        'Secured not less than 50% marks in previous final examination (not applicable for Class I)',
        'Annual family income not exceeding ₹1 lakh.'
      ],
      benefits: 'Scholarship covering admission/tuition fees and maintenance allowance.',
      applicationProcess: 'Apply online through National Scholarship Portal (NSP): https://scholarships.gov.in/',
      requiredDocuments: ['Minority Community Certificate', 'Income Certificate (Family annual income <= ₹1 lakh)', 'Aadhaar Card', 'Marksheet of previous qualifying exam (for Class II-X)', 'Bank account details (joint account with parent for young students)', 'Domicile certificate'],
      icon: 'pencil-outline',
      category: 'education',
      ageRange: { min: 0, max: 100 }, // Pre-matriculation students (Class I-X)
      genderEligible: ['all'],
      occupationEligible: ['student', 'minority_community_member'],
      casteEligible: ['all'],
      incomeLimit: 100000
    },
    {
      id: '69',
      name: 'Gruha Aarogya Scheme',
      description: 'Provides screening and treatment for six non-communicable diseases (NCDs) to individuals in Karnataka.',
      eligibility: [
        'Residents of Karnataka',
        'Seeking screening and treatment for specified non-communicable diseases (e.g., hypertension, diabetes, certain cancers).'
      ],
      benefits: 'Free screening, diagnosis, and treatment for six identified NCDs at government health facilities. Medicines may also be provided.',
      applicationProcess: 'Visit local Primary Health Centers (PHCs), Community Health Centers (CHCs), or other designated government hospitals. Check: https://karhfw.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Resident proof of Karnataka', 'Any existing medical records related to NCDs'],
      icon: 'heart-outline', // Reusing
      category: 'health',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '70',
      name: 'Kalyana Karnataka Comprehensive Health Scheme',
      description: 'Aims to strengthen healthcare infrastructure and services in the Kalyana Karnataka region (formerly Hyderabad-Karnataka region).',
      eligibility: [
        'Residents of the Kalyana Karnataka region (Bidar, Kalaburagi, Yadgir, Raichur, Koppal, Ballari, Vijayanagara districts).'
      ],
      benefits: 'Improved access to quality healthcare services, upgraded hospitals and health centers, and special health programs tailored for the region.',
      applicationProcess: 'Benefits accessed through existing public health system in Kalyana Karnataka region. Check: https://www.kalyanakarnataka.gov.in/health (or similar official KK RDB portal)',
      requiredDocuments: ['Aadhaar Card', 'Resident proof of Kalyana Karnataka region'],
      icon: 'medkit-outline', // Reusing
      category: 'health',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '71',
      name: 'Ayushman Bharat–Arogya Karnataka (AB-ArK) Scheme',
      description: 'Provides cashless health coverage to all eligible residents of Karnataka for secondary and tertiary care hospitalization.',
      eligibility: [
        'All residents of Karnataka are broadly covered.',
        '"Eligible PMJAY Beneficiaries" (identified via SECC 2011 or RSBY) get coverage up to ₹5 lakh per family per year.',
        '"Eligible State Beneficiaries" (other Karnataka residents not covered under PMJAY) also get benefits, potentially with co-payment for certain treatments or if opting for private hospitals directly for tertiary care without referral.'
      ],
      benefits: 'Cashless health coverage up to ₹5 lakhs per family per annum for secondary and tertiary care hospitalization at empanelled public and private hospitals.',
      applicationProcess: 'No specific enrollment for PMJAY beneficiaries. Others can get AB-ArK card. Check eligibility and get card at empanelled hospitals or Arogya Mitra kiosks. Portal: https://pmjay.gov.in/karnataka or http://arogya.karnataka.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Ration Card (BPL/APL)', 'PMJAY e-card (if available)', 'Mobile number'],
      icon: 'shield-checkmark-outline', // Reusing
      category: 'health',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['all'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null // Tiered benefits based on PMJAY/State beneficiary status
    },
    {
      id: '72',
      name: 'New Industrial Policy 2024-29',
      description: 'Aims to generate employment and promote industrial growth in Karnataka with incentives for various sectors, female workforce participation, and backward talukas.',
      eligibility: [
        'Industries and entrepreneurs setting up new greenfield enterprises or undertaking expansion/diversification in Karnataka.',
        'Specific eligibility criteria for different incentives (e.g., investment size, sector, location, employment generation).'
      ],
      benefits: 'Various incentives like investment promotion subsidy, exemption from stamp duty, concessional registration charges, reimbursement of land conversion fee, interest subsidy on term loans, exemption from electricity duty. Special incentives for industries with higher female workforce and those in backward talukas. Logistics and warehousing accorded "industry" status.',
      applicationProcess: 'Apply through Karnataka Udyog Mitra or Department of Industries and Commerce. Check policy document: https://www.karnataka.gov.in/industry',
      requiredDocuments: ['Detailed Project Report (DPR)', 'Company registration documents', 'Land documents', 'Financial statements', 'Application for specific incentives as per policy guidelines'],
      icon: 'business-outline', // Reusing
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 0, max: 100 }, // Entrepreneurs/Company representatives
      genderEligible: ['all'], // Incentives for female workforce participation
      occupationEligible: ['entrepreneur', 'industrialist'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '73',
      name: "Chief Minister's Kaushalya Karnataka Yojane (CMKKY) and Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
      description: 'Offers free skill training in various sectors to youth in Karnataka to enhance employability.',
      eligibility: [
        'Youth aged 18-35 years in Karnataka (age may vary slightly by course/component)',
        'Unemployed youth, school/college dropouts, or those seeking skill upgradation.'
      ],
      benefits: 'Free short-term skill training in NSQF (National Skills Qualifications Framework) aligned courses across various sectors (e.g., IT, electronics, construction, healthcare, apparel, agriculture). Placement assistance and certification upon completion.',
      applicationProcess: 'Register online through Kaushalkar portal or at local skill development centers. Portal: https://kaushalkar.karnataka.gov.in/',
      requiredDocuments: ['Aadhaar Card', 'Age proof', 'Educational qualification certificates (if any)', 'Bank account details', 'Photographs'],
      icon: 'school-outline', // Reusing
      category: 'skill_development_entrepreneurship',
      ageRange: { min: 18, max: 35 },
      genderEligible: ['all'],
      occupationEligible: ['unemployed_youth', 'student_dropout', 'all'], // Seeking skill training
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '74',
      name: 'Ashadeepa Scheme',
      description: 'Reimburses ESI and EPF contributions paid by private sector employers for SC/ST candidates for 2 years.',
      eligibility: [
        'Employers in the private sector in Karnataka',
        'Employing SC/ST candidates who are new recruits.'
      ],
      benefits: 'Reimbursement of the employer\'s contribution towards ESI and EPF for SC/ST employees for a period of 2 years (up to ₹3000/month per candidate). Aims to promote employment of SC/ST youth.',
      applicationProcess: 'Employers apply through the Department of Social Welfare: https://socialwelfare.karnataka.gov.in/',
      requiredDocuments: ['Company registration details', 'List of SC/ST employees with appointment letters', 'Proof of ESI/EPF payment for these employees', 'Caste certificates of employees', 'Aadhaar of employees'],
      icon: 'file-tray-stacked-outline',
      category: 'employment',
      ageRange: { min: 0, max: 100 }, // Applicable to employers
      genderEligible: ['all'], // For SC/ST employees
      occupationEligible: ['employer'], // Beneficiary is employer, for SC/ST employees
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '75',
      name: 'Akka Cooperative Society',
      description: 'Provides quick access to credit for women in Self-Help Groups (SHGs) under the National Livelihood Mission (NRLM/Sanjeevini).',
      eligibility: [
        'Women who are members of Self-Help Groups (SHGs) formed under NRLM (Sanjeevini) in Karnataka.'
      ],
      benefits: 'Easier and quicker access to credit facilities for livelihood activities and other needs, strengthening SHGs.',
      applicationProcess: 'SHGs can approach Akka Cooperative Societies. Information via Department of Women and Child Development or NRLM officials: https://www.karnataka.gov.in/womenchild',
      requiredDocuments: ['SHG membership details', 'Loan application from SHG', 'Aadhaar cards of SHG members involved', 'Business/activity plan for loan utilization'],
      icon: 'people-circle-outline', // Reusing
      category: 'women_empowerment',
      ageRange: { min: 18, max: 100 },
      genderEligible: ['female'],
      occupationEligible: ['shg_member'],
      casteEligible: ['all'],
      incomeLimit: null // Targets women in SHGs, often from poorer sections
    },
    {
      id: '76',
      name: "Loan Amount Enhancement for SC/ST Women's SHGs",
      description: 'Increases the loan amount available to Self-Help Groups (SHGs) formed by SC/ST women.',
      eligibility: [
        'Self-Help Groups (SHGs) formed by SC/ST women in Karnataka.'
      ],
      benefits: 'Enhanced loan amount (e.g., increased from ₹1 lakh to ₹2.5 lakh in some announcements) for SHGs to undertake larger income-generating activities.',
      applicationProcess: 'SHGs apply through relevant corporations like Dr. B.R. Ambedkar Development Corporation or Social Welfare Department: https://socialwelfare.karnataka.gov.in/',
      requiredDocuments: ['SHG registration/formation documents', 'List of SC/ST women members with caste certificates', 'Aadhaar cards of members', 'Loan application with project proposal', 'Bank account details of SHG'],
      icon: 'cash-outline', // Reusing
      category: 'women_empowerment',
      ageRange: { min: 18, max: 100 },
      genderEligible: ['female'],
      occupationEligible: ['shg_member', 'scheduled_caste_member', 'scheduled_tribe_member'],
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '77',
      name: 'Integrated Child Development Services (ICDS) Scheme',
      description: 'Provides a package of services including supplementary nutrition, immunization, health check-ups, and pre-school education to children below 6 years, pregnant women, lactating mothers, and adolescent girls.',
      eligibility: [
        'Children below 6 years',
        'Pregnant women',
        'Lactating mothers',
        'Adolescent girls ( Kishori Shakti Yojana/SABLA component).'
      ],
      benefits: 'Supplementary nutrition, immunization, health check-ups, referral services, pre-school non-formal education, and nutrition & health education through Anganwadi Centers.',
      applicationProcess: 'Services are delivered through Anganwadi Centers. Register at the local Anganwadi. Portal: https://dwcd.karnataka.gov.in/page/ICDS/en',
      requiredDocuments: ['Aadhaar Card (child and parent/guardian)', 'Birth certificate of child', 'Pregnancy record (Thayi card for pregnant women)'],
      icon: 'body-outline',
      category: 'health',
      ageRange: { min: 0, max: 100 }, // Covers children 0-6, adolescent girls, pregnant/lactating women
      genderEligible: ['female', 'all'], // Specific groups targeted
      occupationEligible: ['all'], // Based on beneficiary category
      casteEligible: ['all'], // Specific groups targeted
      incomeLimit: null // Universal for target groups
    },
    {
      id: '78',
      name: 'Pradhana Mantri Matru Vandana Yojana (PMMVY)',
      description: 'Maternity benefit scheme providing cash incentives for pregnant women and lactating mothers for their first live birth to improve health and nutrition.',
      eligibility: [
        'Pregnant women and lactating mothers for their first live birth',
        'Excludes those in regular employment with Central/State Govt or PSUs or those receiving similar benefits under any law.'
      ],
      benefits: 'Cash incentive of ₹5,000 in three installments, subject to fulfilling specific conditionalities related to maternal and child health. (Often combined with Janani Suraksha Yojana benefits for institutional delivery).',
      applicationProcess: 'Register at Anganwadi Centre or approved health facility. Online registration also possible. Portal: https://pmmvy.nic.in/',
      requiredDocuments: ['Aadhaar Card (mother and husband)', 'Bank Account details (mother)', 'MCP (Mother Child Protection) Card / Thayi Card', 'Proof of first live birth'],
      icon: 'woman-outline', // Reusing
      category: 'women_empowerment',
      ageRange: { min: 18, max: 100 }, // Reproductive age
      genderEligible: ['female'],
      occupationEligible: ['all'], // With exclusions
      casteEligible: ['all'],
      incomeLimit: null
    },
    {
      id: '79',
      name: 'Beti Bachao, Beti Padhao',
      description: 'Aims to prevent gender-biased sex selective elimination, ensure survival and protection of the girl child, and ensure education and participation of the girl child.',
      eligibility: [
        'Focuses on girl children and women across the lifecycle. It is a social campaign and advocacy scheme rather than an individual cash benefit scheme in most aspects.'
      ],
      benefits: 'Addresses issues of declining Child Sex Ratio (CSR) through advocacy, community mobilization, and multi-sectoral interventions to promote the value of the girl child and her education.',
      applicationProcess: 'Not an individual application scheme. Implemented through district-level action plans involving Health, Education, and Women & Child Development departments. Portal: https://wcd.nic.in/schemes/beti-bachao-beti-padhao-bbbp',
      requiredDocuments: ['N/A for direct individual application for cash benefits, as it is primarily an advocacy and intervention scheme.'],
      icon: 'female-outline',
      category: 'women_empowerment',
      ageRange: { min: 0, max: 100 },
      genderEligible: ['female'],
      occupationEligible: ['all'],
      casteEligible: ['all'],
      incomeLimit: null
    }
  ];
  


export default function SchemesScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [showEligibilityChecker, setShowEligibilityChecker] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: '',
    gender: '',
    occupation: '',
    caste: ''
  });
  const [showPersonalizedResults, setShowPersonalizedResults] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const ageRanges = [
    { label: 'Select Age Range', value: '' },
    { label: '0-18 years', value: '0-18' },
    { label: '19-25 years', value: '19-25' },
    { label: '26-35 years', value: '26-35' },
    { label: '36-50 years', value: '36-50' },
    { label: '51-65 years', value: '51-65' },
    { label: '65+ years', value: '65+' }
  ];

  const genders = [
    { label: 'Select Gender', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
  ];

  const occupations = [
    { label: 'Select Occupation', value: '' },
    { label: 'Student', value: 'student' },
    { label: 'Farmer', value: 'farmer' },
    { label: 'Laborer', value: 'laborer' },
    { label: 'Employed', value: 'employed' },
    { label: 'Business Owner', value: 'business' },
    { label: 'Self-Employed', value: 'self-employed' },
    { label: 'Unemployed', value: 'unemployed' },
    { label: 'Other', value: 'other' }
  ];

  const castes = [
    { label: 'Select Caste', value: '' },
    { label: 'Scheduled Caste (SC)', value: 'SC' },
    { label: 'Scheduled Tribe (ST)', value: 'ST' },
    { label: 'Other Backward Class (OBC)', value: 'OBC' },
    { label: 'General', value: 'General' }
  ];

  const categories = [
    { key: 'all', label: 'All', icon: 'apps-outline' },
    { key: 'health', label: 'Health', icon: 'medical-outline' },
    { key: 'education', label: 'Education', icon: 'school-outline' },
    { key: 'agriculture', label: 'Agriculture', icon: 'leaf-outline' },
    { key: 'employment', label: 'Employment', icon: 'people-outline' },
    { key: 'housing', label: 'Housing', icon: 'home-outline' },
    { key: 'social', label: 'Social', icon: 'heart-outline' }
  ];

  const checkEligibility = (scheme: Scheme, profile: UserProfile) => {
    if (!profile.age || !profile.gender || !profile.occupation || !profile.caste) return true;

    // Check age eligibility
    if (scheme.ageRange) {
      const ageValue = getAgeFromRange(profile.age);
      if (ageValue < scheme.ageRange.min || ageValue > scheme.ageRange.max) {
        return false;
      }
    }

    // Check gender eligibility
    if (scheme.genderEligible && !scheme.genderEligible.includes('all')) {
      if (!scheme.genderEligible.includes(profile.gender as any)) {
        return false;
      }
    }

    // Check occupation eligibility
    if (scheme.occupationEligible && !scheme.occupationEligible.includes('all')) {
      if (!scheme.occupationEligible.includes(profile.occupation)) {
        return false;
      }
    }

    // Check caste eligibility
    if (scheme.casteEligible && !scheme.casteEligible.includes('all')) {
      if (!scheme.casteEligible.includes(profile.caste as 'SC' | 'ST' | 'OBC' | 'General')) {
        return false;
      }
    }

    return true;
  };

  const getAgeFromRange = (ageRange: string): number => {
    if (ageRange === '0-18') return 9;
    if (ageRange === '19-25') return 22;
    if (ageRange === '26-35') return 30;
    if (ageRange === '36-50') return 43;
    if (ageRange === '51-65') return 58;
    if (ageRange === '65+') return 70;
    return 30;
  };

  const filteredSchemes = GOVERNMENT_SCHEMES.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    const isEligible = showPersonalizedResults ? checkEligibility(scheme, userProfile) : true;
    return matchesSearch && matchesCategory && isEligible;
  });

  const handleFindSchemes = () => {
    if (!userProfile.age || !userProfile.gender || !userProfile.occupation || !userProfile.caste) {
      Alert.alert('Missing Information', 'Please fill in all fields to find personalized schemes.');
      return;
    }
    setShowPersonalizedResults(true);
  };

  const handleResetFilter = () => {
    setShowPersonalizedResults(false);
    setUserProfile({ age: '', gender: '', occupation: '', caste: '' });
  };

  const renderDropdown = (
    items: { label: string; value: string }[],
    selectedValue: string,
    onValueChange: (value: string) => void,
    placeholder: string
  ) => {
    return (
      <>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setActiveDropdown(placeholder)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownText, !selectedValue && styles.dropdownPlaceholder]}>
              {selectedValue ? items.find(item => item.value === selectedValue)?.label : placeholder}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <Modal
          visible={activeDropdown === placeholder}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActiveDropdown(null)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActiveDropdown(null)}
          >
            <Pressable 
              style={styles.dropdownModal}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownModalTitle}>{placeholder}</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Ionicons name="close-outline" size={24} color={DARK} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                {items.slice(1).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      selectedValue === item.value && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setActiveDropdown(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedValue === item.value && styles.dropdownItemTextSelected
                    ]}>
                      {item.label}
                    </Text>
                    {selectedValue === item.value && (
                      <Ionicons name="checkmark-outline" size={20} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Pressable>
          </TouchableOpacity>
        </Modal>
      </>
    );
  };

  const renderSchemeCard = (scheme: Scheme) => {
    const isEligible = showPersonalizedResults && checkEligibility(scheme, userProfile);
    
    return (
      <TouchableOpacity
        key={scheme.id}
        style={styles.schemeCard}
        onPress={() => setSelectedScheme(scheme)}
        activeOpacity={0.85}
      >
        <LinearGradient colors={CARD_GRADIENT} style={styles.schemeGradient}>
          {showPersonalizedResults && isEligible && (
            <View style={styles.eligibilityBadge}>
              <Ionicons name="checkmark-circle" size={16} color="white" />
              <Text style={styles.eligibilityBadgeText}>You&apos;re Eligible!</Text>
            </View>
          )}
          
          <View style={styles.schemeHeader}>
            <View style={styles.schemeIconContainer}>
              <Ionicons name={scheme.icon as any} size={24} color={TEAL} />
            </View>
            <View style={styles.schemeTitleContainer}>
              <Text style={styles.schemeTitle} numberOfLines={2}>{scheme.name}</Text>
              <Text style={styles.schemeCategory}>{scheme.category.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.schemeDescription} numberOfLines={3}>
            {scheme.description}
          </Text>
          <View style={styles.schemeBenefits}>
            <Ionicons name="gift-outline" size={16} color={DARK} />
            <Text style={styles.benefitsText} numberOfLines={2}>{scheme.benefits}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderSchemeDetails = () => (
    <Modal
      visible={!!selectedScheme}
      animationType="slide"
      onRequestClose={() => setSelectedScheme(null)}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setSelectedScheme(null)}>
            <Ionicons name="arrow-back" size={24} color={DARK} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Scheme Details</Text>
          <TouchableOpacity onPress={() => Alert.alert('Apply', 'Redirecting to application process...')}>
            <Text style={styles.applyButton}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedScheme && (
            <>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>{selectedScheme.name}</Text>
                <Text style={styles.detailDescription}>{selectedScheme.description}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={TEAL} /> Eligibility Criteria
                </Text>
                {selectedScheme.eligibility.map((criteria, index) => (
                  <Text key={index} style={styles.listItem}>• {criteria}</Text>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="gift-outline" size={20} color={TEAL} /> Benefits
                </Text>
                <Text style={styles.detailText}>{selectedScheme.benefits}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="document-text-outline" size={20} color={TEAL} /> Required Documents
                </Text>
                {selectedScheme.requiredDocuments.map((doc, index) => (
                  <Text key={index} style={styles.listItem}>• {doc}</Text>
                ))}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="flag-outline" size={20} color={TEAL} /> Application Process
                </Text>
                <Text style={styles.detailText}>{selectedScheme.applicationProcess}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkEligibilityButton}
                onPress={() => setShowEligibilityChecker(true)}
              >
                <LinearGradient colors={CARD_GRADIENT} style={styles.buttonGradient}>
                  <Ionicons name="search-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Check My Eligibility</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderEligibilityChecker = () => (
    <Modal
      visible={showEligibilityChecker}
      animationType="slide"
      onRequestClose={() => setShowEligibilityChecker(false)}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEligibilityChecker(false)}>
            <Ionicons name="arrow-back" size={24} color={DARK} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Eligibility Checker</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.detailSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={20} color={TEAL} /> Personal Information
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Annual Income (₹)"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Occupation"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Caste"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="State/District"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={styles.checkEligibilityButton}
            onPress={() => Alert.alert('Eligibility Result', 'Based on your information, you may be eligible for this scheme. Please verify documents and apply through official channels.')}
          >
            <LinearGradient colors={CARD_GRADIENT} style={styles.buttonGradient}>
              <Ionicons name="checkmark-circle-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Check Eligibility</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: CREAM }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Government Schemes</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Find schemes you&apos;re eligible for</ThemedText>
      </View>

      {/* Personalized Eligibility Form */}
      <View style={styles.eligibilityForm}>
        <View style={styles.formHeader}>
          <Ionicons name="person-circle-outline" size={24} color={TEAL} />
          <Text style={styles.formTitle}>Find Your Eligible Schemes</Text>
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formField, { marginRight: 8 }]}>
            {renderDropdown(
              ageRanges,
              userProfile.age,
              (value: string) => setUserProfile(prev => ({ ...prev, age: value })),
              'Age Range'
            )}
          </View>
          <View style={styles.formField}>
            {renderDropdown(
              genders,
              userProfile.gender,
              (value: string) => setUserProfile(prev => ({ ...prev, gender: value })),
              'Gender'
            )}
          </View>
        </View>

        <View style={styles.formField}>
          {renderDropdown(
            occupations,
            userProfile.occupation,
            (value: string) => setUserProfile(prev => ({ ...prev, occupation: value })),
            'Occupation'
          )}
        </View>

        <View style={styles.formField}>
          {renderDropdown(
            castes,
            userProfile.caste,
            (value: string) => setUserProfile(prev => ({ ...prev, caste: value })),
            'Caste'
          )}
        </View>

        <View style={styles.formButtons}>
          <TouchableOpacity
            style={styles.findSchemesButton}
            onPress={handleFindSchemes}
          >
            <LinearGradient colors={CARD_GRADIENT} style={styles.buttonGradient}>
              <Ionicons name="search-outline" size={20} color="white" />
              <Text style={styles.buttonText}>Find My Schemes</Text>
            </LinearGradient>
          </TouchableOpacity>

          {showPersonalizedResults && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilter}
            >
              <Text style={styles.resetButtonText}>Show All Schemes</Text>
            </TouchableOpacity>
          )}
        </View>

        {showPersonalizedResults && (
          <View style={styles.resultsInfo}>
            <Ionicons name="checkmark-circle-outline" size={20} color={TEAL} />
            <Text style={styles.resultsText}>
              Showing {filteredSchemes.length} scheme(s) you may be eligible for
            </Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search schemes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Ionicons
              name={category.icon as any}
              size={14}
              color={selectedCategory === category.key ? 'white' : TEAL}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.key && styles.categoryTextActive
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Schemes List */}
      <View style={styles.schemesContainer}>
        <View style={styles.schemesGrid}>
          {filteredSchemes.map(renderSchemeCard)}
        </View>
        
        {filteredSchemes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No schemes found</Text>
            <Text style={styles.emptyStateSubtext}>
              {showPersonalizedResults 
                ? 'No schemes match your profile. Try adjusting your information or check all schemes.'
                : 'Try adjusting your search or filters'
              }
            </Text>
          </View>
        )}
      </View>

      {renderSchemeDetails()}
      {renderEligibilityChecker()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DARK,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  eligibilityForm: {
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK,
    marginLeft: 8,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  findSchemesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    overflow: 'hidden',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    overflow: 'hidden',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEAL,
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  resultsText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: DARK,
  },
  categoryContainer: {
    paddingVertical: 8,
  },
  categoryContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: TEAL,
  },
  categoryChipActive: {
    backgroundColor: TEAL,
  },
  categoryText: {
    marginLeft: 4,
    fontSize: 12,
    color: TEAL,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  schemesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  schemesGrid: {
    paddingBottom: 20,
  },
  schemeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  schemeGradient: {
    padding: 16,
  },
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  schemeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  schemeTitleContainer: {
    flex: 1,
  },
  schemeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK,
    marginBottom: 4,
  },
  schemeCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  schemeDescription: {
    fontSize: 14,
    color: DARK,
    lineHeight: 20,
    marginBottom: 12,
  },
  schemeBenefits: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitsText: {
    flex: 1,
    fontSize: 13,
    color: DARK,
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: CREAM,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK,
  },
  applyButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEAL,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK,
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  listItem: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 4,
  },
  checkEligibilityButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: TEAL,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 8,
    position: 'relative',
    zIndex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: DARK,
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  eligibilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  eligibilityBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 4,
  },
  dropdownModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownItemSelected: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 16,
    color: DARK,
  },
  dropdownItemTextSelected: {
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 