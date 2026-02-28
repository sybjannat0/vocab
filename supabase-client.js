// Supabase Client Configuration
const SUPABASE_URL = 'https://qytvihtvxfkahwlzwpwp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5dHZpaHR2eGZrYWh3bHp3cHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDA5MTAsImV4cCI6MjA4NzYxNjkxMH0.1RO_Vb68RSeP4AKmf2xiHJvWOWHm8tzm2xeQmERN9kk';

// Database table helper - matches sql.js API
const db = {
  // Initialize database (no-op for Supabase)
  async init() {
    console.log('Supabase initialized');
    return true;
  },

  // Get all words
  async getAllWords() {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/words?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (!response.ok) {
        console.error('Error fetching words:', response.status, response.statusText);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching words:', error);
      return [];
    }
  },

  // Get word by ID (sync for compatibility)
  getWord(id) {
    // Return a promise that resolves immediately for sync compatibility
    return this.getWordAsync(id);
  },

  async getWordAsync(id) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/words?id=eq.${id}`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (!response.ok) {
        console.error('Error fetching word:', response.status, response.statusText);
        return null;
      }
      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error('Error fetching word:', error);
      return null;
    }
  },

  // Add new word - matches sql.js signature
  async addWord(word, definition, example, synonym, category, difficulty, bangla, extra) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/words`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          word: word,
          definition: definition || '',
          bangla: bangla || '',
          synonym: synonym || '',
          example: example || '',
          category: category || 'General',
          difficulty: difficulty || 1,
          times_correct: 0,
          times_incorrect: 0
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error adding word:', response.status, response.statusText, errorText);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding word:', error);
      return null;
    }
  },

  // Update word - matches sql.js signature
  async updateWord(id, wordData) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/words?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          word: wordData.word,
          definition: wordData.definition,
          bangla: wordData.bangla || '',
          synonym: wordData.synonym || '',
          example: wordData.example || '',
          category: wordData.category || 'General',
          difficulty: wordData.difficulty || 1
        })
      });
      if (!response.ok) {
        console.error('Error updating word:', response.status, response.statusText);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating word:', error);
      return null;
    }
  },

  // Delete word
  async deleteWord(id) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/words?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (!response.ok) {
        console.error('Error deleting word:', response.status, response.statusText);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting word:', error);
      return false;
    }
  },

  // Get words for practice
  async getWordsForPractice(limit = 50) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/words?select=*&limit=${limit}`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );
      if (!response.ok) {
        console.error('Error fetching practice words:', response.status, response.statusText);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching practice words:', error);
      return [];
    }
  },

  // Record answer (for practice mode)
  async recordAnswer(wordId, correct) {
    try {
      const word = await this.getWordAsync(wordId);
      if (!word) return;

      const updates = correct 
        ? { times_correct: (word.times_correct || 0) + 1 }
        : { times_incorrect: (word.times_incorrect || 0) + 1 };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/words?id=eq.${wordId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        console.error('Error recording answer:', response.status, response.statusText);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error recording answer:', error);
      return false;
    }
  },

  // Update practice stats
  async updatePracticeStats(id, correct) {
    return this.recordAnswer(id, correct);
  },

  // Get statistics
  async getStatistics() {
    try {
      const words = await this.getAllWords();
      
      const totalWords = words.length;
      const masteredWords = words.filter(w => 
        (w.times_correct || 0) >= 5 && 
        ((w.times_correct || 0) / ((w.times_correct || 0) + (w.times_incorrect || 0))) >= 0.8
      ).length;

      const totalCorrect = words.reduce((sum, w) => sum + (w.times_correct || 0), 0);
      const totalIncorrect = words.reduce((sum, w) => sum + (w.times_incorrect || 0), 0);
      
      const accuracy = totalCorrect + totalIncorrect > 0 
        ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) 
        : 0;

      const wordsByCategory = {};
      words.forEach(w => {
        wordsByCategory[w.category] = (wordsByCategory[w.category] || 0) + 1;
      });

      return {
        totalWords,
        masteredWords,
        totalCorrect,
        totalIncorrect,
        accuracy,
        mastered: masteredWords,
        wordsByCategory
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalWords: 0,
        masteredWords: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        accuracy: 0,
        mastered: 0,
        wordsByCategory: {}
      };
    }
  },

  // Check if word exists
  wordExists(word, excludeId = null) {
    // Sync version for compatibility - returns boolean
    return this.wordExistsAsync(word, excludeId);
  },

  async wordExistsAsync(word, excludeId = null) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/words?word=eq.${encodeURIComponent(word)}`;
      if (excludeId) {
        url += `&id=neq.${excludeId}`;
      }
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (!response.ok) {
        console.error('Error checking word:', response.status, response.statusText);
        return null;
      }
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error checking word:', error);
      return null;
    }
  },

  // Clear all words (for testing)
  async clearDatabase() {
    try {
      // Delete using a filter that matches all rows (id=gt.0 will match all positive IDs)
      const response = await fetch(`${SUPABASE_URL}/rest/v1/words?id=gt.0`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        }
      });
      if (!response.ok) {
        console.error('Error clearing database:', response.status, response.statusText);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error clearing database:', error);
      return false;
    }
  }
};

// Export for use in app
try {
  window.vocabDb = db;
  console.log('supabase-client.js loaded successfully');
  console.log('VocabDB initialized: success');
} catch (e) {
  console.error('Error initializing vocabDb:', e);
}
