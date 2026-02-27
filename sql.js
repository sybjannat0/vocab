// SQL Database Wrapper for Vocab Pro
// Uses sql.js (SQLite compiled to WebAssembly)

class VocabDatabase {
  constructor() {
    this.db = null;
    this.dbName = 'vocab_pro.db';
    this.isInitialized = false;
  }

  // Initialize the database
  async init() {
    if (this.isInitialized) return;

    try {
      // Load sql.js
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem(this.dbName);
      if (savedDb) {
        const data = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0));
        this.db = new SQL.Database(data);
        // Run migrations for existing database
        this.runMigrations();
      } else {
        this.db = new SQL.Database();
        this.createTables();
      }

      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Run database migrations
  runMigrations() {
    try {
      // Add bangla column if not exists
      this.db.run(`ALTER TABLE words ADD COLUMN bangla TEXT DEFAULT ''`);
    } catch (e) {
      // Column may already exist, ignore
    }
    try {
      // Add synonym column if not exists
      this.db.run(`ALTER TABLE words ADD COLUMN synonym TEXT DEFAULT ''`);
    } catch (e) {
      // Column may already exist, ignore
    }
    this.save();
  }

  // Create database tables
  createTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        definition TEXT NOT NULL,
        bangla TEXT,
        synonym TEXT,
        example TEXT,
        pronunciation TEXT,
        category TEXT,
        difficulty INTEGER DEFAULT 1,
        times_correct INTEGER DEFAULT 0,
        times_incorrect INTEGER DEFAULT 0,
        last_practiced TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT DEFAULT '#4a90d9',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS practice_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_date TEXT NOT NULL,
        words_practiced INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        incorrect_answers INTEGER DEFAULT 0,
        duration_seconds INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Save initial state
    this.save();
  }

  // Save database to localStorage
  save() {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = String.fromCharCode(...data);
    localStorage.setItem(this.dbName, btoa(buffer));
  }

  // Word operations
  addWord(word, definition, example = '', pronunciation = '', category = 'General', difficulty = 1, bangla = '', synonym = '') {
    const stmt = this.db.prepare(`
      INSERT INTO words (word, definition, bangla, synonym, example, pronunciation, category, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([word, definition, bangla, synonym, example, pronunciation, category, difficulty]);
    stmt.free();
    this.save();
    return this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
  }

  getWord(id) {
    const result = this.db.exec(`SELECT * FROM words WHERE id = ?`, [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    return this.rowToObject(columns, values);
  }

  // Check if a word already exists in the database
  wordExists(word) {
    const result = this.db.exec(`SELECT * FROM words WHERE LOWER(word) = LOWER(?)`, [word]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    return this.rowToObject(columns, values);
  }

  getAllWords(category = null) {
    let query = 'SELECT * FROM words';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = this.db.exec(query, params);
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(row => this.rowToObject(columns, row));
  }

  updateWord(id, updates) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (['word', 'definition', 'example', 'pronunciation', 'category', 'difficulty', 'times_correct', 'times_incorrect', 'last_practiced', 'bangla', 'synonym'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const query = `UPDATE words SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    this.db.run(query, values);
    this.save();
    return true;
  }

  deleteWord(id) {
    this.db.run('DELETE FROM words WHERE id = ?', [id]);
    this.save();
  }

  // Clear all words
  clearAllWords() {
    this.db.run('DELETE FROM words');
    this.save();
  }

  // Clear entire database (reset app)
  clearDatabase() {
    localStorage.removeItem(this.dbName);
    this.db.run('DELETE FROM words');
    this.save();
    // Reload to start fresh
    location.reload();
  }

  // Practice functions
  recordAnswer(wordId, correct) {
    const field = correct ? 'times_correct' : 'times_incorrect';
    this.db.run(`
      UPDATE words 
      SET ${field} = ${field} + 1, 
          last_practiced = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [wordId]);
    this.save();
  }

  getWordsForPractice(limit = 10, category = null) {
    // Get words that need practice (less correct answers or not practiced recently)
    let query = `
      SELECT * FROM words 
      WHERE (times_correct = 0 OR times_incorrect > times_correct)
    `;
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY RANDOM() LIMIT ?';
    params.push(limit);
    
    const result = this.db.exec(query, params);
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(row => this.rowToObject(columns, row));
  }

  // Category operations
  addCategory(name, description = '', color = '#4a90d9') {
    try {
      this.db.run(`
        INSERT INTO categories (name, description, color)
        VALUES (?, ?, ?)
      `, [name, description, color]);
      this.save();
      return true;
    } catch (error) {
      console.error('Failed to add category:', error);
      return false;
    }
  }

  getAllCategories() {
    const result = this.db.exec('SELECT * FROM categories ORDER BY name');
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(row => this.rowToObject(columns, row));
  }

  deleteCategory(id) {
    this.db.run('DELETE FROM categories WHERE id = ?', [id]);
    this.save();
  }

  // Statistics
  getStatistics() {
    const stats = {};
    
    // Total words
    let result = this.db.exec('SELECT COUNT(*) as count FROM words');
    stats.totalWords = result[0]?.values[0]?.[0] || 0;
    
    // Words by category
    result = this.db.exec('SELECT category, COUNT(*) as count FROM words GROUP BY category');
    stats.wordsByCategory = {};
    if (result.length > 0) {
      result[0].values.forEach(row => {
        stats.wordsByCategory[row[0]] = row[1];
      });
    }
    
    // Practice statistics
    result = this.db.exec(`
      SELECT 
        SUM(words_practiced) as total,
        SUM(correct_answers) as correct,
        SUM(incorrect_answers) as incorrect
      FROM practice_sessions
    `);
    stats.totalPracticed = result[0]?.values[0]?.[0] || 0;
    stats.totalCorrect = result[0]?.values[0]?.[1] || 0;
    stats.totalIncorrect = result[0]?.values[0]?.[2] || 0;
    stats.accuracy = stats.totalPracticed > 0 
      ? Math.round((stats.totalCorrect / stats.totalPracticed) * 100) 
      : 0;
    
    // Words mastered (>= 5 correct answers)
    result = this.db.exec('SELECT COUNT(*) FROM words WHERE times_correct >= 5');
    stats.mastered = result[0]?.values[0]?.[0] || 0;
    
    return stats;
  }

  // Search
  searchWords(query) {
    const searchTerm = `%${query}%`;
    const result = this.db.exec(`
      SELECT * FROM words 
      WHERE word LIKE ? OR definition LIKE ? OR example LIKE ?
      ORDER BY word
    `, [searchTerm, searchTerm, searchTerm]);
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    return result[0].values.map(row => this.rowToObject(columns, row));
  }

  // Helper: Convert row to object
  rowToObject(columns, values) {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  }

  // Export database
  exportData() {
    const words = this.getAllWords();
    const categories = this.getAllCategories();
    const stats = this.getStatistics();
    
    return JSON.stringify({
      version: 1,
      exportDate: new Date().toISOString(),
      words,
      categories,
      statistics: stats
    }, null, 2);
  }

  // Import database
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      this.db.run('DELETE FROM words');
      this.db.run('DELETE FROM categories');
      
      // Import categories
      if (data.categories) {
        data.categories.forEach(cat => {
          this.addCategory(cat.name, cat.description, cat.color);
        });
      }
      
      // Import words
      if (data.words) {
        data.words.forEach(word => {
          this.addWord(
            word.word,
            word.definition,
            word.example || '',
            word.pronunciation || '',
            word.category || 'General',
            word.difficulty || 1
          );
        });
      }
      
      this.save();
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  // Close database
  close() {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Create global instance
const vocabDb = new VocabDatabase();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  vocabDb.init().catch(console.error);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VocabDatabase, vocabDb };
}
