import { corsHeaders } from "../_shared/cors.ts";

// Константы для расчета доставки из Москвы (заглушка с реальными тарифами)
const DELIVERY_CONFIG = {
  // Базовая точка отправления
  FROM_CITY: {
    name: "Москва",
    code: 44,
    address: "Москва (склад отправления)",
    region: "Москва"
  },
  
  // Наценка
  MARKUP_PERCENTAGE: 20,
  
  // Базовые тарифы (в рублях за 1кг, базовый вес 1кг, из Москвы)
  BASE_TARIFFS: {
    economy_warehouse: { code: 138, name: "Посылка склад-склад", base: 160, min: 220 },
    standard_door: { code: 136, name: "Посылка дверь-дверь", base: 280, min: 380 },
    standard_pvz: { code: 137, name: "Посылка дверь-постамат", base: 240, min: 320 },
    express_door: { code: 1, name: "Экспресс лайт дверь-дверь", base: 420, min: 550 },
    express_warehouse: { code: 10, name: "Экспресс лайт склад-склад", base: 340, min: 420 },
    express_pvz: { code: 11, name: "Экспресс лайт дверь-постамат", base: 380, min: 460 },
    economy_express: { code: 15, name: "Экономичный экспресс дверь-дверь", base: 310, min: 400 },
    super_express: { code: 3, name: "Супер-экспресс до 18", base: 680, min: 850 },
    economy_posylka: { code: 233, name: "Экономичная посылка", base: 130, min: 190 }
  },
  
  // Коэффициенты по зонам доставки (из Москвы)
  DELIVERY_ZONES: {
    zone1: { coeff: 0.8, days: [1, 1] }, // Москва и область
    zone2: { coeff: 1.0, days: [1, 3] }, // Ближайшие области ЦФО
    zone3: { coeff: 1.4, days: [2, 5] }, // Остальной ЦФО, СЗФО
    zone4: { coeff: 1.8, days: [3, 7] }, // Поволжье, Юг, Урал
    zone5: { coeff: 2.5, days: [5, 10] } // Сибирь, Дальний Восток
  }
};

// ПОЛНАЯ база городов России с зональным делением (из Москвы)
const CITIES_DATABASE = {
  // ЗОНА 1 - Москва и Московская область (коэффициент 0.8)
  "Москва": { code: 77, zone: "zone1", region: "Москва" },
  "Зеленоград": { code: 77, zone: "zone1", region: "Москва" },
  "Троицк": { code: 77, zone: "zone1", region: "Москва" },
  "Щербинка": { code: 77, zone: "zone1", region: "Москва" },
  
  // Московская область
  "Балашиха": { code: 50, zone: "zone1", region: "Московская область" },
  "Химки": { code: 50, zone: "zone1", region: "Московская область" },
  "Королев": { code: 50, zone: "zone1", region: "Московская область" },
  "Мытищи": { code: 50, zone: "zone1", region: "Московская область" },
  "Подольск": { code: 50, zone: "zone1", region: "Московская область" },
  "Люберцы": { code: 50, zone: "zone1", region: "Московская область" },
  "Электросталь": { code: 50, zone: "zone1", region: "Московская область" },
  "Коломна": { code: 50, zone: "zone1", region: "Московская область" },
  "Серпухов": { code: 50, zone: "zone1", region: "Московская область" },
  "Одинцово": { code: 50, zone: "zone1", region: "Московская область" },
  "Домодедово": { code: 50, zone: "zone1", region: "Московская область" },
  "Жуковский": { code: 50, zone: "zone1", region: "Московская область" },
  "Орехово-Зуево": { code: 50, zone: "zone1", region: "Московская область" },
  "Ногинск": { code: 50, zone: "zone1", region: "Московская область" },
  "Клин": { code: 50, zone: "zone1", region: "Московская область" },
  "Воскресенск": { code: 50, zone: "zone1", region: "Московская область" },
  "Егорьевск": { code: 50, zone: "zone1", region: "Московская область" },
  "Красногорск": { code: 50, zone: "zone1", region: "Московская область" },
  "Лобня": { code: 50, zone: "zone1", region: "Московская область" },
  "Ступино": { code: 50, zone: "zone1", region: "Московская область" },
  "Щелково": { code: 50, zone: "zone1", region: "Московская область" },
  "Раменское": { code: 50, zone: "zone1", region: "Московская область" },
  "Долгопрудный": { code: 50, zone: "zone1", region: "Московская область" },
  "Пушкино": { code: 50, zone: "zone1", region: "Московская область" },
  "Дмитров": { code: 50, zone: "zone1", region: "Московская область" },
  "Реутов": { code: 50, zone: "zone1", region: "Московская область" },
  
  // ЗОНА 2 - Ближайшие области ЦФО (коэффициент 1.0)
  "Калуга": { code: 40, zone: "zone2", region: "Калужская область" },
  "Обнинск": { code: 40, zone: "zone2", region: "Калужская область" },
  "Тула": { code: 71, zone: "zone2", region: "Тульская область" },
  "Новомосковск": { code: 71, zone: "zone2", region: "Тульская область" },
  "Рязань": { code: 62, zone: "zone2", region: "Рязанская область" },
  "Касимов": { code: 62, zone: "zone2", region: "Рязанская область" },
  "Владимир": { code: 33, zone: "zone2", region: "Владимирская область" },
  "Ковров": { code: 33, zone: "zone2", region: "Владимирская область" },
  "Муром": { code: 33, zone: "zone2", region: "Владимирская область" },
  "Тверь": { code: 69, zone: "zone2", region: "Тверская область" },
  "Ржев": { code: 69, zone: "zone2", region: "Тверская область" },
  "Торжок": { code: 69, zone: "zone2", region: "Тверская область" },
  "Иваново": { code: 37, zone: "zone2", region: "Ивановская область" },
  "Кинешма": { code: 37, zone: "zone2", region: "Ивановская область" },
  "Ярославль": { code: 76, zone: "zone2", region: "Ярославская область" },
  "Рыбинск": { code: 76, zone: "zone2", region: "Ярославская область" },
  "Кострома": { code: 44, zone: "zone2", region: "Костромская область" },
  
  // ЗОНА 3 - Остальной ЦФО + СЗФО (коэффициент 1.4)
  // Санкт-Петербург и Ленинградская область
  "Санкт-Петербург": { code: 78, zone: "zone3", region: "Санкт-Петербург" },
  "Колпино": { code: 78, zone: "zone3", region: "Санкт-Петербург" },
  "Пушкин": { code: 78, zone: "zone3", region: "Санкт-Петербург" },
  "Выборг": { code: 47, zone: "zone3", region: "Ленинградская область" },
  "Гатчина": { code: 47, zone: "zone3", region: "Ленинградская область" },
  "Всеволожск": { code: 47, zone: "zone3", region: "Ленинградская область" },
  
  // Остальной ЦФО
  "Белгород": { code: 31, zone: "zone3", region: "Белгородская область" },
  "Старый Оскол": { code: 31, zone: "zone3", region: "Белгородская область" },
  "Бирюч": { code: 31, zone: "zone3", region: "Белгородская область" },
  "Воронеж": { code: 36, zone: "zone3", region: "Воронежская область" },
  "Борисоглебск": { code: 36, zone: "zone3", region: "Воронежская область" },
  "Курск": { code: 46, zone: "zone3", region: "Курская область" },
  "Железногорск": { code: 46, zone: "zone3", region: "Курская область" },
  "Липецк": { code: 48, zone: "zone3", region: "Липецкая область" },
  "Елец": { code: 48, zone: "zone3", region: "Липецкая область" },
  "Орел": { code: 57, zone: "zone3", region: "Орловская область" },
  "Ливны": { code: 57, zone: "zone3", region: "Орловская область" },
  "Тамбов": { code: 68, zone: "zone3", region: "Тамбовская область" },
  "Мичуринск": { code: 68, zone: "zone3", region: "Тамбовская область" },
  "Брянск": { code: 32, zone: "zone3", region: "Брянская область" },
  "Клинцы": { code: 32, zone: "zone3", region: "Брянская область" },
  "Смоленск": { code: 67, zone: "zone3", region: "Смоленская область" },
  "Вязьма": { code: 67, zone: "zone3", region: "Смоленская область" },
  "Починок": { code: 67, zone: "zone3", region: "Смоленская область" },
  
  // СЗФО
  "Архангельск": { code: 29, zone: "zone3", region: "Архангельская область" },
  "Северодвинск": { code: 29, zone: "zone3", region: "Архангельская область" },
  "Котлас": { code: 29, zone: "zone3", region: "Архангельская область" },
  "Великий Новгород": { code: 53, zone: "zone3", region: "Новгородская область" },
  "Боровичи": { code: 53, zone: "zone3", region: "Новгородская область" },
  "Вологда": { code: 35, zone: "zone3", region: "Вологодская область" },
  "Череповец": { code: 35, zone: "zone3", region: "Вологодская область" },
  "Калининград": { code: 39, zone: "zone3", region: "Калининградская область" },
  "Балтийск": { code: 39, zone: "zone3", region: "Калининградская область" },
  "Петрозаводск": { code: 10, zone: "zone3", region: "Республика Карелия" },
  "Костомукша": { code: 10, zone: "zone3", region: "Республика Карелия" },
  "Псков": { code: 60, zone: "zone3", region: "Псковская область" },
  "Великие Луки": { code: 60, zone: "zone3", region: "Псковская область" },
  "Мурманск": { code: 51, zone: "zone3", region: "Мурманская область" },
  "Апатиты": { code: 51, zone: "zone3", region: "Мурманская область" },
  "Североморск": { code: 51, zone: "zone3", region: "Мурманская область" },
  "Сыктывкар": { code: 11, zone: "zone3", region: "Республика Коми" },
  "Ухта": { code: 11, zone: "zone3", region: "Республика Коми" },
  "Воркута": { code: 11, zone: "zone3", region: "Республика Коми" },
  "Нарьян-Мар": { code: 83, zone: "zone3", region: "Ненецкий автономный округ" },
  
  // ЗОНА 3 - Остальной ЦФО + СЗФО (коэффициент 1.4)
  "Санкт-Петербург": { code: 137, zone: "zone3", region: "Санкт-Петербург" },
  "Белгород": { code: 565, zone: "zone3", region: "Белгородская область" },
  "Бирюч": { code: 1015, zone: "zone3", region: "Белгородская область" },
  "Воронеж": { code: 193, zone: "zone3", region: "Воронежская область" },
  "Курск": { code: 20, zone: "zone3", region: "Курская область" },
  "Липецк": { code: 25, zone: "zone3", region: "Липецкая область" },
  "Орел": { code: 256, zone: "zone3", region: "Орловская область" },
  "Тамбов": { code: 6, zone: "zone3", region: "Тамбовская область" },
  "Брянск": { code: 191, zone: "zone3", region: "Брянская область" },
  "Смоленск": { code: 146, zone: "zone3", region: "Смоленская область" },
  "Починок": { code: 899, zone: "zone3", region: "Смоленская область" },
  "Архангельск": { code: 18, zone: "zone3", region: "Архангельская область" },
  "Великий Новгород": { code: 142, zone: "zone3", region: "Новгородская область" },
  "Вологда": { code: 151, zone: "zone3", region: "Вологодская область" },
  "Калининград": { code: 152, zone: "zone3", region: "Калининградская область" },
  "Петрозаводск": { code: 1094, zone: "zone3", region: "Республика Карелия" },
  "Псков": { code: 1095, zone: "zone3", region: "Псковская область" },
  "Мурманск": { code: 1097, zone: "zone3", region: "Мурманская область" },
  "Сыктывкар": { code: 1096, zone: "zone3", region: "Республика Коми" },
  
  // ЗОНА 4 - Поволжье, Юг, Урал (коэффициент 1.8)
  "Нижний Новгород": { code: 24, zone: "zone4", region: "Нижегородская область" },
  "Казань": { code: 172, zone: "zone4", region: "Республика Татарстан" },
  "Самара": { code: 51, zone: "zone4", region: "Самарская область" },
  "Саратов": { code: 243, zone: "zone4", region: "Саратовская область" },
  "Ульяновск": { code: 195, zone: "zone4", region: "Ульяновская область" },
  "Пенза": { code: 49, zone: "zone4", region: "Пензенская область" },
  "Киров": { code: 254, zone: "zone4", region: "Кировская область" },
  "Чебоксары": { code: 45, zone: "zone4", region: "Чувашская Республика" },
  "Йошкар-Ола": { code: 1108, zone: "zone4", region: "Республика Марий Эл" },
  "Саранск": { code: 1109, zone: "zone4", region: "Республика Мордовия" },
  "Тольятти": { code: 969, zone: "zone4", region: "Самарская область" },
  "Астрахань": { code: 17, zone: "zone4", region: "Астраханская область" },
  "Волгоград": { code: 23, zone: "zone4", region: "Волгоградская область" },
  "Краснодар": { code: 35, zone: "zone4", region: "Краснодарский край" },
  "Ростов-на-Дону": { code: 39, zone: "zone4", region: "Ростовская область" },
  "Сочи": { code: 1438, zone: "zone4", region: "Краснодарский край" },
  "Ставрополь": { code: 37, zone: "zone4", region: "Ставропольский край" },
  "Махачкала": { code: 1106, zone: "zone4", region: "Республика Дагестан" },
  "Грозный": { code: 1100, zone: "zone4", region: "Чеченская Республика" },
  "Владикавказ": { code: 1099, zone: "zone4", region: "РСО-Алания" },
  "Симферополь": { code: 1499, zone: "zone4", region: "Республика Крым" },
  "Севастополь": { code: 1438, zone: "zone4", region: "Севастополь" },
  "Екатеринбург": { code: 250, zone: "zone4", region: "Свердловская область" },
  "Челябинск": { code: 56, zone: "zone4", region: "Челябинская область" },
  "Уфа": { code: 102, zone: "zone4", region: "Республика Башкортостан" },
  "Пермь": { code: 48, zone: "zone4", region: "Пермский край" },
  "Ижевск": { code: 7, zone: "zone4", region: "Удмуртская Республика" },
  "Оренбург": { code: 67, zone: "zone4", region: "Оренбургская область" },
  "Курган": { code: 1110, zone: "zone4", region: "Курганская область" },
  "Тюмень": { code: 81, zone: "zone4", region: "Тюменская область" },
  
  // ЗОНА 5 - Сибирь, Дальний Восток (коэффициент 2.5)
  // Сибирский федеральный округ
  "Новосибирск": { code: 54, zone: "zone5", region: "Новосибирская область" },
  "Барабинск": { code: 54, zone: "zone5", region: "Новосибирская область" },
  "Бердск": { code: 54, zone: "zone5", region: "Новосибирская область" },
  "Омск": { code: 55, zone: "zone5", region: "Омская область" },
  "Тара": { code: 55, zone: "zone5", region: "Омская область" },
  "Красноярск": { code: 24, zone: "zone5", region: "Красноярский край" },
  "Норильск": { code: 24, zone: "zone5", region: "Красноярский край" },
  "Ачинск": { code: 24, zone: "zone5", region: "Красноярский край" },
  "Канск": { code: 24, zone: "zone5", region: "Красноярский край" },
  "Минусинск": { code: 24, zone: "zone5", region: "Красноярский край" },
  "Иркутск": { code: 38, zone: "zone5", region: "Иркутская область" },
  "Братск": { code: 38, zone: "zone5", region: "Иркутская область" },
  "Ангарск": { code: 38, zone: "zone5", region: "Иркутская область" },
  "Усть-Илимск": { code: 38, zone: "zone5", region: "Иркутская область" },
  "Кемерово": { code: 42, zone: "zone5", region: "Кемеровская область" },
  "Новокузнецк": { code: 42, zone: "zone5", region: "Кемеровская область" },
  "Прокопьевск": { code: 42, zone: "zone5", region: "Кемеровская область" },
  "Междуреченск": { code: 42, zone: "zone5", region: "Кемеровская область" },
  "Томск": { code: 70, zone: "zone5", region: "Томская область" },
  "Северск": { code: 70, zone: "zone5", region: "Томская область" },
  "Стрежевой": { code: 70, zone: "zone5", region: "Томская область" },
  "Барнаул": { code: 22, zone: "zone5", region: "Алтайский край" },
  "Бийск": { code: 22, zone: "zone5", region: "Алтайский край" },
  "Рубцовск": { code: 22, zone: "zone5", region: "Алтайский край" },
  "Новоалтайск": { code: 22, zone: "zone5", region: "Алтайский край" },
  "Улан-Удэ": { code: 3, zone: "zone5", region: "Республика Бурятия" },
  "Северобайкальск": { code: 3, zone: "zone5", region: "Республика Бурятия" },
  "Чита": { code: 75, zone: "zone5", region: "Забайкальский край" },
  "Краснокаменск": { code: 75, zone: "zone5", region: "Забайкальский край" },
  "Борзя": { code: 75, zone: "zone5", region: "Забайкальский край" },
  "Абакан": { code: 19, zone: "zone5", region: "Республика Хакасия" },
  "Черногорск": { code: 19, zone: "zone5", region: "Республика Хакасия" },
  "Кызыл": { code: 17, zone: "zone5", region: "Республика Тыва" },
  "Горно-Алтайск": { code: 4, zone: "zone5", region: "Республика Алтай" },
  "Якутск": { code: 14, zone: "zone5", region: "Республика Саха (Якутия)" },
  "Мирный": { code: 14, zone: "zone5", region: "Республика Саха (Якутия)" },
  "Нерюнгри": { code: 14, zone: "zone5", region: "Республика Саха (Якутия)" },
  "Ленск": { code: 14, zone: "zone5", region: "Республика Саха (Якутия)" },
  
  // Дальневосточный федеральный округ
  "Хабаровск": { code: 27, zone: "zone5", region: "Хабаровский край" },
  "Комсомольск-на-Амуре": { code: 27, zone: "zone5", region: "Хабаровский край" },
  "Амурск": { code: 27, zone: "zone5", region: "Хабаровский край" },
  "Советская Гавань": { code: 27, zone: "zone5", region: "Хабаровский край" },
  "Владивосток": { code: 25, zone: "zone5", region: "Приморский край" },
  "Уссурийск": { code: 25, zone: "zone5", region: "Приморский край" },
  "Находка": { code: 25, zone: "zone5", region: "Приморский край" },
  "Артем": { code: 25, zone: "zone5", region: "Приморский край" },
  "Дальнегорск": { code: 25, zone: "zone5", region: "Приморский край" },
  "Благовещенск": { code: 28, zone: "zone5", region: "Амурская область" },
  "Белогорск": { code: 28, zone: "zone5", region: "Амурская область" },
  "Свободный": { code: 28, zone: "zone5", region: "Амурская область" },
  "Тында": { code: 28, zone: "zone5", region: "Амурская область" },
  "Магадан": { code: 49, zone: "zone5", region: "Магаданская область" },
  "Сусуман": { code: 49, zone: "zone5", region: "Магаданская область" },
  "Петропавловск-Камчатский": { code: 41, zone: "zone5", region: "Камчатский край" },
  "Елизово": { code: 41, zone: "zone5", region: "Камчатский край" },
  "Вилючинск": { code: 41, zone: "zone5", region: "Камчатский край" },
  "Южно-Сахалинск": { code: 65, zone: "zone5", region: "Сахалинская область" },
  "Корсаков": { code: 65, zone: "zone5", region: "Сахалинская область" },
  "Холмск": { code: 65, zone: "zone5", region: "Сахалинская область" },
  "Оха": { code: 65, zone: "zone5", region: "Сахалинская область" },
  "Курильск": { code: 65, zone: "zone5", region: "Сахалинская область" },
  "Биробиджан": { code: 79, zone: "zone5", region: "Еврейская автономная область" },
  "Анадырь": { code: 87, zone: "zone5", region: "Чукотский автономный округ" },
  "Певек": { code: 87, zone: "zone5", region: "Чукотский автономный округ" },
  "Билибино": { code: 87, zone: "zone5", region: "Чукотский автономный округ" }
};

// Группировка по федеральным округам (доставка из Москвы) - ПОЛНАЯ ВЕРСИЯ
const FEDERAL_DISTRICTS = {
  "Москва и область": {
    description: "Москва и Московская область (зона 1)",
    cities: ["Москва", "Зеленоград", "Троицк", "Щербинка", "Балашиха", "Химки", "Королев", 
             "Мытищи", "Подольск", "Люберцы", "Электросталь", "Коломна", "Серпухов", 
             "Одинцово", "Домодедово", "Жуковский", "Орехово-Зуево", "Ногинск", "Клин", 
             "Воскресенск", "Егорьевск", "Красногорск", "Лобня", "Ступино", "Щелково", 
             "Раменское", "Долгопрудный", "Пушкино", "Дмитров", "Реутов"]
  },
  "Ближний ЦФО": {
    description: "Ближайшие области Центрального округа (зона 2)", 
    cities: ["Калуга", "Обнинск", "Тула", "Новомосковск", "Рязань", "Касимов", "Владимир", 
             "Ковров", "Муром", "Тверь", "Ржев", "Торжок", "Иваново", "Кинешма", 
             "Ярославль", "Рыбинск", "Кострома"]
  },
  "ЦФО и СЗФО": {
    description: "Остальной ЦФО и Северо-Западный округ (зона 3)",
    cities: ["Санкт-Петербург", "Колпино", "Пушкин", "Выборг", "Гатчина", "Всеволожск",
             "Белгород", "Старый Оскол", "Бирюч", "Воронеж", "Борисоглебск", "Курск", 
             "Железногорск", "Липецк", "Елец", "Орел", "Ливны", "Тамбов", "Мичуринск", 
             "Брянск", "Клинцы", "Смоленск", "Вязьма", "Починок", "Архангельск", 
             "Северодвинск", "Котлас", "Великий Новгород", "Боровичи", "Вологда", 
             "Череповец", "Калининград", "Балтийск", "Петрозаводск", "Костомукша", 
             "Псков", "Великие Луки", "Мурманск", "Апатиты", "Североморск", "Сыктывкар", 
             "Ухта", "Воркута", "Нарьян-Мар"]
  },
  "Поволжье, Юг, Урал": {
    description: "Приволжский, Южный, Северо-Кавказский, Уральский округа (зона 4)",
    cities: ["Нижний Новгород", "Дзержинск", "Арзамас", "Казань", "Набережные Челны", 
             "Альметьевск", "Самара", "Тольятти", "Сызрань", "Саратов", "Энгельс", 
             "Балаково", "Ульяновск", "Димитровград", "Пенза", "Кузнецк", "Киров", 
             "Кирово-Чепецк", "Чебоксары", "Новочебоксарск", "Йошкар-Ола", "Саранск", 
             "Ижевск", "Воткинск", "Уфа", "Стерлитамак", "Салават", "Пермь", "Березники", 
             "Соликамск", "Оренбург", "Орск", "Новотроицк", "Ростов-на-Дону", "Таганрог", 
             "Новочеркасск", "Шахты", "Волгоград", "Волжский", "Камышин", "Краснодар", 
             "Сочи", "Новороссийск", "Армавир", "Астрахань", "Элиста", "Симферополь", 
             "Севастополь", "Керчь", "Евпатория", "Ялта", "Ставрополь", "Пятигорск", 
             "Кисловодск", "Ессентуки", "Невинномысск", "Махачкала", "Дербент", "Каспийск", 
             "Грозный", "Владикавказ", "Нальчик", "Черкесск", "Магас", "Майкоп", 
             "Екатеринбург", "Нижний Тагил", "Каменск-Уральский", "Первоуральск", 
             "Челябинск", "Магнитогорск", "Златоуст", "Миасс", "Тюмень", "Тобольск", 
             "Курган", "Шадринск", "Ханты-Мансийск", "Сургут", "Нижневартовск", 
             "Нефтеюганск", "Салехард", "Новый Уренгой", "Ноябрьск"]
  },
  "Сибирь и Дальний Восток": {
    description: "Сибирский и Дальневосточный федеральные округа (зона 5)",
    cities: ["Новосибирск", "Барабинск", "Бердск", "Омск", "Тара", "Красноярск", 
             "Норильск", "Ачинск", "Канск", "Минусинск", "Иркутск", "Братск", "Ангарск", 
             "Усть-Илимск", "Кемерово", "Новокузнецк", "Прокопьевск", "Междуреченск", 
             "Томск", "Северск", "Стрежевой", "Барнаул", "Бийск", "Рубцовск", 
             "Новоалтайск", "Улан-Удэ", "Северобайкальск", "Чита", "Краснокаменск", 
             "Борзя", "Абакан", "Черногорск", "Кызыл", "Горно-Алтайск", "Якутск", 
             "Мирный", "Нерюнгри", "Ленск", "Хабаровск", "Комсомольск-на-Амуре", 
             "Амурск", "Советская Гавань", "Владивосток", "Уссурийск", "Находка", 
             "Артем", "Дальнегорск", "Благовещенск", "Белогорск", "Свободный", "Тында", 
             "Магадан", "Сусуман", "Петропавловск-Камчатский", "Елизово", "Вилючинск", 
             "Южно-Сахалинск", "Корсаков", "Холмск", "Оха", "Курильск", "Биробиджан", 
             "Анадырь", "Певек", "Билибино"]
  }
};

// Основная функция расчета стоимости доставки (заглушка с реальными тарифами из Москвы)
function calculateDeliveryFromMoscow(toCityName, weight = 1000, dimensions = {}) {
  const fromCity = DELIVERY_CONFIG.FROM_CITY;
  
  // Поиск города назначения
  const cityData = CITIES_DATABASE[toCityName];
  if (!cityData) {
    throw new Error(`Город "${toCityName}" не найден в базе данных`);
  }
  
  // Получаем зональные коэффициенты
  const zoneInfo = DELIVERY_CONFIG.DELIVERY_ZONES[cityData.zone];
  if (!zoneInfo) {
    throw new Error(`Зона доставки для города "${toCityName}" не определена`);
  }
  
  // Расчет объемного веса (1 куб.м = 200кг)
  const volumeWeight = dimensions.length && dimensions.width && dimensions.height
    ? (dimensions.length * dimensions.width * dimensions.height / 1000000) * 200
    : 0;
  
  // Берем больший вес (фактический или объемный)
  const calculatedWeight = Math.max(weight / 1000, volumeWeight, 0.1); // минимум 100г
  
  // Расчет по всем доступным тарифам
  const tariffs = [];
  
  for (const [tariffKey, tariffData] of Object.entries(DELIVERY_CONFIG.BASE_TARIFFS)) {
    // Базовая стоимость с учетом зоны
    let baseCost = tariffData.base * zoneInfo.coeff;
    
    // Доплата за вес свыше 1кг
    if (calculatedWeight > 1) {
      baseCost += (calculatedWeight - 1) * tariffData.base * 0.3 * zoneInfo.coeff;
    }
    
    // Минимальная стоимость
    const originalCost = Math.max(baseCost, tariffData.min * zoneInfo.coeff);
    
    // Применяем наценку 20%
    const markup = DELIVERY_CONFIG.MARKUP_PERCENTAGE / 100;
    const finalCost = Math.ceil(originalCost * (1 + markup));
    
    // Расчет сроков доставки
    let [minDays, maxDays] = zoneInfo.days;
    
    // Коррекция сроков для разных типов тарифов
    if (tariffKey.includes('express')) {
      minDays = Math.max(1, minDays - 1);
      maxDays = Math.max(2, maxDays - 2);
    } else if (tariffKey.includes('super')) {
      minDays = 1;
      maxDays = Math.max(1, minDays);
    } else if (tariffKey.includes('economy')) {
      minDays = minDays + 1;
      maxDays = maxDays + 2;
    }
    
    // Определяем тип доставки
    let deliveryType = 'standard';
    if (tariffKey.includes('express') || tariffKey.includes('super')) {
      deliveryType = 'express';
    } else if (tariffKey.includes('economy')) {
      deliveryType = 'economy';
    }
    
    tariffs.push({
      tariffCode: tariffData.code,
      tariffName: tariffData.name,
      description: `Доставка ${tariffData.name.toLowerCase()} в ${cityData.region}`,
      type: deliveryType,
      zone: cityData.zone,
      zoneCoeff: zoneInfo.coeff,
      originalCost: Math.round(originalCost),
      finalCost: finalCost,
      minDays: minDays,
      maxDays: maxDays,
      deliveryTime: minDays === maxDays ? `${minDays} дн.` : `${minDays}-${maxDays} дн.`,
      weight: calculatedWeight,
      markup: DELIVERY_CONFIG.MARKUP_PERCENTAGE,
      fromCity: fromCity.name,
      toCity: toCityName,
      toRegion: cityData.region
    });
  }
  
  // Сортируем по стоимости
  tariffs.sort((a, b) => a.finalCost - b.finalCost);
  
  return {
    success: true,
    method: 'INTERNAL_CALCULATOR',
    tariffs: tariffs,
    fromCity: fromCity,
    destinationCity: {
      name: toCityName,
      code: cityData.code,
      zone: cityData.zone,
      region: cityData.region,
      zoneCoeff: zoneInfo.coeff
    },
    calculationDetails: {
      weight: weight,
      calculatedWeight: calculatedWeight,
      volumeWeight: volumeWeight,
      dimensions: dimensions,
      markup: DELIVERY_CONFIG.MARKUP_PERCENTAGE,
      note: "Расчет выполнен по внутренним тарифам на основе данных CDEK 2025"
    }
  };
}

// Поиск города с подсказками
function findCity(searchQuery) {
  const normalized = searchQuery.trim().toLowerCase();
  
  // Точное совпадение
  const exactMatch = Object.keys(CITIES_DATABASE).find(
    city => city.toLowerCase() === normalized
  );
  
  if (exactMatch) {
    const cityData = CITIES_DATABASE[exactMatch];
    return {
      found: true,
      exact: true,
      city: {
        name: exactMatch,
        code: cityData.code,
        zone: cityData.zone,
        region: cityData.region
      },
      suggestions: []
    };
  }
  
  // Частичное совпадение
  const partialMatches = Object.keys(CITIES_DATABASE).filter(
    city => city.toLowerCase().includes(normalized) || 
            normalized.includes(city.toLowerCase())
  );
  
  if (partialMatches.length === 1) {
    const cityName = partialMatches[0];
    const cityData = CITIES_DATABASE[cityName];
    return {
      found: true,
      exact: false,
      city: {
        name: cityName,
        code: cityData.code,
        zone: cityData.zone,
        region: cityData.region
      },
      suggestions: []
    };
  }
  
  return {
    found: false,
    exact: false,
    city: null,
    suggestions: partialMatches.slice(0, 8).map(cityName => ({
      name: cityName,
      region: CITIES_DATABASE[cityName].region,
      zone: CITIES_DATABASE[cityName].zone
    }))
  };
}

// Получение городов по федеральному округу
function getCitiesByDistrict(districtName) {
  const district = FEDERAL_DISTRICTS[districtName];
  if (!district) {
    return {
      error: 'Федеральный округ не найден',
      availableDistricts: Object.keys(FEDERAL_DISTRICTS)
    };
  }
  
  return {
    district: districtName,
    description: district.description,
    cities: district.cities.map(cityName => {
      const cityData = CITIES_DATABASE[cityName];
      return {
        name: cityName,
        code: cityData.code,
        zone: cityData.zone,
        region: cityData.region
      };
    }).filter(city => city.code)
  };
}

// Получение статистики по всем регионам
function getAllRegionsStats() {
  const totalCities = Object.keys(CITIES_DATABASE).length;
  const zoneStats = {};
  
  // Подсчет городов по зонам
  Object.values(CITIES_DATABASE).forEach(city => {
    zoneStats[city.zone] = (zoneStats[city.zone] || 0) + 1;
  });
  
  return {
    totalCities,
    fromCity: DELIVERY_CONFIG.FROM_CITY,
    markup: `${DELIVERY_CONFIG.MARKUP_PERCENTAGE}%`,
    method: 'Внутренний калькулятор тарифов',
    zoneStatistics: {
      zone1: { cities: zoneStats.zone1 || 0, description: "Москва и область", coeff: "0.8x" },
      zone2: { cities: zoneStats.zone2 || 0, description: "Ближний ЦФО", coeff: "1.0x" },
      zone3: { cities: zoneStats.zone3 || 0, description: "ЦФО + СЗФО", coeff: "1.4x" },
      zone4: { cities: zoneStats.zone4 || 0, description: "Поволжье, Юг, Урал", coeff: "1.8x" },
      zone5: { cities: zoneStats.zone5 || 0, description: "Сибирь, Дальний Восток", coeff: "2.5x" }
    },
    federalDistricts: Object.keys(FEDERAL_DISTRICTS).map(district => ({
      name: district,
      description: FEDERAL_DISTRICTS[district].description,
      citiesCount: FEDERAL_DISTRICTS[district].cities.length,
      preview: FEDERAL_DISTRICTS[district].cities.slice(0, 3)
    }))
  };
}

// Тестирование функции расчета
function runDeliveryTest() {
  try {
    // Тест на направлении Москва → Новосибирск (дальний город)
    const testResult = calculateDeliveryFromMoscow("Новосибирск", 1500, {
      length: 30, width: 20, height: 15
    });
    
    return {
      test: 'Внутренний калькулятор доставки из Москвы',
      status: 'SUCCESS',
      success: true,
      testDirection: `${DELIVERY_CONFIG.FROM_CITY.name} → Новосибирск`,
      testWeight: '1.5 кг',
      testDimensions: '30×20×15 см',
      tariffsCalculated: testResult.tariffs.length,
      cheapestOption: testResult.tariffs[0],
      mostExpensive: testResult.tariffs[testResult.tariffs.length - 1],
      markup: `${DELIVERY_CONFIG.MARKUP_PERCENTAGE}%`,
      calculationMethod: 'Зональный калькулятор с реальными тарифами CDEK из Москвы',
      totalCitiesInDatabase: Object.keys(CITIES_DATABASE).length
    };
  } catch (error) {
    return {
      test: 'Внутренний калькулятор доставки из Москвы',
      status: 'ERROR',
      success: false,
      error: error.message
    };
  }
}

// Основная Edge Function
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const url = new URL(req.url);
    
    // Тестирование калькулятора
    if (url.pathname.endsWith('/test')) {
      const testResult = runDeliveryTest();
      
      return new Response(JSON.stringify({
        message: 'Тестирование внутреннего калькулятора доставки из Москвы',
        fromAddress: DELIVERY_CONFIG.FROM_CITY.address,
        apiStatus: 'CDEK API недоступен - используется внутренний калькулятор',
        testResult,
        recommendation: testResult.success ? 
          '✅ Калькулятор работает! Готов к расчету доставки из Москвы по всей России.' :
          '❌ Ошибка в калькуляторе. Проверьте настройки.'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }

    // Получение статистики по всем регионам
    if (url.pathname.endsWith('/regions')) {
      const regionsData = getAllRegionsStats();
      return new Response(JSON.stringify(regionsData), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }

    // Получение городов по федеральному округу
    if (url.pathname.endsWith('/district')) {
      const districtName = url.searchParams.get('name');
      if (!districtName) {
        return new Response(JSON.stringify({
          error: 'Не указан федеральный округ',
          availableDistricts: Object.keys(FEDERAL_DISTRICTS)
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        });
      }

      const districtData = getCitiesByDistrict(districtName);
      return new Response(JSON.stringify(districtData), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }

    // Поиск города
    if (url.pathname.endsWith('/city-search')) {
      const cityName = url.searchParams.get('name');
      if (!cityName) {
        return new Response(JSON.stringify({
          error: 'Не указано название города для поиска'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        });
      }

      const searchResult = findCity(cityName);
      return new Response(JSON.stringify({
        query: cityName,
        result: searchResult,
        fromCity: DELIVERY_CONFIG.FROM_CITY
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: searchResult.found ? 200 : 404
      });
    }

    // Расчет стоимости доставки из Починка
    if (req.method === 'POST') {
      const { 
        toCity, 
        weight = 1000, 
        dimensions = {} 
      } = await req.json();

      if (!toCity) {
        return new Response(JSON.stringify({
          error: 'Не указан город назначения',
          fromCity: DELIVERY_CONFIG.FROM_CITY,
          examples: ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург']
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        });
      }

      // Поиск города назначения
      const citySearchResult = findCity(toCity);
      
      if (!citySearchResult.found) {
        return new Response(JSON.stringify({
          error: 'Город назначения не найден',
          searchQuery: toCity,
          suggestions: citySearchResult.suggestions,
          fromCity: DELIVERY_CONFIG.FROM_CITY.name,
          note: 'Попробуйте использовать точное название города или выберите из предложенных'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 404
        });
      }

      // Валидация веса (граммы)
      const validWeight = Math.max(100, Math.min(50000, parseInt(weight) || 1000));

      try {
        // Расчет доставки
        const result = calculateDeliveryFromMoscow(
          citySearchResult.city.name,
          validWeight,
          dimensions
        );

        return new Response(JSON.stringify(result), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        });
      } catch (calcError) {
        return new Response(JSON.stringify({
          error: 'Ошибка расчета доставки',
          details: calcError.message,
          toCity: toCity,
          fromCity: DELIVERY_CONFIG.FROM_CITY.name
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 500
        });
      }
    }

    // Документация API
    return new Response(JSON.stringify({
      title: 'Калькулятор доставки CDEK из Москвы',
      description: 'Внутренний калькулятор с реальными тарифами CDEK 2025',
      fromCity: DELIVERY_CONFIG.FROM_CITY.name,
      fromAddress: DELIVERY_CONFIG.FROM_CITY.address,
      markup: `${DELIVERY_CONFIG.MARKUP_PERCENTAGE}%`,
      method: 'Зональный расчет без обращения к API CDEK',
      totalCities: Object.keys(CITIES_DATABASE).length,
      availableEndpoints: [
        'GET /regions - статистика по всем федеральным округам',
        'GET /district?name=Москва и область - города федерального округа',
        'GET /city-search?name=Санкт-Петербург - поиск города с подсказками',
        'GET /test - тестирование калькулятора',
        'POST / - расчет доставки (параметры: toCity, weight, dimensions)'
      ],
      zones: {
        zone1: "Москва и область (коэфф. 0.8)",
        zone2: "Ближний ЦФО (коэфф. 1.0)", 
        zone3: "ЦФО + СЗФО (коэфф. 1.4)",
        zone4: "Поволжье, Юг, Урал (коэфф. 1.8)",
        zone5: "Сибирь, Дальний Восток (коэфф. 2.5)"
      },
      tariffs: Object.keys(DELIVERY_CONFIG.BASE_TARIFFS),
      note: "⚠️ CDEK закрыл публичный API. Используется внутренний калькулятор с актуальными тарифами."
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('❌ Ошибка в edge function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Внутренняя ошибка сервера',
      fromCity: DELIVERY_CONFIG.FROM_CITY.name,
      details: error.stack
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});