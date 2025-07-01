/**
 * Утилиты для продвинутого поиска с использованием:
 * - Расстояния Левенштейна для нечеткого поиска
 * - Цепей Маркова для предсказания следующих слов
 * - Токенизации и нормализации текста
 */

/**
 * Вычисляет расстояние Левенштейна между двумя строками
 * @param {string} str1 - Первая строка
 * @param {string} str2 - Вторая строка
 * @returns {number} - Расстояние Левенштейна
 */
export const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Инициализируем матрицу
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Заполняем матрицу
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // удаление
        matrix[i][j - 1] + 1,     // вставка
        matrix[i - 1][j - 1] + cost // замена
      );
    }
  }

  return matrix[len1][len2];
};

/**
 * Вычисляет коэффициент схожести на основе расстояния Левенштейна
 * @param {string} str1 - Первая строка
 * @param {string} str2 - Вторая строка
 * @returns {number} - Коэффициент схожести от 0 до 1
 */
export const calculateSimilarity = (str1, str2) => {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return (maxLen - distance) / maxLen;
};

/**
 * Нормализует текст для поиска
 * @param {string} text - Текст для нормализации
 * @returns {string} - Нормализованный текст
 */
export const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0400-\u04FF]/g, '') // оставляем только буквы, цифры и кириллицу
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Разбивает текст на токены
 * @param {string} text - Текст для токенизации
 * @returns {Array<string>} - Массив токенов
 */
export const tokenize = (text) => {
  return normalizeText(text).split(' ').filter(token => token.length > 0);
};

/**
 * Создает цепь Маркова из массива текстов
 * @param {Array<string>} texts - Массив текстов для анализа
 * @returns {Object} - Цепь Маркова
 */
export const buildMarkovChain = (texts) => {
  const chain = {};
  
  texts.forEach(text => {
    const tokens = tokenize(text);
    
    for (let i = 0; i < tokens.length - 1; i++) {
      const currentWord = tokens[i];
      const nextWord = tokens[i + 1];
      
      if (!chain[currentWord]) {
        chain[currentWord] = {};
      }
      
      if (!chain[currentWord][nextWord]) {
        chain[currentWord][nextWord] = 0;
      }
      
      chain[currentWord][nextWord]++;
    }
  });
  
  // Нормализуем вероятности
  Object.keys(chain).forEach(word => {
    const total = Object.values(chain[word]).reduce((sum, count) => sum + count, 0);
    Object.keys(chain[word]).forEach(nextWord => {
      chain[word][nextWord] = chain[word][nextWord] / total;
    });
  });
  
  return chain;
};

/**
 * Предлагает следующие слова на основе цепи Маркова
 * @param {string} currentWord - Текущее слово
 * @param {Object} markovChain - Цепь Маркова
 * @param {number} limit - Максимальное количество предложений
 * @returns {Array<string>} - Массив предложенных слов
 */
export const suggestNextWords = (currentWord, markovChain, limit = 5) => {
  const normalizedWord = normalizeText(currentWord);
  
  if (!markovChain[normalizedWord]) {
    return [];
  }
  
  const suggestions = Object.entries(markovChain[normalizedWord])
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);
    
  return suggestions;
};

/**
 * Выполняет нечеткий поиск по массиву объектов
 * @param {Array<Object>} items - Массив объектов для поиска
 * @param {string} query - Поисковый запрос
 * @param {Array<string>} fields - Поля для поиска
 * @param {number} threshold - Минимальный порог схожести (0-1)
 * @returns {Array<Object>} - Отсортированные результаты поиска
 */
export const fuzzySearch = (items, query, fields, threshold = 0.3) => {
  if (!query || query.trim().length === 0) {
    return items;
  }
  
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(normalizedQuery);
  
  const results = items.map(item => {
    let maxScore = 0;
    let totalScore = 0;
    let matches = 0;
    
    fields.forEach(field => {
      const fieldValue = item[field] || '';
      const normalizedValue = normalizeText(fieldValue);
      const fieldTokens = tokenize(normalizedValue);
      
      // Точное совпадение (высший приоритет)
      if (normalizedValue.includes(normalizedQuery)) {
        maxScore = Math.max(maxScore, 1.0);
        totalScore += 1.0;
        matches++;
        return;
      }
      
      // Поиск по токенам
      queryTokens.forEach(queryToken => {
        fieldTokens.forEach(fieldToken => {
          const similarity = calculateSimilarity(queryToken, fieldToken);
          if (similarity >= threshold) {
            maxScore = Math.max(maxScore, similarity);
            totalScore += similarity;
            matches++;
          }
        });
      });
      
      // Поиск частичных совпадений
      const partialSimilarity = calculateSimilarity(normalizedQuery, normalizedValue);
      if (partialSimilarity >= threshold) {
        maxScore = Math.max(maxScore, partialSimilarity * 0.8);
        totalScore += partialSimilarity * 0.8;
        matches++;
      }
    });
    
    const averageScore = matches > 0 ? totalScore / matches : 0;
    const finalScore = Math.max(maxScore * 0.7 + averageScore * 0.3, maxScore);
    
    return {
      ...item,
      _searchScore: finalScore,
      _searchMatches: matches
    };
  })
  .filter(item => item._searchScore >= threshold)
  .sort((a, b) => {
    // Сначала сортируем по количеству совпадений, затем по общему счету
    if (a._searchMatches !== b._searchMatches) {
      return b._searchMatches - a._searchMatches;
    }
    return b._searchScore - a._searchScore;
  });
  
  return results;
};

/**
 * Создает предложения для автодополнения
 * @param {Array<Object>} items - Массив объектов
 * @param {Array<string>} fields - Поля для извлечения текста
 * @param {string} query - Текущий запрос
 * @param {number} limit - Максимальное количество предложений
 * @returns {Array<string>} - Массив предложений
 */
export const generateAutocomplete = (items, fields, query, limit = 10) => {
  const allTexts = items.flatMap(item => 
    fields.map(field => item[field] || '').filter(text => text.length > 0)
  );
  
  const markovChain = buildMarkovChain(allTexts);
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(normalizedQuery);
  
  if (queryTokens.length === 0) {
    return [];
  }
  
  const lastWord = queryTokens[queryTokens.length - 1];
  const suggestions = new Set();
  
  // Предложения на основе цепи Маркова
  const markovSuggestions = suggestNextWords(lastWord, markovChain, limit);
  markovSuggestions.forEach(word => {
    const suggestion = queryTokens.slice(0, -1).concat(lastWord, word).join(' ');
    suggestions.add(suggestion);
  });
  
  // Предложения на основе существующих текстов
  allTexts.forEach(text => {
    const normalizedText = normalizeText(text);
    if (normalizedText.startsWith(normalizedQuery) && normalizedText !== normalizedQuery) {
      suggestions.add(text);
    }
  });
  
  // Нечеткие предложения
  const fuzzyMatches = fuzzySearch(
    allTexts.map(text => ({ text })), 
    query, 
    ['text'], 
    0.6
  ).slice(0, limit);
  
  fuzzyMatches.forEach(match => {
    suggestions.add(match.text);
  });
  
  return Array.from(suggestions).slice(0, limit);
};

/**
 * Класс для продвинутого поиска
 */
export class AdvancedSearch {
  constructor(items, searchFields) {
    this.items = items;
    this.searchFields = searchFields;
    this.markovChain = null;
    this.buildMarkovChain();
  }
  
  buildMarkovChain() {
    const allTexts = this.items.flatMap(item => 
      this.searchFields.map(field => item[field] || '').filter(text => text.length > 0)
    );
    this.markovChain = buildMarkovChain(allTexts);
  }
  
  search(query, options = {}) {
    const {
      threshold = 0.3,
      limit = 50,
      sortBy = null,
      filterBy = null
    } = options;
    
    let results = fuzzySearch(this.items, query, this.searchFields, threshold);
    
    // Применяем дополнительные фильтры
    if (filterBy) {
      results = results.filter(filterBy);
    }
    
    // Применяем дополнительную сортировку
    if (sortBy) {
      results.sort(sortBy);
    }
    
    return results.slice(0, limit);
  }
  
  getAutocomplete(query, limit = 10) {
    return generateAutocomplete(this.items, this.searchFields, query, limit);
  }
  
  getSuggestions(query) {
    const normalizedQuery = normalizeText(query);
    const tokens = tokenize(normalizedQuery);
    
    if (tokens.length === 0) return [];
    
    const lastWord = tokens[tokens.length - 1];
    return suggestNextWords(lastWord, this.markovChain);
  }
}