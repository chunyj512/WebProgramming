let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let events = [];
let selectedEventId = null;

const STORAGE_KEY = 'seeandyou_events';

// DOM 요소 참조 (DOMContentLoaded에서 초기화)
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

function renderCalendar() {
    console.log('📅 renderCalendar 시작:', currentYear, '년', currentMonth, '월');
    
    try {
        const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

        console.log('📅 날짜 정보:', { firstDay, daysInMonth, daysInPrevMonth });

        let html = '';
        let dayCount = 1;
        let nextMonthDayCount = 1;

        for (let week = 0; week < 6; week++) {
        html += '<tr>';

        for (let day = 0; day < 7; day++) {
            const cellIndex = week * 7 + day;
            const isCurrentMonth = cellIndex >= firstDay && dayCount <= daysInMonth;
            const isToday = isCurrentMonth && 
                           dayCount === new Date().getDate() && 
                           currentYear === new Date().getFullYear() && 
                           currentMonth === new Date().getMonth() + 1;

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

            // #9 [수정] 모든 셀에 data-date 속성 부여 – 달력의 모든 날짜 클릭 가능하도록 개선
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

        console.log('📅 HTML 생성 완료, 길이:', html.length);

        if (!calendarBody) {
            console.error('❌ calendarBody 요소를 찾을 수 없습니다.');
            return;
        }

        calendarBody.innerHTML = html;
        console.log('✅ calendarBody.innerHTML 업데이트 완료');

        // #10 [수정] 날짜 클릭 이벤트 연결 – 모든 셀 클릭 가능하도록 개선
        calendarBody.querySelectorAll('td[data-date]').forEach(cell => {
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                if (e.target.classList.contains('event-item')) return;
                
                const date = cell.getAttribute('data-date');
                console.log('클릭된 날짜:', date);
                
                if (date && date !== '') {
                    openAddModal(date);
                }
            });
        });

        calendarBody.querySelectorAll('.event-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = parseInt(item.getAttribute('data-event-id'));
                openDetailModal(eventId);
            });
        });
    } catch (error) {
        console.error('❌ renderCalendar 에러:', error);
        console.error('에러 스택:', error.stack);
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

// #2 [추가] 검색 기능 구현 – 제목/내용/장소/우선순위 실시간 필터링
function performSearch() {
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

// #3 [추가] 검색어 하이라이트 처리 – 일치하는 키워드 노란색 배경 표시
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

// #4 [추가] 검색 초기화 함수 – 검색창 비우고 전체 일정 목록 표시
function clearSearch() {
    searchInput.value = '';
    renderEventList();
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

// #11 [추가] 일정 추가 모달 열기 – 날짜 설정 및 모달 표시
function openAddModal(date) {
    console.log('openAddModal 호출됨, 날짜:', date);
    console.log('selectedDateInput 존재:', !!selectedDateInput);
    console.log('eventModal 존재:', !!eventModal);
    
    // #12 [수정] 폼 초기화 후 날짜 재설정 – reset()이 날짜를 지우는 문제 해결
    eventForm.reset();
    selectedDateInput.value = date;
    eventTitleInput.focus();
    eventModal.show();
    
    console.log('모달 표시 완료, 설정된 날짜:', selectedDateInput.value);
}

// #14 [추가] 일정 상세보기 모달 열기 – 일정 정보 표시
function openDetailModal(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    selectedEventId = eventId;

    // #15 [수정] 날짜 필드 수정 가능하도록 설정 – input type="date" 형식으로 변환
    detailDateInput.value = event.date;
    detailTitleInput.value = event.title;
    detailContentInput.value = event.content || '';
    detailLocationInput.value = event.location || '';
    detailPrioritySelect.value = event.priority || '중간';

    detailModal.show();
}

// #13 [추가] 일정 추가 기능 – 새 일정 생성 및 저장
function addEvent() {
    const title = eventTitleInput.value.trim();
    const date = selectedDateInput.value;
    const content = eventContentInput.value.trim();
    const location = eventLocationInput.value.trim();
    const priority = eventPrioritySelect.value;

    console.log('addEvent 호출됨');
    console.log('제목:', title);
    console.log('날짜:', date);
    console.log('내용:', content);
    console.log('장소:', location);
    console.log('우선순위:', priority);

    if (!title) {
        eventTitleInput.classList.add('is-invalid');
        eventTitleInput.focus();
        return;
    } else {
        eventTitleInput.classList.remove('is-invalid');
    }

    if (!date) {
        console.error('날짜가 비어있습니다!');
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

    console.log('새 이벤트:', newEvent);

    const updatedEvents = [...events, newEvent];
    saveEvents(updatedEvents);

    renderCalendar();
    renderEventList();

    eventModal.hide();

    eventForm.reset();
}

// #16 [추가] 일정 수정 기능 – 기존 일정 정보 변경
function editEvent() {
    if (!selectedEventId) return;

    const title = detailTitleInput.value.trim();
    const date = detailDateInput.value;
    const content = detailContentInput.value.trim();
    const location = detailLocationInput.value.trim();
    const priority = detailPrioritySelect.value;

    if (!title) {
        detailTitleInput.classList.add('is-invalid');
        detailTitleInput.focus();
        return;
    } else {
        detailTitleInput.classList.remove('is-invalid');
    }

    // #17 [추가] 날짜 유효성 검사 – 빈 날짜 체크
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

// #7 [보완] 월 변경 기능 – 현재 년/월 표시 업데이트 포함
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

// #8 [추가] 달력 헤더 년/월 업데이트 함수 – 현재 보고 있는 월 정보 표시
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
    if (!calendarBody) {
        console.error('❌ calendarBody 요소를 찾을 수 없습니다!');
        return;
    }
    
    if (!eventList) {
        console.error('❌ eventList 요소를 찾을 수 없습니다!');
        return;
    }
    
    if (!currentMonthLabel) {
        console.error('❌ currentMonthLabel 요소를 찾을 수 없습니다!');
        return;
    }
    
    // Bootstrap 모달 초기화 (에러 처리)
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

    console.log('✅ DOM 요소 초기화 완료');
    console.log('calendarBody:', calendarBody);
    console.log('eventList:', eventList);
    console.log('currentMonthLabel:', currentMonthLabel);

    loadEvents();
    console.log('✅ 이벤트 로드 완료:', events.length, '개');

    updateCurrentDate();
    updateMonthLabel();
    
    console.log('✅ 캘린더 렌더링 시작...');
    renderCalendar();
    console.log('✅ 캘린더 렌더링 완료');
    
    renderEventList();
    console.log('✅ 이벤트 목록 렌더링 완료');

    prevMonthBtn.addEventListener('click', () => changeMonth('prev'));
    nextMonthBtn.addEventListener('click', () => changeMonth('next'));

    saveEventBtn.addEventListener('click', addEvent);
    editEventBtn.addEventListener('click', editEvent);
    deleteEventBtn.addEventListener('click', deleteEvent);

    // #5 [추가] 검색 기능 이벤트 리스너 연결 – 실시간 검색 및 초기화 기능
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addEvent();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (eventModal._isShown) eventModal.hide();
            if (detailModal._isShown) detailModal.hide();
        }
    });

    eventModal._element.addEventListener('hidden.bs.modal', () => {
        eventForm.reset();
        eventTitleInput.classList.remove('is-invalid');
    });

    detailModal._element.addEventListener('hidden.bs.modal', () => {
        selectedEventId = null;
        detailTitleInput.classList.remove('is-invalid');
    });
});

window.addEventListener('beforeunload', () => {
    saveEvents(events);
});

function showMessage(message, type = 'info') {

    console.log(`${type.toUpperCase()}: ${message}`);
}