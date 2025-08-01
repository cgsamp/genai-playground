package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.*;
import net.sampsoftware.genai.service.PromptService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/prompts")
@RequiredArgsConstructor
@Slf4j
public class PromptController {

    private final PromptService promptService;

    /**
     * Get all active prompts (excludes soft-deleted ones)
     */
    @GetMapping
    public ResponseEntity<List<PromptDto>> getAllActivePrompts() {
        log.debug("GET /api/prompts - fetching all active prompts");
        List<PromptDto> prompts = promptService.getAllActivePrompts();
        return ResponseEntity.ok(prompts);
    }

    /**
     * Get prompt by ID (includes deleted ones as per requirements)
     */
    @GetMapping("/{id}")
    public ResponseEntity<PromptDto> getPromptById(@PathVariable Integer id) {
        log.debug("GET /api/prompts/{} - fetching prompt by id", id);
        PromptDto prompt = promptService.getPromptById(id);
        return ResponseEntity.ok(prompt);
    }

    /**
     * Search active prompts by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<PromptDto>> searchActivePrompts(@RequestParam String name) {
        log.debug("GET /api/prompts/search?name={} - searching active prompts", name);
        List<PromptDto> prompts = promptService.searchActivePrompts(name);
        return ResponseEntity.ok(prompts);
    }

    /**
     * Get active prompts by type
     */
    @GetMapping("/type/{typeId}")
    public ResponseEntity<List<PromptDto>> getActivePromptsByType(@PathVariable Integer typeId) {
        log.debug("GET /api/prompts/type/{} - fetching active prompts by type", typeId);
        List<PromptDto> prompts = promptService.getActivePromptsByType(typeId);
        return ResponseEntity.ok(prompts);
    }

    /**
     * Create a new prompt
     */
    @PostMapping
    public ResponseEntity<PromptDto> createPrompt(@Valid @RequestBody PromptCreateRequest request) {
        log.debug("POST /api/prompts - creating new prompt: {}", request.getName());
        PromptDto created = promptService.createPrompt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update a prompt (using immutable pattern - creates new record and soft deletes old one)
     */
    @PutMapping("/{id}")
    public ResponseEntity<PromptDto> updatePrompt(@PathVariable Integer id, @Valid @RequestBody PromptUpdateRequest request) {
        log.debug("PUT /api/prompts/{} - updating prompt", id);
        PromptDto updated = promptService.updatePrompt(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Soft delete a prompt
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrompt(@PathVariable Integer id) {
        log.debug("DELETE /api/prompts/{} - soft deleting prompt", id);
        promptService.deletePrompt(id);
        return ResponseEntity.noContent().build();
    }
}