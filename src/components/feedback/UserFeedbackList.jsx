import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiChevronDown, FiChevronUp, FiClock, FiCheckCircle, FiAlertCircle, FiXCircle, FiSend } from 'react-icons/fi';

import Button from '../ui/Button';
import supabase from '../../lib/supabase';


const UserFeedbackList = ({ currentUser }) => {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);

  // Загрузка вопросов пользователя
  useEffect(() => {
    if (currentUser) {
      loadUserFeedback();
    }
  }, [currentUser]);

  // Загрузка обратной связи пользователя
  const loadUserFeedback = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          responder:responded_by(id, name, avatar_url),
          product:product_id(id, name)
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbackItems(data || []);
    } catch (error) {
      console.error('Ошибка загрузки обратной связи:', error);
    } finally {
      setLoading(false);
    }
  };

  // Переключение развернутого элемента
  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // Получение цвета статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Получение названия статуса
  const getStatusName = (status) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in_progress': return 'В обработке';
      case 'resolved': return 'Решен';
      case 'closed': return 'Закрыт';
      default: return 'Неизвестно';
    }
  };

  // Получение иконки статуса
  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <FiClock className="text-blue-600" />;
      case 'in_progress': return <FiAlertCircle className="text-yellow-600" />;
      case 'resolved': return <FiCheckCircle className="text-green-600" />;
      case 'closed': return <FiXCircle className="text-gray-600" />;
      default: return <FiMessageSquare className="text-gray-600" />;
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение названия типа обратной связи
  const getFeedbackTypeName = (type) => {
    switch (type) {
      case 'general': return 'Общий вопрос';
      case 'product_inquiry': return 'Вопрос о товаре';
      case 'support': return 'Техподдержка';
      case 'complaint': return 'Жалоба';
      case 'suggestion': return 'Предложение';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-card animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (feedbackItems.length === 0) {
    return (
      <div className="text-center py-12">
        <FiMessageSquare size={48} className="text-text-secondary mx-auto mb-4" />
        <h4 className="text-lg font-medium mb-2 text-text">У вас пока нет сообщений</h4>
        <p className="text-text-secondary mb-4">
          Здесь будут отображаться ваши вопросы и ответы на них
        </p>
        <Button variant="primary" to="/contacts">
          Задать вопрос
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbackItems.map((item) => (
        <motion.div 
          key={item.id} 
          className="bg-white rounded-lg shadow-card overflow-hidden"
          layout
        >
          {/* Шапка сообщения */}
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleExpand(item.id)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                  {getStatusName(item.status)}
                </span>
                <span className="text-xs text-text-secondary">
                  {getFeedbackTypeName(item.type)}
                </span>
              </div>
              <span className="text-xs text-text-secondary">
                {formatDate(item.created_at)}
              </span>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-text mb-1">{item.subject}</h4>
                <p className="text-sm text-text-secondary line-clamp-2">{item.message}</p>
              </div>
              
              <button className="flex-shrink-0 ml-2">
                {expandedItem === item.id ? 
                  <FiChevronUp className="text-text-secondary" /> : 
                  <FiChevronDown className="text-text-secondary" />
                }
              </button>
            </div>
          </div>
          
          {/* Развернутое содержимое */}
          {expandedItem === item.id && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-divider"
            >
              <div className="p-4">
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2">Ваш вопрос:</h5>
                  <div className="bg-gray-50 p-3 rounded whitespace-pre-line text-sm">
                    {item.message}
                  </div>
                  
                  {item.product && (
                    <div className="mt-2 text-xs text-text-secondary">
                      Товар: <a href={`/catalog/${item.product.id}`} className="text-primary hover:underline">{item.product.name}</a>
                    </div>
                  )}
                </div>
                
                {/* Ответ администратора (если есть) */}
                {item.response && (
                  <div className="mt-4 border-t border-divider pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-sm font-medium flex items-center">
                        <FiSend size={14} className="text-primary mr-2" />
                        Ответ:
                      </h5>
                      <span className="text-xs text-text-secondary">
                        {formatDate(item.responded_at)}
                      </span>
                    </div>
                    
                    <div className="bg-primary-bg p-3 rounded whitespace-pre-line text-sm">
                      {item.response}
                    </div>
                    
                    {item.responder && (
                      <div className="mt-2 text-xs text-text-secondary flex items-center">
                        Ответил: 
                        <span className="font-medium ml-1">
                          {item.responder.name || 'Администратор'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default UserFeedbackList;