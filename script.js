// Основные переменные
let currentDate = new Date();
let selectedDate = new Date();
let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

// Элементы DOM
const calendarDays = document.getElementById('calendarDays');
const currentMonthYear = document.getElementById('currentMonthYear');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const todayBtn = document.getElementById('todayBtn');
const selectedDateElement = document.getElementById('selectedDate');
const eventsList = document.getElementById('eventsList');
const eventModal = document.getElementById('eventModal');
const addEventBtn = document.getElementById('addEventBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveEventBtn = document.getElementById('saveEventBtn');
const eventTitle = document.getElementById('eventTitle');
const eventDescription = document.getElementById('eventDescription');

// Названия месяцев и дней
const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Функция для форматирования даты в ключ (YYYY-MM-DD)
function formatDateKey(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// Функция для форматирования даты для отображения
function formatDateDisplay(date) {
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const dayOfWeek = dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1];
    return `${dayOfWeek}, ${day} ${month} ${year}`;
}

// Отрисовка календаря
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Обновляем заголовок
    currentMonthYear.textContent = `${monthNames[month]} ${year}`;
    
    // Очищаем дни
    calendarDays.innerHTML = '';
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    // Последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    // Количество дней в месяце
    const daysInMonth = lastDay.getDate();
    // День недели первого дня месяца (0 - воскресенье, 6 - суббота)
    const startingDay = firstDay.getDay();
    // Корректировка для начала с понедельника
    const adjustedStartingDay = startingDay === 0 ? 6 : startingDay - 1;
    
    // Добавляем дни предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < adjustedStartingDay; i++) {
        const dayNumber = prevMonthLastDay - adjustedStartingDay + i + 1;
        const dayElement = createDayElement(dayNumber, true, false);
        calendarDays.appendChild(dayElement);
    }
    
    // Добавляем дни текущего месяца
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const isToday = i === today.getDate() && 
                       month === today.getMonth() && 
                       year === today.getFullYear();
        const isSelected = i === selectedDate.getDate() && 
                          month === selectedDate.getMonth() && 
                          year === selectedDate.getFullYear();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        const dayElement = createDayElement(i, false, isToday, isSelected, isWeekend, date);
        calendarDays.appendChild(dayElement);
    }
    
    // Добавляем дни следующего месяца
    const totalCells = 42; // 6 недель × 7 дней
    const daysAdded = adjustedStartingDay + daysInMonth;
    const daysNeeded = totalCells - daysAdded;
    
    for (let i = 1; i <= daysNeeded; i++) {
        const dayElement = createDayElement(i, true, false);
        calendarDays.appendChild(dayElement);
    }
    
    // Обновляем список событий
    updateEventsList();
}

// Создание элемента дня
function createDayElement(dayNumber, isOtherMonth, isToday = false, isSelected = false, isWeekend = false, date = null) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    if (isSelected) {
        dayElement.classList.add('selected');
    }
    
    if (isWeekend) {
        dayElement.classList.add('weekend-day');
    }
    
    dayElement.innerHTML = `<div class="day-number">${dayNumber}</div>`;
    
    // Добавляем индикатор событий
    if (date) {
        const dateKey = formatDateKey(date);
        if (events[dateKey] && events[dateKey].length > 0) {
            const eventIndicator = document.createElement('div');
            eventIndicator.className = 'event-indicator';
            eventIndicator.innerHTML = '<i class="fas fa-circle" style="color: #e74c3c; font-size: 10px;"></i>';
            dayElement.appendChild(eventIndicator);
        }
    }
    
    // Обработчик клика
    if (!isOtherMonth && date) {
        dayElement.addEventListener('click', () => {
            selectedDate = date;
            renderCalendar();
            selectedDateElement.textContent = formatDateDisplay(date);
            updateEventsList();
        });
    }
    
    return dayElement;
}

// Обновление списка событий
function updateEventsList() {
    const dateKey = formatDateKey(selectedDate);
    const dateEvents = events[dateKey] || [];
    
    eventsList.innerHTML = '';
    
    if (dateEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">Нет событий на эту дату</div>';
        return;
    }
    
    dateEvents.forEach((event, index) => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-description">${event.description}</div>
            <button class="delete-event-btn" data-index="${index}" style="margin-top: 10px; background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                <i class="fas fa-trash"></i> Удалить
            </button>
        `;
        eventsList.appendChild(eventElement);
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.delete-event-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteEvent(dateKey, index);
        });
    });
}

// Удаление события
function deleteEvent(dateKey, index) {
    if (events[dateKey]) {
        events[dateKey].splice(index, 1);
        if (events[dateKey].length === 0) {
            delete events[dateKey];
        }
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        renderCalendar();
        updateEventsList();
    }
}

// Сохранение события
function saveEvent() {
    const title = eventTitle.value.trim();
    const description = eventDescription.value.trim();
    
    if (!title) {
        alert('Пожалуйста, введите название события');
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    
    if (!events[dateKey]) {
        events[dateKey] = [];
    }
    
    events[dateKey].push({
        title: title,
        description: description,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    
    // Очищаем форму и закрываем модальное окно
    eventTitle.value = '';
    eventDescription.value = '';
    eventModal.style.display = 'none';
    
    // Обновляем календарь и список событий
    renderCalendar();
    updateEventsList();
}

// Обработчики событий
prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    selectedDate = new Date();
    renderCalendar();
    selectedDateElement.textContent = formatDateDisplay(selectedDate);
});

addEventBtn.addEventListener('click', () => {
    eventModal.style.display = 'flex';
    eventTitle.focus();
});

cancelBtn.addEventListener('click', () => {
    eventModal.style.display = 'none';
    eventTitle.value = '';
    eventDescription.value = '';
});

saveEventBtn.addEventListener('click', saveEvent);

// Закрытие модального окна при клике вне его
window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
        eventTitle.value = '';
        eventDescription.value = '';
    }
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    selectedDateElement.textContent = formatDateDisplay(selectedDate);
});
