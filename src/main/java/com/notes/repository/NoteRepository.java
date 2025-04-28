package com.notes.repository;

import com.notes.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // Добавьте этот импорт

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    // Базовые CRUD операции уже включены в JpaRepository

    // tagSearch
    List<Note> findByTagsContainingIgnoreCase(String tag);
    List<Note> findByTagsContaining(String tag);
    // Метод для поиска заметок по id категории
    List<Note> findByTitleContainingOrContentContainingIgnoreCase(String title, String content);
}


