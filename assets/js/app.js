// [수정] 전역 변수 선언부 정리 및 리팩토링된 코드를 원래 구조로 복원 – 코드 가독성 개선
// 전역 변수
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let events = [];
let selectedEventId = null;

const STORAGE_KEY = 'seeandyou_events';

// DOM 요소 참조
let calendarBody;
let eventList;
let currentDateElement;
let currentMonthLabel;
let prevMonthBtn;
let nextMonthBtn;
let searchInput;
let clearSearchBtn;
let eventModal;
let detailModal;
let eventForm;
let saveEventBtn;
let editEventBtn;
let deleteEventBtn;
let selectedDateInput;
let eventTitleInput;
let eventContentInput;
let eventLocationInput;
let eventPrioritySelect;
let detailDateInput;
let detailTitleInput;
let detailContentInput;
let detailLocationInput;
let detailPrioritySelect;

function loadEvents() {
    try {
        const storedEvents = localStorage.getItem(STORAGE_KEY);
        if (storedEvents) {
            events = JSON.parse(storedEvents);
        } else {
            events = [];
        }
    } catch (error) {
        console.error('일정 데이터 불러오기 실패:', error);
        events = [];
    }
}

function saveEvents(eventsArray) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsArray));
        events = eventsArray;
    } catch (error) {
        console.error('일정 데이터 저장 실패:', error);
        alert('일정 저장에 실패했습니다.');
    }
}

// [수정] 과도한 console.log 제거 및 코드 정리 – 디버깅 로그 간소화
function renderCalendar() {
    if (!calendarBody) {
        console.error('calendarBody 요소를 찾을 수 없습니다.');
        return;
    }

    try {
        const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

        let html = '';
        let dayCount = 1;
        let nextMonthDayCount = 1;

        for (let week = 0; week < 6; week++) {
            html += '<tr>';

            for (let day = 0; day < 7; day++) {
                const cellIndex = week * 7 + day;
                const isCurrentMonth = cellIndex >= firstDay && dayCount <= daysInMonth;
                const today = new Date();
                const isToday = isCurrentMonth && 
                               dayCount === today.getDate() && 
                               currentYear === today.getFullYear() && 
                               currentMonth === today.getMonth() + 1;

                let cellClass = 'calendar-date';
                let dayNumber = '';
                let dateString = '';

                if (isCurrentMonth) {
                    dayNumber = dayCount;
                    dateString = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                    dayCount++;
                } else if (cellIndex < firstDay) {
                    dayNumber = daysInPrevMonth - firstDay + cellIndex + 1;
                    cellClass += ' other-month';
                    let prevMonth = currentMonth - 1;
                    let prevYear = currentYear;
                    if (prevMonth === 0) {
                        prevMonth = 12;
                        prevYear--;
                    }
                    dateString = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                } else {
                    dayNumber = nextMonthDayCount;
                    cellClass += ' other-month';
                    nextMonthDayCount++;
                    let nextMonth = currentMonth + 1;
                    let nextYear = currentYear;
                    if (nextMonth === 13) {
                        nextMonth = 1;
                        nextYear++;
                    }
                    dateString = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                }

                if (isToday) {
                    cellClass += ' today';
                }

                html += `<td class="calendar-cell" data-date="${dateString}">`;
                html += `<div class="${cellClass}">${dayNumber}</div>`;

                if (isCurrentMonth) {
                    const dayEvents = getEventsForDate(dateString);
                    dayEvents.forEach(event => {
                        const priorityClass = getPriorityClass(event.priority);
                        html += `<div class="event-item ${priorityClass}" data-event-id="${event.id}">${escapeHTML(event.title)}</div>`;
                    });
                }

                html += '</td>';
            }

            html += '</tr>';

            if (dayCount > daysInMonth) break;
        }

        calendarBody.innerHTML = html;

        // 날짜 클릭 이벤트
        calendarBody.querySelectorAll('td[data-date]').forEach(cell => {
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                if (e.target.classList.contains('event-item')) return;
                
                const date = cell.getAttribute('data-date');
                if (date) {
                    openAddModal(date);
                }
            });
        });

        // 이벤트 클릭 이벤트
        calendarBody.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = parseInt(item.getAttribute('data-event-id'));
                openDetailModal(eventId);
            });
        });
    } catch (error) {
        console.error('renderCalendar 에러:', error);
    }
}

function renderEventList() {
    if (!eventList) {
        console.error('eventList 요소를 찾을 수 없습니다.');
        return;
    }

    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sortedEvents.length === 0) {
        eventList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-calendar3"></i>
                <p>등록된 일정이 없습니다.</p>
            </div>
        `;
        return;
    }

    let html = '';
    sortedEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
        const priorityClass = getPriorityClass(event.priority);

        html += `
            <div class="event-list-item" data-event-id="${event.id}">
                <div class="event-list-date">${formattedDate}</div>
                <div class="event-list-title">${escapeHTML(event.title)}</div>
                <div class="event-list-priority ${priorityClass}">${event.priority}</div>
            </div>
        `;
    });

    eventList.innerHTML = html;

    eventList.querySelectorAll('.event-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const eventId = parseInt(item.getAttribute('data-event-id'));
            openDetailModal(eventId);
        });
    });
}

function getEventsForDate(dateString) {
    return events.filter(event => event.date === dateString);
}

// [수정] 검색 기능 주석 정리 및 코드 간소화 – 가독성 향상
// 검색 기능
function performSearch() {
    if (!eventList || !searchInput) return;

    const searchTerm = searchInput.value.trim().toLowerCase();

    if (!searchTerm) {
        renderEventList();
        return;
    }

    const filteredEvents = events.filter(event => {
        const searchText = `${event.title} ${event.content || ''} ${event.location || ''} ${event.priority || ''}`.toLowerCase();
        return searchText.includes(searchTerm);
    });

    const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sortedEvents.length === 0) {
        eventList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-search"></i>
                <p>"${escapeHTML(searchTerm)}" 검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }

    let html = '';
    sortedEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
        const priorityClass = getPriorityClass(event.priority);
        const title = highlightSearchTerm(event.title, searchTerm);

        html += `
            <div class="event-list-item" data-event-id="${event.id}">
                <div class="event-list-date">${formattedDate}</div>
                <div class="event-list-title">${title}</div>
                <div class="event-list-priority ${priorityClass}">${event.priority}</div>
            </div>
        `;
    });

    eventList.innerHTML = html;

    eventList.querySelectorAll('.event-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const eventId = parseInt(item.getAttribute('data-event-id'));
            openDetailModal(eventId);
        });
    });
}

function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return escapeHTML(text);

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = escapeHTML(text).split(regex);

    return parts.map(part => {
        if (part.toLowerCase() === searchTerm.toLowerCase()) {
            return `<mark>${part}</mark>`;
        }
        return part;
    }).join('');
}

function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
        renderEventList();
    }
}

function getPriorityClass(priority) {
    switch (priority) {
        case '높음': return 'priority-high';
        case '중간': return 'priority-medium';
        case '낮음': return 'priority-low';
        default: return 'priority-medium';
    }
}

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// [수정] 모달 관련 함수 정리 및 console.log 제거 – 불필요한 로그 제거
// 모달 관련 함수
function openAddModal(date) {
    if (!eventModal || !eventForm || !selectedDateInput || !eventTitleInput) return;
    
    eventForm.reset();
    selectedDateInput.value = date;
    eventTitleInput.focus();
    eventModal.show();
}

function openDetailModal(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event || !detailModal) return;

    selectedEventId = eventId;

    if (detailDateInput) detailDateInput.value = event.date;
    if (detailTitleInput) detailTitleInput.value = event.title;
    if (detailContentInput) detailContentInput.value = event.content || '';
    if (detailLocationInput) detailLocationInput.value = event.location || '';
    if (detailPrioritySelect) detailPrioritySelect.value = event.priority || '중간';

    detailModal.show();
}

// [수정] 일정 관리 함수 정리 및 console.log 제거 – 코드 간결화
// 일정 관리 함수
function addEvent() {
    if (!eventTitleInput || !selectedDateInput || !eventContentInput || 
        !eventLocationInput || !eventPrioritySelect) return;

    const title = eventTitleInput.value.trim();
    const date = selectedDateInput.value;
    const content = eventContentInput.value.trim();
    const location = eventLocationInput.value.trim();
    const priority = eventPrioritySelect.value;

    if (!title) {
        eventTitleInput.classList.add('is-invalid');
        eventTitleInput.focus();
        return;
    }

    eventTitleInput.classList.remove('is-invalid');

    if (!date) {
        alert('날짜를 선택해주세요.');
        return;
    }

    const newEvent = {
        id: Date.now(),
        title: title,
        date: date,
        content: content || null,
        location: location || null,
        priority: priority || '중간'
    };

    const updatedEvents = [...events, newEvent];
    saveEvents(updatedEvents);

    renderCalendar();
    renderEventList();
    eventModal.hide();
    eventForm.reset();
}

function editEvent() {
    if (!selectedEventId || !detailTitleInput || !detailDateInput || 
        !detailContentInput || !detailLocationInput || !detailPrioritySelect) return;

    const title = detailTitleInput.value.trim();
    const date = detailDateInput.value;
    const content = detailContentInput.value.trim();
    const location = detailLocationInput.value.trim();
    const priority = detailPrioritySelect.value;

    if (!title) {
        detailTitleInput.classList.add('is-invalid');
        detailTitleInput.focus();
        return;
    }

    detailTitleInput.classList.remove('is-invalid');

    if (!date) {
        alert('날짜를 입력해주세요.');
        detailDateInput.focus();
        return;
    }

    const updatedEvents = events.map(event => {
        if (event.id === selectedEventId) {
            return {
                ...event,
                title: title,
                date: date,
                content: content || null,
                location: location || null,
                priority: priority || '중간'
            };
        }
        return event;
    });

    saveEvents(updatedEvents);

    renderCalendar();
    renderEventList();
    detailModal.hide();
    selectedEventId = null;
}

function deleteEvent() {
    if (!selectedEventId) return;

    if (confirm('정말로 이 일정을 삭제하시겠습니까?')) {
        const updatedEvents = events.filter(event => event.id !== selectedEventId);
        saveEvents(updatedEvents);

        renderCalendar();
        renderEventList();

        detailModal.hide();

        selectedEventId = null;
    }
}

// [수정] 달력 네비게이션 함수 주석 정리 – 코드 구조 개선
// 달력 네비게이션 함수
function changeMonth(direction) {
    if (direction === 'prev') {
        currentMonth--;
        if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
    } else {
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }

    updateMonthLabel();
    renderCalendar();
    renderEventList();
}

function updateMonthLabel() {
    if (currentMonthLabel) {
        currentMonthLabel.textContent = `${currentYear}년 ${currentMonth}월`;
    }
}

function updateCurrentDate() {
    if (currentDateElement) {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        currentDateElement.textContent = now.toLocaleDateString('ko-KR', options);
    }
}

// [수정] DOM 초기화 코드 정리 및 과도한 console.log 제거 – 초기화 로직 간소화
// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조 초기화
    calendarBody = document.getElementById('calendarBody');
    eventList = document.getElementById('eventList');
    currentDateElement = document.getElementById('currentDate');
    currentMonthLabel = document.getElementById('currentMonthLabel');
    prevMonthBtn = document.getElementById('prevMonth');
    nextMonthBtn = document.getElementById('nextMonth');
    searchInput = document.getElementById('searchInput');
    clearSearchBtn = document.getElementById('clearSearchBtn');
    
    // 필수 요소 확인
    if (!calendarBody || !eventList || !currentMonthLabel) {
        console.error('필수 DOM 요소를 찾을 수 없습니다.');
        return;
    }
    
    // Bootstrap 모달 초기화
    try {
        const eventModalElement = document.getElementById('eventModal');
        const detailModalElement = document.getElementById('detailModal');
        
        if (eventModalElement) {
            eventModal = new bootstrap.Modal(eventModalElement);
        }
        
        if (detailModalElement) {
            detailModal = new bootstrap.Modal(detailModalElement);
        }
    } catch (error) {
        console.error('Bootstrap 모달 초기화 실패:', error);
    }
    
    // 폼 요소 참조
    eventForm = document.getElementById('eventForm');
    saveEventBtn = document.getElementById('saveEvent');
    editEventBtn = document.getElementById('editEvent');
    deleteEventBtn = document.getElementById('deleteEvent');
    
    selectedDateInput = document.getElementById('selectedDate');
    eventTitleInput = document.getElementById('eventTitle');
    eventContentInput = document.getElementById('eventContent');
    eventLocationInput = document.getElementById('eventLocation');
    eventPrioritySelect = document.getElementById('eventPriority');
    
    detailDateInput = document.getElementById('detailDate');
    detailTitleInput = document.getElementById('detailTitle');
    detailContentInput = document.getElementById('detailContent');
    detailLocationInput = document.getElementById('detailLocation');
    detailPrioritySelect = document.getElementById('detailPriority');

    // 데이터 로드 및 초기 렌더링
    loadEvents();
    updateCurrentDate();
    updateMonthLabel();
    renderCalendar();
    renderEventList();

    // 이벤트 리스너 등록
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth('prev'));
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth('next'));
    if (saveEventBtn) saveEventBtn.addEventListener('click', addEvent);
    if (editEventBtn) editEventBtn.addEventListener('click', editEvent);
    if (deleteEventBtn) deleteEventBtn.addEventListener('click', deleteEvent);
    if (searchInput) searchInput.addEventListener('input', performSearch);
    if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addEvent();
        });
    }

    // 키보드 이벤트
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (eventModal && eventModal._isShown) eventModal.hide();
            if (detailModal && detailModal._isShown) detailModal.hide();
        }
    });

    // 모달 닫힘 이벤트
    if (eventModal && eventModal._element) {
        eventModal._element.addEventListener('hidden.bs.modal', () => {
            if (eventForm) eventForm.reset();
            if (eventTitleInput) eventTitleInput.classList.remove('is-invalid');
        });
    }

    if (detailModal && detailModal._element) {
        detailModal._element.addEventListener('hidden.bs.modal', () => {
            selectedEventId = null;
            if (detailTitleInput) detailTitleInput.classList.remove('is-invalid');
        });
    }
});

// 페이지 종료 시 데이터 저장
window.addEventListener('beforeunload', () => {
    saveEvents(events);
});
