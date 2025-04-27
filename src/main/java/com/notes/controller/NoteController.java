package com.notes.controller;

import com.notes.model.Note;
import com.notes.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    @Autowired
    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Note note) {
        Note createdNote = noteService.createNote(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNote);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note note) {
        return noteService.updateNote(id, note)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // added search
   @GetMapping("/search")
   public ResponseEntity<List<Note>> searchNotes(@RequestParam String query) {
       List<Note> notes = noteService.searchNotes(query);
       return ResponseEntity.ok(notes);
   }

    //@PutMapping("/{id}/with-category")
    //public ResponseEntity<Note> updateNoteWithCategory(
    //        @PathVariable Long id,
    //        @RequestBody Note note,
    //        @RequestParam(required = false) String categoryName) {
    //    return noteService.updateNoteWithCategory(id, note, categoryName)
    //            .map(ResponseEntity::ok)
    //            .orElse(ResponseEntity.notFound().build());
    //}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        if (noteService.deleteNote(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

