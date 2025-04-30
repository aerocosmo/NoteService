document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const notesList = document.getElementById('notes-list');
    const noteIdInput = document.getElementById('note-id');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const noteTagsInput = document.getElementById('note-tags'); // Элемент для тегов
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const showAllButton = document.getElementById('show-all-button');
    const themeToggle = document.getElementById('theme-toggle');
    const bodyElement = document.body;

    // Загрузка всех заметок при загрузке страницы
    fetchNotes();

    // Сохранение заметки (создание или обновление)
    saveButton.addEventListener('click', function() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        const tags = noteTagsInput.value.trim(); // Получаем теги
        const id = noteIdInput.value;

        if (!title || !content) {
            alert('Пожалуйста, заполните заголовок и содержание');
            return;
        }

        if (id) {
            // Вызываем функцию обновления с передачей тегов
            updateNote(id, title, content, tags);
        } else {
            // Вызываем функцию создания с передачей тегов
            createNote(title, content, tags);
        }
    });

    // Отмена редактирования
    cancelButton.addEventListener('click', function() {
        resetForm();
    });

    // Функция для получения всех заметок с сервера
    function fetchNotes() {
        fetch('/api/notes')
            .then(response => response.json())
            .then(notes => displayNotes(notes))
            .catch(error => console.error('Error fetching notes:', error));
    }

    // Функция для создания новой заметки
    function createNote(title, content, tags) {
        fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                content,
                tags // Включаем теги в тело запроса
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Не удалось создать заметку');
        })
        .then(() => {
            resetForm();
            fetchNotes();
        })
        .catch(error => console.error('Error creating note:', error));
    }

    // Функция для обновления заметки
    function updateNote(id, title, content, tags) {
        fetch(`/api/notes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                content,
                tags // Включаем теги в тело запроса
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Не удалось обновить заметку');
        })
        .then(() => {
            resetForm();
            fetchNotes();
        })
        .catch(error => console.error('Error updating note:', error));
    }

    // Функция для удаления заметки
    function deleteNote(id) {
        if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
            fetch(`/api/notes/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    fetchNotes();
                    if (noteIdInput.value === id.toString()) { // Сравниваем строки
                         resetForm();
                    }
                    return;
                }
                throw new Error('Не удалось удалить заметку');
            })
            .catch(error => console.error('Error deleting note:', error));
        }
    }

    // Функция для отображения заметок на странице
    function displayNotes(notes) {
        notesList.innerHTML = '';
        if (!notes || notes.length === 0) {
            notesList.innerHTML = '<p class="empty-notes">Ничего не найдено.</p>';
            return;
        }
        // notes - массив перед сортировкой
        const notesArray = Array.isArray(notes) ? notes : [notes];

        notesArray.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        notesArray.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'notecard';

            const categoryHtml = note.category ? `<span class="notecategory">${note.category.name}</span>` : '';
            // ДОБАВЛЯЕМ БЛОК С ТЕГАМИ
            const tagsHtml = note.tags ? `<div class="note-tags">Теги: ${note.tags}</div>` : '';

            noteCard.innerHTML = `
                <h2>${note.title}</h2>
                <p>${note.content}</p>
                ${categoryHtml}
                ${tagsHtml} <!--ВЫВОДИМ ТЕГИ-->
                <div class="note-actions">
                    <button class="edit-btn" data-id="${note.id}">✏️</button>
                    <button class="delete-btn" data-id="${note.id}">🗑️</button>
                </div>
                <div class="note-date">Изменено: ${formatDate(note.updatedAt)}</div>
            `;

            // Добавление обработчиков событий для кнопок
            // Используем делегирование событий или находим кнопки внутри созданной карточки
            noteCard.querySelector('.edit-btn').addEventListener('click', function() {
                editNote(note);
            });
            noteCard.querySelector('.delete-btn').addEventListener('click', function() {
                deleteNote(note.id);
            });

            notesList.appendChild(noteCard);
        });
    }

    // Функция для заполнения формы при редактировании
    function editNote(note) {
        noteIdInput.value = note.id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        noteTagsInput.value = note.tags || ''; // Заполняем теги, используем пустую строку если null
        saveButton.textContent = 'Обновить';
        cancelButton.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Функция сброса формы
    function resetForm() {
        noteIdInput.value = '';
        noteTitleInput.value = '';
        noteContentInput.value = '';
        noteTagsInput.value = ''; // Сбрасываем теги
        saveButton.textContent = 'Сохранить';
        cancelButton.classList.add('hidden');
    }

    // Функция форматирования даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        // Используем опции для более гибкого форматирования
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString(undefined, options);
    }

    // Search logic
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            searchNotes(query);
        } else {
            fetchNotes(); // Если строка поиска пуста, показать все заметки
        }
    });

    showAllButton.addEventListener('click', function() {
        searchInput.value = ''; // Очистить поле поиска
        fetchNotes(); // Загрузить все заметки
    });

    function searchNotes(query) {
        fetch(`/api/notes/search?query=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                     // Обработка случая, если поиск не реализован или ошибка на сервере
                     console.error('Search failed or not implemented');
                     // Возможно, вывести сообщение пользователю
                     notesList.innerHTML = '<p class="empty-notes">Ошибка поиска или функция не поддерживается.</p>';
                     return null; // Возвращаем null, чтобы прервать цепочку then
                }
                return response.json();
            })
            .then(data => {
                 if (data !== null) { // Проверяем, что данные получены
                    const notesArray = Array.isArray(data) ? data : [];
                    displayNotes(notesArray);
                 }
            })
            .catch(error => console.error('Error searching notes:', error));
    }

    // Dark theme toggle
    // Проверка сохранённой темы
    const savedTheme = localStorage.getItem('theme') || 'light';
    bodyElement.setAttribute('data-theme', savedTheme);

    // Обновляем текст кнопки при загрузке
    themeToggle.textContent = savedTheme === 'dark' ? '☀️ Светлая тема' : '🌓 Тёмная тема';

    // Обработчик клика
    themeToggle.addEventListener('click', () => {
        const currentTheme = bodyElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        bodyElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        // Обновляем текст кнопки
        themeToggle.textContent = newTheme === 'dark' ? '☀️ Светлая тема' : '🌓 Тёмная тема';
    });

    // Автоопределение системной темы (применяется только если нет сохранённой темы)
    if (!localStorage.getItem('theme')) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        bodyElement.setAttribute('data-theme', systemTheme);
         themeToggle.textContent = systemTheme === 'dark' ? '☀️ Светлая тема' : '🌓 Тёмная тема';
    }
});

