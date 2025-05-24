import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTranslation } from 'react-i18next';

// Import Firebase directly
import { initializeApp } from 'firebase/app';
import {
    addDoc,
    collection,
    deleteDoc,
    doc, getDoc, getDocs, getFirestore, increment, orderBy,
    query, setDoc, updateDoc
} from 'firebase/firestore';

// Initialize Firebase directly in this component
const firebaseConfig = {
  apiKey: "AIzaSyDck33JzaYxPe595Ye5J2TPE74zKUFA8gU",
  authDomain: "dhata-f0b61.firebaseapp.com",
  projectId: "dhata-f0b61",
  storageBucket: "dhata-f0b61.appspot.com",
  messagingSenderId: "815341000420",
  appId: "1:815341000420:android:f1baa96d4f7115e73f3ef1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test Firebase connection
console.log("Firebase initialized with project:", firebaseConfig.projectId);

// Run a simple test query
const testFirestore = async () => {
  try {
    const testCollection = collection(db, "test_connection");
    const testDoc = await addDoc(testCollection, {
      timestamp: new Date(),
      test: true
    });
    console.log("Firestore connection successful! Test document created with ID:", testDoc.id);
    
    // Clean up the test document
    try {
      await deleteDoc(doc(db, "test_connection", testDoc.id));
      console.log("Test document cleaned up successfully");
    } catch (cleanupError) {
      console.error("Error cleaning up test document:", cleanupError);
    }
  } catch (error) {
    console.error("Firestore connection test failed:", error);
  }
};

// Run the test
testFirestore();

// Create Tab Navigator
const Tab = createMaterialTopTabNavigator();

// Define feedback categories
const FEEDBACK_CATEGORIES = [
  { id: 'roads', label: 'Roads & Infrastructure' },
  { id: 'sanitation', label: 'Sanitation & Cleanliness' },
  { id: 'schemes', label: 'Government Schemes' },
  { id: 'other', label: 'Other Issues' }
];

// Define types for feedback data
interface FeedbackItem {
  id: string;
  category: string;
  description: string;
  rating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  timestamp: Date;
}

// Category statistics interface
interface CategoryStats {
  totalFeedback: number;
  positive: number;
  neutral: number;
  negative: number;
}

// Mock sentiment analysis function (in a real app, this would call an API)
const analyzeSentiment = (text: string): { sentiment: 'positive' | 'neutral' | 'negative', score: number } => {
  // Simple sentiment analysis based on positive and negative words
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'fantastic', 'happy', 'satisfied', 'helpful'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'unhappy', 'disappointed', 'useless', 'frustrated'];
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  // Calculate sentiment score (0-1 range)
  const totalWords = text.split(' ').length;
  const sentimentScore = totalWords > 0 
    ? (positiveCount - negativeCount + totalWords) / (totalWords * 2) 
    : 0.5;
  
  // Determine sentiment category
  let sentiment: 'positive' | 'neutral' | 'negative';
  if (sentimentScore > 0.6) {
    sentiment = 'positive';
  } else if (sentimentScore < 0.4) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  return { sentiment, score: sentimentScore };
};

// Initialize or update category stats in Firestore
const initializeCategoryStats = async () => {
  try {
    // Check if the stats document exists for each category
    for (const category of FEEDBACK_CATEGORIES) {
      const statsRef = doc(db, "feedback_stats", category.id);
      const statsDoc = await getDoc(statsRef);
      
      if (!statsDoc.exists()) {
        // Create initial stats document if it doesn't exist
        await setDoc(statsRef, {
          totalFeedback: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          lastUpdated: new Date()
        });
        console.log(`Created stats document for category: ${category.id}`);
      }
    }
  } catch (error) {
    console.error("Error initializing category stats:", error);
  }
};

// Feedback form component
function FeedbackFormScreen() {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Initialize category stats on component mount
  useEffect(() => {
    initializeCategoryStats();
  }, []);
  
  // Preview sentiment as user types
  const sentimentResult = description.length > 5 ? analyzeSentiment(description) : null;
  
  // Submit feedback to Firestore
  const submitFeedback = async () => {
    if (!category) {
      Alert.alert(
        'Category Required',
        'Please select a feedback category.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (description.trim().length < 10) {
      Alert.alert(
        'Incomplete Feedback',
        'Please provide a more detailed description (at least 10 characters).',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (rating === 0) {
      Alert.alert(
        'Rating Required',
        'Please select a rating before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Analyze sentiment
      const { sentiment, score } = analyzeSentiment(description);
      
      console.log('Attempting to submit feedback...');
      
      // Add document to feedback collection
      try {
        const feedbackRef = await addDoc(collection(db, "feedback"), {
          category,
          description,
          rating,
          sentiment,
          sentimentScore: score,
          timestamp: new Date()
        });
        
        console.log('Feedback document added with ID:', feedbackRef.id);
        
        // Update category stats
        try {
          // Get reference to the category stats document
          const statsRef = doc(db, "feedback_stats", category);
          
          // Update stats with atomic increment operations
          await updateDoc(statsRef, {
            totalFeedback: increment(1),
            [sentiment]: increment(1), // Increment the specific sentiment counter
            lastUpdated: new Date()
          });
          
          console.log(`Updated stats for category: ${category}, sentiment: ${sentiment}`);
        } catch (statsError: any) {
          console.error("Error updating category stats:", statsError);
          
          // If stats document doesn't exist, create it
          if (statsError.code === 'not-found') {
            try {
              await setDoc(doc(db, "feedback_stats", category), {
                totalFeedback: 1,
                positive: sentiment === 'positive' ? 1 : 0,
                neutral: sentiment === 'neutral' ? 1 : 0, 
                negative: sentiment === 'negative' ? 1 : 0,
                lastUpdated: new Date()
              });
              console.log(`Created new stats document for category: ${category}`);
            } catch (createError) {
              console.error("Error creating stats document:", createError);
            }
          }
          // Continue execution even if stats update fails
        }
        
        // Update overall stats document
        try {
          const overallStatsRef = doc(db, "feedback_stats", "overall");
          
          // Check if overall stats document exists
          const overallStatsDoc = await getDoc(overallStatsRef);
          
          if (overallStatsDoc.exists()) {
            // Update existing document
            await updateDoc(overallStatsRef, {
              totalFeedback: increment(1),
              [sentiment]: increment(1),
              lastUpdated: new Date()
            });
          } else {
            // Create new overall stats document
            await setDoc(overallStatsRef, {
              totalFeedback: 1,
              positive: sentiment === 'positive' ? 1 : 0,
              neutral: sentiment === 'neutral' ? 1 : 0,
              negative: sentiment === 'negative' ? 1 : 0,
              lastUpdated: new Date()
            });
          }
          
          console.log("Updated overall stats");
        } catch (overallStatsError) {
          console.error("Error updating overall stats:", overallStatsError);
          // Continue execution even if overall stats update fails
        }
        
        // Reset form
        setDescription('');
        setRating(0);
        setCategory('');
        
        Alert.alert(
          'Feedback Submitted',
          'Thank you for your feedback!',
          [{ text: 'OK' }]
        );
      } catch (firebaseError: any) {
        console.error("Firebase error details:", firebaseError);
        
        let errorMessage = 'There was an error submitting your feedback.';
        
        if (firebaseError.code === 'permission-denied') {
          errorMessage = 'Permission denied: You do not have access to submit feedback.';
        } else if (firebaseError.message && firebaseError.message.includes('permission')) {
          errorMessage = 'Permission error: ' + firebaseError.message;
        }
        
        Alert.alert(
          'Submission Error',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error("Error in feedback process:", error);
      Alert.alert(
        'Error',
        'There was an error processing your feedback. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => setRating(i)}
          style={styles.starContainer}
        >
          <Ionicons 
            name={i <= rating ? "star" : "star-outline"} 
            size={32} 
            color={i <= rating ? "#FFC107" : "#CCCCCC"} 
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };
  
  const getCategoryById = (id: string) => {
    const category = FEEDBACK_CATEGORIES.find(cat => cat.id === id);
    return category ? category.label : 'Select Category';
  };
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.formTitle}>Share Your Feedback</ThemedText>
      
      {/* Category Selector */}
      <ThemedView style={styles.formSection}>
        <ThemedText style={styles.formLabel}>What is your feedback about?</ThemedText>
        <TouchableOpacity 
          style={styles.categorySelector} 
          onPress={() => setShowCategoryModal(true)}
        >
          <ThemedText style={[
            styles.categoryText, 
            !category && styles.placeholderText
          ]}>
            {category ? getCategoryById(category) : 'Select a category'}
          </ThemedText>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
      </ThemedView>
      
      {/* Rating Section */}
      <ThemedView style={styles.formSection}>
        <ThemedText style={styles.formLabel}>How would you rate your experience?</ThemedText>
        <ThemedView style={styles.ratingContainer}>
          {renderStars()}
        </ThemedView>
      </ThemedView>
      
      {/* Feedback Text Section */}
      <ThemedView style={styles.formSection}>
        <ThemedText style={styles.formLabel}>Tell us about your experience</ThemedText>
        <TextInput
          style={styles.textInput}
          placeholder="Please describe your experience in detail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          placeholderTextColor="#999"
        />
      </ThemedView>
      
      {/* Sentiment Preview */}
      {sentimentResult && (
        <ThemedView style={styles.sentimentPreview}>
          <ThemedText style={styles.sentimentLabel}>Sentiment Analysis:</ThemedText>
          <ThemedView style={styles.sentimentResult}>
            <Ionicons 
              name={
                sentimentResult.sentiment === 'positive' ? "happy-outline" :
                sentimentResult.sentiment === 'negative' ? "sad-outline" : "happy-outline"
              } 
              size={24} 
              color={
                sentimentResult.sentiment === 'positive' ? "#4CAF50" :
                sentimentResult.sentiment === 'negative' ? "#F44336" : "#FFC107"
              } 
            />
            <ThemedText style={styles.sentimentText}>
              {sentimentResult.sentiment.charAt(0).toUpperCase() + sentimentResult.sentiment.slice(1)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}
      
      {/* Submit Button */}
      <TouchableOpacity 
        style={[
          styles.submitButton, 
          (isSubmitting || description.trim().length < 10 || rating === 0 || !category) && styles.disabledButton
        ]}
        onPress={submitFeedback}
        disabled={isSubmitting || description.trim().length < 10 || rating === 0 || !category}
      >
        <ThemedText style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </ThemedText>
      </TouchableOpacity>
      
      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Category</ThemedText>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {FEEDBACK_CATEGORIES.map((cat) => (
                <TouchableOpacity 
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.id && styles.selectedCategory
                  ]}
                  onPress={() => {
                    setCategory(cat.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <ThemedText style={[
                    styles.categoryOptionText,
                    category === cat.id && styles.selectedCategoryText
                  ]}>
                    {cat.label}
                  </ThemedText>
                  {category === cat.id && (
                    <Ionicons name="checkmark" size={24} color="#6ec3c1" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

// Feedback results component
function FeedbackResultsScreen() {
  const { t } = useTranslation();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, CategoryStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [overallStats, setOverallStats] = useState<CategoryStats>({
    totalFeedback: 0,
    positive: 0,
    neutral: 0,
    negative: 0
  });
  
  useEffect(() => {
    fetchCategoryStats();
    fetchFeedbackItems();
    fetchOverallStats();
  }, []);
  
  const fetchCategoryStats = async () => {
    try {
      const stats: Record<string, CategoryStats> = {};
      let lastUpdateTime: Date | null = null;
      
      for (const category of FEEDBACK_CATEGORIES) {
        const statsRef = doc(db, "feedback_stats", category.id);
        const statsDoc = await getDoc(statsRef);
        
        if (statsDoc.exists()) {
          const data = statsDoc.data();
          stats[category.id] = {
            totalFeedback: data.totalFeedback || 0,
            positive: data.positive || 0,
            neutral: data.neutral || 0,
            negative: data.negative || 0
          };
          
          // Track the most recent update time
          if (data.lastUpdated) {
            const updateTime = data.lastUpdated.toDate();
            if (!lastUpdateTime || updateTime > lastUpdateTime) {
              lastUpdateTime = updateTime;
            }
          }
        } else {
          stats[category.id] = {
            totalFeedback: 0,
            positive: 0,
            neutral: 0,
            negative: 0
          };
        }
      }
      
      setCategoryStats(stats);
      setLastUpdated(lastUpdateTime);
    } catch (error) {
      console.error("Error fetching category stats:", error);
    }
  };
  
  const fetchFeedbackItems = async () => {
    try {
      const q = query(collection(db, "feedback"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      
      const items: FeedbackItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          category: data.category,
          description: data.description,
          rating: data.rating,
          sentiment: data.sentiment,
          sentimentScore: data.sentimentScore,
          timestamp: data.timestamp.toDate()
        });
      });
      
      setFeedbackItems(items);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOverallStats = async () => {
    try {
      // Try to get the overall stats directly
      const overallStatsRef = doc(db, "feedback_stats", "overall");
      const overallStatsDoc = await getDoc(overallStatsRef);
      
      if (overallStatsDoc.exists()) {
        const data = overallStatsDoc.data();
        setOverallStats({
          totalFeedback: data.totalFeedback || 0,
          positive: data.positive || 0,
          neutral: data.neutral || 0,
          negative: data.negative || 0
        });
        
        if (data.lastUpdated) {
          setLastUpdated(data.lastUpdated.toDate());
        }
      } else {
        // If no overall stats document, calculate from categories
        const totals = {
          totalFeedback: 0,
          positive: 0,
          neutral: 0,
          negative: 0
        };
        
        // Fetch all categories
        for (const category of FEEDBACK_CATEGORIES) {
          const statsRef = doc(db, "feedback_stats", category.id);
          const statsDoc = await getDoc(statsRef);
          
          if (statsDoc.exists()) {
            const data = statsDoc.data();
            totals.totalFeedback += data.totalFeedback || 0;
            totals.positive += data.positive || 0;
            totals.neutral += data.neutral || 0;
            totals.negative += data.negative || 0;
          }
        }
        
        setOverallStats(totals);
      }
    } catch (error) {
      console.error("Error fetching overall stats:", error);
    }
  };
  
  const filteredFeedback = selectedCategory 
    ? feedbackItems.filter(item => item.category === selectedCategory)
    : feedbackItems;
  
  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch(sentiment) {
      case 'positive':
        return <Ionicons name="happy-outline" size={24} color="#4CAF50" />;
      case 'neutral':
        return <Ionicons name="happy-outline" size={24} color="#FFC107" />;
      case 'negative':
        return <Ionicons name="sad-outline" size={24} color="#F44336" />;
      default:
        return <Ionicons name="help-outline" size={24} color="#9E9E9E" />;
    }
  };
  
  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons 
          key={i}
          name={i <= rating ? "star" : "star-outline"} 
          size={16} 
          color={i <= rating ? "#FFC107" : "#CCCCCC"} 
          style={styles.starIcon}
        />
      );
    }
    return (
      <ThemedView style={styles.starsContainer}>
        {stars}
      </ThemedView>
    );
  };
  
  const renderCategoryStats = () => {
    return (
      <>
        {lastUpdated && (
          <ThemedText style={styles.lastUpdatedText}>
            Last updated: {lastUpdated.toLocaleString()}
          </ThemedText>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScrollView}>
          {FEEDBACK_CATEGORIES.map((category) => {
            const stats = categoryStats[category.id] || { 
              totalFeedback: 0, 
              positive: 0, 
              neutral: 0, 
              negative: 0 
            };
            
            const isSelected = selectedCategory === category.id;
            
            return (
              <TouchableOpacity 
                key={category.id}
                style={[
                  styles.categoryStatsCard,
                  isSelected && styles.selectedCategoryCard
                ]}
                onPress={() => setSelectedCategory(isSelected ? null : category.id)}
              >
                <ThemedText style={styles.categoryStatsTitle}>{category.label}</ThemedText>
                <ThemedView style={styles.statsRow}>
                  <ThemedView style={styles.statItem}>
                    <ThemedText style={styles.statValue}>{stats.totalFeedback}</ThemedText>
                    <ThemedText style={styles.statLabel}>Total</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.statItem}>
                    <ThemedText style={[styles.statValue, styles.positiveText]}>+{stats.positive}</ThemedText>
                    <ThemedText style={styles.statLabel}>Positive</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.statItem}>
                    <ThemedText style={[styles.statValue, styles.neutralText]}>+{stats.neutral}</ThemedText>
                    <ThemedText style={styles.statLabel}>Neutral</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.statItem}>
                    <ThemedText style={[styles.statValue, styles.negativeText]}>+{stats.negative}</ThemedText>
                    <ThemedText style={styles.statLabel}>Negative</ThemedText>
                  </ThemedView>
                </ThemedView>
                {isSelected && (
                  <ThemedText style={styles.tapToReset}>Tap to reset filter</ThemedText>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </>
    );
  };
  
  const renderOverallStats = () => {
    return (
      <ThemedView style={styles.overallStatsCard}>
        <ThemedText style={styles.overallStatsTitle}>Overall Feedback Statistics</ThemedText>
        
        {lastUpdated && (
          <ThemedText style={styles.lastUpdatedText}>
            Last updated: {lastUpdated.toLocaleString()}
          </ThemedText>
        )}
        
        <ThemedView style={styles.overallStatsGrid}>
          <ThemedView style={styles.overallStatItem}>
            <ThemedText style={styles.overallStatValue}>{overallStats.totalFeedback}</ThemedText>
            <ThemedText style={styles.overallStatLabel}>Total Feedback</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.overallStatItem}>
            <ThemedText style={[styles.overallStatValue, styles.positiveText]}>
              +{overallStats.positive}
            </ThemedText>
            <ThemedText style={styles.overallStatLabel}>Positive</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.overallStatItem}>
            <ThemedText style={[styles.overallStatValue, styles.neutralText]}>
              +{overallStats.neutral}
            </ThemedText>
            <ThemedText style={styles.overallStatLabel}>Neutral</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.overallStatItem}>
            <ThemedText style={[styles.overallStatValue, styles.negativeText]}>
              +{overallStats.negative}
            </ThemedText>
            <ThemedText style={styles.overallStatLabel}>Negative</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  };
  
  const renderFeedbackItem = ({ item }: { item: FeedbackItem }) => {
    const categoryLabel = FEEDBACK_CATEGORIES.find(cat => cat.id === item.category)?.label || 'Unknown';
    
    return (
      <ThemedView style={styles.feedbackItem}>
        <ThemedView style={styles.feedbackHeader}>
          {getSentimentIcon(item.sentiment)}
          <ThemedText style={styles.feedbackCategory}>{categoryLabel}</ThemedText>
          {renderRatingStars(item.rating)}
        </ThemedView>
        <ThemedText style={styles.feedbackDescription}>{item.description}</ThemedText>
        <ThemedText style={styles.feedbackDate}>
          {item.timestamp.toLocaleDateString()}
        </ThemedText>
      </ThemedView>
    );
  };
  
  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText>Loading feedback...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      {/* Display overall stats first */}
      {renderOverallStats()}
      
      {/* Category-specific stats */}
      {renderCategoryStats()}
      
      {feedbackItems.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#ccc" />
          <ThemedText style={styles.emptyStateText}>No feedback available yet</ThemedText>
        </ThemedView>
      ) : (
        <>
          <ThemedText style={styles.feedbackListHeader}>
            {selectedCategory ? 
              `${filteredFeedback.length} feedback items for ${FEEDBACK_CATEGORIES.find(cat => cat.id === selectedCategory)?.label}` : 
              `${feedbackItems.length} total feedback items`
            }
          </ThemedText>
          
          <FlatList
            data={filteredFeedback}
            renderItem={renderFeedbackItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </ThemedView>
  );
}

// Main component with tabs
export default function SentimentScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: '500' },
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIndicatorStyle: { backgroundColor: '#6ec3c1' },
      }}
    >
      <Tab.Screen 
        name="Submit Feedback" 
        component={FeedbackFormScreen} 
      />
      <Tab.Screen 
        name="Feedback Results" 
        component={FeedbackResultsScreen} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  categorySelector: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  starContainer: {
    padding: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#6ec3c1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sentimentPreview: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sentimentLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  sentimentResult: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentimentText: {
    marginLeft: 8,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: 'rgba(110, 195, 193, 0.1)',
  },
  categoryOptionText: {
    fontSize: 16,
  },
  selectedCategoryText: {
    fontWeight: '600',
    color: '#6ec3c1',
  },
  listContainer: {
    paddingBottom: 20,
  },
  feedbackItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackCategory: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginLeft: 2,
  },
  feedbackDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsScrollView: {
    marginBottom: 16,
  },
  categoryStatsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    marginBottom: 8,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategoryCard: {
    borderColor: '#6ec3c1',
    borderWidth: 2,
  },
  categoryStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  positiveText: {
    color: '#4CAF50',
  },
  neutralText: {
    color: '#FFC107',
  },
  negativeText: {
    color: '#F44336',
  },
  tapToReset: {
    fontSize: 12,
    color: '#6ec3c1',
    textAlign: 'center',
    marginTop: 8,
  },
  feedbackListHeader: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textAlign: 'center',
  },
  overallStatsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  overallStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  overallStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  overallStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  overallStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
}); 