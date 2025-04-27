document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const notesList = document.getElementById('notes-list');
    const noteIdInput = document.getElementById('note-id');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');

    // Загрузка всех заметок при загрузке страницы
    fetchNotes();

    // Сохранение заметки
    saveButton.addEventListener('click', function() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        const id = noteIdInput.value;

        if (!title || !content) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        if (id) {
            updateNote(id, title, content);
        } else {
            createNote(title, content);
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
    function createNote(title, content) {
        fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
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
    function updateNote(id, title, content) {
        fetch(`/api/notes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
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
                    if (noteIdInput.value === id) {
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
        
        if (notes.length === 0) {
            notesList.innerHTML = '<p class="empty-notes">У вас пока нет заметок.</p>';
            return;
        }
        
        // Сортировка заметок по дате изменения (сначала новые)
        notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.innerHTML = `
                <h2>${note.title}</h2>
                <p>${note.content}</p>
                <div class="note-actions">
                    <button class="edit-btn" data-id="${note.id}">✏️</button>
                    <button class="delete-btn" data-id="${note.id}">🗑️</button>
                </div>
                <div class="note-date">
                    Изменено: ${formatDate(note.updatedAt)}
                </div>
            `;

            // Добавление обработчиков событий для кнопок
            noteCard.querySelector('.edit-btn').addEventListener('click', function() {
                editNote(note);
            });

            noteCard.querySelector('.delete-btn').addEventListener('click', function() {
                deleteNote(note.id);
            });

            notesList.appendChild(noteCard);
        });
    }

    // Функция для заполнения формы данными заметки для редактирования
    function editNote(note) {
        noteIdInput.value = note.id;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        saveButton.textContent = 'Обновить';
        cancelButton.classList.remove('hidden');
        
        // Прокрутка к форме
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Функция сброса формы
    function resetForm() {
        noteIdInput.value = '';
        noteTitleInput.value = '';
        noteContentInput.value = '';
        saveButton.textContent = 'Сохранить';
        cancelButton.classList.add('hidden');
    }

    // Функция форматирования даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
});

