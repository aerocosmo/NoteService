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
        const tags = document.getElementById('note-tags').value
          .split(',')
          .map(tag => tag.trim()); // Разделяем тэги запятыми
      
        fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, tags })
        })
          .then(response => response.json())
          .then(() => {
            resetForm();
            fetchNotes();
          })
          .catch(error => console.error('Ошибка создания заметки:', error));
    }

    // Функция для обновления заметки
    function updateNote(id, title, content) {
        const tags = document.getElementById('note-tags').value
          .split(',')
          .map(tag => tag.trim());
      
        fetch(`/api/notes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, tags })
        })
          .then(response => response.json())
          .then(() => {
            resetForm();
            fetchNotes();
          })
          .catch(error => console.error('Ошибка обновления заметки:', error));
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
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = ''; // Очищаем текущий список
      
        if (notes.length === 0) {
          notesList.innerHTML = '<p>Ничего не найдено.</p>';
          return;
        }
      
        notes.forEach(note => {
          const noteCard = document.createElement('div');
          noteCard.className = 'notecard';
      
          const tags = note.tags.map(tag => `<span class="tag">${tag}</span>`).join(', ');
      
          noteCard.innerHTML = `
            <h2>${note.title}</h2>
            <p>${note.content}</p>
            <p><strong>Тэги:</strong> ${tags}</p>
            <div class="note-actions">
              <button class="editbtn" data-id="${note.id}">✏️</button>
              <button class="deletebtn" data-id="${note.id}">🗑️</button>
            </div>
          `;
      
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
	// sgination
    let currentPage = 0;
    const pageSize = 10;
    
    function loadNotes(page = 0) {
        fetch(`/api/notes?page=${page}&size=${pageSize}`)
            .then(response => response.json())
            .then(data => {
                displayNotes(data.content);
                updatePagination(data);
            })
            .catch(error => console.error('Error fetching notes:', error));
    }
    
    function updatePagination(data) {
        const paginationElement = document.getElementById('pagination');
        paginationElement.innerHTML = '';
        
        if (data.totalPages > 1) {
            // Previous page button
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Назад';
            prevButton.disabled = currentPage === 0;
            prevButton.addEventListener('click', () => {
                currentPage--;
                loadNotes(currentPage);
            });
            paginationElement.appendChild(prevButton);
            
            // Page numbers
            for (let i = 0; i < data.totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i + 1;
                pageButton.classList.toggle('active', i === currentPage);
                pageButton.addEventListener('click', () => {
                    currentPage = i;
                    loadNotes(currentPage);
                });
                paginationElement.appendChild(pageButton);
            }
            
            // Next page button
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Вперед';
            nextButton.disabled = currentPage === data.totalPages - 1;
            nextButton.addEventListener('click', () => {
                currentPage++;
                loadNotes(currentPage);
            });
            paginationElement.appendChild(nextButton);
        }
    }
    // search logic
    document.getElementById('search-button').addEventListener('click', function() {
        const query = document.getElementById('search-input').value.trim();
        if (query) {
            searchNotes(query);
        } else {
            loadNotes();
        }
    });
    
    function searchNotes(query) {
        fetch(`/api/notes/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                // Проверяем структуру данных, убеждаемся что это массив
                const notesArray = Array.isArray(data) ? data : [];
                displayNotes(notesArray);
            })
            .catch(error => console.error('Error searching notes:', error));
    }
    // tag search
    const noteTagsInput = document.getElementById('note-tags'); // Новое поле ввода для тэгов
    function createNote(title, content) {
      const tags = noteTagsInput.value.split(',').map(tag => tag.trim()); // Разделение тэгов по запятой

      fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, tags }),
      })
      .then(/* остальной код */);
    }
    //tag search  button
    const tagsButton = document.getElementById('tags-button');
    const tagsDropdown = document.getElementById('tags-dropdown');

    function loadTags() {
        fetch('/api/notes/all-tags') // Выполняем запрос на получение всех тэгов
          .then(response => response.json())
          .then(tags => {
            if (tags.length > 0) {
              // Наполняем список тэгами
              tagsDropdown.innerHTML = tags
                .map(tag => `<li onclick="filterByTag('${tag}')">${tag}</li>`)
                .join('');
              tagsDropdown.classList.add('visible'); // Показываем список
            } else {
              tagsDropdown.innerHTML = `<li>Нет доступных тэгов</li>`;
              tagsDropdown.classList.add('visible'); // Показываем список даже при отсутствии тэгов
            }
          })
          .catch(error => console.error('Ошибка загрузки тэгов', error));
    }
      
    
    function filterByTag(tag) {
        fetch(`/api/notes/tags?tag=${encodeURIComponent(tag)}`)
            .then(response => response.json())
            .then(notes => displayNotes(notes)) // Отображает только отфильтрованные заметки
            .catch(error => console.error('Ошибка фильтрации заметок:', error));
    }

    // Загрузка всех доступных тэгов
    // tagsButton.addEventListener('click', function () {
    //     fetch('/api/notes/all-tags') // Осуществляем GET запрос
    //       .then(response => {
    //         if (!response.ok) {
    //           throw new Error('Ошибка запроса');
    //         }
    //         return response.json(); // Преобразуем ответ в JSON
    //       })
    //       .then(tags => {
    //         if (tags.length > 0) {
    //           // Обновляем содержимое dropdown
    //           tagsDropdown.innerHTML = tags
    //             .map(tag => `<li onclick="filterByTag('${tag}')">${tag}</li>`) // Создаём список тегов
    //             .join('');
    //           tagsDropdown.classList.remove('hidden');
    //         } else {
    //           tagsDropdown.innerHTML = '<li>Нет доступных тэгов</li>';
    //           tagsDropdown.classList.remove('hidden');
    //         }
    //       })
    //       .catch(error => console.error('Ошибка загрузки тэгов:', error)); // Логируем ошибку
    //   });
    tagsButton.addEventListener('click', () => {
        loadTags(); // Загружаем тэги с сервера
        tagsDropdown.classList.toggle('visible'); // Переключаем класс видимости
    });
      

    // dark theme
    // Сохраняем элементы
    const themeToggle = document.getElementById('theme-toggle');
    const bodyElement = document.body;
    
    // Проверка сохранённой темы
    const savedTheme = localStorage.getItem('theme') || 'light';
    bodyElement.setAttribute('data-theme', savedTheme);
    
    // Обработчик клика
    themeToggle.addEventListener('click', () => {
      const currentTheme = bodyElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
      bodyElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    
      // Обновляем текст кнопки
      themeToggle.textContent = newTheme === 'dark' ? '☀️ Светлая тема' : '🌓 Тёмная тема';
    });
    
    // Автоопределение системной темы
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (!localStorage.getItem('theme')) {
      bodyElement.setAttribute('data-theme', systemTheme);
    }

});

