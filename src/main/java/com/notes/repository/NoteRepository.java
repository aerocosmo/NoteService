package com.notes.repository;

import org.springframework.data.jpa.repository.Query; 
import org.springframework.data.repository.query.Param;
import com.notes.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // Добавьте этот импорт

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    // Базовые CRUD операции уже включены в JpaRepository

//    @Query("SELECT n FROM Note n WHERE " +
//       "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
//       "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
//       "LOWER(n.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
//	List<Note> searchNotes(@Param("query") String query);
	
      @Query("SELECT n FROM Note n WHERE " +
     	// Преобразуем и поле title, и поисковый запрос в нижний регистр перед сравнением
      	"LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
       	// Аналогично для поля content
       	"LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
       	// И для поля tags
       	"LOWER(n.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Note> searchNotes(@Param("query") String query);
    // Метод для поиска заметок по id категории
    List<Note> findByTitleContainingOrContentContainingIgnoreCase(String title, String content);
}


