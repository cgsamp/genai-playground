package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.model.Book;
import net.sampsoftware.genai.repository.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {
    private final BookRepository bookRepository;

    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookRepository.findById(id);
        return book.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Book createBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        Optional<Book> bookOptional = bookRepository.findById(id);

        if (bookOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Book book = bookOptional.get();
        book.setName(bookDetails.getName());
        book.setAuthorName(bookDetails.getAuthorName());
        book.setPublishYear(bookDetails.getPublishYear());
        book.setAttributes(bookDetails.getAttributes());

        Book updatedBook = bookRepository.save(book);
        return ResponseEntity.ok(updatedBook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        if (!bookRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        bookRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public List<Book> searchBooks(
            @RequestParam(required = false) String authorName,
            @RequestParam(required = false) String publishYear) {

        if (authorName != null && !authorName.isEmpty()) {
            return bookRepository.findByAuthorName(authorName);
        } else if (publishYear != null && !publishYear.isEmpty()) {
            return bookRepository.findByPublishYear(publishYear);
        } else {
            return bookRepository.findAll();
        }
    }
}
