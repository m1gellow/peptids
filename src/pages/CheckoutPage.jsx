import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock,
  FiCheck,
  FiAlertCircle,
  FiSearch,
  FiTruck,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiBox,
  FiMap,
  FiX
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { showNotification } from '../utils/telegramUtils';
import supabase, { supabaseAnonKey, supabaseUrl } from '../lib/supabase';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [cities, setCities] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [federalDistricts, setFederalDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);
  const [availableTariffs, setAvailableTariffs] = useState([]);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [showTariffs, setShowTariffs] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true);
  
  const addressTimeoutRef = useRef(null);
  const dimensionTimeoutRef = useRef(null);
  const citySearchTimeoutRef = useRef(null);
  
  const { clearCart } = useCart();

  const [orderData, setOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    city: '',
    notes: '',
    dimensions: { 
      length: 20,
      width: 15,
      height: 10
    }
  });

  const [formErrors, setFormErrors] = useState({});

  // Загрузка сохраненных данных доставки из localStorage
  useEffect(() => {
    const savedDeliveryData = localStorage.getItem('deliveryData');
    if (savedDeliveryData) {
      try {
        const { city, address } = JSON.parse(savedDeliveryData);
        setOrderData(prev => ({
          ...prev,
          city: city || '',
          deliveryAddress: address || ''
        }));
      } catch (e) {
        console.error('Ошибка парсинга сохраненных данных доставки:', e);
      }
    }
    setIsLoadingFromStorage(false);
  }, []);

  const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  };

  const calculateEstimatedWeight = () => {
    const baseWeight = 250;
    const itemWeightGrams = 100;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return baseWeight + (totalItems * itemWeightGrams);
  };

  const loadRegionsData = async () => {
    setIsLoadingCities(true);
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/calculate-delivery/regions`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки регионов: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.federalDistricts && Array.isArray(data.federalDistricts)) {
        setFederalDistricts(data.federalDistricts);
        
        if (data.federalDistricts.length > 0 && !selectedDistrict) {
          setSelectedDistrict(data.federalDistricts[0]);
          await loadDistrictCities(data.federalDistricts[0].name);
        }
      } else {
        let allCities = [];
        const zoneStatistics = data.zoneStatistics || {};
        
        for (const zone in zoneStatistics) {
          if (zoneStatistics[zone].cities && Array.isArray(zoneStatistics[zone].cities)) {
            allCities = [...allCities, ...zoneStatistics[zone].cities];
          }
        }
        
        if (allCities.length > 0) {
          setCities(allCities.sort());
        } else {
          setCities([
            'Москва', 
            'Санкт-Петербург', 
            'Новосибирск', 
            'Екатеринбург', 
            'Казань'
          ]);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных о регионах:', error);
      setCities([
        'Москва', 
        'Санкт-Петербург', 
        'Новосибирск', 
        'Екатеринбург', 
        'Казань',
        'Нижний Новгород',
        'Челябинск',
        'Самара',
        'Уфа',
        'Ростов-на-Дону'
      ]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const loadDistrictCities = async (districtName) => {
    if (!districtName) return;
    
    setIsLoadingCities(true);
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/calculate-delivery/district?name=${encodeURIComponent(districtName)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки городов округа: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.cities && Array.isArray(data.cities)) {
        const cityNames = data.cities.map(city => city.name).sort();
        setCities(cityNames);
      } else {
        throw new Error('Структура данных не содержит городов');
      }
    } catch (error) {
      console.error(`Ошибка загрузки городов для округа "${districtName}":`, error);
      showNotification('Не удалось загрузить города. Используется ограниченный список городов.', 'Предупреждение');
      setCities([
        'Москва', 
        'Санкт-Петербург', 
        'Новосибирск', 
        'Екатеринбург', 
        'Казань'
      ]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const searchCities = (query) => {
    if (!query) {
      setFilteredCities([]);
      return;
    }

    const normalized = query.toLowerCase();
    const filtered = cities.filter(city => 
      city.toLowerCase().includes(normalized)
    );
    
    setFilteredCities(filtered.slice(0, 10));
  };

  const handleCitySearch = (value) => {
    setSearchCity(value);
    
    if (citySearchTimeoutRef.current) {
      clearTimeout(citySearchTimeoutRef.current);
    }

    citySearchTimeoutRef.current = setTimeout(() => {
      searchCities(value);
    }, 300);
  };

  const selectCity = (city) => {
    setOrderData(prev => ({ ...prev, city }));
    setSearchCity('');
    setFilteredCities([]);
  };

  const calculateDeliveryCost = async (toCity) => {
    if (!toCity) return;
    
    setIsCalculatingDelivery(true);
    setDeliveryData(null);
    setAvailableTariffs([]);
    setSelectedTariff(null);
    
    try {
      const weight = calculateEstimatedWeight();
      
      const response = await fetch(`${supabaseUrl}/functions/v1/calculate-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          toCity: toCity,
          weight: weight,
          dimensions: orderData.dimensions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка расчета стоимости: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.tariffs || data.tariffs.length === 0) {
        throw new Error('Не удалось получить тарифы доставки');
      }
      
      const sortedTariffs = [...data.tariffs].sort((a, b) => a.finalCost - b.finalCost);
      
      setAvailableTariffs(sortedTariffs);
      setSelectedTariff(sortedTariffs[0]);
      
      setDeliveryData({
        fromCity: data.fromCity.name,
        toCity: toCity,
        calculatedWeight: data.calculationDetails?.calculatedWeight,
        dimensions: data.calculationDetails?.dimensions,
        destinationCity: data.destinationCity
      });
      
      updateTotalWithDelivery(sortedTariffs[0].finalCost);
      setShowDimensions(true);
    } catch (error) {
      console.error('Ошибка расчета стоимости доставки:', error);
      showNotification('Не удалось рассчитать стоимость доставки. Пожалуйста, выберите другой город или попробуйте позже.', 'Ошибка');
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  const updateTotalWithDelivery = (deliveryCost) => {
    setEstimatedTotal(prev => {
      const totalWithoutDelivery = selectedTariff ? prev - selectedTariff.finalCost : prev;
      return totalWithoutDelivery + deliveryCost;
    });
  };

  const handleSelectTariff = (tariff) => {
    setSelectedTariff(tariff);
    updateTotalWithDelivery(tariff.finalCost);
  };

  const searchAddresses = async (query) => {
    if (!query || query.length < 3 || !orderData.city) {
      setAddressSuggestions([]);
      return;
    }

    setIsSearchingAddress(true);
    
    try {
      const mockSuggestions = [
        {
          value: `${query}, ${orderData.city}, Россия`,
          unrestricted_value: `г ${orderData.city}, ${query}`
        },
        {
          value: `${query}, д. 10, ${orderData.city}, Россия`,
          unrestricted_value: `г ${orderData.city}, ${query}, д. 10`
        },
        {
          value: `${query}, д. 25, кв. 15, ${orderData.city}, Россия`,
          unrestricted_value: `г ${orderData.city}, ${query}, д. 25, кв. 15`
        }
      ].filter(item => 
        item.value.toLowerCase().includes(query.toLowerCase())
      );
      
      setAddressSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Ошибка поиска адресов:', error);
      setAddressSuggestions([]);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleAddressSearch = (value) => {
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }

    addressTimeoutRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  };

  const calculateEstimatedTotal = (items) => {
    let total = 0;
    items.forEach(item => {
      if (item.product.base_price && !isNaN(parseFloat(item.product.base_price))) {
        total += parseFloat(item.product.base_price) * item.quantity;
      } else {
        const priceText = item.product.price || '';
        const matches = priceText.match(/[\d\s,]+/);
        if (matches) {
          const numericPrice = parseFloat(matches[0].replace(/\s/g, '').replace(',', '.'));
          if (!isNaN(numericPrice)) {
            total += numericPrice * item.quantity;
          }
        }
      }
    });
    return total;
  };

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

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/profile');
          return;
        }

        setCurrentUser(user);

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userData) {
          setOrderData(prev => ({
            ...prev,
            customerName: userData.name || '',
            customerEmail: userData.email || user.email || ''
          }));
        }

        await loadCartItems(user.id);
        await loadRegionsData();
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
      if (dimensionTimeoutRef.current) {
        clearTimeout(dimensionTimeoutRef.current);
      }
      if (citySearchTimeoutRef.current) {
        clearTimeout(citySearchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (orderData.city) {
      calculateDeliveryCost(orderData.city);
    }
  }, [orderData.city]);

  const loadCartItems = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product:products (
            id,
            name,
            price,
            base_price,
            currency,
            sku
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        navigate('/cart');
        return;
      }

      setCartItems(data);
      const estimated = calculateEstimatedTotal(data);
      setEstimatedTotal(estimated);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      navigate('/cart');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'deliveryAddress') {
      handleAddressSearch(value);
      setShowSuggestions(value.length >= 3);
    }
  };

  const handleAddressSelect = (address) => {
    setOrderData(prev => ({
      ...prev,
      deliveryAddress: address.value
    }));
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const validateForm = () => {
    const errors = {};

    if (!orderData.customerName.trim()) {
      errors.customerName = 'Укажите ваше имя';
    }

    if (!orderData.customerEmail.trim()) {
      errors.customerEmail = 'Укажите ваш email';
    } else if (!/\S+@\S+\.\S+/.test(orderData.customerEmail)) {
      errors.customerEmail = 'Некорректный формат email';
    }

    if (!orderData.customerPhone.trim()) {
      errors.customerPhone = 'Укажите ваш телефон';
    }
    
    if (!orderData.city) {
      errors.city = 'Выберите город доставки';
    }

    if (!orderData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Укажите адрес доставки';
    }
    
    if (!selectedTariff) {
      errors.tariff = 'Выберите тариф доставки';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = generateOrderNumber();
      const totalAmount = estimatedTotal > 0 ? estimatedTotal : null;

      const orderPayload = {
        user_id: currentUser.id,
        order_number: orderNumber,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        delivery_address: `${orderData.city}, ${orderData.deliveryAddress}`,
        notes: orderData.notes,
        status: 'pending_approval',
        currency: 'RUB',
        total_amount: totalAmount
      };
      
      // Сохраняем данные доставки в localStorage
      localStorage.setItem('deliveryData', JSON.stringify({
        city: orderData.city,
        address: orderData.deliveryAddress
      }));

      if (selectedTariff) {
        const deliveryCost = parseFloat(selectedTariff.finalCost);
        if (!isNaN(deliveryCost) && deliveryCost > 0) {
          orderPayload.delivery_cost = deliveryCost;
          
          const dimensionsText = `${orderData.dimensions.length}x${orderData.dimensions.width}x${orderData.dimensions.height} см`;
          
          const zoneInfo = deliveryData?.destinationCity?.zone ? 
            `Зона доставки: ${deliveryData.destinationCity.zone}` : '';
          
          const deliveryInfo = [
            `\n\nДоставка: ${selectedTariff.tariffName}`,
            `Город: ${orderData.city}`,
            `Регион: ${deliveryData?.destinationCity?.region || 'Не указан'}`,
            zoneInfo,
            `Стоимость: ${deliveryCost} руб.`,
            `Срок: ${selectedTariff.minDays}-${selectedTariff.maxDays} дней`,
            `Размеры посылки: ${dimensionsText}`,
            `Вес: ${deliveryData?.calculatedWeight ? `${deliveryData.calculatedWeight} кг` : 'до 1 кг'}`
          ].filter(Boolean).join('\n');
          
          orderPayload.notes = `${orderPayload.notes || ''}${deliveryInfo}`;
        }
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => {
        let unitPrice = null;
        if (item.product.base_price && !isNaN(parseFloat(item.product.base_price))) {
          unitPrice = parseFloat(item.product.base_price);
        } else {
          const priceText = item.product.price || '';
          const matches = priceText.match(/[\d\s,]+/);
          if (matches) {
            const numericPrice = parseFloat(matches[0].replace(/\s/g, '').replace(',', '.'));
            if (!isNaN(numericPrice)) {
              unitPrice = numericPrice;
            }
          }
        }
        
        return {
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_sku: item.product.sku,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: unitPrice ? unitPrice * item.quantity : null
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
      
      await clearCart();

      let successMessage = `Заказ ${order.order_number} создан и отправлен на рассмотрение менеджеру. `;
      
      if (estimatedTotal > 0) {
        successMessage += `Предварительная стоимость: ${estimatedTotal.toLocaleString('ru-RU')} ₽`;
        if (selectedTariff) {
          successMessage += ` (включая доставку ${selectedTariff.finalCost} ₽)`;
        }
        successMessage += `. `;
      }
      
      successMessage += `Вы получите уведомление после одобрения.`;

      showNotification(
        successMessage,
        'Заказ отправлен на рассмотрение'
      );

      navigate('/profile?tab=orders');

    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      showNotification('Произошла ошибка при создании заказа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    const numValue = Math.max(1, parseInt(value) || 1);
    
    setOrderData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: numValue
      }
    }));
    
    if (orderData.city) {
      if (dimensionTimeoutRef.current) {
        clearTimeout(dimensionTimeoutRef.current);
      }
      
      dimensionTimeoutRef.current = setTimeout(() => {
        calculateDeliveryCost(orderData.city);
      }, 500);
    }
  };

  const handleDistrictChange = async (district) => {
    setSelectedDistrict(district);
    await loadDistrictCities(district.name);
    setOrderData(prev => ({ ...prev, city: '' }));
    setSearchCity('');
    setFilteredCities([]);
  };

  if (!currentUser || loading) {
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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      <div className="relative bg-gradient-to-r from-primary to-primary-dark py-6">
        <div className="container mx-auto px-4">
          <Button
            variant="text"
            onClick={() => navigate('/cart')}
            icon={<FiArrowLeft size={16} />}
            className="text-white hover:text-white/80 mb-4"
          >
            К корзине
          </Button>
          
          <h1 className="text-2xl font-bold text-white mb-2">Оформление заказа</h1>
          <p className="text-white/90 text-sm">
            Заполните данные для отправки заказа на рассмотрение
          </p>
        </div>
      </div>

      <Section variant="default" className="py-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertCircle className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" size={16} />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Как работает заказ:</p>
                <ol className="text-blue-700 space-y-1 list-decimal list-inside text-xs">
                  <li>Вы отправляете заказ на рассмотрение менеджеру</li>
                  <li>Система автоматически рассчитывает стоимость доставки из Москвы</li>
                  <li>Менеджер проверяет заказ и подтверждает расчет</li>
                  <li>Вы получаете уведомление об одобрении с финальной стоимостью</li>
                  <li>После одобрения появляется возможность оплаты</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-card">
            <h3 className="text-lg font-semibold mb-4">Контактные данные</h3>
            
            <Input
              label="Имя"
              name="customerName"
              value={orderData.customerName}
              onChange={handleChange}
              placeholder="Ваше имя"
              icon={<FiUser size={16} />}
              error={formErrors.customerName}
              required
            />

            <Input
              label="Email"
              type="email"
              name="customerEmail"
              value={orderData.customerEmail}
              onChange={handleChange}
              placeholder="Ваш email"
              icon={<FiMail size={16} />}
              error={formErrors.customerEmail}
              required
            />

            <Input
              label="Телефон"
              type="tel"
              name="customerPhone"
              value={orderData.customerPhone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
              icon={<FiPhone size={16} />}
              error={formErrors.customerPhone}
              required
            />

            {federalDistricts.length > 0 && (
              <div className="mb-4">
                <label className="block mb-1.5 text-sm font-medium text-text-secondary">
                  Федеральный округ
                </label>
                <div className="bg-gray-50 p-3 rounded-md mb-3">
                  <div className="flex flex-wrap gap-2">
                    {federalDistricts.map((district) => (
                      <button
                        key={district.name}
                        onClick={() => handleDistrictChange(district)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          selectedDistrict?.name === district.name
                            ? 'bg-primary text-white'
                            : 'bg-white border border-divider text-text-secondary hover:border-primary hover:text-primary'
                        }`}
                        title={district.description}
                      >
                        {district.name}
                        <span className="ml-1 opacity-70">({district.citiesCount})</span>
                      </button>
                    ))}
                  </div>
                  {selectedDistrict && (
                    <p className="text-xs text-text-secondary mt-2">
                      <FiMap className="inline-block mr-1" size={12} />
                      {selectedDistrict.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className={`block mb-1.5 text-sm font-medium ${formErrors.city ? 'text-error' : 'text-text-secondary'}`}>
                Город доставки<span className="text-error ml-1">*</span>
              </label>
              
              {isLoadingFromStorage ? (
                <div className="animate-pulse h-12 bg-gray-100 rounded-md"></div>
              ) : orderData.city ? (
                <div className="bg-primary-bg p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-medium text-primary-dark">{orderData.city}</span>
                    {deliveryData?.destinationCity?.region && (
                      <span className="text-xs text-text-secondary block mt-0.5">
                        {deliveryData.destinationCity.region}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setOrderData(prev => ({ ...prev, city: '' }))}
                    className="text-text-secondary hover:text-error transition-colors"
                    title="Сменить город"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative mb-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
                    <input
                      type="text"
                      value={searchCity}
                      onChange={(e) => handleCitySearch(e.target.value)}
                      placeholder="Поиск города"
                      className="w-full rounded-md border border-divider focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-white text-text placeholder:text-text-light text-sm pl-10 pr-10 py-3"
                    />
                    {searchCity && (
                      <button 
                        onClick={() => {
                          setSearchCity('');
                          setFilteredCities([]);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>

                  {filteredCities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-divider rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredCities.map((city, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-primary-bg transition-colors border-b border-divider last:border-b-0"
                          onClick={() => selectCity(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {!orderData.city && !isLoadingFromStorage && (
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
                  <select
                    name="city"
                    value={orderData.city}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border ${formErrors.city ? 'border-error' : 'border-divider'} rounded-lg focus:outline-none focus:ring-2 ${formErrors.city ? 'focus:ring-error/50' : 'focus:ring-primary/50'} ${formErrors.city ? 'focus:border-error' : 'focus:border-primary'} bg-white text-text placeholder:text-text-secondary text-sm transition-all duration-200 appearance-none`}
                    disabled={isLoadingCities}
                  >
                    <option value="">Выберите город из списка</option>
                    {isLoadingCities ? (
                      <option value="" disabled>Загрузка городов...</option>
                    ) : (
                      cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {isLoadingCities ? (
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    ) : (
                      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-400"></div>
                    )}
                  </div>
                </div>
              )}
              
              {formErrors.city && (
                <p className="mt-1 text-xs text-error">{formErrors.city}</p>
              )}
              
              {isCalculatingDelivery && (
                <div className="mt-2 flex items-center text-xs text-text-secondary">
                  <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                  Расчет стоимости доставки из Москвы...
                </div>
              )}
              
              {deliveryData?.destinationCity?.zone && (
                <div className="mt-2 bg-blue-50 rounded-lg p-2 text-xs text-blue-700">
                  <div className="flex items-start">
                    <FiMap className="mt-0.5 mr-1.5 flex-shrink-0" size={12} />
                    <span>
                      Зона доставки: <strong>{deliveryData.destinationCity.zone}</strong> 
                      {deliveryData.destinationCity.zoneCoeff && ` (коэффициент: ${deliveryData.destinationCity.zoneCoeff}x)`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 relative">
              <label className={`block mb-1.5 text-sm font-medium ${formErrors.deliveryAddress ? 'text-error' : 'text-text-secondary'}`}>
                Адрес доставки<span className="text-error ml-1">*</span>
              </label>
              {isLoadingFromStorage ? (
                <div className="animate-pulse h-12 bg-gray-100 rounded-md"></div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={orderData.deliveryAddress}
                      onChange={handleChange}
                      onFocus={() => orderData.deliveryAddress.length >= 3 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Улица, дом, квартира"
                      className={`w-full rounded-md border ${formErrors.deliveryAddress ? 'border-error' : 'border-divider'} focus:outline-none focus:ring-2 ${formErrors.deliveryAddress ? 'focus:ring-error/50' : 'focus:ring-primary/50'} ${formErrors.deliveryAddress ? 'focus:border-error' : 'focus:border-primary'} transition-all duration-200 bg-white text-text placeholder:text-text-light text-sm pl-10 pr-10 py-3`}
                    />
                    {isSearchingAddress && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  {formErrors.deliveryAddress && (
                    <p className="mt-1 text-xs text-error">{formErrors.deliveryAddress}</p>
                  )}

                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-divider rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-divider last:border-b-0 text-sm"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          <div className="font-medium">{suggestion.value}</div>
                          {suggestion.unrestricted_value && suggestion.unrestricted_value !== suggestion.value && (
                            <div className="text-xs text-text-secondary mt-1">
                              {suggestion.unrestricted_value}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">
                  Габариты посылки
                </label>
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => setShowDimensions(!showDimensions)}
                  className="text-xs p-1"
                  icon={showDimensions ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                >
                  {showDimensions ? 'Скрыть' : 'Показать'}
                </Button>
              </div>
              
              {showDimensions && (
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Длина (см)</label>
                      <input
                        type="number"
                        name="length"
                        min="1"
                        value={orderData.dimensions.length}
                        onChange={handleDimensionChange}
                        className="w-full px-3 py-2 border border-divider rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Ширина (см)</label>
                      <input
                        type="number"
                        name="width"
                        min="1"
                        value={orderData.dimensions.width}
                        onChange={handleDimensionChange}
                        className="w-full px-3 py-2 border border-divider rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Высота (см)</label>
                      <input
                        type="number"
                        name="height"
                        min="1"
                        value={orderData.dimensions.height}
                        onChange={handleDimensionChange}
                        className="w-full px-3 py-2 border border-divider rounded-md text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-text-secondary mt-2 flex items-center">
                    <FiBox size={12} className="mr-1 flex-shrink-0" />
                    <span>Указывайте реальные габариты посылки для точного расчета доставки</span>
                  </div>
                  
                  {deliveryData && deliveryData.calculatedWeight && (
                    <div className="text-xs text-primary mt-1 flex items-center">
                      <FiTruck size={12} className="mr-1 flex-shrink-0" />
                      <span>Расчетный вес посылки: {deliveryData.calculatedWeight.toFixed(2)} кг</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {availableTariffs.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${formErrors.tariff ? 'text-error' : 'text-text-secondary'}`}>
                    Тарифы доставки<span className="text-error ml-1">*</span>
                  </label>
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => setShowTariffs(!showTariffs)}
                    className="text-xs p-1"
                    icon={showTariffs ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  >
                    {showTariffs ? 'Скрыть' : 'Показать все'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {availableTariffs.slice(0, showTariffs ? availableTariffs.length : 3).map(tariff => (
                    <div 
                      key={tariff.tariffCode}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedTariff?.tariffCode === tariff.tariffCode
                          ? 'border-primary bg-primary-bg'
                          : 'border-divider hover:border-primary/50'
                      }`}
                      onClick={() => handleSelectTariff(tariff)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                          <div className="font-medium truncate" title={tariff.tariffName}>
                            {tariff.tariffName}
                          </div>
                          <div className="text-xs text-text-secondary mt-1">
                            {tariff.minDays === tariff.maxDays 
                              ? `${tariff.minDays} ${getWordDays(tariff.minDays)}` 
                              : `${tariff.minDays}-${tariff.maxDays} дней`}
                          </div>
                          {tariff.description && (
                            <div className="text-xs text-text-secondary mt-1 line-clamp-1" title={tariff.description}>
                              {tariff.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-primary whitespace-nowrap">
                            {tariff.finalCost} ₽
                          </div>
                          {selectedTariff?.tariffCode === tariff.tariffCode && (
                            <div className="flex items-center justify-end text-primary text-xs mt-1">
                              <FiCheck size={12} className="mr-1" />
                              Выбрано
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {formErrors.tariff && (
                  <p className="mt-1 text-xs text-error">{formErrors.tariff}</p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-1.5 text-sm font-medium text-text-secondary">
                Комментарий к заказу
              </label>
              <textarea
                name="notes"
                value={orderData.notes}
                onChange={handleChange}
                placeholder="Дополнительная информация, особые требования..."
                rows="3"
                className="w-full rounded-md border border-divider focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-white text-text placeholder:text-text-light text-sm px-4 py-3"
              />
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleCreateOrder}
              disabled={isSubmitting}
              icon={isSubmitting ? undefined : <FiCheck size={16} />}
            >
              {isSubmitting ? 'Отправка заказа...' : 'Отправить заказ на рассмотрение'}
            </Button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-card">
            <h4 className="font-medium mb-3">Товары в заказе:</h4>
            <div className="max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-divider last:border-b-0">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-medium text-sm truncate" title={item.product.name}>
                      {item.product.name}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {item.product.sku} × {item.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap">
                    {item.product.base_price 
                      ? `${parseFloat(item.product.base_price).toLocaleString('ru-RU')} ₽` 
                      : item.product.price}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 mt-3 border-t border-divider">
              <div className="flex justify-between items-center">
                <span className="text-sm">Стоимость товаров:</span>
                <span className="text-sm">
                  {estimatedTotal > 0 && selectedTariff
                    ? `~${(estimatedTotal - selectedTariff.finalCost).toLocaleString('ru-RU')} ₽` 
                    : estimatedTotal > 0 
                      ? `~${estimatedTotal.toLocaleString('ru-RU')} ₽` 
                      : 'По запросу'}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm">Доставка:</span>
                <span className="text-sm">
                  {selectedTariff 
                    ? `${selectedTariff.finalCost.toLocaleString('ru-RU')} ₽` 
                    : 'Рассчитывается при выборе города'}
                </span>
              </div>
              
              <div className="flex justify-between items-center font-medium mt-2 pt-2 border-t border-dashed border-divider">
                <span>Предварительная стоимость:</span>
                <span className="text-primary">
                  {estimatedTotal > 0 ? `~${estimatedTotal.toLocaleString('ru-RU')} ₽` : 'По запросу'}
                </span>
              </div>
              
              {selectedTariff && (
                <div className="mt-2 text-xs text-text-secondary flex items-center">
                  <FiCalendar size={12} className="mr-1" />
                  <span>
                    Примерный срок доставки: {selectedTariff.minDays === selectedTariff.maxDays 
                      ? `${selectedTariff.minDays} ${getWordDays(selectedTariff.minDays)}` 
                      : `${selectedTariff.minDays}-${selectedTariff.maxDays} дней`
                    }
                  </span>
                </div>
              )}
              
              <p className="text-xs text-text-secondary mt-2">
                Система автоматически рассчитывает предварительную стоимость на основе базовых цен. 
                Менеджер проверит актуальные цены и при необходимости скорректирует стоимость доставки.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiClock className="text-yellow-600 mt-0.5 mr-2" size={16} />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Сроки обработки:</p>
                <ul className="text-yellow-700 space-y-1 text-xs">
                  <li>• Автоматический расчет: мгновенно</li>
                  <li>• Рассмотрение заказа: до 2 рабочих дней</li>
                  <li>• Расчет точной стоимости товаров и доставки: индивидуально</li>
                  <li>• Уведомление об одобрении: сразу после рассмотрения</li>
                  <li>• Срок оплаты: 24 часа после одобрения</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

function getWordDays(number) {
  const cases = [2, 0, 1, 1, 1, 2];
  const titles = ['день', 'дня', 'дней'];
  return titles[
    (number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]
  ];
}

export default CheckoutPage;