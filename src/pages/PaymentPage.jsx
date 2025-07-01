import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiCreditCard, 
  FiCheck, 
  FiClock,
  FiAlertCircle,
  FiCopy,
  FiExternalLink,
  FiDollarSign,
  FiInfo,
  FiLock,
  FiShield,
  FiX
} from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { showNotification, showConfirmation } from '../utils/telegramUtils';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('btc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentTransaction, setPaymentTransaction] = useState(null);
  const [paymentAddresses, setPaymentAddresses] = useState({});
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [returnToOrdersList, setReturnToOrdersList] = useState(false);

  // Анимация страницы
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeInOut' }
    }
  };

  // Отображение иконок методов оплаты
  const getPaymentIcon = (type) => {
    switch (type) {
      case 'btc': return { icon: '₿', color: 'text-orange-500' };
      case 'eth': return { icon: 'Ξ', color: 'text-blue-500' };
      case 'usdt_trc20': return { icon: '₮', color: 'text-green-500' };
      case 'usdt_erc20': return { icon: '₮', color: 'text-green-600' };
      case 'manual': return { icon: '💳', color: 'text-gray-500' };
      default: return { icon: '$', color: 'text-primary' };
    }
  };

  // Отображение названий методов оплаты
  const getPaymentName = (type) => {
    switch (type) {
      case 'btc': return 'Bitcoin (BTC)';
      case 'eth': return 'Ethereum (ETH)';
      case 'usdt_trc20': return 'USDT (TRC-20)';
      case 'usdt_erc20': return 'USDT (ERC-20)';
      case 'manual': return 'Ручная обработка';
      default: return type;
    }
  };

  // Инициализация
  useEffect(() => {
    const initialize = async () => {
      console.log('Инициализация PaymentPage для заказа:', orderId);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('Пользователь не авторизован, перенаправление на профиль');
          navigate('/profile');
          return;
        }

        console.log('Пользователь авторизован:', user.id);
        setCurrentUser(user);
        
        // Проверяем, откуда пришел пользователь
        setReturnToOrdersList(location.state?.fromOrdersList || false);
        
        // Загружаем адреса для оплаты
        await loadPaymentAddresses();
        
        // Загружаем заказ и связанные данные
        await loadOrder(user.id);
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        showNotification('Ошибка инициализации страницы оплаты');
        navigate('/profile?tab=orders');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      initialize();
    } else {
      console.error('ID заказа не передан');
      navigate('/profile?tab=orders');
      setLoading(false);
    }
  }, [orderId, navigate, location.state]);

  // Загрузка адресов для оплаты из базы данных
  const loadPaymentAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_addresses')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Обогащаем данные адресов и создаем объект для быстрого доступа
      const addressesByType = {};
      const methods = [];
      
      data.forEach(addr => {
        addressesByType[addr.type] = addr;
        
        // Создаем объект метода оплаты на основе данных из БД
        const iconData = getPaymentIcon(addr.type);
        methods.push({
          id: addr.type,
          name: addr.name || getPaymentName(addr.type),
          description: addr.description,
          icon: iconData.icon,
          color: iconData.color,
          address: addr.address,
          network: addr.network,
          confirmations: addr.confirmations,
          exchangeRate: addr.exchange_rate || 1.0
        });
      });
      
      setPaymentAddresses(addressesByType);
      setAvailablePaymentMethods(methods);
      
      // Если нет выбранного метода оплаты, выбираем первый доступный
      if (methods.length > 0 && !paymentMethod) {
        setPaymentMethod(methods[0].id);
      }
    } catch (error) {
      console.error('Ошибка загрузки адресов для оплаты:', error);
      showNotification('Ошибка загрузки данных оплаты');
    }
  };

  // Загрузка заказа
  const loadOrder = async (userId) => {
    console.log('Загрузка заказа:', orderId, 'для пользователя:', userId);
    
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (orderError) {
        console.error('Ошибка загрузки заказа:', orderError);
        throw orderError;
      }
      
      console.log('Загружен заказ:', orderData);
      
      // Проверяем, что заказ одобрен
      if (orderData.status !== 'approved') {
        console.log('Заказ не одобрен для оплаты, статус:', orderData.status);
        showNotification(`Заказ не готов к оплате. Статус: ${orderData.status}`);
        navigate('/profile?tab=orders');
        return;
      }

      // Проверяем наличие суммы
      if (!orderData.total_amount || orderData.total_amount <= 0) {
        console.log('Сумма заказа не определена:', orderData.total_amount);
        showNotification('Стоимость заказа не определена. Обратитесь к менеджеру.');
        navigate('/profile?tab=orders');
        return;
      }

      setOrder(orderData);

      // Загружаем товары заказа
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Ошибка загрузки товаров заказа:', itemsError);
        throw itemsError;
      }
      
      console.log('Загружены товары заказа:', itemsData);
      setOrderItems(itemsData || []);

      // Проверяем, есть ли уже транзакция оплаты для этого заказа
      const { data: existingTransaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('order_id', orderId)
        .or('status.eq.pending,status.eq.waiting_confirmation,status.eq.manual_verification')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!transactionError && existingTransaction && existingTransaction.length > 0) {
        console.log('Найдена существующая транзакция:', existingTransaction[0]);
        setPaymentTransaction(existingTransaction[0]);
        setPaymentMethod(existingTransaction[0].payment_type);
      }

    } catch (error) {
      console.error('Ошибка загрузки заказа:', error);
      showNotification('Ошибка загрузки информации о заказе');
      navigate('/profile?tab=orders');
    }
  };

  // Получение адреса для оплаты
  const getPaymentAddressForType = (type) => {
    return paymentAddresses[type] || null;
  };

  // Получить выбранный метод оплаты
  const getSelectedMethod = () => {
    const methodFromAddresses = availablePaymentMethods.find(m => m.id === paymentMethod);
    if (methodFromAddresses) return methodFromAddresses;
    
    // Если метод не найден в загруженных данных, используем дефолтное представление
    const iconData = getPaymentIcon(paymentMethod);
    return {
      id: paymentMethod,
      name: getPaymentName(paymentMethod),
      icon: iconData.icon,
      color: iconData.color
    };
  };

  // Найти метод оплаты по ID
  const selectedMethod = getSelectedMethod();
  
  // Получить адрес для выбранного метода
  const selectedAddress = getPaymentAddressForType(paymentMethod);

  // Конвертировать сумму в выбранную криптовалюту
  const convertAmountToCrypto = (amount, exchangeRate = 1.0) => {
    if (!amount || !exchangeRate || exchangeRate === 0) return 0;
    return parseFloat(amount) * parseFloat(exchangeRate);
  };

  // Создание транзакции оплаты
  const handleCreatePayment = async () => {
    if (!order) {
      console.error('Заказ не загружен');
      return;
    }

    console.log('Создание транзакции оплаты для заказа:', order.id, 'методом:', paymentMethod);
    setIsProcessing(true);

    try {
      const paymentAddress = getPaymentAddressForType(paymentMethod);
      
      if (!paymentAddress) {
        throw new Error(`Адрес для оплаты типа ${paymentMethod} не найден`);
      }
      
      // Рассчитываем сумму в криптовалюте на основе курса обмена
      const cryptoAmount = paymentMethod !== 'manual' 
        ? convertAmountToCrypto(order.total_amount, paymentAddress.exchange_rate)
        : order.total_amount;

      // Создаем транзакцию оплаты
      const transactionData = {
        order_id: order.id,
        payment_type: paymentMethod,
        amount: paymentMethod === 'manual' ? order.total_amount : cryptoAmount,
        currency: paymentMethod === 'manual' ? order.currency : paymentMethod.toUpperCase(),
        status: paymentMethod === 'manual' ? 'manual_verification' : 'waiting_confirmation',
        crypto_address: paymentAddress.address,
        network: paymentAddress.network,
        required_confirmations: paymentAddress.confirmations,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 часа
      };

      console.log('Данные транзакции:', transactionData);

      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error('Ошибка создания транзакции:', error);
        throw error;
      }

      console.log('Создана транзакция:', transaction);
      setPaymentTransaction(transaction);

      showNotification(
        'Транзакция оплаты создана. Переведите средства на указанный адрес и нажмите "Я оплатил заказ".',
        'Оплата инициирована'
      );

    } catch (error) {
      console.error('Ошибка создания транзакции:', error);
      showNotification('Произошла ошибка при создании транзакции оплаты');
    } finally {
      setIsProcessing(false);
    }
  };

  // Копирование в буфер обмена
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showNotification('Скопировано в буфер обмена');
      }).catch(err => {
        console.error('Ошибка копирования:', err);
        showNotification('Ошибка копирования');
      });
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showNotification('Скопировано в буфер обмена');
      } catch (err) {
        console.error('Ошибка копирования:', err);
        showNotification('Ошибка копирования');
      }
      document.body.removeChild(textArea);
    }
  };

  // Отметить транзакцию как оплаченную (ожидание подтверждения)
  const markTransactionAsPaid = async () => {
    if (!paymentTransaction) return;
    
    try {
      // Обновляем статус транзакции на "ручная проверка"
      const { error } = await supabase
        .from('payment_transactions')
        .update({
          status: 'manual_verification',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentTransaction.id);

      if (error) throw error;
      
      // Обновляем локальное состояние
      setPaymentTransaction(prev => ({
        ...prev,
        status: 'manual_verification',
        updated_at: new Date().toISOString()
      }));

      showNotification(
        'Спасибо! Ваша оплата ожидает подтверждения менеджером. Это может занять некоторое время.',
        'Ожидание подтверждения'
      );
    } catch (error) {
      console.error('Ошибка обновления статуса транзакции:', error);
      showNotification('Произошла ошибка при обновлении статуса оплаты');
    }
  };

  // Форматирование криптовалютного адреса для мобильных устройств
  const formatCryptoAddress = (address) => {
    if (!address) return '';
    
    const isMobile = window.innerWidth < 640;
    if (isMobile && address.length > 24 && !address.startsWith('По запросу')) {
      return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
    }
    
    return address;
  };

  // Сбросить транзакцию и вернуться к выбору способа оплаты
  const resetPaymentTransaction = () => {
    showConfirmation(
      'Вы хотите отменить текущую транзакцию и выбрать другой способ оплаты?',
      'Изменение способа оплаты',
      async (buttonId) => {
        if (buttonId === 'ok') {
          setPaymentTransaction(null);
        }
      }
    );
  };

  // Получение суммы в криптовалюте с учетом курса обмена
  const getCryptoAmount = () => {
    if (!order || !selectedAddress || !selectedAddress.exchange_rate) return 'Н/Д';
    
    const exchangeRate = parseFloat(selectedAddress.exchange_rate);
    if (isNaN(exchangeRate) || exchangeRate === 0) return 'Н/Д';
    
    const rubAmount = parseFloat(order.total_amount);
    if (isNaN(rubAmount)) return 'Н/Д';
    
    const cryptoAmount = rubAmount * exchangeRate;
    
    // Форматирование с учетом валюты
    switch (paymentMethod) {
      case 'btc': 
        return cryptoAmount.toFixed(8);
      case 'eth': 
        return cryptoAmount.toFixed(6);
      case 'usdt_trc20': 
      case 'usdt_erc20': 
        return cryptoAmount.toFixed(2);
      default: 
        return cryptoAmount.toFixed(2);
    }
  };

  // Получение информации о курсе обмена
  const getExchangeRateInfo = () => {
    if (!selectedAddress || !selectedAddress.exchange_rate) return '';
    
    const exchangeRate = parseFloat(selectedAddress.exchange_rate);
    if (isNaN(exchangeRate) || exchangeRate === 0) return '';
    
    // Расчет обратного курса (сколько рублей в 1 единице криптовалюты)
    const rubPerCrypto = 1 / exchangeRate;
    
    switch (paymentMethod) {
      case 'btc': 
        return `1 BTC = ${rubPerCrypto.toLocaleString('ru-RU')} ₽`;
      case 'eth': 
        return `1 ETH = ${rubPerCrypto.toLocaleString('ru-RU')} ₽`;
      case 'usdt_trc20': 
      case 'usdt_erc20': 
        return `1 USDT = ${rubPerCrypto.toLocaleString('ru-RU')} ₽`;
      default: 
        return '';
    }
  };

  // Обработчик возврата к списку заказов или выбору способа оплаты
  const handleGoBack = () => {
    if (paymentTransaction) {
      // Если есть активная транзакция, предлагаем вернуться к выбору способа оплаты
      resetPaymentTransaction();
    } else {
      // Иначе просто возвращаемся к списку заказов
      navigate('/profile?tab=orders');
    }
  };

  if (loading) {
    return (
      <Section variant="default" className="py-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </Section>
    );
  }

  if (!order) {
    return (
      <Section variant="default" className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
          <p className="text-text-secondary mb-4">
            Заказ не найден или недоступен для оплаты
          </p>
          <Button variant="primary" to="/profile?tab=orders">
            К заказам
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary to-primary-dark py-6">
        <div className="container mx-auto px-4">
          <Button
            variant="text"
            onClick={handleGoBack}
            icon={<FiArrowLeft size={16} />}
            className="text-white hover:text-white/80 mb-4"
          >
            {paymentTransaction ? 'Сменить способ оплаты' : 'К заказам'}
          </Button>
          
          <h1 className="text-2xl font-bold text-white mb-2">Оплата заказа</h1>
          <p className="text-white/90 text-sm">
            Заказ {order.order_number} • {parseFloat(order.total_amount).toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>

      <Section variant="default" className="py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Информация о заказе */}
          <div className="bg-white p-6 rounded-lg shadow-card">
            <h3 className="text-lg font-semibold mb-4">Детали заказа</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-text-secondary">Номер заказа:</span>
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Дата создания:</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Статус:</span>
                <span className="font-medium text-green-600">Одобрен</span>
              </div>
            </div>

            {/* Товары в заказе */}
            <div className="border-t border-divider pt-4">
              <h4 className="font-medium mb-3">Товары:</h4>
              <div className="max-h-48 overflow-y-auto">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <div className="pr-2 min-w-0">
                      <div className="font-medium text-sm truncate" title={item.product_name}>
                        {item.product_name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {item.product_sku} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-medium whitespace-nowrap">
                      {item.unit_price ? `${parseFloat(item.unit_price).toLocaleString('ru-RU')} ₽ × ${item.quantity}` : 'По запросу'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Доставка, если она есть */}
            {order.delivery_cost > 0 && (
              <div className="border-t border-divider pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Доставка:</span>
                  <span className="text-sm">
                    {parseFloat(order.delivery_cost).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            )}

            <div className="border-t border-divider pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Итого к оплате:</span>
                <span className="text-xl font-bold text-primary">
                  {parseFloat(order.total_amount).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Транзакция оплаты */}
          {paymentTransaction ? (
            <div className="bg-white p-6 rounded-lg shadow-card">
              <h3 className="text-lg font-semibold mb-4">Инструкции по оплате</h3>
              
              <div className="space-y-4">
                {/* Информация о методе оплаты */}
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className={`text-xl ${selectedMethod?.color}`}>
                    {selectedMethod?.icon}
                  </span>
                  <div>
                    <div className="font-medium text-green-800">{selectedMethod?.name}</div>
                    {selectedAddress && (
                      <div className="text-sm text-green-600">
                        Сеть: {selectedAddress.network}
                        {selectedAddress.confirmations > 0 && ` • Требуется подтверждений: ${selectedAddress.confirmations}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Информация о курсе обмена */}
                {paymentMethod !== 'manual' && selectedAddress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="font-medium text-blue-800 mb-1">Курс обмена</div>
                    <div className="flex justify-between items-center text-sm text-blue-700">
                      <span>
                        {getExchangeRateInfo()}
                      </span>
                      <span className="font-medium">
                        {order.total_amount ? `${parseFloat(order.total_amount).toLocaleString('ru-RU')} ₽ = ${getCryptoAmount()} ${paymentMethod.toUpperCase().replace('_TRC20', '').replace('_ERC20', '')}` : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Адрес для оплаты */}
                {paymentTransaction.crypto_address && paymentMethod !== 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Адрес для оплаты:
                    </label>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-md p-3 border border-divider overflow-hidden">
                      <div className="flex-1 font-mono text-sm break-all text-text overflow-x-auto whitespace-nowrap">
                        {paymentTransaction.crypto_address}
                      </div>
                      <Button
                        variant="outlined"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => copyToClipboard(paymentTransaction.crypto_address)}
                        icon={<FiCopy size={14} />}
                      />
                    </div>
                    
                    {/* На мобильных также показываем сокращенный адрес */}
                    <div className="mt-1 text-xs text-text-secondary sm:hidden">
                      <span className="block truncate">
                        {formatCryptoAddress(paymentTransaction.crypto_address)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Информация для ручной оплаты */}
                {paymentMethod === 'manual' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                    <p className="text-sm text-blue-800">
                      Свяжитесь с менеджером для получения реквизитов оплаты. 
                      После оплаты не забудьте нажать кнопку "Я оплатил заказ".
                    </p>
                  </div>
                )}

                {/* Сумма к оплате */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Сумма к оплате:
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-gray-50 rounded-md text-sm font-bold border border-divider">
                      {paymentMethod === 'manual' ? 
                        `${parseFloat(paymentTransaction.amount).toLocaleString('ru-RU')} ${paymentTransaction.currency}` : 
                        `${parseFloat(paymentTransaction.amount).toFixed(
                          paymentMethod === 'btc' ? 8 : 
                          paymentMethod === 'eth' ? 6 : 2
                        )} ${paymentTransaction.currency}`
                      }
                    </code>
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => copyToClipboard(`${paymentTransaction.amount} ${paymentTransaction.currency}`)}
                      icon={<FiCopy size={14} />}
                    />
                  </div>
                  
                  {/* Оригинальная сумма в рублях для криптовалют */}
                  {paymentMethod !== 'manual' && (
                    <div className="mt-1 text-xs text-text-secondary">
                      Сумма в рублях: {parseFloat(order.total_amount).toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>

                {/* Предупреждение */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertCircle className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={16} />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Важно:</p>
                      <ul className="text-yellow-700 space-y-1 text-xs">
                        <li>• Переведите точную сумму на указанный адрес</li>
                        <li>• Обязательно нажмите кнопку "Я оплатил заказ" после перевода</li>
                        <li>• Ваш платеж будет проверен менеджером вручную</li>
                        <li>• Срок действия: 24 часа</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Статус оплаты */}
                <div className="p-4 border border-divider rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Статус оплаты:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      paymentTransaction.status === 'manual_verification' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {paymentTransaction.status === 'manual_verification' 
                        ? 'Ожидает проверки менеджера' 
                        : 'Ожидает оплаты'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-4">
                    {paymentTransaction.status === 'manual_verification' 
                      ? 'Спасибо! Ваш платеж находится на проверке. Это может занять некоторое время.' 
                      : 'После совершения платежа не забудьте нажать кнопку "Я оплатил заказ".'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {paymentTransaction.status !== 'manual_verification' && (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={markTransactionAsPaid}
                        icon={<FiCheck size={16} />}
                      >
                        Я оплатил заказ
                      </Button>
                    )}
                    
                    {/* Кнопка для изменения способа оплаты */}
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={resetPaymentTransaction}
                      icon={<FiX size={16} />}
                    >
                      Сменить способ оплаты
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Выбор способа оплаты */}
              <div className="bg-white p-6 rounded-lg shadow-card">
                <h3 className="text-lg font-semibold mb-4">Способ оплаты</h3>
                
                <div className="space-y-3">
                  {availablePaymentMethods.map((method) => {
                    // Получаем курс обмена
                    const exchangeRate = paymentAddresses[method.id]?.exchange_rate || 1.0;
                    // Рассчитываем примерную сумму в криптовалюте
                    const cryptoAmount = method.id !== 'manual' && order.total_amount
                      ? convertAmountToCrypto(order.total_amount, exchangeRate).toFixed(
                          method.id === 'btc' ? 8 : 
                          method.id === 'eth' ? 6 : 2
                        )
                      : null;
                    
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-primary bg-primary-bg'
                            : 'border-divider hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <span className={`text-xl mr-3 ${method.color}`}>
                          {method.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {method.name}
                          </div>
                          {method.id !== 'manual' && cryptoAmount && (
                            <div className="text-xs text-text-secondary truncate">
                              ≈ {cryptoAmount} {method.id.toUpperCase().replace('_TRC20', '').replace('_ERC20', '')}
                            </div>
                          )}
                          {method.description && (
                            <div className="text-xs text-text-secondary truncate" title={`${method.network} • ${method.confirmations} подтверждений • ${method.description}`}>
                              {method.network} • {method.confirmations} подтверждений
                              {method.description && ` • ${method.description}`}
                            </div>
                          )}
                        </div>
                        {paymentMethod === method.id && (
                          <FiCheck className="ml-auto text-primary" size={16} />
                        )}
                      </label>
                    );
                  })}
                  
                  {availablePaymentMethods.length === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-800 text-sm font-medium">
                        Ошибка загрузки методов оплаты
                      </p>
                      <p className="text-red-600 text-xs mt-1">
                        Пожалуйста, обратитесь к менеджеру или повторите попытку позже
                      </p>
                      <Button 
                        variant="outlined" 
                        className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                        size="sm"
                        onClick={() => loadPaymentAddresses()}
                      >
                        Повторить загрузку
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Предупреждение о времени */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FiClock className="text-yellow-600 mt-0.5 mr-3 flex-shrink-0" size={16} />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">Срок оплаты:</p>
                    <p className="text-yellow-700">
                      У вас есть 24 часа с момента одобрения заказа для завершения оплаты.
                      После истечения срока заказ может быть отменен.
                    </p>
                  </div>
                </div>
              </div>

              {/* Безопасность платежей */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FiShield className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" size={16} />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">Безопасность платежей:</p>
                    <ul className="text-blue-700 space-y-1 text-xs">
                      <li>• Все платежи обрабатываются в защищенном режиме</li>
                      <li>• Информация о транзакциях шифруется</li>
                      <li>• Проверка платежей выполняется вручную</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Кнопка создания транзакции */}
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreatePayment}
                disabled={isProcessing || !getPaymentAddressForType(paymentMethod) || availablePaymentMethods.length === 0}
                icon={isProcessing ? undefined : <FiCreditCard size={16} />}
              >
                {isProcessing ? 'Создание транзакции...' : 'Перейти к оплате'}
              </Button>
            </>
          )}
        </div>
      </Section>
    </motion.div>
  );
};

export default PaymentPage;