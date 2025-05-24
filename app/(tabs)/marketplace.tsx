import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    ColorValue,
    Modal,
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
  category: 'education' | 'health' | 'agriculture' | 'employment' | 'housing' | 'social';
  ageRange?: { min: number; max: number };
  genderEligible?: ('male' | 'female' | 'all')[];
  occupationEligible?: string[];
  incomeLimit?: number;
}

interface UserProfile {
  age: string;
  gender: string;
  occupation: string;
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
    incomeLimit: 1000000
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
    occupation: ''
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
    if (!profile.age || !profile.gender || !profile.occupation) return true;

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
    if (!userProfile.age || !userProfile.gender || !userProfile.occupation) {
      Alert.alert('Missing Information', 'Please fill in all fields to find personalized schemes.');
      return;
    }
    setShowPersonalizedResults(true);
  };

  const handleResetFilter = () => {
    setShowPersonalizedResults(false);
    setUserProfile({ age: '', gender: '', occupation: '' });
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
            <View style={styles.dropdownModal}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownModalTitle}>{placeholder}</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Ionicons name="close-outline" size={24} color={DARK} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.dropdownList}>
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
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedValue === item.value && styles.dropdownItemTextSelected
                    ]}>
                      {item.label}
                    </Text>
                    {selectedValue === item.value && (
                      <Ionicons name="checkmark-outline" size={20} color={TEAL} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
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
    width: '80%',
    maxHeight: '80%',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK,
  },
  dropdownList: {
    flex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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