package com.notes.repository;

import com.notes.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // Добавьте этот импорт

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    // Базовые CRUD операции уже включены в JpaRepository

    // Метод для поиска заметок по id категории
    List<Note> findByCategoryId(Long categoryId);
    List<Note> findByTitleContainingOrContentContainingIgnoreCase(String title, String content);
}


