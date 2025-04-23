// MessageController.java
package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.model.Message;
import net.sampsoftware.genai.repository.MessageRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageRepository repo;
    public MessageController(MessageRepository repo) { this.repo = repo; }

    @GetMapping public List<Message> all() { return repo.findAll(); }
    @PostMapping public Message create(@RequestBody Message m) { return repo.save(m); }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
