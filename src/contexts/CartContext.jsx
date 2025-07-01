import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

// Создаем контекст
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children, currentUser }) => {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Загрузка корзины пользователя
  const loadCart = async () => {
    if (!currentUser) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      // Проверяем соединение с Supabase
      const { data: healthCheck, error: healthError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (healthError) {
        console.error('Ошибка соединения с Supabase:', healthError);
        throw new Error('Нет соединения с базой данных');
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          created_at,
          product:products (
            id,
            name,
            price,
            base_price,
            image_url,
            sku
          )
        `)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Ошибка SQL запроса:', error);
        throw error;
      }
      
      setCartItems(data || []);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      
      // Показываем пользователю более понятную ошибку
      if (error.message && error.message.includes('Failed to fetch')) {
        console.error('Проблема с сетевым соединением. Проверьте подключение к интернету.');
      } else if (error.message && error.message.includes('Invalid API key')) {
        console.error('Неверный API ключ Supabase');
      } else {
        console.error('Произошла ошибка при загрузке корзины:', error.message || error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Загрузка избранного пользователя
  const loadFavorites = async () => {
    if (!currentUser) {
      setFavorites([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          product:products (
            id,
            name,
            price,
            base_price,
            image_url,
            sku
          )
        `)
        .eq('user_id', currentUser.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    }
  };

  // Добавление товара в корзину
  const addToCart = async (productId, quantity = 1) => {
    if (!currentUser) {
      throw new Error('Необходимо войти в аккаунт');
    }

    try {
      // Проверяем, есть ли товар уже в корзине
      const existingItem = cartItems.find(item => item.product && item.product.id === productId);

      if (existingItem) {
        // Обновляем количество
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
      } else {
        // Добавляем новый товар
        const { error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: currentUser.id,
            product_id: productId,
            quantity
          }]);

        if (error) throw error;
      }

      // Перезагружаем корзину
      await loadCart();
      return true;
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      throw error;
    }
  };

  // Обновление количества товара в корзине
  const updateCartItem = async (cartItemId, quantity) => {
    if (!currentUser) return;

    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', currentUser.id); // Добавлено условие по user_id для безопасности

      if (error) throw error;

      // Обновляем локальное состояние
      setCartItems(prev => 
        prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      console.error('Ошибка обновления корзины:', error);
    }
  };

  // Удаление товара из корзины
  const removeFromCart = async (cartItemId) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', currentUser.id); // Добавлено условие по user_id для безопасности

      if (error) throw error;

      // Обновляем локальное состояние
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
    }
  };

  // Очистка корзины
  const clearCart = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
    }
  };

  // Добавление/удаление из избранного
  const toggleFavorite = async (productId) => {
    if (!currentUser) {
      throw new Error('Необходимо войти в аккаунт');
    }

    try {
      const isFavorite = favorites.some(fav => fav.product && fav.product.id === productId);

      if (isFavorite) {
        // Удаляем из избранного (найдем сначала id записи)
        const favoriteItem = favorites.find(fav => fav.product && fav.product.id === productId);
        
        if (!favoriteItem) {
          throw new Error('Запись в избранном не найдена');
        }
        
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favoriteItem.id)
          .eq('user_id', currentUser.id); // Добавлено условие по user_id для безопасности

        if (error) throw error;
        
        setFavorites(prev => prev.filter(fav => fav.product && fav.product.id !== productId));
      } else {
        // Добавляем в избранное
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: currentUser.id,
            product_id: productId
          }]);

        if (error) throw error;
        await loadFavorites();
      }

      return !isFavorite;
    } catch (error) {
      console.error('Ошибка управления избранным:', error);
      throw error;
    }
  };

  // Проверка, есть ли товар в избранном
  const isFavorite = (productId) => {
    return favorites.some(fav => fav.product && fav.product.id === productId);
  };

  // Получение общего количества товаров в корзине
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Загрузка данных при изменении пользователя
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          // Проверяем доступность базы данных
          const isConnected = await checkSupabaseConnection();
          if (!isConnected) {
            console.warn('Проблемы с соединением Supabase');
          }
          
          // Используем Promise.all для параллельной загрузки
          await Promise.all([
            loadCart(),
            loadFavorites()
          ]);
        } catch (error) {
          console.error('Ошибка загрузки данных пользователя:', error);
        }
      } else {
        setCartItems([]);
        setFavorites([]);
      }
    };
    
    loadUserData();
  }, [currentUser]);

  // Вспомогательная функция для проверки соединения
  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
        
      return !error;
    } catch (error) {
      console.error('Ошибка проверки соединения:', error);
      return false;
    }
  };

  const value = {
    // ИСПРАВЛЕНИЕ: Добавляем currentUser в value!
    currentUser,
    cartItems,
    favorites,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    toggleFavorite,
    isFavorite,
    getCartItemsCount,
    loadCart,
    loadFavorites
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};