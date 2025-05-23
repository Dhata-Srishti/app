// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes
} from 'firebase/storage';

// Firebase config details
const firebaseConfig = {
  apiKey: "AIzaSyDck33JzaYxPe595Ye5J2TPE74zKUFA8gU",
  projectId: "dhata-f0b61",
  storageBucket: "dhata-f0b61.firebasestorage.app",
  messagingSenderId: "815341000420",
  appId: "1:815341000420:android:f1baa96d4f7115e73f3ef1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Database utility functions
const dbUtils = {
  // User related functions
  async createUser(userId, userData) {
    try {
      await setDoc(doc(db, "users", userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...userData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Forum posts related functions
  async createPost(postData) {
    try {
      const postRef = doc(collection(db, "posts"));
      await setDoc(postRef, {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return postRef.id;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  async getPosts(limit = 10) {
    try {
      const postsQuery = query(collection(db, "posts"), where("status", "==", "active"));
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting posts:", error);
      throw error;
    }
  },

  // Stray cow reports related functions
  async createStrayCowReport(reportData) {
    try {
      const reportRef = doc(collection(db, "strayCowReports"));
      await setDoc(reportRef, {
        ...reportData,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return reportRef.id;
    } catch (error) {
      console.error("Error creating stray cow report:", error);
      throw error;
    }
  },

  async getStrayCowReports(status = "pending") {
    try {
      const reportsQuery = query(collection(db, "strayCowReports"), where("status", "==", status));
      const snapshot = await getDocs(reportsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting stray cow reports:", error);
      throw error;
    }
  },

  // Marketplace related functions
  async createProduct(productData) {
    try {
      const productRef = doc(collection(db, "products"));
      await setDoc(productRef, {
        ...productData,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return productRef.id;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async getProducts(category = null) {
    try {
      let productsQuery = query(collection(db, "products"), where("status", "==", "active"));
      if (category) {
        productsQuery = query(productsQuery, where("category", "==", category));
      }
      const snapshot = await getDocs(productsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting products:", error);
      throw error;
    }
  },

  // Storage utility functions
  async uploadImage(file, path) {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
};

export { db, dbUtils, firebaseConfig, storage };

